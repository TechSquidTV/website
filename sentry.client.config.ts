import * as Sentry from "@sentry/astro";
import { initializeSentryAnalytics } from "@/lib/sentry-client-metrics";
import {
  SENTRY_DATA_COLLECTION,
  SENTRY_DSN,
  SENTRY_ENABLED,
} from "@/lib/sentry-config";

if (SENTRY_ENABLED) {
  Sentry.init({
    dataCollection: SENTRY_DATA_COLLECTION,
    dsn: SENTRY_DSN,
    enableLogs: false,
    tracesSampleRate: 1,
  });

  initializeSentryAnalytics();
}
