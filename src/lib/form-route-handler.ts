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

interface FormRouteOptions<Submission> {
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
    try {
      assertSameOrigin(request);
      const payload = await parsePayload(request);
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

      return formResponse(options.successMessage, 200);
    } catch (error) {
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
