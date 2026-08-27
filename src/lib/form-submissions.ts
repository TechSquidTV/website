export class FormSubmissionError extends Error {
  constructor(
    message: string,
    readonly status: 400 | 403 | 429 | 502,
  ) {
    super(message);
    this.name = "FormSubmissionError";
  }
}

export interface NewsletterSubmission {
  email: string;
  name: string;
}

export interface ContactSubmission extends NewsletterSubmission {
  message: string;
}

interface TurnstileVerification {
  action: string;
  hostname: string;
  success: boolean;
}

export type TurnstileAction = "contact" | "newsletter";

export type FormPayload = Record<string, unknown>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/u;
const MAX_NAME_LENGTH = 120;
const MAX_MESSAGE_LENGTH = 10_000;
const MAX_TURNSTILE_TOKEN_LENGTH = 2_048;

function isFormPayload(value: unknown): value is FormPayload {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isTurnstileVerification(
  value: unknown,
): value is TurnstileVerification {
  return (
    typeof value === "object" &&
    value !== null &&
    "success" in value &&
    typeof value.success === "boolean" &&
    "action" in value &&
    typeof value.action === "string" &&
    "hostname" in value &&
    typeof value.hostname === "string"
  );
}

function readString(payload: FormPayload, key: string): string {
  const value = payload[key];
  return typeof value === "string" ? value.trim() : "";
}

function readRequiredString(
  payload: FormPayload,
  key: string,
  label: string,
  maxLength: number,
): string {
  const value = readString(payload, key);

  if (value.length === 0 || value.length > maxLength) {
    throw new FormSubmissionError(`Please provide a valid ${label}.`, 400);
  }

  return value;
}

function readEmail(payload: FormPayload): string {
  const email = readRequiredString(
    payload,
    "email",
    "email address",
    320,
  ).toLowerCase();

  if (!EMAIL_PATTERN.test(email)) {
    throw new FormSubmissionError("Please provide a valid email address.", 400);
  }

  return email;
}

export async function parsePayload(request: Request): Promise<FormPayload> {
  if (!request.headers.get("content-type")?.includes("application/json")) {
    throw new FormSubmissionError("Invalid form submission.", 400);
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    throw new FormSubmissionError("Invalid form submission.", 400);
  }

  if (!isFormPayload(payload)) {
    throw new FormSubmissionError("Invalid form submission.", 400);
  }

  if (readString(payload, "dontCheckMe").length > 0) {
    throw new FormSubmissionError("Invalid form submission.", 400);
  }

  return payload;
}

export function parseNewsletterSubmission(
  payload: FormPayload,
): NewsletterSubmission {
  return {
    email: readEmail(payload),
    name: readString(payload, "name").slice(0, MAX_NAME_LENGTH),
  };
}

export function parseContactSubmission(
  payload: FormPayload,
): ContactSubmission {
  return {
    ...parseNewsletterSubmission(payload),
    message: readRequiredString(
      payload,
      "message",
      "message",
      MAX_MESSAGE_LENGTH,
    ),
  };
}

export function assertSameOrigin(request: Request): void {
  const origin = request.headers.get("origin");

  if (origin !== new URL(request.url).origin) {
    throw new FormSubmissionError("Invalid form submission.", 403);
  }
}

export async function verifyTurnstile(
  token: string,
  secret: string,
  remoteIp: string | null,
  expectedAction: TurnstileAction,
  expectedHostnames: string,
): Promise<void> {
  const hostnames = new Set(
    expectedHostnames
      .split(",")
      .map((hostname) => hostname.trim())
      .filter(Boolean),
  );

  if (
    token.length === 0 ||
    token.length > MAX_TURNSTILE_TOKEN_LENGTH ||
    secret.length === 0 ||
    hostnames.size === 0
  ) {
    throw new FormSubmissionError(
      "Please complete the verification challenge.",
      403,
    );
  }

  const body = new URLSearchParams({ response: token, secret });
  if (remoteIp) {
    body.set("remoteip", remoteIp);
  }

  let response: Response;

  try {
    response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        body,
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        method: "POST",
        signal: AbortSignal.timeout(10_000),
      },
    );
  } catch {
    throw new FormSubmissionError(
      "Unable to verify your submission. Please try again.",
      502,
    );
  }

  if (!response.ok) {
    throw new FormSubmissionError(
      "Unable to verify your submission. Please try again.",
      502,
    );
  }

  const result: unknown = await response.json();
  if (
    !isTurnstileVerification(result) ||
    !result.success ||
    result.action !== expectedAction ||
    !hostnames.has(result.hostname)
  ) {
    throw new FormSubmissionError(
      "Please complete the verification challenge.",
      403,
    );
  }
}

export async function enforceRateLimit(
  limiter: FormRateLimiter,
  request: Request,
): Promise<void> {
  const key = request.headers.get("CF-Connecting-IP") ?? "unknown";
  const result = await limiter.limit({ key });

  if (!result.success) {
    throw new FormSubmissionError(
      "Too many submissions. Please try again later.",
      429,
    );
  }
}

export function formResponse(message: string, status: number): Response {
  return Response.json({ message }, { status });
}

export function getTurnstileToken(payload: FormPayload): string {
  return readString(payload, "turnstileToken");
}
