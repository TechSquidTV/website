export type AbsoluteUrl = `https://${string}` | `http://${string}`;
export type TemplateVariable = `{{{${string}}}}`;
export type NewsletterUrl = AbsoluteUrl | TemplateVariable;

export function newsletterCampaignUrl(url: NewsletterUrl): string {
  if (url.startsWith("{{{")) {
    // Resend resolves template variables after rendering, so publishing must
    // supply canonical URLs without query parameters.
    return `${url}?utm_source=newsletter`;
  }

  const campaignUrl = new URL(url);
  campaignUrl.searchParams.set("utm_source", "newsletter");
  return campaignUrl.href;
}
