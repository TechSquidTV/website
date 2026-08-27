import { contentTopic } from "@/lib/analytics-taxonomy";
import type { FormPayload } from "@/lib/form-submissions";
import {
  formMetricPlacement,
  type NewsletterMetricAttribution,
} from "@/lib/sentry-form-metrics";
import { getPublishedPosts } from "@/utils/blog";

function payloadString(payload: FormPayload, key: string): string {
  const value = payload[key];
  return typeof value === "string" ? value : "";
}

export async function newsletterMetricAttribution(
  payload: FormPayload,
): Promise<NewsletterMetricAttribution> {
  const placement = formMetricPlacement(
    "newsletter",
    payloadString(payload, "metricPlacement"),
  );
  const requestedSlug = payloadString(payload, "sourcePostSlug");

  if (!requestedSlug) {
    return { contentTopic: "other", placement };
  }

  const post = (await getPublishedPosts()).find(
    (candidate) => (candidate.data.slug || candidate.id) === requestedSlug,
  );

  if (!post) {
    return { contentTopic: "other", placement };
  }

  return {
    contentTopic: contentTopic(post.data.analyticsTopic),
    placement,
    sourcePostSlug: post.data.slug || post.id,
  };
}
