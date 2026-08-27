import { describe, expect, it } from "vitest";
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
});
