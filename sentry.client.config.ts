import * as Sentry from "@sentry/astro";
import { initializeSentryAnalytics } from "@/lib/sentry-client-metrics";
import { SENTRY_DATA_COLLECTION, SENTRY_DSN } from "@/lib/sentry-config";

Sentry.init({
  dataCollection: SENTRY_DATA_COLLECTION,
  dsn: SENTRY_DSN,
  enableLogs: false,
  tracesSampleRate: import.meta.env.DEV ? 1 : 0.1,
});

initializeSentryAnalytics();
