import type { ContentTopic } from "@/lib/analytics-taxonomy";

export const FORM_KINDS = ["contact", "newsletter"] as const;

export type FormKind = (typeof FORM_KINDS)[number];

export const NEWSLETTER_METRIC_PLACEMENTS = [
  "blog_inline",
  "follow_inline",
  "newsletter_page",
  "other",
] as const;

export type NewsletterMetricPlacement =
  (typeof NEWSLETTER_METRIC_PLACEMENTS)[number];

export interface NewsletterMetricAttribution {
  contentTopic: ContentTopic;
  placement: NewsletterMetricPlacement;
  sourcePostSlug?: string;
}

export function newsletterMetricAttributes(
  attribution: NewsletterMetricAttribution,
): Record<string, string> {
  return {
    placement: attribution.placement,
    content_topic: attribution.contentTopic,
    ...(attribution.sourcePostSlug
      ? { source_post_slug: attribution.sourcePostSlug }
      : {}),
  };
}

export const CONTACT_METRIC_PLACEMENTS = ["contact_page", "services"] as const;

export type ContactMetricPlacement = (typeof CONTACT_METRIC_PLACEMENTS)[number];

export type FormMetricPlacement =
  NewsletterMetricPlacement | ContactMetricPlacement;

export type FormFailureKind =
  | "network"
  | "origin"
  | "provider"
  | "rate_limit"
  | "turnstile_rejected"
  | "turnstile_unavailable"
  | "unexpected"
  | "validation";

function isOneOf<T extends readonly string[]>(
  value: string,
  values: T,
): value is T[number] {
  return values.includes(value);
}

export function formMetricPlacement(
  kind: "newsletter",
  value: string,
): NewsletterMetricPlacement;
export function formMetricPlacement(
  kind: "contact",
  value: string,
): ContactMetricPlacement;
export function formMetricPlacement(
  kind: FormKind,
  value: string,
): FormMetricPlacement;
export function formMetricPlacement(
  kind: FormKind,
  value: string,
): FormMetricPlacement {
  if (kind === "newsletter") {
    return isOneOf(value, NEWSLETTER_METRIC_PLACEMENTS) ? value : "other";
  }

  return isOneOf(value, CONTACT_METRIC_PLACEMENTS) ? value : "contact_page";
}
