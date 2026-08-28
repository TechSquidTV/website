# Sentry observability

Sentry is enabled only in production. The deployment workflow uploads source
maps when its `production` environment provides `SENTRY_AUTH_TOKEN`,
`SENTRY_ORG`, and `SENTRY_PROJECT`.

`Sync Sentry observability` keeps the managed `Content to Newsletter` dashboard
and its three operational metric alerts in sync with
`scripts/sync-sentry-observability.sh`. The workflow runs when that script
changes or on manual dispatch. Do not manually add widgets to that dashboard:
the sync replaces its complete widget set.

Set these production environment values before the first sync:

| Name                   | Type     | Purpose                                             |
| ---------------------- | -------- | --------------------------------------------------- |
| `SENTRY_AUTH_TOKEN`    | Secret   | Token with dashboard and metric-alert write access. |
| `SENTRY_ORG`           | Variable | Sentry organization slug.                           |
| `SENTRY_PROJECT`       | Variable | This site's Sentry project slug.                    |
| `SENTRY_ALERT_ACTIONS` | Variable | JSON array of Sentry notification actions.          |

`SENTRY_ALERT_ACTIONS` intentionally has no default recipient. Configure the
team or integration that should receive production alerts, for example:

```json
[
  {
    "id": "sentry.mail.actions.NotifyEmailAction",
    "targetType": "Team",
    "targetIdentifier": 123
  }
]
```

The dashboard contains views for content by topic and post, newsletter starts
by placement, successful subscriptions by originating post, two funnel series
(content-to-subscriber and start-to-subscriber), and failures by kind. The
funnel panels deliberately show both numerator and denominator series; Sentry's
CLI widget interface does not currently expose dashboard equations for a saved
percentage.

The alerts are operational only:

- three newsletter subscription failures in 15 minutes;
- ten Turnstile rejections in 15 minutes; and
- newsletter submission p95 over 3 seconds for 15 minutes.
