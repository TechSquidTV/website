# TechSquidTV

Source for [techsquidtv.com](https://techsquidtv.com), Kyle Tryon's personal
site for developer education, technical writing, and DevRel services.

The site is built with Astro, TypeScript, React, and Tailwind CSS. It deploys
as a Cloudflare Worker and uses Resend for its contact and newsletter forms.

## Requirements

- Node.js 24 or later
- [pnpm](https://pnpm.io/) 11.9.0 (the version is pinned in `package.json`)

## Getting started

```sh
pnpm install
pnpm dev
```

The local site is available at `http://localhost:4321`.

## Commands

| Command                   | Description                                                             |
| ------------------------- | ----------------------------------------------------------------------- |
| `pnpm dev`                | Start the local development server.                                     |
| `pnpm build`              | Type-check and create a production build in `dist/`.                    |
| `pnpm preview`            | Serve the production build locally.                                     |
| `pnpm test`               | Run unit tests.                                                         |
| `pnpm check`              | Run formatting, lint, dead-code, spelling, and production-build checks. |
| `pnpm format`             | Format the repository with Prettier.                                    |
| `pnpm lint:fix`           | Apply ESLint fixes where available.                                     |
| `pnpm deploy`             | Build and deploy the Worker with Wrangler.                              |
| `pnpm indexnow:submit`    | Submit the site's URLs to IndexNow.                                     |
| `pnpm newsletter:publish` | Publish the hosted Resend newsletter template.                          |
| `pnpm sentry:sync`        | Synchronize the managed Sentry dashboard and alerts.                    |

## Project layout

```text
src/
├── components/   Reusable Astro components
├── content/blog/ Markdown and MDX blog posts
├── emails/       Resend newsletter template source
├── layouts/      Shared page and post layouts
├── lib/          Form handling, analytics, Sentry, and site utilities
├── pages/        Site pages, API routes, RSS, and Open Graph endpoints
└── styles/       Global styles
public/           Static assets served as-is
scripts/          Operational and publishing scripts
docs/             Deployment and service runbooks
```

## Content

Blog posts live in `src/content/blog/<year>/` as Markdown or MDX. The content
collection schema in `src/content.config.ts` validates frontmatter during the
build. Keep article images in `src/images/blog/` and reference them from the
post.

## Configuration and deployment

`wrangler.jsonc` defines the production Worker, route, asset binding, and
rate-limit binding. Secrets and account-specific values are intentionally not
committed. Configure the following Worker bindings for production forms:

- `RESEND_API_KEY`
- `RESEND_NEWSLETTER_SEGMENT_ID`
- `CONTACT_RECIPIENT`
- `TURNSTILE_SECRET_KEY`
- `TURNSTILE_HOSTNAMES`
- `FORM_RATE_LIMITER`

Set `PUBLIC_TURNSTILE_SITE_KEY` when a different Turnstile site key is needed
for a local or preview environment. Set `SENTRY_AUTH_TOKEN` during a
production build to upload source maps.

For the complete account-side setup and cutover checklist, see
[Cloudflare and Resend cutover](docs/cloudflare-resend-cutover.md). The
[Sentry observability runbook](docs/sentry-observability.md) and
[newsletter template guide](docs/newsletter-template.md) document their
respective workflows.

## Contributing

Before opening a change, run:

```sh
pnpm check
```

Do not commit secrets, generated `dist/` output, or account-specific
configuration.
