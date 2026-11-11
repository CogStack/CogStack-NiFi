#!/bin/sh
set -eu
case "${1:-ready}" in
    live) path=live ;;
    startup|ready) path=ready ;;
    *) echo 'Usage: healthcheck.sh live|startup|ready' >&2; exit 2 ;;
esac
exec curl --silent --show-error --fail --noproxy '*' --max-time "${NGINX_HEALTH_TIMEOUT:-5}" \
    --output /dev/null "http://127.0.0.1:${NGINX_HEALTH_PORT:-8080}/healthz/$path"
