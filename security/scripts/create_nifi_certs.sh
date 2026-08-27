#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
SECURITY_TEMPLATES_FOLDER="${SCRIPT_DIR}/../templates/"
SECURITY_CERTIFICATES_FOLDER="${SCRIPT_DIR}/../certificates/"
SECURITY_ENV_FOLDER="${SCRIPT_DIR}/../env/"
ROOT_CERTIFICATES_FOLDER="${SECURITY_CERTIFICATES_FOLDER}root/"
NIFI_CERTIFICATES_FOLDER="${SECURITY_CERTIFICATES_FOLDER}nifi/"

# These paths are resolved dynamically from this script's location.
# shellcheck disable=SC1090
source "${SECURITY_ENV_FOLDER}certificates_general.env"
# shellcheck disable=SC1090
source "${SECURITY_ENV_FOLDER}certificates_nifi.env"

: "${ROOT_CERTIFICATE_NAME:?Must be set in certificates_general.env}"
: "${NIFI_CERTIFICATE_TIME_VAILIDITY_IN_DAYS:?Must be set in certificates_nifi.env}"
: "${NIFI_KEYSTORE_PASSWORD:?Must be set in certificates_nifi.env}"
: "${NIFI_TRUSTSTORE_PASSWORD:?Must be set in certificates_nifi.env}"

EXT_FILE="${SECURITY_TEMPLATES_FOLDER}ssl-extensions-x509.cnf"
CA_ROOT_CERT="${ROOT_CERTIFICATES_FOLDER}${ROOT_CERTIFICATE_NAME}.pem"
CA_ROOT_KEY="${ROOT_CERTIFICATES_FOLDER}${ROOT_CERTIFICATE_NAME}.key"

if [[ ! -f "$CA_ROOT_CERT" || ! -f "$CA_ROOT_KEY" ]]; then
  echo "Missing Root CA files. Run create_root_ca_cert.sh first." >&2
  exit 1
fi

CERT_NAME="nifi"
KEY_FILE="${NIFI_CERTIFICATES_FOLDER}${CERT_NAME}.key"
CSR_FILE="${NIFI_CERTIFICATES_FOLDER}${CERT_NAME}.csr"
PEM_FILE="${NIFI_CERTIFICATES_FOLDER}${CERT_NAME}.pem"
CRT_FILE="${NIFI_CERTIFICATES_FOLDER}${CERT_NAME}.crt"
P12_FILE="${NIFI_CERTIFICATES_FOLDER}${CERT_NAME}.p12"
KEYSTORE_FILE="${NIFI_CERTIFICATES_FOLDER}${CERT_NAME}-keystore.jks"
TRUSTSTORE_FILE="${NIFI_CERTIFICATES_FOLDER}${CERT_NAME}-truststore.jks"

mkdir -p "$NIFI_CERTIFICATES_FOLDER"
rm -f "$KEY_FILE" "$CSR_FILE" "$PEM_FILE" "$CRT_FILE" "$P12_FILE" "$KEYSTORE_FILE" "$TRUSTSTORE_FILE"

openssl genrsa -out "$KEY_FILE" 4096
openssl req -new -key "$KEY_FILE" -out "$CSR_FILE" -config "$EXT_FILE"

openssl x509 -req \
  -in "$CSR_FILE" \
  -CA "$CA_ROOT_CERT" \
  -CAkey "$CA_ROOT_KEY" \
  -CAcreateserial \
  -out "$PEM_FILE" \
  -days "$NIFI_CERTIFICATE_TIME_VAILIDITY_IN_DAYS" \
  -sha256 \
  -extfile "$EXT_FILE" \
  -extensions v3_leaf

openssl x509 -in "$PEM_FILE" -outform DER -out "$CRT_FILE"

openssl pkcs12 -export \
  -in "$PEM_FILE" \
  -inkey "$KEY_FILE" \
  -out "$P12_FILE" \
  -name "$CERT_NAME" \
  -passout pass:"$NIFI_KEYSTORE_PASSWORD"

keytool -importkeystore \
  -destkeystore "$KEYSTORE_FILE" \
  -srckeystore "$P12_FILE" \
  -srcstoretype PKCS12 \
  -alias "$CERT_NAME" \
  -srcstorepass "$NIFI_KEYSTORE_PASSWORD" \
  -deststorepass "$NIFI_KEYSTORE_PASSWORD" \
  -noprompt

keytool -importcert \
  -file "$CA_ROOT_CERT" \
  -alias "$ROOT_CERTIFICATE_NAME" \
  -keystore "$TRUSTSTORE_FILE" \
  -storepass "$NIFI_TRUSTSTORE_PASSWORD" \
  -noprompt

chmod 600 "$KEY_FILE" "$P12_FILE" "$KEYSTORE_FILE" "$TRUSTSTORE_FILE"
chmod 644 "$PEM_FILE" "$CRT_FILE" "$CSR_FILE"
