#!/usr/bin/env bash

# =============================================================================================================================
# 🔐 Create Root CA certificate, private key, and keystore/truststore bundle
#
# Usage:
#     ./create_root_ca_cert.sh
#
# Requires:
#     - ../env/certificates_general.env
#     - ../templates/ssl-extensions-x509.cnf
#
# Output:
#     ./certificates/root/<ROOT_CERTIFICATE_NAME>.key              - Private key
#     ./certificates/root/<ROOT_CERTIFICATE_NAME>.pem              - Self-signed X.509 certificate (PEM)
#     ./certificates/root/<ROOT_CERTIFICATE_NAME>.crt              - DER-encoded certificate (for Java truststore etc.)
#     ./certificates/root/<ROOT_CERTIFICATE_NAME>.csr              - Certificate Signing Request (optional)
#     ./certificates/root/<ROOT_CERTIFICATE_NAME>.srl              - Serial file (used when signing certs)
#     ./certificates/root/<ROOT_CERTIFICATE_NAME>.p12              - PKCS#12 bundle (key + cert)
#     ./certificates/root/<ROOT_CERTIFICATE_NAME>.jks              - Java Keystore (.jks)
#     ./certificates/root/<ROOT_CERTIFICATE_NAME>-truststore.key   - Java Truststore (.jks)
# =============================================================================================================================

set -euo pipefail


SECURITY_TEMPLATES_FOLDER="../templates/"
SECURITY_CERTIFICATES_FOLDER="../certificates/"
SECURITY_ENV_FOLDER="../env/"

source "${SECURITY_ENV_FOLDER}certificates_general.env"

# === Validate required env vars
: "${ROOT_CERTIFICATE_NAME:?Must be set in certificates_general.env}"
: "${ROOT_CERTIFICATE_KEYSTORE_PASSWORD:?Must be set in certificates_general.env}"
: "${ROOT_CERTIFICATE_SUBJ_LINE:?Must be set in certificates_general.env}"
: "${ROOT_CERTIFICATE_TIME_VAILIDITY_IN_DAYS:?Must be set in certificates_general.env}"
: "${ROOT_CERTIFICATE_KEY_SIZE:?Must be set in certificates_general.env}"

ROOT_CERTIFICATES_FOLDER="${SECURITY_CERTIFICATES_FOLDER}root/"

EXT_FILE="${SECURITY_TEMPLATES_FOLDER}ssl-extensions-x509.cnf"

echo "====================================== CREATE_ROOT_CA_CERT ==============================="
echo "ROOT_CERTIFICATE_NAME: $ROOT_CERTIFICATE_NAME"
echo "ROOT_CERTIFICATE_KEYSTORE_PASSWORD: $ROOT_CERTIFICATE_KEYSTORE_PASSWORD"
echo "ROOT_CERTIFICATE_SUBJ_LINE: $ROOT_CERTIFICATE_SUBJ_LINE"
echo "ROOT_CERTIFICATE_KEY_SIZE: $ROOT_CERTIFICATE_KEY_SIZE"
echo "ROOT_CERTIFICATE_TIME_VAILIDITY_IN_DAYS: $ROOT_CERTIFICATE_TIME_VAILIDITY_IN_DAYS"
echo "ROOT_CERTIFICATES_FOLDER: $ROOT_CERTIFICATES_FOLDER"
echo "=========================================================================================="

mkdir -p "${ROOT_CERTIFICATES_FOLDER}"

KEY_FILE="${ROOT_CERTIFICATES_FOLDER}${ROOT_CERTIFICATE_NAME}.key"
CSR_FILE="${ROOT_CERTIFICATES_FOLDER}${ROOT_CERTIFICATE_NAME}.csr"
PEM_FILE="${ROOT_CERTIFICATES_FOLDER}${ROOT_CERTIFICATE_NAME}.pem"
CRT_FILE="${ROOT_CERTIFICATES_FOLDER}${ROOT_CERTIFICATE_NAME}.crt"
SRL_FILE="${ROOT_CERTIFICATES_FOLDER}${ROOT_CERTIFICATE_NAME}.srl"
P12_FILE="${ROOT_CERTIFICATES_FOLDER}${ROOT_CERTIFICATE_NAME}.p12"
JKS_FILE="${ROOT_CERTIFICATES_FOLDER}${ROOT_CERTIFICATE_NAME}-keystore.jks"
TRUSTSTORE_FILE="${ROOT_CERTIFICATES_FOLDER}${ROOT_CERTIFICATE_NAME}-truststore.jks"

# === Generate private key
echo "🔑 Generating private key: $KEY_FILE"
openssl genrsa -out "$KEY_FILE" "$ROOT_CERTIFICATE_KEY_SIZE"

# === Generate CSR
echo "📜 Generating self-signed certificate: $CRT_FILE"
openssl req -x509 -new \
  -key "$KEY_FILE" \
  -sha256 \
  -days $ROOT_CERTIFICATE_TIME_VAILIDITY_IN_DAYS \
  -subj "$ROOT_CERTIFICATE_SUBJ_LINE" \
  -out "$CRT_FILE" \
  -extensions v3_ca \
  -config "$EXT_FILE" \
  -outform DER

# === Convert to PEM format (text-based)
openssl x509 -inform DER -in "$CRT_FILE" -out "$PEM_FILE" -outform PEM

# === Generate dummy CSR (optional, for parity)
echo "🧾 Generating dummy CSR: $CSR_FILE"
openssl req -new -key "$KEY_FILE" -out "$CSR_FILE" -subj "$ROOT_CERTIFICATE_SUBJ_LINE"

# === Convert to PKCS#12 bundle
echo "📦 Converting to PKCS#12: $P12_FILE"
openssl pkcs12 -export \
  -in "$PEM_FILE" \
  -inkey "$KEY_FILE" \
  -out "$P12_FILE" \
  -name "$ROOT_CERTIFICATE_NAME" \
  -passout pass:"$ROOT_CERTIFICATE_KEYSTORE_PASSWORD"

# === Create Java Keystore (.jks)
echo "☕ Creating Java keystore: $JKS_FILE"
keytool -importkeystore \
  -destkeystore "$JKS_FILE" \
  -srckeystore "$P12_FILE" \
  -srcstoretype PKCS12 \
  -alias "$ROOT_CERTIFICATE_NAME" \
  -srcstorepass "$ROOT_CERTIFICATE_KEYSTORE_PASSWORD" \
  -deststorepass "$ROOT_CERTIFICATE_KEYSTORE_PASSWORD" \
  -noprompt

# === Create Java Truststore (.jks)
echo "🤝 Creating Java truststore: $TRUSTSTORE_FILE"

# Delete truststore if it exists to avoid alias conflict
if [[ -f "$TRUSTSTORE_FILE" ]]; then
  echo "⚠️  Truststore already exists. Removing it to avoid alias conflict..."
  rm -f "$TRUSTSTORE_FILE"
fi

keytool -importcert \
  -file "$PEM_FILE" \
  -alias "$ROOT_CERTIFICATE_NAME" \
  -keystore "$TRUSTSTORE_FILE" \
  -storepass "$ROOT_CERTIFICATE_KEYSTORE_PASSWORD" \
  -noprompt

# === Set permissions
echo "🔐 Setting permissions..."
find "$ROOT_CERTIFICATES_FOLDER" -type f -exec chmod 644 {} \;
find "$ROOT_CERTIFICATES_FOLDER" -type d -exec chmod 755 {} \;

echo "✅ Root CA + PKCS#12 + Keystore + Truststore created successfully."
