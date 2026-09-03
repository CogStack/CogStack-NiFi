#!/usr/bin/env bash

# Create CogStack application tenants, roles, users, and role mappings through
# the OpenSearch Security plugin REST API.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SECURITY_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
REPO_ROOT="$(cd "${SECURITY_DIR}/.." && pwd)"

SECURITY_ENV_DIR="${SECURITY_DIR}/env"
DEFAULT_CA_CERT="${SECURITY_DIR}/certificates/elastic/opensearch/elastic-stack-ca.crt.pem"

usage() {
  cat <<USAGE
Usage: $0 <opensearch_hostname> [--use-http]

Options:
  --use-http    Use plain HTTP instead of the default verified HTTPS connection.
  --use-ssl     Deprecated compatibility option; HTTPS is already the default.
  -h, --help    Show this help.

Environment overrides:
  OPENSEARCH_PORT            REST API port (default: ELASTICSEARCH_NODE_1_OUTPUT_PORT or 9200)
  OPENSEARCH_CA_CERT         CA certificate used to verify HTTPS
  OPENSEARCH_ADMIN_USER      REST API administrator (default: admin)
  OPENSEARCH_ADMIN_PASSWORD  REST API administrator password (default: ELASTIC_PASSWORD)
USAGE
}

require_command() {
  local command_name="$1"

  if ! command -v "$command_name" >/dev/null 2>&1; then
    echo "ERROR: Required command not found: $command_name" >&2
    exit 1
  fi
}

json_escape() {
  local value="$1"

  value=${value//\\/\\\\}
  value=${value//\"/\\\"}
  value=${value//$'\n'/\\n}
  value=${value//$'\r'/\\r}
  value=${value//$'\t'/\\t}
  printf '%s' "$value"
}

source_env_files() {
  # shellcheck disable=SC1091
  source "${REPO_ROOT}/deploy/elasticsearch.env"
  # shellcheck disable=SC1091
  source "${SECURITY_ENV_DIR}/users_elasticsearch.env"
}

OPENSEARCH_HOST=""
USE_HTTP=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --use-http)
      USE_HTTP=true
      ;;
    --use-ssl)
      # Retained so existing automation continues to work. HTTPS is now default.
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    -*)
      echo "ERROR: Unknown option: $1" >&2
      usage
      exit 1
      ;;
    *)
      if [[ -n "$OPENSEARCH_HOST" ]]; then
        echo "ERROR: Multiple OpenSearch hostnames supplied." >&2
        usage
        exit 1
      fi
      OPENSEARCH_HOST="$1"
      ;;
  esac
  shift
done

if [[ -z "$OPENSEARCH_HOST" ]]; then
  usage
  exit 1
fi

source_env_files
require_command curl

OPENSEARCH_PORT="${OPENSEARCH_PORT:-${ELASTICSEARCH_NODE_1_OUTPUT_PORT:-9200}}"
OPENSEARCH_ADMIN_USER="${OPENSEARCH_ADMIN_USER:-admin}"
OPENSEARCH_ADMIN_PASSWORD="${OPENSEARCH_ADMIN_PASSWORD:-${ELASTIC_PASSWORD:-}}"

: "${OPENSEARCH_ADMIN_PASSWORD:?Set OPENSEARCH_ADMIN_PASSWORD or ELASTIC_PASSWORD}"
: "${INGEST_SERVICE_PASSWORD:?Set INGEST_SERVICE_PASSWORD in users_elasticsearch.env}"

if [[ "$USE_HTTP" == true ]]; then
  OPENSEARCH_PROTOCOL=http
else
  OPENSEARCH_PROTOCOL=https
  OPENSEARCH_CA_CERT="${OPENSEARCH_CA_CERT:-$DEFAULT_CA_CERT}"
  if [[ ! -r "$OPENSEARCH_CA_CERT" ]]; then
    echo "ERROR: OpenSearch CA certificate is not readable: $OPENSEARCH_CA_CERT" >&2
    exit 1
  fi
fi

API_BASE="${OPENSEARCH_PROTOCOL}://${OPENSEARCH_HOST}:${OPENSEARCH_PORT}/_plugins/_security/api"
CURL_ARGS=(
  --silent
  --show-error
  --fail-with-body
  --user "${OPENSEARCH_ADMIN_USER}:${OPENSEARCH_ADMIN_PASSWORD}"
  --header "Content-Type: application/json"
)

if [[ "$USE_HTTP" != true ]]; then
  CURL_ARGS+=(--cacert "$OPENSEARCH_CA_CERT")
fi

api_put() {
  local resource="$1"
  local payload="$2"

  echo "Applying ${resource}..."
  curl "${CURL_ARGS[@]}" \
    --request PUT \
    "${API_BASE}/${resource}" \
    --data "$payload"
  printf '\n'
}

INGEST_PASSWORD_JSON="$(json_escape "$INGEST_SERVICE_PASSWORD")"

echo "Configuring CogStack OpenSearch resources at ${OPENSEARCH_PROTOCOL}://${OPENSEARCH_HOST}:${OPENSEARCH_PORT}"

api_put "tenants/nifi_tenant" '{
  "description": "A tenant for NiFi"
}'

api_put "tenants/cogstack_tenant" '{
  "description": "A tenant for CogStack"
}'

api_put "roles/cogstack_ingest" '{
  "cluster_permissions": [
    "cluster_composite_ops",
    "indices:data/read/scroll*"
  ],
  "index_permissions": [{
    "index_patterns": ["nifi_*", "cogstack_*"],
    "fls": [],
    "masked_fields": [],
    "allowed_actions": ["indices_all"]
  }],
  "tenant_permissions": [{
    "tenant_patterns": ["nifi_tenant", "cogstack_tenant"],
    "allowed_actions": ["kibana_all_write"]
  }]
}'

api_put "roles/cogstack_access" '{
  "cluster_permissions": ["cluster_composite_ops"],
  "index_permissions": [{
    "index_patterns": ["cogstack_*", "nifi_*"],
    "fls": [],
    "masked_fields": [],
    "allowed_actions": ["search", "read", "get"]
  }],
  "tenant_permissions": [{
    "tenant_patterns": ["cogstack_tenant"],
    "allowed_actions": ["kibana_all_write"]
  }]
}'

api_put "internalusers/cogstack_user" "{
  \"password\": \"${INGEST_PASSWORD_JSON}\",
  \"backend_roles\": [\"cogstack_access\", \"kibanauser\"],
  \"attributes\": {}
}"

api_put "internalusers/cogstack_pipeline" "{
  \"password\": \"${INGEST_PASSWORD_JSON}\",
  \"backend_roles\": [\"cogstack_ingest\"],
  \"attributes\": {}
}"

api_put "internalusers/nifi" "{
  \"password\": \"${INGEST_PASSWORD_JSON}\",
  \"backend_roles\": [\"cogstack_ingest\"],
  \"attributes\": {}
}"

api_put "rolesmapping/cogstack_access" '{
  "backend_roles": ["cogstack_access"],
  "hosts": [],
  "users": ["cogstack_user"]
}'

api_put "rolesmapping/cogstack_ingest" '{
  "backend_roles": ["cogstack_ingest"],
  "hosts": [],
  "users": ["cogstack_pipeline", "nifi"]
}'

echo "OpenSearch application security resources configured successfully."
