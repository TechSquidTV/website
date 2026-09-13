import {
  clearNewsletterAttribution,
  newsletterAttributionForForm,
  trackClientFormFailure,
  trackNewsletterSubscribeStarted,
} from "@/lib/sentry-client-metrics";
import {
  formMetricPlacement,
  type NewsletterMetricAttribution,
} from "@/lib/sentry-form-metrics";

import { verifyTurnstile } from "@/lib/turnstile-client";

const activeSubmissions = new Set<AbortController>();

interface SubmissionDialog {
  cancelButton: HTMLButtonElement;
  challenge: HTMLElement;
  closeButton: HTMLButtonElement;
  dialog: HTMLDialogElement;
  message: HTMLElement;
  title: HTMLElement;
  widget: HTMLElement;
}

function valueFromForm(form: HTMLFormElement, name: string): string {
  const value = new FormData(form).get(name);
  return typeof value === "string" ? value : "";
}

function messageFromResponse(value: unknown): string {
  if (
    typeof value === "object" &&
    value !== null &&
    "message" in value &&
    typeof value.message === "string"
  ) {
    return value.message;
  }

  return "Unable to process your submission. Please try again.";
}

type FormStatusTone = "error" | "neutral" | "success";

function setStatus(
  status: HTMLElement,
  message: string,
  tone: FormStatusTone,
): void {
  status.textContent = message;
  status.classList.toggle("text-red-500", tone === "error");
  status.classList.toggle("text-green-600", tone === "success");
}

function submissionDialog(form: HTMLFormElement): SubmissionDialog | null {
  const id = form.dataset.formDialog;
  const dialog = id ? document.getElementById(id) : null;

  if (!(dialog instanceof HTMLDialogElement)) {
    return null;
  }

  const title = dialog.querySelector<HTMLElement>("[data-form-dialog-title]");
  const message = dialog.querySelector<HTMLElement>(
    "[data-form-dialog-message]",
  );
  const closeButton = dialog.querySelector<HTMLButtonElement>(
    "[data-form-dialog-close]",
  );
  const cancelButton = dialog.querySelector<HTMLButtonElement>(
    "[data-form-dialog-cancel]",
  );
  const challenge = dialog.querySelector<HTMLElement>(
    "[data-form-dialog-challenge]",
  );
  const widget = dialog.querySelector<HTMLElement>("[data-turnstile]");

  if (
    !title ||
    !message ||
    !closeButton ||
    !cancelButton ||
    !challenge ||
    !widget
  ) {
    return null;
  }

  return {
    cancelButton,
    challenge,
    closeButton,
    dialog,
    message,
    title,
    widget,
  };
}

type SubmissionState = "error" | "submitting" | "success" | "verifying";

function updateDialog(
  dialog: SubmissionDialog,
  state: SubmissionState,
  title: string,
  message: string,
): void {
  const isComplete = state === "error" || state === "success";
  dialog.title.textContent = title;
  dialog.message.textContent = message;
  dialog.challenge.hidden = isComplete;
  dialog.cancelButton.hidden = isComplete;
  dialog.closeButton.hidden = !isComplete;

  if (!dialog.dialog.open) {
    dialog.dialog.showModal();
  }

  (isComplete ? dialog.closeButton : dialog.cancelButton).focus();
}

function initialiseForm(form: HTMLFormElement): void {
  if (form.dataset.submissionInitialised === "true") {
    return;
  }

  const endpoint = form.dataset.formEndpoint;
  const kind = form.dataset.formKind;
  const status = form.querySelector<HTMLElement>("[data-form-status]");
  const dialog = submissionDialog(form);
  const submitButton = form.querySelector<HTMLButtonElement>(
    'button[type="submit"]',
  );

  if (
    !endpoint ||
    (kind !== "contact" && kind !== "newsletter") ||
    !status ||
    !dialog ||
    !submitButton
  ) {
    return;
  }

  form.dataset.submissionInitialised = "true";
  let activeSubmission: AbortController | undefined;

  dialog.closeButton.addEventListener("click", () => dialog.dialog.close());
  dialog.cancelButton.addEventListener("click", () => {
    activeSubmission?.abort();
    dialog.dialog.close();
  });
  dialog.dialog.addEventListener("close", () => {
    activeSubmission?.abort();
    activeSubmission = undefined;
    submitButton.focus();
  });
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (activeSubmission) return;
    submitButton.disabled = true;
    const controller = new AbortController();
    activeSubmission = controller;
    activeSubmissions.add(controller);
    setStatus(status, "Verifying…", "neutral");
    updateDialog(
      dialog,
      "verifying",
      "Checking your submission",
      "Please wait while we verify your submission.",
    );

    const rawMetricPlacement = form.dataset.sentryPlacement ?? "";
    const metricPlacement = formMetricPlacement(kind, rawMetricPlacement);
    let newsletterAttribution: NewsletterMetricAttribution | undefined;

    try {
      const turnstileToken = await verifyTurnstile(
        dialog.widget,
        controller.signal,
      );
      const payload: Record<string, string> = {
        dontCheckMe: valueFromForm(form, "dontCheckMe"),
        email: valueFromForm(form, "email"),
        name: valueFromForm(form, "name"),
        metricPlacement,
        turnstileToken,
      };

      if (kind === "contact") {
        payload.message = valueFromForm(form, "message");
      } else {
        newsletterAttribution = newsletterAttributionForForm(
          formMetricPlacement("newsletter", rawMetricPlacement),
        );
        payload.contentTopic = newsletterAttribution.contentTopic;
        payload.metricPlacement = newsletterAttribution.placement;
        payload.sourcePostSlug = newsletterAttribution.sourcePostSlug ?? "";
        trackNewsletterSubscribeStarted(newsletterAttribution);
      }

      setStatus(status, "Submitting…", "neutral");
      updateDialog(
        dialog,
        "submitting",
        "Sending your submission",
        "Almost there…",
      );
      const response = await fetch(endpoint, {
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
        method: "POST",
        signal: controller.signal,
      });
      const body: unknown = await response.json();
      controller.signal.throwIfAborted();
      const message = messageFromResponse(body);

      if (!response.ok) {
        setStatus(status, message, "error");
        updateDialog(dialog, "error", "Something went wrong", message);
        return;
      }

      form.reset();
      if (kind === "newsletter") {
        clearNewsletterAttribution();
      }
      setStatus(status, message, "success");
      updateDialog(
        dialog,
        "success",
        kind === "newsletter" ? "You’re subscribed!" : "Message sent!",
        message,
      );
    } catch (error) {
      if (
        controller.signal.aborted ||
        (error instanceof DOMException && error.name === "AbortError")
      ) {
        setStatus(status, "Submission cancelled.", "neutral");
        return;
      }

      trackClientFormFailure(kind, newsletterAttribution);
      const message = "Unable to process your submission. Please try again.";
      setStatus(status, message, "error");
      updateDialog(dialog, "error", "Something went wrong", message);
    } finally {
      activeSubmissions.delete(controller);
      submitButton.disabled = false;
      if (activeSubmission === controller) {
        activeSubmission = undefined;
      }
    }
  });
}

function initialiseForms(): void {
  document
    .querySelectorAll<HTMLFormElement>("[data-form-endpoint]")
    .forEach(initialiseForm);
}

document.addEventListener("astro:page-load", initialiseForms);
document.addEventListener("astro:before-swap", () => {
  for (const controller of activeSubmissions) controller.abort();
});
initialiseForms();
