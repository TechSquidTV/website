# Cloudflare and Resend cutover

The repository now deploys the site as the `techsquidtv-website` Cloudflare Worker. Complete these account-side steps before sending production traffic to it.

## Cloudflare

1. Export every DNS record from Porkbun, including MX, SPF, DKIM, DMARC, CAA, and third-party verification records.
2. Add `techsquidtv.com` as a Cloudflare zone, reproduce the complete record set, and then update Porkbun to Cloudflare's assigned nameservers.
3. Attach both `techsquidtv.com` and `www.techsquidtv.com` to the Worker. Configure a permanent redirect from `www.techsquidtv.com` to `https://techsquidtv.com/`.
4. The managed Turnstile widget uses site key `0x4AAAAAAEd_LCHW3k_8fBFt`. Its domain allowlist must include `techsquidtv.com`, `www.techsquidtv.com`, `localhost`, and `127.0.0.1`. Store its secret as `TURNSTILE_SECRET_KEY`. Production only accepts tokens issued for the apex or `www` hostname; use a local `TURNSTILE_HOSTNAMES=localhost,127.0.0.1` override when testing a Worker locally.
5. Add the remaining production Worker secrets with Wrangler or the Cloudflare dashboard:

   ```sh
   wrangler secret put RESEND_API_KEY
   wrangler secret put RESEND_NEWSLETTER_SEGMENT_ID
   wrangler secret put CONTACT_RECIPIENT
   ```

   Set `RESEND_NEWSLETTER_SEGMENT_ID` to `4dcd094d-c0bb-4601-9d5b-5aabc22dc99d` and `CONTACT_RECIPIENT` to `contact@techsquidtv.com`.

6. Create a scoped `CLOUDFLARE_API_TOKEN` that can deploy this Worker and store it, with the Cloudflare account ID, as GitHub Actions secrets. To upload Sentry source maps during the production build, also add `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, and `SENTRY_PROJECT` as build secrets. Source-map upload is intentionally disabled when `SENTRY_AUTH_TOKEN` is absent.

The configured Worker rate-limit binding permits five form submissions per IP per minute. Cloudflare's Worker binding supports only 10- or 60-second windows; add a Cloudflare WAF rule if a ten-minute enforcement window is required.

## Resend

1. Verify `updates.techsquidtv.com` in Resend and publish every Resend-generated DNS record in Cloudflare.
2. Confirm that `forms@updates.techsquidtv.com` is an approved Resend sender.
3. Provision and monitor the receiving mailbox `contact@techsquidtv.com`. Resend sends the notification but does not host that inbox.
4. Confirm that the existing **TechSquidTV Newsletter** segment is still the target segment. New subscriptions use Resend's API; broadcasts and unsubscribe handling remain in the Resend dashboard.

## Netlify retirement

1. Export the contact and newsletter form submissions to a private archive.
2. Inventory Netlify environment variables, build hooks, deploy notifications, redirects, and domain configuration. Recreate any still-needed integration outside Netlify.
3. Deploy and test the Worker on its temporary Cloudflare hostname. Test a newsletter signup, contact delivery, Turnstile rejection, and rate-limit rejection.
4. After DNS propagation, test the apex domain, the `www` redirect, RSS, sitemap, Open Graph images, and the public forms.
5. Disable Netlify Forms, build hooks, and deployment only after the Cloudflare production smoke test succeeds.
