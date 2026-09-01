#!/usr/bin/env bash

# ==============================================================================
# 🔐 Create users and service account tokens for Elasticsearch Native
#
# This script:
#   - Waits until Elasticsearch is available
#   - Sets a password for built-in `kibana_system` user
#   - Creates custom users for:
#       • Kibana dashboard access
#       • NiFi / ingestion service
#   - Creates a Fleet Server service token (used by Elastic Agent / Fleet)
#
# Usage:
#     ./create_es_native_credentials.sh
#
# Requirements:
#   • `certificates_elasticsearch.env` must define:
#       - ELASTIC_HOST, ELASTIC_PASSWORD
#       - KIBANA_USER, KIBANA_PASSWORD
#       - INGEST_SERVICE_USER, INGEST_SERVICE_PASSWORD
#       - ES_ADMIN_EMAIL
#   • `certificates_general.env` must define:
#       - CA root path used for HTTPS verification
#
# Output:
#   • Password for `kibana_system` set
#   • Users `$KIBANA_USER` and `$INGEST_SERVICE_USER` created
#   • Fleet Server token written to a mode-0600 JSON file
# ==============================================================================

set -uo pipefail


SECURITY_ENV_FOLDER="../env/"
SECURITY_CERTIFICATES_FOLDER="../certificates/"
ES_CERTIFICATES_FOLDER="${SECURITY_CERTIFICATES_FOLDER}elastic/elasticsearch"

# Load required env vars
source "${SECURITY_ENV_FOLDER}"certificates_elasticsearch.env
source "${SECURITY_ENV_FOLDER}"certificates_general.env
source "${SECURITY_ENV_FOLDER}"users_elasticsearch.env

ES_CA_CERT="${ES_CERTIFICATES_FOLDER}/elastic-stack-ca.crt.pem"
ES_CA_KEY="${ES_CERTIFICATES_FOLDER}/elastic-stack-ca.key.pem"

# Validate required variables
: "${ELASTIC_HOST:?Must set ELASTIC_HOST in certificates_elasticsearch.env}"
: "${ELASTIC_PASSWORD:?Must set ELASTIC_PASSWORD in certificates_elasticsearch.env}"
: "${KIBANA_USER:?Must set KIBANA_USER in certificates_elasticsearch.env}"
: "${KIBANA_PASSWORD:?Must set KIBANA_PASSWORD in certificates_elasticsearch.env}"
: "${INGEST_SERVICE_USER:?Must set INGEST_SERVICE_USER in certificates_elasticsearch.env}"
: "${INGEST_SERVICE_PASSWORD:?Must set INGEST_SERVICE_PASSWORD in certificates_elasticsearch.env}"
: "${ES_ADMIN_EMAIL:?Must set ES_ADMIN_EMAIL in certificates_elasticsearch.env}"

echo "====================================== CREATE_ES_NATIVE_CREDENTIALS =============================="
echo "ELASTIC_HOST: $ELASTIC_HOST"
echo "ELASTIC_USER: $ELASTIC_USER"
echo "KIBANA_USER: $KIBANA_USER"
echo "INGEST_SERVICE_USER: $INGEST_SERVICE_USER"
echo "ES_ADMIN_EMAIL: $ES_ADMIN_EMAIL"
echo "Credential values: [loaded; values not logged]"
echo "=================================================================================================="

ES_URL="https://$ELASTIC_HOST:9200"

# Wait for Elasticsearch to be available
echo "⏳ Waiting for Elasticsearch to become available..."
until curl -ks --cacert "$ES_CA_CERT" -u "elastic:$ELASTIC_PASSWORD" "$ES_URL" >/dev/null; do
  echo "  🔁 Still waiting on $ELASTIC_HOST..."
  sleep 10
done
echo "✅ Elasticsearch is reachable"

create_user() {
  local username=$1
  local password=$2
  local roles=$3

  echo "🔐 Creating user: $username with role: $roles"

  response=$(curl -ks -w "\n%{http_code}" --cacert "$ES_CA_CERT" \
    -u "elastic:$ELASTIC_PASSWORD" \
    -X POST "$ES_URL/_security/user/$username?pretty" \
    -H 'Content-Type: application/json' \
    -d "
    {
      \"password\": \"$password\",
      \"roles\": [ $roles ],
      \"full_name\": \"$username\",
      \"enabled\": true
    }")

  # Split body and status code
  body=$(echo "$response" | sed '$d')
  status=$(echo "$response" | tail -n1)

  if [[ "$status" -eq 200 || "$status" -eq 201 ]]; then
    echo "✅ User $username created successfully"
  elif [[ "$status" -eq 409 ]]; then
    echo "⚠️  User $username already exists (HTTP 409 Conflict)"
  else
    echo "❌ Failed to create user $username (HTTP $status)"
    echo "Response: $body"
  fi
}

echo "🔑 Connecting to Elasticsearch at $ES_URL"

create_user "$FILEBEAT_USER" "$FILEBEAT_PASSWORD" "\"beats_system\""
create_user "$METRICBEAT_USER" "$METRICBEAT_PASSWORD" "\"beats_system\""
create_user "$INGEST_SERVICE_USER" "$INGEST_SERVICE_PASSWORD" "\"ingest_admin\""
create_user "$KIBANA_USER" "$KIBANA_PASSWORD" "\"kibana_system\", \"kibana_admin\", \"ingest_admin\""

# Create Fleet server service account token
echo "🔑 Creating Fleet server service account token..."
FLEET_TOKEN_OUTPUT_FILE="${ELASTICSEARCH_SERVICE_TOKEN_OUTPUT_FILE:-${ES_CERTIFICATES_FOLDER}/fleet-server-service-token.json}"
mkdir -p "$(dirname "$FLEET_TOKEN_OUTPUT_FILE")"
FLEET_TOKEN_TEMP_FILE="$(mktemp "${FLEET_TOKEN_OUTPUT_FILE}.tmp.XXXXXX")"
trap 'rm -f "$FLEET_TOKEN_TEMP_FILE"' EXIT

if ! curl -ks --fail -X POST \
  --cacert "$ES_CA_CERT" \
  -u "elastic:$ELASTIC_PASSWORD" \
  --output "$FLEET_TOKEN_TEMP_FILE" \
  "$ES_URL/_security/service/elastic/fleet-server/credential/token?pretty"; then
  echo "❌ Failed to create the Fleet Server token; no token file was written." >&2
  exit 1
fi

chmod 600 "$FLEET_TOKEN_TEMP_FILE"
mv "$FLEET_TOKEN_TEMP_FILE" "$FLEET_TOKEN_OUTPUT_FILE"
trap - EXIT
echo "✅ Fleet Server token written to $FLEET_TOKEN_OUTPUT_FILE (value not logged)."

echo "✅ All Elasticsearch native credentials have been created."
