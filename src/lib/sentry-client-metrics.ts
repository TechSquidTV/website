import * as Sentry from "@sentry/astro";
import { contentTopic } from "@/lib/analytics-taxonomy";
import type {
  FormKind,
  NewsletterMetricAttribution,
  NewsletterMetricPlacement,
} from "@/lib/sentry-form-metrics";
import {
  formMetricPlacement,
  newsletterMetricAttributes,
} from "@/lib/sentry-form-metrics";

type PageType =
  | "about"
  | "blog_index"
  | "blog_post"
  | "blog_tag"
  | "contact"
  | "follow"
  | "home"
  | "newsletter"
  | "other"
  | "services";

type AcquisitionSource =
  "direct" | "internal" | "newsletter" | "referral" | "search" | "social";

let lastTrackedPath: string | undefined;
let completedReadPath: string | undefined;
let acquisitionTracked = false;

const NEWSLETTER_ATTRIBUTION_STORAGE_KEY = "techsquidtv.newsletter-attribution";
const POST_SLUG_PATTERN = /^[a-z0-9][a-z0-9_-]{0,119}$/u;

const INTERNAL_REFERRER_HOSTS = new Set([
  "techsquidtv.com",
  "www.techsquidtv.com",
]);

const SEARCH_REFERRER_DOMAINS = [
  "google.com",
  "google.co.uk",
  "google.ca",
  "google.de",
  "google.fr",
  "google.co.in",
  "google.co.jp",
  "google.com.au",
  "google.com.br",
  "google.com.mx",
  "google.es",
  "google.it",
  "google.nl",
  "google.pl",
  "bing.com",
  "duckduckgo.com",
  "search.yahoo.com",
  "brave.com",
  "ecosia.org",
] as const;

const SOCIAL_REFERRER_DOMAINS = [
  "bsky.app",
  "discord.com",
  "discord.gg",
  "facebook.com",
  "fosstodon.org",
  "instagram.com",
  "linkedin.com",
  "mastodon.social",
  "reddit.com",
  "t.co",
  "twitter.com",
  "x.com",
  "youtube.com",
  "youtu.be",
] as const;

function pageType(pathname: string): PageType {
  if (pathname === "/") return "home";
  if (pathname === "/about/") return "about";
  if (pathname === "/blog/" || pathname === "/blog") return "blog_index";
  if (pathname.startsWith("/blog/tags/")) return "blog_tag";
  if (pathname.startsWith("/blog/")) return "blog_post";
  if (pathname === "/contact/" || pathname === "/contact") return "contact";
  if (pathname === "/follow/" || pathname === "/follow") return "follow";
  if (pathname === "/newsletter/" || pathname === "/newsletter") {
    return "newsletter";
  }
  if (pathname.startsWith("/services/")) return "services";
  return "other";
}

function blogPostSlug(): string | undefined {
  return document.querySelector<HTMLElement>("[data-sentry-blog-post]")?.dataset
    .sentryPostSlug;
}

function currentContentContext(): Omit<
  NewsletterMetricAttribution,
  "placement"
> | null {
  const article = document.querySelector<HTMLElement>(
    "[data-sentry-blog-post]",
  );
  const sourcePostSlug = article?.dataset.sentryPostSlug;

  if (!sourcePostSlug) return null;

  return {
    contentTopic: contentTopic(article.dataset.sentryContentTopic),
    sourcePostSlug,
  };
}

function isMetricPostSlug(value: string): boolean {
  return POST_SLUG_PATTERN.test(value);
}

function storedNewsletterAttribution(): NewsletterMetricAttribution | null {
  try {
    const value: unknown = JSON.parse(
      window.sessionStorage.getItem(NEWSLETTER_ATTRIBUTION_STORAGE_KEY) ??
        "null",
    );

    if (
      typeof value !== "object" ||
      value === null ||
      !("placement" in value) ||
      !("sourcePostSlug" in value) ||
      !("contentTopic" in value) ||
      typeof value.placement !== "string" ||
      typeof value.sourcePostSlug !== "string" ||
      typeof value.contentTopic !== "string" ||
      !isMetricPostSlug(value.sourcePostSlug)
    ) {
      return null;
    }

    return {
      contentTopic: contentTopic(value.contentTopic),
      placement: formMetricPlacement("newsletter", value.placement),
      sourcePostSlug: value.sourcePostSlug,
    };
  } catch {
    return null;
  }
}

function storeNewsletterAttribution(
  attribution: NewsletterMetricAttribution,
): void {
  try {
    window.sessionStorage.setItem(
      NEWSLETTER_ATTRIBUTION_STORAGE_KEY,
      JSON.stringify(attribution),
    );
  } catch {
    // Storage is optional; attribution still works for embedded forms.
  }
}

export function clearNewsletterAttribution(): void {
  try {
    window.sessionStorage.removeItem(NEWSLETTER_ATTRIBUTION_STORAGE_KEY);
  } catch {
    // Storage is optional.
  }
}

export function newsletterAttributionForForm(
  defaultPlacement: NewsletterMetricPlacement,
): NewsletterMetricAttribution {
  const source = currentContentContext();
  if (source) return { ...source, placement: defaultPlacement };

  if (pageType(window.location.pathname) === "newsletter") {
    return (
      storedNewsletterAttribution() ?? {
        contentTopic: "other",
        placement: defaultPlacement,
      }
    );
  }

  return { contentTopic: "other", placement: defaultPlacement };
}

function isReferrerDomain(
  hostname: string,
  domains: readonly string[],
): boolean {
  return domains.some(
    (domain) => hostname === domain || hostname.endsWith(`.${domain}`),
  );
}

function acquisitionSource(): AcquisitionSource {
  if (
    new URL(window.location.href).searchParams
      .get("utm_source")
      ?.toLowerCase() === "newsletter"
  ) {
    return "newsletter";
  }

  if (!document.referrer) return "direct";

  try {
    const referrer = new URL(document.referrer);
    const hostname = referrer.hostname.toLowerCase();

    if (
      referrer.origin === window.location.origin ||
      INTERNAL_REFERRER_HOSTS.has(hostname)
    ) {
      return "internal";
    }
    if (isReferrerDomain(hostname, SEARCH_REFERRER_DOMAINS)) return "search";
    if (isReferrerDomain(hostname, SOCIAL_REFERRER_DOMAINS)) return "social";
  } catch {
    return "referral";
  }

  return "referral";
}

function trackAcquisitionLandingView(): void {
  if (acquisitionTracked) return;

  acquisitionTracked = true;
  const content = currentContentContext();
  Sentry.metrics.count("acquisition.landing_view", 1, {
    attributes: {
      source: acquisitionSource(),
      page_type: pageType(window.location.pathname),
      ...(content
        ? {
            content_topic: content.contentTopic,
            post_slug: content.sourcePostSlug,
          }
        : {}),
    },
  });
}

function trackPageView(): void {
  const pathname = window.location.pathname;
  if (pathname === lastTrackedPath) return;

  lastTrackedPath = pathname;
  completedReadPath = undefined;
  const type = pageType(pathname);
  Sentry.metrics.count("site.page_view", 1, {
    attributes: { page_type: type },
  });

  const postSlug = blogPostSlug();
  if (postSlug) {
    Sentry.metrics.count("content.view", 1, {
      attributes: {
        post_slug: postSlug,
        content_topic: contentTopic(
          document.querySelector<HTMLElement>("[data-sentry-blog-post]")
            ?.dataset.sentryContentTopic,
        ),
      },
    });
  }
}

function trackCompletedRead(): void {
  const article = document.querySelector<HTMLElement>(
    "[data-sentry-blog-post]",
  );
  const postSlug = article?.dataset.sentryPostSlug;
  if (!article || !postSlug || completedReadPath === window.location.pathname) {
    return;
  }

  const articleTop = article.getBoundingClientRect().top + window.scrollY;
  const viewedBottom = window.scrollY + window.innerHeight;
  const progress = (viewedBottom - articleTop) / article.offsetHeight;

  if (progress < 0.8) return;

  completedReadPath = window.location.pathname;
  Sentry.metrics.count("content.read_completed", 1, {
    attributes: {
      content_topic: contentTopic(article.dataset.sentryContentTopic),
      post_slug: postSlug,
    },
  });
}

function outboundDestination(url: URL): string {
  const hostname = url.hostname.toLowerCase();
  if (hostname.endsWith("youtube.com") || hostname === "youtu.be") {
    return "youtube";
  }
  if (hostname === "github.com") return "github";
  if (hostname === "discord.gg") return "discord";
  if (hostname.endsWith("linkedin.com")) return "linkedin";
  if (hostname === "bsky.app") return "bluesky";
  if (hostname.endsWith("fosstodon.org")) return "mastodon";
  if (hostname === "x.com" || hostname === "twitter.com") return "x";
  return "other";
}

function trackClick(event: MouseEvent): void {
  if (!(event.target instanceof Element)) return;

  const cta = event.target.closest<HTMLElement>("[data-sentry-cta]");
  if (cta?.dataset.sentryCta) {
    Sentry.metrics.count("cta.clicked", 1, {
      attributes: {
        name: cta.dataset.sentryCta,
        placement:
          cta.dataset.sentryCtaPlacement ?? pageType(window.location.pathname),
      },
    });
  }

  const newsletterCta = event.target.closest<HTMLAnchorElement>(
    "[data-sentry-newsletter-cta]",
  );
  const source = currentContentContext();
  if (newsletterCta && source) {
    const attribution: NewsletterMetricAttribution = {
      ...source,
      placement: formMetricPlacement(
        "newsletter",
        newsletterCta.dataset.sentryNewsletterCtaPlacement ?? "",
      ),
    };

    storeNewsletterAttribution(attribution);
    Sentry.metrics.count("newsletter.cta.clicked", 1, {
      attributes: newsletterMetricAttributes(attribution),
    });
  }

  const link = event.target.closest<HTMLAnchorElement>("a[href]");
  if (!link) return;

  const destination = new URL(link.href, window.location.href);
  if (
    !["http:", "https:"].includes(destination.protocol) ||
    destination.origin === window.location.origin
  ) {
    return;
  }

  Sentry.metrics.count("outbound_link.clicked", 1, {
    attributes: {
      destination: outboundDestination(destination),
      placement: pageType(window.location.pathname),
    },
  });
}

export function trackNewsletterSubscribeStarted(
  attribution: NewsletterMetricAttribution,
): void {
  Sentry.metrics.count("newsletter.subscribe.started", 1, {
    attributes: newsletterMetricAttributes(attribution),
  });
}

export function trackClientFormFailure(
  kind: FormKind,
  newsletterAttribution?: NewsletterMetricAttribution,
): void {
  Sentry.metrics.count("form.submit.client_failed", 1, {
    attributes: {
      failure_kind: "network",
      form_kind: kind,
      ...(kind === "newsletter" && newsletterAttribution
        ? newsletterMetricAttributes(newsletterAttribution)
        : {}),
    },
  });
}

export function initializeSentryAnalytics(): void {
  trackAcquisitionLandingView();
  trackPageView();
  trackCompletedRead();
  document.addEventListener("click", trackClick);
  document.addEventListener("scroll", trackCompletedRead, { passive: true });
  document.addEventListener("astro:page-load", () => {
    trackPageView();
    trackCompletedRead();
  });
}
