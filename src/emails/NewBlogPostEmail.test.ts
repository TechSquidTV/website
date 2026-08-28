import { describe, expect, it } from "vitest";
import {
  NEWSLETTER_TEMPLATE_ALIAS,
  NEWSLETTER_TEMPLATE_VARIABLE_KEYS,
} from "@/emails/new-blog-post.template-variables";
import { newsletterCampaignUrl } from "@/emails/newsletter-url";

describe("newsletterCampaignUrl", () => {
  it("adds the newsletter source while preserving existing query parameters", () => {
    expect(
      newsletterCampaignUrl("https://techsquidtv.com/blog/docker?view=full"),
    ).toBe(
      "https://techsquidtv.com/blog/docker?view=full&utm_source=newsletter",
    );
  });

  it("keeps Resend placeholders intact for the hosted template", () => {
    expect(newsletterCampaignUrl("{{{POST_URL}}}")).toBe(
      "{{{POST_URL}}}?utm_source=newsletter",
    );
  });

  it("defines a stable alias and bounded template variable list", () => {
    expect(NEWSLETTER_TEMPLATE_ALIAS).toBe("techsquidtv-new-blog-post");
    expect(NEWSLETTER_TEMPLATE_VARIABLE_KEYS).toHaveLength(18);
    expect(new Set(NEWSLETTER_TEMPLATE_VARIABLE_KEYS)).toHaveLength(
      NEWSLETTER_TEMPLATE_VARIABLE_KEYS.length,
    );
  });
});
