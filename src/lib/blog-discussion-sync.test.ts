import { describe, expect, it } from "vitest";
import {
  assertValidDiscussionMappings,
  blogPostSlug,
  canonicalBlogPostUrl,
  isNewPublicBlogPost,
  parseBlogFrontmatter,
  setBlogFrontmatterValue,
} from "@/lib/blog-discussion-sync";

const sourcePath = "src/content/blog/2026/example-post.mdx";

describe("blog Discussion frontmatter", () => {
  it("parses and updates automation-owned metadata without changing article content", () => {
    const source = `---\ntitle: Example post\nslug: hello world\ndraft: false\n---\n\nArticle body.\n`;
    const withThread = setBlogFrontmatterValue(
      source,
      "commentThreadId",
      "7f0ffb9e-5317-4dfd-bac2-57a29c3d5ef6",
    );
    const updated = setBlogFrontmatterValue(
      withThread,
      "discussionId",
      "D_kwDOdiscussion",
    );

    expect(parseBlogFrontmatter(updated, sourcePath)).toMatchObject({
      commentThreadId: "7f0ffb9e-5317-4dfd-bac2-57a29c3d5ef6",
      discussionId: "D_kwDOdiscussion",
      draft: false,
      slug: "hello world",
      title: "Example post",
    });
    expect(updated).toContain("Article body.");
  });

  it("constructs canonical URLs from encoded slugs and content paths", () => {
    const frontmatter = parseBlogFrontmatter(
      "---\ntitle: Example post\n---\n",
      sourcePath,
    );

    expect(blogPostSlug(sourcePath, frontmatter)).toBe("2026/example-post");
    expect(canonicalBlogPostUrl("hello world/part #2")).toBe(
      "https://techsquidtv.com/blog/hello%20world/part%20%232/",
    );
  });

  it("rejects malformed automation-owned identifiers before provisioning", () => {
    expect(() =>
      parseBlogFrontmatter(
        "---\ntitle: Example post\ncommentThreadId: not-a-uuid\n---\n",
        sourcePath,
      ),
    ).toThrow("commentThreadId as a UUID");

    expect(() =>
      parseBlogFrontmatter(
        '---\ntitle: Example post\ndiscussionId: ""\n---\n',
        sourcePath,
      ),
    ).toThrow("discussionId as a non-empty string");
  });
});

describe("publication detection", () => {
  const publicPost = {
    commentThreadId: undefined,
    discussionId: undefined,
    draft: false,
    slug: "example-post",
    title: "Example post",
  };
  const draftPost = { ...publicPost, draft: true };

  it("selects only new public posts and draft-to-public transitions", () => {
    expect(isNewPublicBlogPost(undefined, publicPost)).toBe(true);
    expect(isNewPublicBlogPost(draftPost, publicPost)).toBe(true);
    expect(isNewPublicBlogPost(publicPost, publicPost)).toBe(false);
    expect(isNewPublicBlogPost(undefined, draftPost)).toBe(false);
  });
});

describe("Discussion mappings", () => {
  it("allows a prepared thread awaiting provisioning", () => {
    expect(() =>
      assertValidDiscussionMappings([
        {
          commentThreadId: "7f0ffb9e-5317-4dfd-bac2-57a29c3d5ef6",
          discussionId: undefined,
          path: sourcePath,
        },
      ]),
    ).not.toThrow();
  });

  it("rejects orphaned or duplicate IDs", () => {
    expect(() =>
      assertValidDiscussionMappings([
        {
          commentThreadId: undefined,
          discussionId: "D_kwDOdiscussion",
          path: sourcePath,
        },
      ]),
    ).toThrow("without a commentThreadId");

    expect(() =>
      assertValidDiscussionMappings([
        {
          commentThreadId: "7f0ffb9e-5317-4dfd-bac2-57a29c3d5ef6",
          discussionId: "D_kwDOdiscussion",
          path: sourcePath,
        },
        {
          commentThreadId: "8b6dc074-931b-468b-8f2d-bdb75bc91d2e",
          discussionId: "D_kwDOdiscussion",
          path: "src/content/blog/2026/another-post.mdx",
        },
      ]),
    ).toThrow("is shared");
  });
});
