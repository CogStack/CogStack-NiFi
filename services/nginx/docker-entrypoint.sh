#!/bin/sh
set -eu
umask 077

if [ "$#" -gt 0 ]; then exec "$@"; fi

: "${NIFI_UPSTREAM_HOST:=nifi}"
: "${NIFI_UPSTREAM_PORT:=${NIFI_INTERNAL_PORT:-8443}}"
: "${NIFI_UPSTREAM_TLS_NAME:=$NIFI_UPSTREAM_HOST}"
: "${NIFI_INTERNAL_PORT_NGINX:=8443}"
: "${NIFI_WEB_PROXY_PORT:=8443}"
: "${NGINX_NIFI_SERVER_NAME:=_}"
: "${NGINX_PROXY_CONTEXT_PATH:=}"
: "${NGINX_PROXY_SCHEME:=https}"
: "${NGINX_TLS_CERTIFICATE:=/certificates/nifi/nifi.pem}"
: "${NGINX_TLS_CERTIFICATE_KEY:=/certificates/nifi/nifi.key}"
: "${NGINX_UPSTREAM_CA:=/certificates/root/root-ca.pem}"
: "${NGINX_HEALTH_PORT:=8080}"
: "${NGINX_WORKER_PROCESSES:=1}"
: "${NGINX_RUNTIME_DIR:=/tmp/nginx}"
: "${NGINX_DNS_RESOLVER:=$(awk '/^nameserver[ \t]/{print $2; exit}' /etc/resolv.conf)}"
case "$NGINX_DNS_RESOLVER" in *:*|*.*) ;; *) echo 'Supply a DNS resolver address' >&2; exit 1 ;; esac
case "$NGINX_DNS_RESOLVER" in \[*\]) ;; *:* ) NGINX_DNS_RESOLVER="[$NGINX_DNS_RESOLVER]" ;; esac

for port in "$NIFI_UPSTREAM_PORT" "$NIFI_INTERNAL_PORT_NGINX" "$NIFI_WEB_PROXY_PORT" "$NGINX_HEALTH_PORT"; do
    case "$port" in ''|*[!0-9]*) echo 'Proxy ports must be numeric' >&2; exit 1 ;; esac
    [ "$port" -gt 0 ] && [ "$port" -le 65535 ] || { echo 'Proxy port is out of range' >&2; exit 1; }
done
case "$NGINX_PROXY_SCHEME" in http|https) ;; *) echo 'Invalid NGINX_PROXY_SCHEME' >&2; exit 1 ;; esac
case "$NGINX_PROXY_CONTEXT_PATH" in /) NGINX_PROXY_CONTEXT_PATH='' ;; */) NGINX_PROXY_CONTEXT_PATH=${NGINX_PROXY_CONTEXT_PATH%/} ;; esac
for value in "$NIFI_UPSTREAM_HOST" "$NIFI_UPSTREAM_TLS_NAME" "$NGINX_NIFI_SERVER_NAME" \
    "$NGINX_PROXY_CONTEXT_PATH" "$NGINX_TLS_CERTIFICATE" "$NGINX_TLS_CERTIFICATE_KEY" \
    "$NGINX_UPSTREAM_CA" "$NGINX_RUNTIME_DIR" "$NGINX_WORKER_PROCESSES" "$NGINX_DNS_RESOLVER"; do
    case "$value" in *';'*|*'{'*|*'}'*|*'"'*|*'\'*|*'
'*) echo 'Invalid character in proxy configuration' >&2; exit 1 ;; esac
done
case "$NGINX_PROXY_CONTEXT_PATH" in ''|/*) ;; *) echo 'Proxy context must start with /' >&2; exit 1 ;; esac
for certificate in "$NGINX_TLS_CERTIFICATE" "$NGINX_TLS_CERTIFICATE_KEY" "$NGINX_UPSTREAM_CA"; do
    [ -f "$certificate" ] && [ -r "$certificate" ] || { echo "Certificate input is not readable by the runtime user: $certificate" >&2; exit 1; }
done
mkdir -p "$NGINX_RUNTIME_DIR/client_temp" "$NGINX_RUNTIME_DIR/proxy_temp" \
    "$NGINX_RUNTIME_DIR/fastcgi_temp" "$NGINX_RUNTIME_DIR/uwsgi_temp" "$NGINX_RUNTIME_DIR/scgi_temp"
export NIFI_UPSTREAM_HOST NIFI_UPSTREAM_PORT NIFI_UPSTREAM_TLS_NAME NIFI_INTERNAL_PORT_NGINX \
    NIFI_WEB_PROXY_PORT NGINX_NIFI_SERVER_NAME NGINX_PROXY_CONTEXT_PATH NGINX_PROXY_SCHEME \
    NGINX_TLS_CERTIFICATE NGINX_TLS_CERTIFICATE_KEY NGINX_UPSTREAM_CA NGINX_HEALTH_PORT \
    NGINX_WORKER_PROCESSES NGINX_RUNTIME_DIR NGINX_DNS_RESOLVER
envsubst '${NIFI_UPSTREAM_HOST} ${NIFI_UPSTREAM_PORT} ${NIFI_UPSTREAM_TLS_NAME} ${NIFI_INTERNAL_PORT_NGINX} ${NIFI_WEB_PROXY_PORT} ${NGINX_NIFI_SERVER_NAME} ${NGINX_PROXY_CONTEXT_PATH} ${NGINX_PROXY_SCHEME} ${NGINX_TLS_CERTIFICATE} ${NGINX_TLS_CERTIFICATE_KEY} ${NGINX_UPSTREAM_CA} ${NGINX_HEALTH_PORT} ${NGINX_WORKER_PROCESSES} ${NGINX_RUNTIME_DIR} ${NGINX_DNS_RESOLVER}' \
    < "${NGINX_CONFIG_TEMPLATE:-/etc/nginx/templates/nginx.conf.template}" > "$NGINX_RUNTIME_DIR/nginx.conf"
nginx -t -c "$NGINX_RUNTIME_DIR/nginx.conf"
exec nginx -c "$NGINX_RUNTIME_DIR/nginx.conf" -g 'daemon off;'
