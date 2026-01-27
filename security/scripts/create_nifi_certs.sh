#!/usr/bin/env bash

set -euo pipefail

SECURITY_TEMPLATES_FOLDER="../templates/"
SECURITY_CERTIFICATES_FOLDER="../certificates/"
SECURITY_ENV_FOLDER="../env/"
ROOT_CERTIFICATES_FOLDER="${SECURITY_CERTIFICATES_FOLDER}root/"
NIFI_CERTIFICATES_FOLDER="${SECURITY_CERTIFICATES_FOLDER}nifi/"

source "${SECURITY_ENV_FOLDER}certificates_general.env"
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

mkdir -p "$NIFI_CERTIFICATES_FOLDER"
rm -f "${NIFI_CERTIFICATES_FOLDER}${CERT_NAME}"*

openssl genrsa -out "${CERT_NAME}.key" 4096
openssl req -new -key "${CERT_NAME}.key" -out "${CERT_NAME}.csr" -config "$EXT_FILE"

openssl x509 -req \
  -in "${CERT_NAME}.csr" \
  -CA "$CA_ROOT_CERT" \
  -CAkey "$CA_ROOT_KEY" \
  -CAcreateserial \
  -out "${CERT_NAME}.pem" \
  -days "$NIFI_CERTIFICATE_TIME_VAILIDITY_IN_DAYS" \
  -sha256 \
  -extfile "$EXT_FILE" \
  -extensions v3_leaf

openssl x509 -in "${CERT_NAME}.pem" -outform DER -out "${CERT_NAME}.crt"

openssl pkcs12 -export \
  -in "${CERT_NAME}.pem" \
  -inkey "${CERT_NAME}.key" \
  -out "${CERT_NAME}.p12" \
  -name "$CERT_NAME" \
  -passout pass:"$NIFI_KEYSTORE_PASSWORD"

keytool -importkeystore \
  -destkeystore "${CERT_NAME}-keystore.jks" \
  -srckeystore "${CERT_NAME}.p12" \
  -srcstoretype PKCS12 \
  -alias "$CERT_NAME" \
  -srcstorepass "$NIFI_KEYSTORE_PASSWORD" \
  -deststorepass "$NIFI_KEYSTORE_PASSWORD" \
  -noprompt

keytool -importcert \
  -file "$CA_ROOT_CERT" \
  -alias "$ROOT_CERTIFICATE_NAME" \
  -keystore "${CERT_NAME}-truststore.jks" \
  -storepass "$NIFI_TRUSTSTORE_PASSWORD" \
  -noprompt

mv "${CERT_NAME}.key" "${CERT_NAME}.pem" "${CERT_NAME}.crt" "${CERT_NAME}.csr" \
  "${CERT_NAME}.p12" "${CERT_NAME}-keystore.jks" "${CERT_NAME}-truststore.jks" \
  "$NIFI_CERTIFICATES_FOLDER"
