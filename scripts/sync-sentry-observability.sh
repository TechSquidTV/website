#!/usr/bin/env bash

set -euo pipefail

required_environment() {
  local name="$1"
  if [[ -z "${!name:-}" ]]; then
    echo "$name must be set." >&2
    exit 1
  fi
}

required_environment SENTRY_AUTH_TOKEN
required_environment SENTRY_ORG
required_environment SENTRY_PROJECT
required_environment SENTRY_ALERT_ACTIONS

if ! jq -e 'type == "array"' >/dev/null <<<"$SENTRY_ALERT_ACTIONS"; then
  echo "SENTRY_ALERT_ACTIONS must be a JSON array of Sentry alert actions." >&2
  exit 1
fi

dashboard_title="Content to Newsletter"
dashboard_target="$SENTRY_ORG/$SENTRY_PROJECT/$dashboard_title"

dashboard_list="$(pnpm exec sentry dashboard list "$SENTRY_ORG/" "$dashboard_title" --json)"
dashboard_count="$(jq --arg title "$dashboard_title" '[(.data // .)[]? | select(.title == $title)] | length' <<<"$dashboard_list")"

if [[ "$dashboard_count" == "0" ]]; then
  pnpm exec sentry dashboard create "$SENTRY_ORG/$SENTRY_PROJECT" "$dashboard_title"
elif [[ "$dashboard_count" != "1" ]]; then
  echo "Expected at most one managed dashboard named '$dashboard_title'." >&2
  exit 1
fi

dashboard="$(pnpm exec sentry dashboard "$dashboard_target" --json)"
widget_count="$(jq '(.widgets // .data.widgets // []) | length' <<<"$dashboard")"

for ((index = 0; index < widget_count; index += 1)); do
  pnpm exec sentry dashboard widget delete "$dashboard_target" --index 0 --yes
done

metric_sum() {
  local name="$1"
  printf 'sum(value,%s,counter,none)' "$name"
}

pnpm exec sentry dashboard widget add "$dashboard_target" "Content views by topic" \
  --display categorical_bar --dataset metrics \
  --query "$(metric_sum content.view)" --group-by content_topic \
  --col 0 --row 0 --width 3 --height 2

pnpm exec sentry dashboard widget add "$dashboard_target" "Content views by post" \
  --display top_n --dataset metrics \
  --query "$(metric_sum content.view)" --group-by post_slug --sort "-$(metric_sum content.view)" --limit 10 \
  --col 3 --row 0 --width 3 --height 2

pnpm exec sentry dashboard widget add "$dashboard_target" "Newsletter starts by placement" \
  --display categorical_bar --dataset metrics \
  --query "$(metric_sum newsletter.subscribe.started)" --group-by placement \
  --col 0 --row 2 --width 3 --height 2

pnpm exec sentry dashboard widget add "$dashboard_target" "Successful subscriptions by source post" \
  --display top_n --dataset metrics \
  --query "$(metric_sum newsletter.subscribe.succeeded)" --group-by source_post_slug --sort "-$(metric_sum newsletter.subscribe.succeeded)" --limit 10 \
  --col 3 --row 2 --width 3 --height 2

pnpm exec sentry dashboard widget add "$dashboard_target" "Content views and subscriptions" \
  --display line --dataset metrics \
  --query "$(metric_sum content.view)" --query "$(metric_sum newsletter.subscribe.succeeded)" \
  --col 0 --row 4 --width 3 --height 2

pnpm exec sentry dashboard widget add "$dashboard_target" "Newsletter starts and subscriptions" \
  --display line --dataset metrics \
  --query "$(metric_sum newsletter.subscribe.started)" --query "$(metric_sum newsletter.subscribe.succeeded)" \
  --col 3 --row 4 --width 3 --height 2

pnpm exec sentry dashboard widget add "$dashboard_target" "Newsletter subscription failures by kind" \
  --display categorical_bar --dataset metrics \
  --query "$(metric_sum newsletter.subscribe.failed)" --group-by failure_kind \
  --col 0 --row 6 --width 6 --height 2

sync_metric_alert() {
  local name="$1"
  local aggregate="$2"
  local threshold="$3"
  local window="$4"
  local query="$5"
  local trigger
  local alerts
  local rule_id

  trigger="$(jq -cn --argjson actions "$SENTRY_ALERT_ACTIONS" --argjson threshold "$threshold" '{alertThreshold: $threshold, actions: $actions}')"
  alerts="$(pnpm exec sentry alert metrics list "$SENTRY_ORG/" --query "$name" --json)"
  rule_id="$(jq -r --arg name "$name" '(.data // .)[]? | select(.name == $name) | .id' <<<"$alerts")"

  if [[ -n "$rule_id" ]]; then
    pnpm exec sentry alert metrics edit "$SENTRY_ORG/$rule_id" \
      --name "$name" --query "$query" --aggregate "$aggregate" --dataset metrics \
      --time-window "$window" --trigger "$trigger" --project "$SENTRY_PROJECT" --environment production
  else
    pnpm exec sentry alert metrics create "$SENTRY_ORG" \
      --name "$name" --query "$query" --aggregate "$aggregate" --dataset metrics \
      --time-window "$window" --trigger "$trigger" --project "$SENTRY_PROJECT" --environment production
  fi
}

sync_metric_alert \
  "Newsletter subscription failures" \
  "$(metric_sum newsletter.subscribe.failed)" \
  3 15 ""

sync_metric_alert \
  "Newsletter anti-abuse rejections" \
  "$(metric_sum form.turnstile.rejected)" \
  10 15 ""

sync_metric_alert \
  "Newsletter subscription latency" \
  "p95(value,form.submit.duration,distribution,millisecond)" \
  3000 15 "form_kind:newsletter"
