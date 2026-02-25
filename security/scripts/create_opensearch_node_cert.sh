#!/usr/bin/env bash

# ==============================================================================
# 🔐 Generate OpenSearch node certificate signed by Root CA
#
# Usage:
#     ./create_opensearch_node_cert.sh <cert_name> [cert_name...]
#
# Requires:
#     - ../env/certificates_general.env
#     - ../env/certificates_elasticsearch.env
#     - ../env/users_elasticsearch.env
#
# Produces:
#     - <cert_name>.key            → Private key (PKCS#8)
#     - <cert_name>.csr            → Certificate Signing Request
#     - <cert_name>.crt            → Signed X.509 certificate
#     - <cert_name>-keystore.jks   → Java Keystore for NiFi etc.
#     - <cert_name>-truststore.key → Truststore with CA cert
#     - Copies CA root certs into ./certificates/elastic/opensearch/
#     - Final path: ./certificates/elastic/opensearch/elasticsearch/<cert_name>/
#
# ==============================================================================

set -euo pipefail


SECURITY_TEMPLATES_FOLDER="../templates/"
SECURITY_CERTIFICATES_FOLDER="../certificates/"
SECURITY_ENV_FOLDER="../env/"

ROOT_CERTIFICATES_FOLDER="${SECURITY_CERTIFICATES_FOLDER}root/"

# required env var files
source "${SECURITY_ENV_FOLDER}certificates_general.env"
source "${SECURITY_ENV_FOLDER}certificates_elasticsearch.env"
source "${SECURITY_ENV_FOLDER}users_elasticsearch.env"

# === Required Input ===
if [[ "$#" -lt 1 ]]; then
  echo "❌ Usage: $0 <cert_name> [cert_name...]"
  exit 1
fi
CERT_NAMES=("$@")

# === Required ENV Vars ===
: "${ROOT_CERTIFICATE_NAME:?ROOT_CERTIFICATE_NAME must be set in certificates_general.env}"
: "${ES_CERTIFICATE_TIME_VALIDITY_IN_DAYS:?Must be set in certificates_elasticsearch.env}"
: "${ES_NODE_SUBJ_LINE:?Must be set in certificates_elasticsearch.env}"
: "${ES_NODE_SUBJ_ALT_NAMES:?Must be set in certificates_elasticsearch.env}"
: "${ES_CERTIFICATE_PASSWORD:?Must be set in certificates_elasticsearch.env}"
: "${ES_KEY_SIZE:?Must be set in certificates_elasticsearch.env}"

echo "====================================== CREATE_OPENSEARCH_NODE_CERT =============================="
echo "CERT_NAMES: ${CERT_NAMES[*]}"
echo "ES_NODE_SUBJ_LINE: $ES_NODE_SUBJ_LINE"
echo "ES_NODE_SUBJ_ALT_NAMES: $ES_NODE_SUBJ_ALT_NAMES"
echo "ES_KEY_SIZE: $ES_KEY_SIZE"
echo "ES_CERTIFICATE_TIME_VALIDITY_IN_DAYS: $ES_CERTIFICATE_TIME_VALIDITY_IN_DAYS"
echo "ROOT_CERTIFICATE_NAME: $ROOT_CERTIFICATE_NAME"
echo "=================================================================================================="

# === Paths ===
OPENSEARCH_FOLDER="${SECURITY_CERTIFICATES_FOLDER}elastic/opensearch/"
ES_CERTIFICATES_FOLDER="${OPENSEARCH_FOLDER}elasticsearch/"
CA_ROOT_CERT="${ROOT_CERTIFICATES_FOLDER}${ROOT_CERTIFICATE_NAME}.pem"
CA_ROOT_KEY="${ROOT_CERTIFICATES_FOLDER}${ROOT_CERTIFICATE_NAME}.key"
CA_ROOT_KEYSTORE="${ROOT_CERTIFICATES_FOLDER}${ROOT_CERTIFICATE_NAME}.p12"

# === Validate Root CA Files ===
if [[ ! -f "$CA_ROOT_CERT" || ! -f "$CA_ROOT_KEY" ]]; then
  echo "❌ Missing Root CA certificate or key: $CA_ROOT_CERT / $CA_ROOT_KEY"
  exit 1
fi

generate_node_cert() {
  local cert_name="$1"

  if [[ -z "$cert_name" ]]; then
    echo "❌ Empty cert name provided."
    exit 1
  fi

  # === Update Subject lines with CN & SAN ===
  local subject_line="${ES_NODE_SUBJ_LINE}/CN=${cert_name}"
  local subject_alt_name="subjectAltName=DNS:${cert_name},${ES_NODE_SUBJ_ALT_NAMES}"

  # === Logging ===
  echo "====================================== CREATE_OPENSEARCH_NODE_CERT =============================="
  echo "CERT_NAME: $cert_name"
  echo "SUBJECT_LINE: $subject_line"
  echo "SUBJECT_ALT_NAME: $subject_alt_name"
  echo "CA_ROOT_CERT: $CA_ROOT_CERT"
  echo "--------------------------------------------------------------------------------------------------"

  # === Generate Private Key ===
  echo "🔑 Generating private RSA key..."
  openssl genrsa -out "${cert_name}.raw.key" "$ES_KEY_SIZE"

  echo "🔄 Converting key to PKCS#8 format..."
  openssl pkcs8 -v1 "PBE-SHA1-3DES" -in "${cert_name}.raw.key" -topk8 -out "${cert_name}.key" -nocrypt

  # === Generate CSR ===
  echo "📨 Generating Certificate Signing Request (CSR)..."
  openssl req -new -key "${cert_name}.key" -out "${cert_name}.csr" -subj "$subject_line" -addext "$subject_alt_name"

  # === Sign CSR ===
  echo "✅ Signing certificate with Root CA..."
  openssl x509 -req \
    -days "$ES_CERTIFICATE_TIME_VALIDITY_IN_DAYS" \
    -in "${cert_name}.csr" \
    -CA "$CA_ROOT_CERT" \
    -CAkey "$CA_ROOT_KEY" \
    -CAcreateserial \
    -out "${cert_name}.crt" \
    -extensions v3_leaf \
    -extfile "${SECURITY_TEMPLATES_FOLDER}ssl-extensions-x509.cnf"

  # === Create Java Keystore ===
  echo "🔐 Creating Java Keystore (.jks)..."
  ./create_keystore.sh "$cert_name" "${cert_name}-keystore" "$ES_CERTIFICATE_PASSWORD"

  # === Move Files to Target Folder ===
  mkdir -p "${ES_CERTIFICATES_FOLDER}${cert_name}"
  mv "${cert_name}.crt" "${cert_name}.key" "${cert_name}.csr" "${cert_name}.p12" \
     "${cert_name}-keystore.jks" "${cert_name}-truststore.key" \
     "${ES_CERTIFICATES_FOLDER}${cert_name}/"

  rm -f "${cert_name}.raw.key"

  echo "✅ Finished generating certificate for node: $cert_name"
}

for cert_name in "${CERT_NAMES[@]}"; do
  generate_node_cert "$cert_name"
done

# === Copy Root CA files to opensearch folder ===
ELASTIC_CA_PREFIX="elastic-stack-ca"
cp "$CA_ROOT_KEY" "${OPENSEARCH_FOLDER}${ELASTIC_CA_PREFIX}.key.pem"
cp "$CA_ROOT_CERT" "${OPENSEARCH_FOLDER}${ELASTIC_CA_PREFIX}.crt.pem"
cp "$CA_ROOT_KEYSTORE" "${OPENSEARCH_FOLDER}${ELASTIC_CA_PREFIX}.p12"

echo "✅ Finished generating certificates for nodes: ${CERT_NAMES[*]}"
