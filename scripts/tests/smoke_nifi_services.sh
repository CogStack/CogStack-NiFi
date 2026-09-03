#!/usr/bin/env bash
# Smoke checks for NiFi and the nginx reverse proxy.

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

HOST="${NIFI_SMOKE_HOST:-localhost}"
NIFI_PORT="${NIFI_EXTERNAL_PORT_NGINX:-8443}"
# The sourced smoke helper reads this shared variable when checks run.
# shellcheck disable=SC2034
SMOKE_CA_CERT="${NIFI_SMOKE_CA_CERT:-${ROOT_DIR}/security/certificates/root/root-ca.pem}"
START_SERVICES="${NIFI_SMOKE_START_SERVICES:-1}"
RETRIES="${NIFI_SMOKE_RETRIES:-30}"
DELAY_SECONDS="${NIFI_SMOKE_DELAY_SECONDS:-15}"
NIFI_BASE_URL="https://${HOST}:${NIFI_PORT}"

SMOKE_CHECKS=(
  "nifi|${NIFI_BASE_URL}/nifi/"
  "nifi-nginx|${NIFI_BASE_URL}/"
)

check_authenticated_nifi_api() {
  local token
  local code

  if ! token="$(
    curl \
      --silent \
      --show-error \
      --fail \
      --cacert "$SMOKE_CA_CERT" \
      --connect-timeout "$SMOKE_CONNECT_TIMEOUT" \
      --max-time "$SMOKE_MAX_TIME" \
      --data-urlencode "username=${NIFI_SINGLE_USER_CREDENTIALS_USERNAME}" \
      --data-urlencode "password=${NIFI_SINGLE_USER_CREDENTIALS_PASSWORD}" \
      "${NIFI_BASE_URL}/nifi-api/access/token"
  )"; then
    echo "FAIL: nifi-api - authentication failed" >&2
    return 1
  fi

  if [[ -z "$token" ]]; then
    echo "FAIL: nifi-api - authentication returned an empty token" >&2
    return 1
  fi

  if ! code="$(
    curl \
      --silent \
      --show-error \
      --output /dev/null \
      --cacert "$SMOKE_CA_CERT" \
      --connect-timeout "$SMOKE_CONNECT_TIMEOUT" \
      --max-time "$SMOKE_MAX_TIME" \
      --header "Authorization: Bearer ${token}" \
      --write-out "%{http_code}" \
      "${NIFI_BASE_URL}/nifi-api/flow/about"
  )"; then
    echo "FAIL: nifi-api - authenticated request failed" >&2
    return 1
  fi

  if [[ "$code" != "200" ]]; then
    echo "FAIL: nifi-api - authenticated request returned HTTP ${code}" >&2
    return 1
  fi

  echo "OK: nifi-api - authenticated API request returned HTTP 200"
}

if [[ "$START_SERVICES" != "0" ]]; then
  if ! command -v make >/dev/null 2>&1; then
    echo "make is required to start NiFi services via the Makefile." >&2
    exit 1
  fi

  echo "Starting NiFi services using 'make -C deploy start-nifi-dev'."
  make -C "${ROOT_DIR}/deploy" start-nifi-dev
fi

echo "Running smoke checks against NiFi and nginx."
wait_for_checks "NiFi" "$RETRIES" "$DELAY_SECONDS" "${SMOKE_CHECKS[@]}"

echo "Checking authenticated NiFi API access."
for attempt in $(seq 1 "$RETRIES"); do
  if check_authenticated_nifi_api; then
    exit 0
  fi
  if [[ "$attempt" -lt "$RETRIES" ]]; then
    echo "NiFi API attempt ${attempt}/${RETRIES} failed. Sleeping ${DELAY_SECONDS}s..."
    sleep "$DELAY_SECONDS"
  fi
done

echo "Authenticated NiFi API check failed after ${RETRIES} attempts."
exit 1
