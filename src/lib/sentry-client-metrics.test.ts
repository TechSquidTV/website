import { beforeEach, describe, expect, it, vi } from "vitest";

const NEWSLETTER_ATTRIBUTION_STORAGE_KEY = "techsquidtv.newsletter-attribution";

vi.mock("@sentry/astro", () => ({
  metrics: {
    count: vi.fn(),
    distribution: vi.fn(),
  },
}));

const clientMetrics = await import("@/lib/sentry-client-metrics");

describe("newsletter browser attribution", () => {
  let storage: Map<string, string>;

  beforeEach(() => {
    storage = new Map();
    vi.stubGlobal("document", {
      querySelector: vi.fn().mockReturnValue(null),
    });
    vi.stubGlobal("window", {
      location: { pathname: "/newsletter/" },
      sessionStorage: {
        getItem: (key: string) => storage.get(key) ?? null,
        removeItem: (key: string) => storage.delete(key),
        setItem: (key: string, value: string) => storage.set(key, value),
      },
    });
  });

  it("uses only the controlled fields stored by a blog CTA", () => {
    storage.set(
      NEWSLETTER_ATTRIBUTION_STORAGE_KEY,
      JSON.stringify({
        contentTopic: "devops",
        placement: "blog_inline",
        sourcePostSlug: "how-to-docker-compose",
      }),
    );

    expect(
      clientMetrics.newsletterAttributionForForm("newsletter_page"),
    ).toEqual({
      contentTopic: "devops",
      placement: "blog_inline",
      sourcePostSlug: "how-to-docker-compose",
    });
  });

  it("clears stored attribution after a successful subscription", () => {
    storage.set(
      NEWSLETTER_ATTRIBUTION_STORAGE_KEY,
      JSON.stringify({
        contentTopic: "devops",
        placement: "blog_inline",
        sourcePostSlug: "how-to-docker-compose",
      }),
    );

    clientMetrics.clearNewsletterAttribution();

    expect(storage.has(NEWSLETTER_ATTRIBUTION_STORAGE_KEY)).toBe(false);
    expect(
      clientMetrics.newsletterAttributionForForm("newsletter_page"),
    ).toEqual({ contentTopic: "other", placement: "newsletter_page" });
  });

  it("drops malformed post slugs from browser storage", () => {
    storage.set(
      NEWSLETTER_ATTRIBUTION_STORAGE_KEY,
      JSON.stringify({
        contentTopic: "devops",
        placement: "blog_inline",
        sourcePostSlug: "reader@example.com",
      }),
    );

    expect(
      clientMetrics.newsletterAttributionForForm("newsletter_page"),
    ).toEqual({ contentTopic: "other", placement: "newsletter_page" });
  });
});
