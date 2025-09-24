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
# Output (to Elasticsearch security API):
#   • Password for `kibana_system` set
#   • Users `$KIBANA_USER` and `$INGEST_SERVICE_USER` created
#   • Fleet Server token generated
# ==============================================================================

set -euo pipefail


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
echo "ELASTIC_PASSWORD: $ELASTIC_PASSWORD"
echo "ELASTIC_USER: $ELASTIC_USER"
echo "KIBANA_USER: $KIBANA_USER"
echo "KIBANA_PASSWORD: $KIBANA_PASSWORD"
echo "INGEST_SERVICE_USER: $INGEST_SERVICE_USER"
echo "INGEST_SERVICE_PASSWORD: $INGEST_SERVICE_PASSWORD"
echo "ES_ADMIN_EMAIL: $ES_ADMIN_EMAIL"
echo "=================================================================================================="

# Wait for Elasticsearch to be available
echo "⏳ Waiting for Elasticsearch to become available..."
until curl -ks --cacert "$ES_CA_CERT" -u "elastic:$ELASTIC_PASSWORD" "https://$ELASTIC_HOST:9200" >/dev/null; do
  echo "  🔁 Still waiting on https://$ELASTIC_HOST:9200..."
  sleep 5
done
echo "✅ Elasticsearch is reachable"

# Set kibana_system password
echo "🔧 Setting password for built-in kibana_system user..."
curl -ks -X POST --cacert "$ES_CA_CERT" -u "elastic:$ELASTIC_PASSWORD" \
  -H "Content-Type: application/json" \
  "https://$ELASTIC_HOST:9200/_security/user/kibana_system/_password" \
  -d "{\"password\": \"$KIBANA_PASSWORD\"}"

# Create custom Kibana user
echo "👤 Creating user: $KIBANA_USER..."
curl -ks -X POST --cacert "$ES_CA_CERT" -u "elastic:$ELASTIC_PASSWORD" \
  -H "Content-Type: application/json" \
  "https://$ELASTIC_HOST:9200/_security/user/$KIBANA_USER?pretty" \
  -d @- <<EOF
{
  "password": "$KIBANA_PASSWORD",
  "roles": ["kibana_system", "kibana_admin", "ingest_admin"],
  "full_name": "kibanaserver",
  "email": "$ES_ADMIN_EMAIL"
}
EOF

# Create ingest service user
echo "👤 Creating user: $INGEST_SERVICE_USER..."
curl -ks -X POST --cacert "$ES_CA_CERT" -u "elastic:$ELASTIC_PASSWORD" \
  -H "Content-Type: application/json" \
  "https://$ELASTIC_HOST:9200/_security/user/$INGEST_SERVICE_USER?pretty" \
  -d @- <<EOF
{
  "password": "$INGEST_SERVICE_PASSWORD",
  "roles": ["ingest_admin"],
  "full_name": "ingestion service",
  "email": "$ES_ADMIN_EMAIL"
}
EOF

# Create Fleet server service account token
echo "🔑 Creating Fleet server service account token..."
curl -ks -X POST --cacert "$ES_CA_CERT" -u "elastic:$ELASTIC_PASSWORD" \
  "https://$ELASTIC_HOST:9200/_security/service/elastic/fleet-server/credential/token?pretty"

echo "✅ All Elasticsearch native credentials have been created."
