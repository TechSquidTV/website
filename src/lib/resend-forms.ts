import { Resend } from "resend";
import type {
  ContactSubmission,
  NewsletterSubmission,
} from "@/lib/form-submissions";

export interface ResendFormConfiguration {
  apiKey: string;
  contactRecipient: string;
  newsletterSegmentId: string;
}

interface ResendError {
  message: string;
  statusCode?: number | null;
}

interface ResendResult<T> {
  data: T | null;
  error: ResendError | null;
}

export interface NewsletterResendClient {
  contacts: {
    create(options: {
      email: string;
      firstName?: string;
      segments: { id: string }[];
      unsubscribed: boolean;
    }): Promise<ResendResult<object>>;
    get(email: string): Promise<ResendResult<object>>;
    segments: {
      add(options: {
        email: string;
        segmentId: string;
      }): Promise<ResendResult<object>>;
    };
    update(options: {
      email: string;
      firstName: string | null;
      unsubscribed: boolean;
    }): Promise<ResendResult<object>>;
  };
}

export interface ContactResendClient {
  emails: {
    send(options: {
      from: string;
      html: string;
      replyTo: string;
      subject: string;
      text: string;
      to: string;
    }): Promise<ResendResult<object>>;
  };
}

export class ResendFormError extends Error {
  constructor() {
    super("Unable to process your submission. Please try again.");
    this.name = "ResendFormError";
  }
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function requireSuccess(result: { error: ResendError | null }): void {
  if (result.error) {
    throw new ResendFormError();
  }
}

export async function subscribeToNewsletter(
  submission: NewsletterSubmission,
  configuration: ResendFormConfiguration,
  client: NewsletterResendClient = new Resend(configuration.apiKey),
): Promise<void> {
  const contact = await client.contacts.get(submission.email);

  if (contact.data) {
    const update = await client.contacts.update({
      email: submission.email,
      firstName: submission.name || null,
      unsubscribed: false,
    });
    requireSuccess(update);

    const segment = await client.contacts.segments.add({
      email: submission.email,
      segmentId: configuration.newsletterSegmentId,
    });
    requireSuccess(segment);
    return;
  }

  if (contact.error?.statusCode !== 404) {
    throw new ResendFormError();
  }

  const created = await client.contacts.create({
    email: submission.email,
    ...(submission.name ? { firstName: submission.name } : {}),
    segments: [{ id: configuration.newsletterSegmentId }],
    unsubscribed: false,
  });
  requireSuccess(created);
}

export async function sendContactMessage(
  submission: ContactSubmission,
  configuration: ResendFormConfiguration,
  client: ContactResendClient = new Resend(configuration.apiKey),
): Promise<void> {
  const escapedName = escapeHtml(submission.name);
  const escapedEmail = escapeHtml(submission.email);
  const escapedMessage = escapeHtml(submission.message).replaceAll(
    "\n",
    "<br />",
  );

  const response = await client.emails.send({
    from: "TechSquidTV Forms <forms@updates.techsquidtv.com>",
    html: `<h1>New TechSquidTV contact message</h1><p><strong>Name:</strong> ${escapedName}</p><p><strong>Email:</strong> ${escapedEmail}</p><p><strong>Message:</strong><br />${escapedMessage}</p>`,
    replyTo: submission.email,
    subject: `New contact message from ${submission.name}`,
    text: `New TechSquidTV contact message\n\nName: ${submission.name}\nEmail: ${submission.email}\n\nMessage:\n${submission.message}`,
    to: configuration.contactRecipient,
  });
  requireSuccess(response);
}
