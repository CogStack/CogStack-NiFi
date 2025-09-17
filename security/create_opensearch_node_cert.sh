#!/usr/bin/env bash

# ==============================================================================
# 🔐 Generate OpenSearch node certificate signed by Root CA
#
# Usage:
#     ./create_opensearch_node_cert.sh <cert_name>
#
# Requires:
#     - certificates_general.env
#     - certificates_elasticsearch.env
#     - users_elasticsearch.env
#
# Produces:
#     - <cert_name>.key            → Private key (PKCS#8)
#     - <cert_name>.csr            → Certificate Signing Request
#     - <cert_name>.crt            → Signed X.509 certificate
#     - <cert_name>-keystore.jks   → Java Keystore for NiFi etc.
#     - <cert_name>-truststore.key → Truststore with CA cert
#     - Copies CA root certs into ./es_certificates/opensearch/
#     - Final path: ./es_certificates/opensearch/elasticsearch/<cert_name>/
# ==============================================================================

set -euo pipefail

# required env var files
source certificates_general.env
source certificates_elasticsearch.env
source users_elasticsearch.env

# === Required Input ===
CERT_NAME="${1:-}"
if [[ -z "$CERT_NAME" ]]; then
  echo "❌ Usage: $0 <cert_name>"
  exit 1
fi

# === Required ENV Vars ===
: "${ROOT_CERTIFICATE_NAME:?ROOT_CERTIFICATE_NAME must be set in certificates_general.env}"
: "${ES_CERTIFICATE_TIME_VALIDITY_IN_DAYS:?Must be set in certificates_elasticsearch.env}"
: "${ES_NODE_SUBJ_LINE:?Must be set in certificates_elasticsearch.env}"
: "${ES_NODE_SUBJ_ALT_NAMES:?Must be set in certificates_elasticsearch.env}"
: "${ES_CERTIFICATE_PASSWORD:?Must be set in certificates_elasticsearch.env}"
: "${ES_KEY_SIZE:?Must be set in certificates_elasticsearch.env}"

echo "====================================== CREATE_OPENSEARCH_NODE_CERT =============================="
echo "CERT_NAME: $CERT_NAME"
echo "ES_NODE_SUBJ_LINE: $ES_NODE_SUBJ_LINE"
echo "ES_NODE_SUBJ_ALT_NAMES: $ES_NODE_SUBJ_ALT_NAMES"
echo "ES_KEY_SIZE: $ES_KEY_SIZE"
echo "ES_CERTIFICATE_TIME_VALIDITY_IN_DAYS: $ES_CERTIFICATE_TIME_VALIDITY_IN_DAYS"
echo "ROOT_CERTIFICATE_NAME: $ROOT_CERTIFICATE_NAME"
echo "=================================================================================================="

# === Paths ===
OPENSEARCH_FOLDER="./es_certificates/opensearch/"
ES_CERTIFICATES_FOLDER="${OPENSEARCH_FOLDER}elasticsearch"
CA_ROOT_CERT="root_certificates/${ROOT_CERTIFICATE_NAME}.pem"
CA_ROOT_KEY="root_certificates/${ROOT_CERTIFICATE_NAME}.key"
CA_ROOT_KEYSTORE="root_certificates/${ROOT_CERTIFICATE_NAME}.p12"

# === Validate Root CA Files ===
if [[ ! -f "$CA_ROOT_CERT" || ! -f "$CA_ROOT_KEY" ]]; then
  echo "❌ Missing Root CA certificate or key: $CA_ROOT_CERT / $CA_ROOT_KEY"
  exit 1
fi

# === Update Subject lines with CN & SAN ===
SUBJECT_LINE="${ES_NODE_SUBJ_LINE}/CN=${CERT_NAME}"
SUBJECT_ALT_NAME="subjectAltName=DNS:${CERT_NAME},${ES_NODE_SUBJ_ALT_NAMES}"

# === Logging ===
echo "====================================== CREATE_OPENSEARCH_NODE_CERT =============================="
echo "CERT_NAME: $CERT_NAME"
echo "SUBJECT_LINE: $SUBJECT_LINE"
echo "SUBJECT_ALT_NAME: $SUBJECT_ALT_NAME"
echo "CA_ROOT_CERT: $CA_ROOT_CERT"
echo "--------------------------------------------------------------------------------------------------"

# === Generate Private Key ===
echo "🔑 Generating private RSA key..."
openssl genrsa -out "${CERT_NAME}.raw.key" "$ES_KEY_SIZE"

echo "🔄 Converting key to PKCS#8 format..."
openssl pkcs8 -v1 "PBE-SHA1-3DES" -in "${CERT_NAME}.raw.key" -topk8 -out "${CERT_NAME}.key" -nocrypt

# === Generate CSR ===
echo "📨 Generating Certificate Signing Request (CSR)..."
openssl req -new -key "${CERT_NAME}.key" -out "${CERT_NAME}.csr" -subj "$SUBJECT_LINE" -addext "$SUBJECT_ALT_NAME"

# === Sign CSR ===
echo "✅ Signing certificate with Root CA..."
openssl x509 -req \
  -days "$ES_CERTIFICATE_TIME_VALIDITY_IN_DAYS" \
  -in "${CERT_NAME}.csr" \
  -CA "$CA_ROOT_CERT" \
  -CAkey "$CA_ROOT_KEY" \
  -CAcreateserial \
  -out "${CERT_NAME}.crt" \
  -extensions v3_ca \
  -extfile ./ssl-extensions-x509.cnf

# === Create Java Keystore ===
echo "🔐 Creating Java Keystore (.jks)..."
./create_keystore.sh "$CERT_NAME" "${CERT_NAME}-keystore" "$ES_CERTIFICATE_PASSWORD"

# === Move Files to Target Folder ===
mkdir -p "${ES_CERTIFICATES_FOLDER}/${CERT_NAME}"
mv "${CERT_NAME}.crt" "${CERT_NAME}.key" "${CERT_NAME}.csr" "${CERT_NAME}.p12" \
   "${CERT_NAME}-keystore.jks" "${CERT_NAME}-truststore.key" \
   "${ES_CERTIFICATES_FOLDER}/${CERT_NAME}/"

rm -f "${CERT_NAME}.raw.key"

# === Copy Root CA files to opensearch folder ===
ELASTIC_CA_PREFIX="elastic-stack-ca"
cp "$CA_ROOT_KEY" "$OPENSEARCH_FOLDER/${ELASTIC_CA_PREFIX}.key.pem"
cp "$CA_ROOT_CERT" "$OPENSEARCH_FOLDER/${ELASTIC_CA_PREFIX}.crt.pem"
cp "$CA_ROOT_KEYSTORE" "$OPENSEARCH_FOLDER/${ELASTIC_CA_PREFIX}.p12"

echo "✅ Finished generating certificate for node: $CERT_NAME"
