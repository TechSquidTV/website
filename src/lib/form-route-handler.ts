import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import {
  FormSubmissionError,
  assertSameOrigin,
  enforceRateLimit,
  formResponse,
  getTurnstileToken,
  parsePayload,
  verifyTurnstile,
  type FormPayload,
  type TurnstileAction,
} from "@/lib/form-submissions";
import {
  ResendFormError,
  type ResendFormConfiguration,
} from "@/lib/resend-forms";
import { trackFormSubmission } from "@/lib/sentry-server-metrics";
import { newsletterMetricAttribution } from "@/lib/sentry-newsletter-attribution";
import {
  formMetricPlacement,
  type FormFailureKind,
  type FormKind,
  type NewsletterMetricAttribution,
} from "@/lib/sentry-form-metrics";

interface FormRouteOptions<Submission> {
  kind: FormKind;
  parseSubmission: (payload: FormPayload) => Submission;
  submit: (
    submission: Submission,
    configuration: ResendFormConfiguration,
  ) => Promise<void>;
  successMessage: string;
  turnstileAction: TurnstileAction;
}

const GENERIC_ERROR_MESSAGE =
  "Unable to process your submission. Please try again.";

function metricFailureKind(error: unknown): FormFailureKind {
  if (error instanceof FormSubmissionError) {
    return error.failureKind;
  }

  if (error instanceof ResendFormError) return "provider";
  return "unexpected";
}

function resendConfiguration(): ResendFormConfiguration {
  return {
    apiKey: env.RESEND_API_KEY,
    contactRecipient: env.CONTACT_RECIPIENT,
    newsletterSegmentId: env.RESEND_NEWSLETTER_SEGMENT_ID,
  };
}

export function createFormHandler<Submission>(
  options: FormRouteOptions<Submission>,
): APIRoute {
  return async ({ request }) => {
    const startedAt = performance.now();
    let metricPlacement = formMetricPlacement(options.kind, "");
    let newsletterAttribution: NewsletterMetricAttribution | undefined;

    try {
      assertSameOrigin(request);
      const payload = await parsePayload(request);
      metricPlacement = formMetricPlacement(
        options.kind,
        typeof payload.metricPlacement === "string"
          ? payload.metricPlacement
          : "",
      );
      if (options.kind === "newsletter") {
        try {
          newsletterAttribution = await newsletterMetricAttribution(payload);
        } catch {
          newsletterAttribution = {
            contentTopic: "other",
            placement: formMetricPlacement(
              "newsletter",
              typeof payload.metricPlacement === "string"
                ? payload.metricPlacement
                : "",
            ),
          };
        }
        metricPlacement = newsletterAttribution.placement;
      }
      await verifyTurnstile(
        getTurnstileToken(payload),
        env.TURNSTILE_SECRET_KEY,
        request.headers.get("CF-Connecting-IP"),
        options.turnstileAction,
        env.TURNSTILE_HOSTNAMES,
      );
      await enforceRateLimit(env.FORM_RATE_LIMITER, request);
      await options.submit(
        options.parseSubmission(payload),
        resendConfiguration(),
      );

      trackFormSubmission(
        options.kind,
        metricPlacement,
        performance.now() - startedAt,
        undefined,
        newsletterAttribution,
      );
      return formResponse(options.successMessage, 200);
    } catch (error) {
      trackFormSubmission(
        options.kind,
        metricPlacement,
        performance.now() - startedAt,
        metricFailureKind(error),
        newsletterAttribution,
      );

      if (error instanceof FormSubmissionError) {
        return formResponse(error.message, error.status);
      }

      if (error instanceof ResendFormError) {
        return formResponse(error.message, 502);
      }

      return formResponse(GENERIC_ERROR_MESSAGE, 502);
    }
  };
}
