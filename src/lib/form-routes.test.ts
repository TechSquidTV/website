import { beforeEach, describe, expect, it, vi } from "vitest";
import { FormSubmissionError } from "@/lib/form-submissions";
import { ResendFormError } from "@/lib/resend-forms";

const dependencies = vi.hoisted(() => ({
  assertSameOrigin: vi.fn(),
  enforceRateLimit: vi.fn(),
  getTurnstileToken: vi.fn(),
  parseContactSubmission: vi.fn(),
  parseNewsletterSubmission: vi.fn(),
  parsePayload: vi.fn(),
  sendContactMessage: vi.fn(),
  subscribeToNewsletter: vi.fn(),
  verifyTurnstile: vi.fn(),
}));

vi.mock("cloudflare:workers", () => ({
  env: {
    CONTACT_RECIPIENT: "contact@techsquidtv.com",
    FORM_RATE_LIMITER: { limit: vi.fn() },
    RESEND_API_KEY: "test-key",
    RESEND_NEWSLETTER_SEGMENT_ID: "newsletter-segment",
    TURNSTILE_HOSTNAMES: "techsquidtv.com,www.techsquidtv.com",
    TURNSTILE_SECRET_KEY: "turnstile-secret",
  },
}));

vi.mock("astro:content", () => ({
  getCollection: vi.fn().mockResolvedValue([]),
}));

vi.mock("@/lib/form-submissions", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/lib/form-submissions")>();

  return {
    ...actual,
    assertSameOrigin: dependencies.assertSameOrigin,
    enforceRateLimit: dependencies.enforceRateLimit,
    getTurnstileToken: dependencies.getTurnstileToken,
    parseContactSubmission: dependencies.parseContactSubmission,
    parseNewsletterSubmission: dependencies.parseNewsletterSubmission,
    parsePayload: dependencies.parsePayload,
    verifyTurnstile: dependencies.verifyTurnstile,
  };
});

vi.mock("@/lib/resend-forms", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/resend-forms")>();

  return {
    ...actual,
    sendContactMessage: dependencies.sendContactMessage,
    subscribeToNewsletter: dependencies.subscribeToNewsletter,
  };
});

const { POST: contactPost } = await import("@/pages/api/forms/contact");
const { POST: newsletterPost } = await import("@/pages/api/forms/newsletter");

function requestFor(pathname: string): Request {
  return new Request(`https://techsquidtv.com${pathname}`, {
    headers: { "CF-Connecting-IP": "127.0.0.1" },
  });
}

function routeContext(request: Request): Parameters<typeof contactPost>[0] {
  return { request } as Parameters<typeof contactPost>[0];
}

describe("form API routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    dependencies.assertSameOrigin.mockImplementation(() => undefined);
  });

  it("orchestrates a successful contact submission", async () => {
    const request = requestFor("/api/forms/contact");
    const payload = { message: "Hello" };
    const submission = {
      email: "reader@example.com",
      message: "Hello",
      name: "Reader",
    };

    dependencies.parsePayload.mockResolvedValue(payload);
    dependencies.getTurnstileToken.mockReturnValue("turnstile-token");
    dependencies.parseContactSubmission.mockReturnValue(submission);

    const response = await contactPost(routeContext(request));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      message: "Thanks! Your message has been sent.",
    });
    expect(dependencies.verifyTurnstile).toHaveBeenCalledWith(
      "turnstile-token",
      "turnstile-secret",
      "127.0.0.1",
      "contact",
      "techsquidtv.com,www.techsquidtv.com",
    );
    expect(dependencies.enforceRateLimit).toHaveBeenCalledWith(
      expect.anything(),
      request,
    );
    expect(dependencies.sendContactMessage).toHaveBeenCalledWith(submission, {
      apiKey: "test-key",
      contactRecipient: "contact@techsquidtv.com",
      newsletterSegmentId: "newsletter-segment",
    });
  });

  it("orchestrates a successful newsletter subscription", async () => {
    const request = requestFor("/api/forms/newsletter");
    const payload = { email: "reader@example.com" };
    const submission = { email: "reader@example.com", name: "Reader" };

    dependencies.parsePayload.mockResolvedValue(payload);
    dependencies.getTurnstileToken.mockReturnValue("turnstile-token");
    dependencies.parseNewsletterSubmission.mockReturnValue(submission);

    const response = await newsletterPost(routeContext(request));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      message: "You’re subscribed. Thanks for staying in the loop!",
    });
    expect(dependencies.subscribeToNewsletter).toHaveBeenCalledWith(
      submission,
      {
        apiKey: "test-key",
        contactRecipient: "contact@techsquidtv.com",
        newsletterSegmentId: "newsletter-segment",
      },
    );
    expect(dependencies.verifyTurnstile).toHaveBeenCalledWith(
      "turnstile-token",
      "turnstile-secret",
      "127.0.0.1",
      "newsletter",
      "techsquidtv.com,www.techsquidtv.com",
    );
  });

  it("returns form-validation errors to the client", async () => {
    dependencies.assertSameOrigin.mockImplementation(() => {
      throw new FormSubmissionError("Invalid form submission.", 403, "origin");
    });

    const response = await newsletterPost(
      routeContext(requestFor("/api/forms/newsletter")),
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({
      message: "Invalid form submission.",
    });
  });

  it("maps Resend failures to a generic gateway response", async () => {
    dependencies.parsePayload.mockResolvedValue({ message: "Hello" });
    dependencies.getTurnstileToken.mockReturnValue("turnstile-token");
    dependencies.parseContactSubmission.mockReturnValue({
      email: "reader@example.com",
      message: "Hello",
      name: "Reader",
    });
    dependencies.sendContactMessage.mockRejectedValue(new ResendFormError());

    const response = await contactPost(
      routeContext(requestFor("/api/forms/contact")),
    );

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({
      message: "Unable to process your submission. Please try again.",
    });
  });
});
