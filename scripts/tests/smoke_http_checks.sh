#!/usr/bin/env bash
# Shared HTTP smoke-check helpers.

# Allow callers to override timeouts while keeping safe defaults.
SMOKE_CONNECT_TIMEOUT="${SMOKE_CONNECT_TIMEOUT:-30}"
SMOKE_MAX_TIME="${SMOKE_MAX_TIME:-60}"

# Allow callers to provide their own accepted status codes.
if [[ -z "${SMOKE_ALLOWED_CODES+x}" ]]; then
  SMOKE_ALLOWED_CODES=(200 301 302 303 307 308)
fi

# Callers can provide additional curl arguments such as authentication options.
SMOKE_CURL_ARGS=()
SMOKE_CURL_ARGS_COUNT=0

if ! command -v curl >/dev/null 2>&1; then
  echo "curl is required for smoke checks." >&2
  # This helper supports both sourcing (`return`) and direct execution (`exit`).
  # shellcheck disable=SC2317
  return 1 2>/dev/null || exit 1
fi

set_smoke_allowed_codes() {
  SMOKE_ALLOWED_CODES=("$@")
}

set_smoke_curl_args() {
  SMOKE_CURL_ARGS=("$@")
  SMOKE_CURL_ARGS_COUNT="$#"
}

check_url() {
  local name="$1"
  local url="$2"
  local code
  local allowed
  local -a curl_args=(
    --silent
    --show-error
    --output /dev/null
    --connect-timeout "$SMOKE_CONNECT_TIMEOUT"
    --max-time "$SMOKE_MAX_TIME"
    --write-out "%{http_code}"
  )

  if [[ -n "${SMOKE_CA_CERT:-}" ]]; then
    if [[ ! -r "$SMOKE_CA_CERT" ]]; then
      echo "FAIL: ${name} - CA certificate is not readable: ${SMOKE_CA_CERT}" >&2
      return 1
    fi
    curl_args+=(--cacert "$SMOKE_CA_CERT")
  fi

  if (( SMOKE_CURL_ARGS_COUNT > 0 )); then
    curl_args+=("${SMOKE_CURL_ARGS[@]}")
  fi

  if ! code="$(curl "${curl_args[@]}" "$url")"; then
    echo "FAIL: ${name} - unable to reach ${url}"
    return 1
  fi

  for allowed in "${SMOKE_ALLOWED_CODES[@]}"; do
    if [[ "$code" == "$allowed" ]]; then
      echo "OK: ${name} - ${url} (HTTP ${code})"
      return 0
    fi
  done

  echo "FAIL: ${name} - ${url} (unexpected HTTP ${code})"
  return 1
}

# Usage:
#   run_checks "name|https://example/path" "other|https://example/other"
run_checks() {
  local check_spec
  local name
  local url

  if [[ "$#" -eq 0 ]]; then
    echo "FAIL: run_checks requires at least one 'name|url' argument." >&2
    return 1
  fi

  for check_spec in "$@"; do
    if [[ "$check_spec" != *"|"* ]]; then
      echo "FAIL: invalid check format '${check_spec}' (expected 'name|url')." >&2
      return 1
    fi

    name="${check_spec%%|*}"
    url="${check_spec#*|}"

    if ! check_url "$name" "$url"; then
      return 1
    fi
  done
}

# Usage:
#   wait_for_checks "Label" RETRIES DELAY_SECONDS "name|url" "name|url"
wait_for_checks() {
  local name="$1"
  local retries="$2"
  local delay="$3"
  shift 3

  local attempt

  echo "Running ${name} smoke checks."
  for attempt in $(seq 1 "$retries"); do
    if run_checks "$@"; then
      return 0
    fi
    if [[ "$attempt" -lt "$retries" ]]; then
      echo "${name} attempt ${attempt}/${retries} failed. Sleeping ${delay}s..."
      sleep "$delay"
    fi
  done

  echo "${name} smoke checks failed after ${retries} attempts."
  return 1
}
