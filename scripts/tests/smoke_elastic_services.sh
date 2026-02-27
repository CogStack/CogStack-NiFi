#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ENV_LOADER="${ROOT_DIR}/deploy/export_env_vars.sh"
SMOKE_HELPERS="${ROOT_DIR}/scripts/tests/smoke_http_checks.sh"

if [[ -f "$ENV_LOADER" ]]; then
  # shellcheck disable=SC1090
  source "$ENV_LOADER"
fi

if [[ ! -f "$SMOKE_HELPERS" ]]; then
  echo "Missing smoke helper script: $SMOKE_HELPERS" >&2
  exit 1
fi

# shellcheck disable=SC1090
source "$SMOKE_HELPERS"

HOST="${ELASTICSEARCH_SMOKE_HOST:-localhost}"
KIBANA_HOST="${KIBANA_SMOKE_HOST:-$HOST}"
ELASTICSEARCH_PORT_LIST=(
  "${ELASTICSEARCH_NODE_1_OUTPUT_PORT:-9200}"
  "${ELASTICSEARCH_NODE_2_OUTPUT_PORT:-9201}"
  "${ELASTICSEARCH_NODE_3_OUTPUT_PORT:-9202}"
)
KIBANA_PORT="${KIBANA_SERVER_OUTPUT_PORT:-5601}"

START_SERVICES="${ELASTICSEARCH_SMOKE_START_SERVICES:-1}"

ELASTICSEARCH_RETRIES="${ELASTICSEARCH_SMOKE_RETRIES:-30}"
ELASTICSEARCH_DELAY_SECONDS="${ELASTICSEARCH_SMOKE_DELAY_SECONDS:-10}"

KIBANA_RETRIES="${KIBANA_SMOKE_RETRIES:-30}"
KIBANA_DELAY_SECONDS="${KIBANA_SMOKE_DELAY_SECONDS:-10}"
KIBANA_GRACE_SECONDS="${KIBANA_SMOKE_GRACE_SECONDS:-60}"

ELASTICSEARCH_CHECKS=()
for port in "${ELASTICSEARCH_PORT_LIST[@]}"; do
  ELASTICSEARCH_CHECKS+=("elasticsearch:${port}|https://${HOST}:${port}/")
done

KIBANA_CHECKS=(
  "kibana|https://${KIBANA_HOST}:${KIBANA_PORT}/"
)

if [[ "$START_SERVICES" != "0" ]]; then
  if ! command -v make >/dev/null 2>&1; then
    echo "make is required to start Elasticsearch services via the Makefile." >&2
    exit 1
  fi

  echo "Starting Elasticsearch services using 'make -C deploy start-elastic'."
  make -C "${ROOT_DIR}/deploy" start-elastic
fi

wait_for_checks \
  "Elasticsearch" \
  "$ELASTICSEARCH_RETRIES" \
  "$ELASTICSEARCH_DELAY_SECONDS" \
  "${ELASTICSEARCH_CHECKS[@]}"

if [[ "$KIBANA_GRACE_SECONDS" -gt 0 ]]; then
  echo "Elasticsearch is healthy. Waiting ${KIBANA_GRACE_SECONDS}s before Kibana checks."
  sleep "$KIBANA_GRACE_SECONDS"
fi

wait_for_checks \
  "Kibana" \
  "$KIBANA_RETRIES" \
  "$KIBANA_DELAY_SECONDS" \
  "${KIBANA_CHECKS[@]}"

echo "Elasticsearch and Kibana smoke checks passed."
