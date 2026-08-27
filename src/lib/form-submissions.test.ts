import { describe, expect, it, vi } from "vitest";
import {
  FormSubmissionError,
  enforceRateLimit,
  parseNewsletterSubmission,
  verifyTurnstile,
} from "@/lib/form-submissions";
import {
  type ContactResendClient,
  type NewsletterResendClient,
  ResendFormError,
  sendContactMessage,
  subscribeToNewsletter,
} from "@/lib/resend-forms";

const configuration = {
  apiKey: "test-key",
  contactRecipient: "contact@techsquidtv.com",
  newsletterSegmentId: "newsletter-segment",
};

const success = { data: {}, error: null };

describe("newsletter submissions", () => {
  it("normalizes a valid email address", () => {
    expect(
      parseNewsletterSubmission({
        email: "  Reader@Example.com ",
        name: "Reader",
      }),
    ).toEqual({ email: "reader@example.com", name: "Reader" });
  });

  it("rejects malformed email addresses", () => {
    expect(() =>
      parseNewsletterSubmission({ email: "not-an-email", name: "Reader" }),
    ).toThrow(FormSubmissionError);
  });

  it("updates an existing contact and restores its segment membership", async () => {
    const update = vi.fn().mockResolvedValue(success);
    const add = vi.fn().mockResolvedValue(success);
    const create = vi.fn().mockResolvedValue(success);
    const client: NewsletterResendClient = {
      contacts: {
        create,
        get: vi.fn().mockResolvedValue(success),
        segments: { add },
        update,
      },
    };

    await subscribeToNewsletter(
      { email: "reader@example.com", name: "Reader" },
      configuration,
      client,
    );

    expect(update).toHaveBeenCalledWith({
      email: "reader@example.com",
      firstName: "Reader",
      unsubscribed: false,
    });
    expect(add).toHaveBeenCalledWith({
      email: "reader@example.com",
      segmentId: "newsletter-segment",
    });
    expect(create).not.toHaveBeenCalled();
  });

  it("maps a Resend delivery error to the generic form error", async () => {
    const client: ContactResendClient = {
      emails: {
        send: vi.fn().mockResolvedValue({
          data: null,
          error: { message: "provider detail" },
        }),
      },
    };

    await expect(
      sendContactMessage(
        {
          email: "reader@example.com",
          message: "Hello",
          name: "Reader",
        },
        configuration,
        client,
      ),
    ).rejects.toBeInstanceOf(ResendFormError);
  });
});

describe("submission protection", () => {
  it("rejects a failed Turnstile verification", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            action: "newsletter",
            hostname: "techsquidtv.com",
            success: false,
          }),
        ),
      ),
    );

    await expect(
      verifyTurnstile(
        "token",
        "secret",
        "127.0.0.1",
        "newsletter",
        "techsquidtv.com,www.techsquidtv.com",
      ),
    ).rejects.toMatchObject({
      failureKind: "turnstile_rejected",
      status: 403,
    });

    vi.unstubAllGlobals();
  });

  it("rejects a token issued for a different action or hostname", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            action: "contact",
            hostname: "untrusted.example",
            success: true,
          }),
        ),
      ),
    );

    await expect(
      verifyTurnstile(
        "token",
        "secret",
        "127.0.0.1",
        "newsletter",
        "techsquidtv.com,www.techsquidtv.com",
      ),
    ).rejects.toMatchObject({
      failureKind: "turnstile_rejected",
      status: 403,
    });

    vi.unstubAllGlobals();
  });

  it("rejects requests over the configured rate limit", async () => {
    await expect(
      enforceRateLimit(
        { limit: vi.fn().mockResolvedValue({ success: false }) },
        new Request("https://techsquidtv.com/api/forms/newsletter"),
      ),
    ).rejects.toMatchObject({ failureKind: "rate_limit", status: 429 });
  });

  it("identifies an unavailable Turnstile service", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));

    await expect(
      verifyTurnstile(
        "token",
        "secret",
        "127.0.0.1",
        "newsletter",
        "techsquidtv.com,www.techsquidtv.com",
      ),
    ).rejects.toMatchObject({
      failureKind: "turnstile_unavailable",
      status: 502,
    });

    vi.unstubAllGlobals();
  });
});
