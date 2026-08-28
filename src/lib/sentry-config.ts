export const SENTRY_DSN =
  "https://e26cdb3b3ef04aa5626b4e7363eb1f81@o4509194194386944.ingest.us.sentry.io/4511984146907136";

/** Sentry is enabled only for Astro production builds. */
export const SENTRY_ENABLED = import.meta.env.PROD;

export const SENTRY_DATA_COLLECTION = {
  cookies: false,
  databaseQueryData: false,
  httpBodies: [],
  httpHeaders: {
    request: false,
    response: false,
  },
  stackFrameVariables: false,
  urlQueryParams: false,
  userInfo: false,
};
