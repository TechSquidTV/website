import * as Sentry from "@sentry/cloudflare";
import type {
  FormFailureKind,
  FormKind,
  FormMetricPlacement,
  NewsletterMetricAttribution,
} from "@/lib/sentry-form-metrics";
import {
  formMetricPlacement,
  newsletterMetricAttributes,
} from "@/lib/sentry-form-metrics";

function captureMetric(action: () => void): void {
  try {
    action();
  } catch {
    // Observability must never make a form submission fail.
  }
}

export function trackFormSubmission(
  kind: FormKind,
  placement: FormMetricPlacement,
  durationMs: number,
  failureKind?: FormFailureKind,
  newsletterAttribution?: NewsletterMetricAttribution,
): void {
  const outcome = failureKind ? "failure" : "success";
  const attributes = {
    form_kind: kind,
    outcome,
    placement,
  };

  captureMetric(() => {
    Sentry.metrics.distribution("form.submit.duration", durationMs, {
      attributes,
      unit: "millisecond",
    });
  });

  captureMetric(() => {
    Sentry.metrics.count(
      failureKind ? "form.submit.failed" : "form.submit.succeeded",
      1,
      {
        attributes: failureKind
          ? { ...attributes, failure_kind: failureKind }
          : attributes,
      },
    );
  });

  if (kind === "newsletter") {
    const attribution = newsletterAttribution ?? {
      contentTopic: "other" as const,
      placement: formMetricPlacement("newsletter", placement),
    };
    const newsletterAttributes = newsletterMetricAttributes(attribution);

    captureMetric(() => {
      Sentry.metrics.count(
        failureKind
          ? "newsletter.subscribe.failed"
          : "newsletter.subscribe.succeeded",
        1,
        {
          attributes: failureKind
            ? { ...newsletterAttributes, failure_kind: failureKind }
            : newsletterAttributes,
        },
      );
    });
  }

  if (kind === "contact" && !failureKind) {
    captureMetric(() => {
      Sentry.metrics.count("contact.submit.succeeded", 1, {
        attributes: { placement },
      });
    });
  }

  if (kind === "contact" && failureKind) {
    captureMetric(() => {
      Sentry.metrics.count("contact.submit.failed", 1, {
        attributes: { failure_kind: failureKind, placement },
      });
    });
  }

  if (failureKind === "rate_limit") {
    captureMetric(() => {
      Sentry.metrics.count("form.rate_limited", 1, {
        attributes: { form_kind: kind, placement },
      });
    });
  }

  if (failureKind === "turnstile_rejected") {
    captureMetric(() => {
      Sentry.metrics.count("form.turnstile.rejected", 1, {
        attributes: { form_kind: kind, placement },
      });
    });
  }

  if (failureKind === "turnstile_unavailable") {
    captureMetric(() => {
      Sentry.metrics.count("form.turnstile.unavailable", 1, {
        attributes: { form_kind: kind, placement },
      });
    });
  }
}
