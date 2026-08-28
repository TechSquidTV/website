import { describe, expect, it, vi } from "vitest";
import { blogDiscussionCacheKey } from "@/lib/blog-discussion-cache";
import {
  fetchDiscussionSnapshots,
  findDiscussionByThreadId,
  managedDiscussionBody,
} from "@/lib/github-discussions";

interface FixtureReply {
  author: { avatarUrl: string; login: string; url: string } | null;
  bodyHTML: string;
  createdAt: string;
  id: string;
  updatedAt: string;
  url: string;
}

function graphqlResponse(
  bodyHtml: string,
  replies: FixtureReply[] = [],
  commentsTruncated = false,
): Response {
  return new Response(
    JSON.stringify({
      data: {
        discussion0: {
          category: { name: "Blog comments" },
          comments: {
            nodes: [
              {
                author: {
                  avatarUrl: "https://github.com/example-user.png",
                  login: "example-user",
                  url: "https://github.com/example-user",
                },
                bodyHTML: bodyHtml,
                createdAt: "2026-08-28T12:00:00Z",
                id: "DC_kwDOcomment",
                replies: {
                  nodes: replies,
                  pageInfo: { hasNextPage: false },
                },
                updatedAt: "2026-08-28T12:00:00Z",
                url: "https://github.com/TechSquidTV/website/discussions/1#discussioncomment-1",
              },
            ],
            pageInfo: { hasPreviousPage: commentsTruncated },
          },
          id: "D_kwDOdiscussion",
          repository: { nameWithOwner: "TechSquidTV/website" },
          updatedAt: "2026-08-28T12:00:00Z",
          url: "https://github.com/TechSquidTV/website/discussions/1",
        },
      },
    }),
    { status: 200 },
  );
}

describe("GitHub Discussion snapshots", () => {
  it("sanitizes untrusted comment HTML and excludes links and images", async () => {
    const fetchImpl = vi
      .fn<typeof fetch>()
      .mockResolvedValue(
        graphqlResponse(
          '<p>Hello <a href="https://example.com">world</a></p><img src="https://example.com/avatar.png"><script>alert(1)</script><a href="javascript:alert(1)">bad</a>',
        ),
      );

    const snapshots = await fetchDiscussionSnapshots(["D_kwDOdiscussion"], {
      fetchImpl,
    });

    const comment = snapshots.get("D_kwDOdiscussion")?.comments[0];
    expect(comment?.bodyHtml).toContain("world");
    expect(comment?.bodyHtml).not.toContain("<a");
    expect(comment?.bodyHtml).not.toContain("<img");
    expect(comment?.bodyHtml).not.toContain("<script");
    expect(comment?.bodyHtml).not.toContain("javascript:");
    expect(comment?.author?.avatarUrl).toBe(
      "https://github.com/example-user.png",
    );
    expect(comment?.author?.url).toBe("https://github.com/example-user");
  });

  it("rejects a discussion outside the managed category", async () => {
    const response = graphqlResponse("<p>Hello</p>");
    const payload = (await response.json()) as {
      data: { discussion0: { category: { name: string } } };
    };
    payload.data.discussion0.category.name = "General";
    const fetchImpl = vi
      .fn<typeof fetch>()
      .mockResolvedValue(
        new Response(JSON.stringify(payload), { status: 200 }),
      );

    await expect(
      fetchDiscussionSnapshots(["D_kwDOdiscussion"], { fetchImpl }),
    ).rejects.toThrow("Blog comments");
  });

  it("requests the latest 20 threads and normalizes their replies", async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(
      graphqlResponse(
        "<p>Parent</p>",
        [
          {
            author: {
              avatarUrl: "https://github.com/reply-user.png",
              login: "reply-user",
              url: "https://github.com/reply-user",
            },
            bodyHTML:
              '<p>Reply with <a href="https://example.com">a link</a></p>',
            createdAt: "2026-08-28T12:01:00Z",
            id: "DC_kwDOreply",
            updatedAt: "2026-08-28T12:01:00Z",
            url: "https://github.com/TechSquidTV/website/discussions/1#discussioncomment-2",
          },
        ],
        true,
      ),
    );

    const snapshots = await fetchDiscussionSnapshots(["D_kwDOdiscussion"], {
      fetchImpl,
    });
    const request = fetchImpl.mock.calls[0]?.[1];
    const requestBody = request?.body;

    expect(String(requestBody)).toContain("comments(last: 20)");
    expect(String(requestBody)).toContain("replies(first: 100)");
    expect(String(requestBody)).toContain("hasPreviousPage");
    expect(snapshots.get("D_kwDOdiscussion")?.commentsTruncated).toBe(true);
    expect(
      snapshots.get("D_kwDOdiscussion")?.comments[0]?.replies[0],
    ).toMatchObject({
      author: { login: "reply-user", url: "https://github.com/reply-user" },
      bodyHtml: "<p>Reply with a link</p>",
    });
  });

  it("fails when a stored Discussion has been deleted", async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ data: { discussion0: null } }), {
        status: 200,
      }),
    );

    await expect(
      fetchDiscussionSnapshots(["D_kwDOdiscussion"], { fetchImpl }),
    ).rejects.toThrow("no longer exists");
  });

  it("uses the immutable thread marker in generated discussion copy", () => {
    const body = managedDiscussionBody(
      "A post",
      "https://techsquidtv.com/blog/a-post/",
      "7f0ffb9e-5317-4dfd-bac2-57a29c3d5ef6",
    );

    expect(body).toContain(
      "<!-- techsquidtv-comment-thread:7f0ffb9e-5317-4dfd-bac2-57a29c3d5ef6 -->",
    );
    expect(body).toContain(
      "profile links, avatar images, timestamps, and comment text",
    );
  });

  it("rejects duplicate remote thread markers", async () => {
    const marker =
      "<!-- techsquidtv-comment-thread:7f0ffb9e-5317-4dfd-bac2-57a29c3d5ef6 -->";
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          data: {
            repository: {
              discussions: {
                nodes: [
                  {
                    body: marker,
                    id: "D_kwDOfirst",
                    title: "First",
                    url: "https://github.com/TechSquidTV/website/discussions/1",
                  },
                  {
                    body: marker,
                    id: "D_kwDOsecond",
                    title: "Second",
                    url: "https://github.com/TechSquidTV/website/discussions/2",
                  },
                ],
                pageInfo: { endCursor: null, hasNextPage: false },
              },
            },
          },
        }),
        { status: 200 },
      ),
    );

    await expect(
      findDiscussionByThreadId(
        "7f0ffb9e-5317-4dfd-bac2-57a29c3d5ef6",
        "DIC_kwDOcategory",
        { fetchImpl, token: "test-token" },
      ),
    ).rejects.toThrow("Multiple GitHub Discussions");
  });
});

describe("blog discussion cache keys", () => {
  it("changes only when its discussion changes", () => {
    const before = blogDiscussionCacheKey("post-digest", {
      comments: [],
      commentsTruncated: false,
      fetchedAt: "2026-08-28T12:00:00Z",
      id: "D_kwDOdiscussion",
      updatedAt: "2026-08-28T12:00:00Z",
      url: "https://github.com/TechSquidTV/website/discussions/1",
    });
    const after = blogDiscussionCacheKey("post-digest", {
      comments: [],
      commentsTruncated: false,
      fetchedAt: "2026-08-28T12:05:00Z",
      id: "D_kwDOdiscussion",
      updatedAt: "2026-08-28T12:05:00Z",
      url: "https://github.com/TechSquidTV/website/discussions/1",
    });

    expect(before).not.toBe(after);
    expect(blogDiscussionCacheKey("post-digest", undefined)).toBe(
      "post-digest:no-discussion",
    );
  });
});
