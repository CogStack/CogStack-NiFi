#!/usr/bin/env bash

# ==============================================================================
# 🔐 Create OpenSearch client + admin certs (key, pem, csr, p12)
#
# Usage:
#     ./create_opensearch_client_admin_certs.sh
#
# Requires:
#     - ../env/certificates_general.env
#     - ../env/certificates_elasticsearch.env
#
# Produces:
#     - ./certificates/elastic/opensearch/${ES_CLIENT_CERT_NAME}.{key,pem,csr,p12}
#     - ./certificates/elastic/opensearch/admin.{key.pem,crt,csr}
# ==============================================================================

set -euo pipefail


SECURITY_TEMPLATES_FOLDER="../templates/"
SECURITY_CERTIFICATES_FOLDER="../certificates/"
SECURITY_ENV_FOLDER="../env/"

ROOT_CERTIFICATES_FOLDER="${SECURITY_CERTIFICATES_FOLDER}root/"

OPENSEARCH_ES_CERTIFICATES_FOLDER="${SECURITY_CERTIFICATES_FOLDER}elastic/opensearch/"

source "${SECURITY_ENV_FOLDER}/certificates_general.env"
source "${SECURITY_ENV_FOLDER}/certificates_elasticsearch.env"

# Validate required env vars
: "${ROOT_CERTIFICATE_NAME:?Must be set in certificates_general.env}"
: "${ROOT_CERTIFICATE_KEYSTORE_PASSWORD:?Must be set in certificates_general.env}"
: "${ES_CLIENT_SUBJ_LINE:?Must be set in certificates_elasticsearch.env}"
: "${ES_CLIENT_CERT_NAME:?Must be set in certificates_elasticsearch.env}"
: "${ES_ADMIN_SUBJ_LINE:?Must be set in certificates_elasticsearch.env}"
: "${ES_KEY_SIZE:?Must be set in certificates_elasticsearch.env}"
: "${ES_CERTIFICATE_TIME_VALIDITY_IN_DAYS:?Must be set in certificates_elasticsearch.env}"

echo "====================================== CREATE_OPENSEARCH_ADMIN_CERT ==============================="
echo "ES_CERTIFICATE_TIME_VALIDITY_IN_DAYS: $ES_CERTIFICATE_TIME_VALIDITY_IN_DAYS"
echo "ES_CLIENT_SUBJ_ALT_NAMES: $ES_CLIENT_SUBJ_ALT_NAMES"
echo "ES_KEY_SIZE: $ES_KEY_SIZE"
echo "ES_CLIENT_CERT_NAME: $ES_CLIENT_CERT_NAME"
echo "ES_ADMIN_SUBJ_LINE: $ES_ADMIN_SUBJ_LINE"
echo "ROOT_CERTIFICATE_NAME: $ROOT_CERTIFICATE_NAME"
echo "==================================================================================================="

CA_ROOT_CERT="${ROOT_CERTIFICATES_FOLDER}"$ROOT_CERTIFICATE_NAME".pem"
CA_ROOT_KEY="${ROOT_CERTIFICATES_FOLDER}"$ROOT_CERTIFICATE_NAME".key"
EXT_FILE="${SECURITY_TEMPLATES_FOLDER}ssl-extensions-x509.cnf"

# === Client cert ===
echo "Generating a key for: $ES_CLIENT_CERT_NAME"
openssl genrsa -out "$ES_CLIENT_CERT_NAME.p12" "$ES_KEY_SIZE"

echo "Converting the key to PKCS #8"
openssl pkcs8 -v1 "PBE-SHA1-3DES" -in "$ES_CLIENT_CERT_NAME.p12" -topk8 -out "$ES_CLIENT_CERT_NAME.key" -nocrypt

echo "Generating the certificate ..."
openssl req -new -key "$ES_CLIENT_CERT_NAME.key" -out "$ES_CLIENT_CERT_NAME.csr" -subj "$ES_CLIENT_SUBJ_LINE"

echo "Signing the certificate ..."
openssl x509 -req -days "$ES_CERTIFICATE_TIME_VALIDITY_IN_DAYS" \
  -in "$ES_CLIENT_CERT_NAME.csr" \
  -CA "$CA_ROOT_CERT" -CAkey "$CA_ROOT_KEY" -CAcreateserial \
  -out "$ES_CLIENT_CERT_NAME.pem" \
  -extensions v3_leaf -extfile $EXT_FILE

mv "$ES_CLIENT_CERT_NAME"* "$OPENSEARCH_ES_CERTIFICATES_FOLDER"

# === Admin cert ===
echo "Generating admin key"
openssl genrsa -out admin-key-temp.pem "$ES_KEY_SIZE"

echo "Converting to PKCS #8 key"
openssl pkcs8 -inform PEM -outform PEM -in admin-key-temp.pem -topk8 -nocrypt -v1 PBE-SHA1-3DES -out admin.key.pem

echo "Generating admin CSR"
openssl req -new -key admin.key.pem -subj "$ES_ADMIN_SUBJ_LINE" -out admin.csr

echo "Signing admin certificate"
openssl x509 -req -in admin.csr -CA "$CA_ROOT_CERT" -CAkey "$CA_ROOT_KEY" -CAcreateserial -sha256 -out admin.crt -days "$ES_CERTIFICATE_TIME_VALIDITY_IN_DAYS"

mv admin.crt admin.csr admin.key.pem admin-key-temp.pem "$OPENSEARCH_ES_CERTIFICATES_FOLDER"

# === Final permissions ===
find "$OPENSEARCH_ES_CERTIFICATES_FOLDER" -type f -exec chmod 644 {} \;
find "$OPENSEARCH_ES_CERTIFICATES_FOLDER" -type d -exec chmod 755 {} \;

echo "✅ OpenSearch client + admin certificates created successfully."
