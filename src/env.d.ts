// Import Astro types first to ensure proper precedence
/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface FormRateLimiter {
  limit(options: { key: string }): Promise<{ success: boolean }>;
}

interface Env {
  CONTACT_RECIPIENT: string;
  FORM_RATE_LIMITER: FormRateLimiter;
  RESEND_API_KEY: string;
  RESEND_NEWSLETTER_SEGMENT_ID: string;
  TURNSTILE_HOSTNAMES: string;
  TURNSTILE_SECRET_KEY: string;
}

declare module "cloudflare:workers" {
  export const env: Env;
}
