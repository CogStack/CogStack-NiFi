#!/usr/bin/env bash
# Smoke checks for NiFi and the nginx reverse proxy.

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ENV_LOADER="${ROOT_DIR}/deploy/export_env_vars.sh"

if [[ -f "$ENV_LOADER" ]]; then
  # shellcheck disable=SC1090
  source "$ENV_LOADER"
fi

if ! command -v curl >/dev/null 2>&1; then
  echo "curl is required for smoke checks." >&2
  exit 1
fi

HOST="${NIFI_SMOKE_HOST:-localhost}"
NIFI_PORT="${NIFI_EXTERNAL_PORT_NGINX:-8443}"

ALLOWED_CODES=(200 301 302 303 307 308 401 403)

check_url() {
  local name="$1"
  local url="$2"
  local code

  if ! code="$(curl --insecure --silent --show-error --output /dev/null \
    --connect-timeout 5 --max-time 15 --write-out "%{http_code}" "$url")"; then
    echo "FAIL: ${name} - unable to reach ${url}"
    return 1
  fi

  for allowed in "${ALLOWED_CODES[@]}"; do
    if [[ "$code" == "$allowed" ]]; then
      echo "OK: ${name} - ${url} (HTTP ${code})"
      return 0
    fi
  done

  echo "FAIL: ${name} - ${url} (unexpected HTTP ${code})"
  return 1
}

check_url "nifi" "https://${HOST}:${NIFI_PORT}/nifi/"
check_url "nifi-nginx" "https://${HOST}:${NIFI_PORT}/"
