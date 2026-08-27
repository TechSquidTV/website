import { beforeEach, describe, expect, it, vi } from "vitest";

const metrics = vi.hoisted(() => ({
  count: vi.fn(),
  distribution: vi.fn(),
}));

vi.mock("@sentry/cloudflare", () => ({ metrics }));

const { trackFormSubmission } = await import("@/lib/sentry-server-metrics");

describe("server form metrics", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("emits exactly one newsletter success metric after a successful subscription", () => {
    trackFormSubmission("newsletter", "blog_inline", 250, undefined, {
      contentTopic: "devops",
      placement: "blog_inline",
      sourcePostSlug: "how-to-docker-compose",
    });

    const newsletterSuccesses = metrics.count.mock.calls.filter(
      ([name]) => name === "newsletter.subscribe.succeeded",
    );

    expect(newsletterSuccesses).toHaveLength(1);
    expect(newsletterSuccesses[0]).toEqual([
      "newsletter.subscribe.succeeded",
      1,
      {
        attributes: {
          content_topic: "devops",
          placement: "blog_inline",
          source_post_slug: "how-to-docker-compose",
        },
      },
    ]);
  });
});
