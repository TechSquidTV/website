import { beforeEach, describe, expect, it, vi } from "vitest";

const dependencies = vi.hoisted(() => ({
  getPublishedPosts: vi.fn(),
}));

vi.mock("@/utils/blog", () => ({
  getPublishedPosts: dependencies.getPublishedPosts,
}));

const { newsletterMetricAttribution } =
  await import("@/lib/sentry-newsletter-attribution");

describe("newsletter metric attribution", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uses a post's controlled topic and canonical slug", async () => {
    dependencies.getPublishedPosts.mockResolvedValue([
      {
        data: { analyticsTopic: "devops", slug: "how-to-docker-compose" },
        id: "docker-compose",
      },
    ]);

    await expect(
      newsletterMetricAttribution({
        contentTopic: "spoofed",
        metricPlacement: "blog_inline",
        sourcePostSlug: "how-to-docker-compose",
      }),
    ).resolves.toEqual({
      contentTopic: "devops",
      placement: "blog_inline",
      sourcePostSlug: "how-to-docker-compose",
    });
  });

  it("drops unrecognized source posts and invalid placements", async () => {
    dependencies.getPublishedPosts.mockResolvedValue([]);

    await expect(
      newsletterMetricAttribution({
        metricPlacement: "a-unique-placement",
        sourcePostSlug: "a-unique-untrusted-slug",
      }),
    ).resolves.toEqual({ contentTopic: "other", placement: "other" });
  });

  it("uses aggregate fallback attribution when a source post is absent", async () => {
    await expect(
      newsletterMetricAttribution({ metricPlacement: "newsletter_page" }),
    ).resolves.toEqual({
      contentTopic: "other",
      placement: "newsletter_page",
    });
    expect(dependencies.getPublishedPosts).not.toHaveBeenCalled();
  });
});
