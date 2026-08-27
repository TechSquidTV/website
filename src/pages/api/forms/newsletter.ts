import { createFormHandler } from "@/lib/form-route-handler";
import { parseNewsletterSubmission } from "@/lib/form-submissions";
import { subscribeToNewsletter } from "@/lib/resend-forms";

export const prerender = false;

export const POST = createFormHandler({
  parseSubmission: parseNewsletterSubmission,
  submit: subscribeToNewsletter,
  successMessage: "You’re subscribed. Thanks for staying in the loop!",
  turnstileAction: "newsletter",
});
