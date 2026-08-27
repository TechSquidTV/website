import { createFormHandler } from "@/lib/form-route-handler";
import { parseContactSubmission } from "@/lib/form-submissions";
import { sendContactMessage } from "@/lib/resend-forms";

export const prerender = false;

export const POST = createFormHandler({
  parseSubmission: parseContactSubmission,
  submit: sendContactMessage,
  successMessage: "Thanks! Your message has been sent.",
  turnstileAction: "contact",
});
