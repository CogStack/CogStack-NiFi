#!/usr/bin/env bash

# ===========================================================================================================================
# 🧰 Create a Java keystore (.jks) and truststore from existing cert + key
#
# Usage:
#     ./create_keystore.sh <cert_base_name> <output_jks_base_name> [password]
#
# Arguments:
#     <cert_base_name>:          Prefix of the .crt and .key input files (e.g., myservice → myservice.crt + myservice.key)
#     <output_jks_base_name>:    Desired name (no extension) for the output keystore
#     [password]:                Optional password (defaults to $ROOT_CERTIFICATE_KEYSTORE_PASSWORD)
#
# Required ENV:
#     ROOT_CERTIFICATE_NAME                 (e.g., root-ca)
#     ROOT_CERTIFICATE_KEYSTORE_PASSWORD    (used as password for keystore + truststore)
#
# Produces:
#     - ${cert_base_name}.p12                (PKCS#12 bundle of key + cert)
#     - ${output_jks_base_name}.jks          (Java keystore with private key + cert + root)
#     - ${cert_base_name}-truststore.key     (Truststore with public cert only)
# ===========================================================================================================================

set -euo pipefail


SECURITY_TEMPLATES_FOLDER="../templates/"
SECURITY_CERTIFICATES_FOLDER="../certificates/"
SECURITY_ENV_FOLDER="../env/"

ROOT_CERTIFICATES_FOLDER="${SECURITY_CERTIFICATES_FOLDER}root/"

source "${SECURITY_ENV_FOLDER}certificates_general.env"

# Validate required variables
: "${ROOT_CERTIFICATE_NAME:?ROOT_CERTIFICATE_NAME must be set in certificates_general.env}"
: "${ROOT_CERTIFICATE_KEYSTORE_PASSWORD:?ROOT_CERTIFICATE_KEYSTORE_PASSWORD must be set in certificates_general.env}"

echo "====================================== CREATE_KEYSTORE =============================="
echo "ROOT_CERTIFICATE_NAME: $ROOT_CERTIFICATE_NAME"
echo "ROOT_CERTIFICATE_KEYSTORE_PASSWORD: $ROOT_CERTIFICATE_KEYSTORE_PASSWORD"
echo "=================================================================================================="

CERT_NAME="${1:-}"
JKS_NAME="${2:-}"
KEYSTORE_PASSWORD="${3:-$ROOT_CERTIFICATE_KEYSTORE_PASSWORD}"

# Root cert defaults
CA_ROOT_CERT="${ROOT_CERTIFICATES_FOLDER}${ROOT_CERTIFICATE_NAME}.pem"
CA_ROOT_KEY="${ROOT_CERTIFICATES_FOLDER}${ROOT_CERTIFICATE_NAME}.key"
CA_ROOT_KEYSTORE="${ROOT_CERTIFICATES_FOLDER}${ROOT_CERTIFICATE_NAME}.p12"

CERT_FILE="${CERT_NAME}.crt"
KEY_FILE="${CERT_NAME}.key"
PKCS12_FILE="${CERT_NAME}.p12"

# Validate required inputs
if [[ -z "$CERT_NAME" || -z "$JKS_NAME" ]]; then
  echo "❌ Usage: $0 <cert_name> <jks_store_name> [password]"
  exit 1
fi

if [[ ! -f "$CERT_FILE" || ! -f "$KEY_FILE" ]]; then
  echo "❌ Error: Missing ${CERT_FILE} or ${KEY_FILE}"
  exit 1
fi

echo "📦 Converting ${CERT_FILE} + ${KEY_FILE} to PKCS#12: ${PKCS12_FILE}"
openssl pkcs12 -export \
  -in "$CERT_FILE" \
  -inkey "$KEY_FILE" \
  -out "$PKCS12_FILE" \
  -name "$CERT_NAME" \
  -CAfile "$CA_ROOT_CERT" \
  -passout pass:"$KEYSTORE_PASSWORD"

echo "🔐 Importing ${PKCS12_FILE} into Java Keystore: ${JKS_NAME}.jks"
keytool -importkeystore \
  -destkeystore "${JKS_NAME}.jks" \
  -srckeystore "$PKCS12_FILE" \
  -srcstoretype PKCS12 \
  -alias "$CERT_NAME" \
  -srcstorepass "$KEYSTORE_PASSWORD" \
  -deststorepass "$KEYSTORE_PASSWORD"

echo "✅ Adding Root CA to truststore in ${JKS_NAME}.jks"
keytool -importcert \
  -file "$CA_ROOT_CERT" \
  -alias "root-ca" \
  -keystore "${JKS_NAME}.jks" \
  -storepass "$KEYSTORE_PASSWORD" \
  -noprompt

echo "📋 Listing keystore contents:"
keytool -list -v \
  -keystore "${JKS_NAME}.jks" \
  -storepass "$KEYSTORE_PASSWORD" \
  -noprompt

echo "🧱 Creating separate truststore file: ${CERT_NAME}-truststore.key"
keytool -import \
  -file "$CERT_FILE" \
  -alias "$CERT_NAME" \
  -keystore "${CERT_NAME}-truststore.key" \
  -storepass "$KEYSTORE_PASSWORD" \
  -noprompt
  