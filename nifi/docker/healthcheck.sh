#!/usr/bin/env bash
set -euo pipefail

case "${1:-ready}" in
  live)
    exec "${NIFI_HOME:-/opt/nifi/nifi-current}/bin/nifi.sh" status >/dev/null
    ;;
  startup|ready)
    host="${NIFI_HEALTHCHECK_HOST:-localhost}"
    port="${NIFI_WEB_HTTPS_PORT:-${NIFI_INTERNAL_PORT:-8443}}"
    exec curl --silent --show-error --fail --max-time "${NIFI_HEALTHCHECK_TIMEOUT:-5}" \
      --noproxy '*' --resolve "${host}:${port}:127.0.0.1" \
      --cacert "${NIFI_HEALTHCHECK_CA_FILE:-/security/certificates/root/root-ca.pem}" \
      --output /dev/null "https://${host}:${port}/nifi-api/authentication/configuration"
    ;;
  *) echo 'Usage: healthcheck.sh live|startup|ready' >&2; exit 2 ;;
esac
