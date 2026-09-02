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
# The sourced smoke helper reads this shared variable when checks run.
# shellcheck disable=SC2034
SMOKE_CA_CERT="${ELASTICSEARCH_SMOKE_CA_CERT:-${ROOT_DIR}/security/certificates/elastic/${ELASTICSEARCH_VERSION:-opensearch}/elastic-stack-ca.crt.pem}"

SEARCH_BACKEND="${ELASTICSEARCH_VERSION:-opensearch}"
case "$SEARCH_BACKEND" in
  opensearch)
    ADMIN_CERT_DIR="${ROOT_DIR}/security/certificates/elastic/opensearch"
    ADMIN_CERT="${ELASTICSEARCH_SMOKE_ADMIN_CERT:-${ADMIN_CERT_DIR}/admin.crt}"
    ADMIN_KEY="${ELASTICSEARCH_SMOKE_ADMIN_KEY:-${ADMIN_CERT_DIR}/admin.key.pem}"
    set_smoke_curl_args --cert "$ADMIN_CERT" --key "$ADMIN_KEY"
    ;;
  elasticsearch)
    : "${ELASTIC_USER:?ELASTIC_USER is required for Elasticsearch smoke checks}"
    : "${ELASTIC_PASSWORD:?ELASTIC_PASSWORD is required for Elasticsearch smoke checks}"
    set_smoke_curl_args --user "${ELASTIC_USER}:${ELASTIC_PASSWORD}"
    ;;
  *)
    echo "Unsupported search backend for smoke checks: ${SEARCH_BACKEND}" >&2
    exit 1
    ;;
esac

START_SERVICES="${ELASTICSEARCH_SMOKE_START_SERVICES:-1}"

ELASTICSEARCH_RETRIES="${ELASTICSEARCH_SMOKE_RETRIES:-30}"
ELASTICSEARCH_DELAY_SECONDS="${ELASTICSEARCH_SMOKE_DELAY_SECONDS:-10}"

KIBANA_RETRIES="${KIBANA_SMOKE_RETRIES:-30}"
KIBANA_DELAY_SECONDS="${KIBANA_SMOKE_DELAY_SECONDS:-10}"
KIBANA_GRACE_SECONDS="${KIBANA_SMOKE_GRACE_SECONDS:-60}"

ELASTICSEARCH_CHECKS=()
for port in "${ELASTICSEARCH_PORT_LIST[@]}"; do
  ELASTICSEARCH_CHECKS+=("elasticsearch:${port}|https://${HOST}:${port}/_cluster/health")
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

set_smoke_allowed_codes 200
wait_for_checks \
  "Elasticsearch" \
  "$ELASTICSEARCH_RETRIES" \
  "$ELASTICSEARCH_DELAY_SECONDS" \
  "${ELASTICSEARCH_CHECKS[@]}"

if [[ "$KIBANA_GRACE_SECONDS" -gt 0 ]]; then
  echo "Elasticsearch is healthy. Waiting ${KIBANA_GRACE_SECONDS}s before Kibana checks."
  sleep "$KIBANA_GRACE_SECONDS"
fi

set_smoke_curl_args
set_smoke_allowed_codes 200 301 302 303 307 308
wait_for_checks \
  "Kibana" \
  "$KIBANA_RETRIES" \
  "$KIBANA_DELAY_SECONDS" \
  "${KIBANA_CHECKS[@]}"

echo "Elasticsearch and Kibana smoke checks passed."
