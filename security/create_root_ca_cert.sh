#!/bin/bash

# =========================================================================================
# 🔐 Create Root CA certificate, private key, and keystore/truststore bundle
#
# Usage:
#     ./create_root_ca_cert.sh
#
# Output:
#     ./root_certificates/<ROOT_CERTIFICATE_NAME>.key      - Private key
#     ./root_certificates/<ROOT_CERTIFICATE_NAME>.pem      - Self-signed X.509 certificate
#     ./root_certificates/<ROOT_CERTIFICATE_NAME>.p12      - PKCS#12 bundle (key + cert)
#     ./root_certificates/<ROOT_CERTIFICATE_NAME>.jks      - Java Keystore (.jks)
#     ./root_certificates/<ROOT_CERTIFICATE_NAME>-truststore.key - Java Truststore
# =========================================================================================

set -euo pipefail

source certificates_general.env

# === Validate required env vars
: "${ROOT_CERTIFICATE_NAME:?Must be set in certificates_general.env}"
: "${ROOT_CERTIFICATE_KEYSTORE_PASSWORD:?Must be set in certificates_general.env}"
: "${ROOT_CERTIFICATE_SUBJ_LINE:?Must be set in certificates_general.env}"
: "${ROOT_CERTIFICATE_KEY_SIZE:=4096}"

echo "====================================== CREATE_ROOT_CA_CERT ==============================="
echo "ROOT_CERTIFICATE_NAME: $ROOT_CERTIFICATE_NAME"
echo "ROOT_CERTIFICATE_KEYSTORE_PASSWORD: $ROOT_CERTIFICATE_KEYSTORE_PASSWORD"
echo "ROOT_CERTIFICATE_SUBJ_LINE: $ROOT_CERTIFICATE_SUBJ_LINE"
echo "ROOT_CERTIFICATE_KEY_SIZE: $ROOT_CERTIFICATE_KEY_SIZE"
echo "ROOT_FOLDER: $ROOT_FOLDER"
echo "=========================================================================================="


ROOT_FOLDER="./root_certificates"
mkdir -p "$ROOT_FOLDER"

KEY_FILE="$ROOT_FOLDER/${ROOT_CERTIFICATE_NAME}.key"
PEM_FILE="$ROOT_FOLDER/${ROOT_CERTIFICATE_NAME}.pem"
P12_FILE="$ROOT_FOLDER/${ROOT_CERTIFICATE_NAME}.p12"
KEYSTORE_FILE="$ROOT_FOLDER/${ROOT_CERTIFICATE_NAME}-keystore.jks"
TRUSTSTORE_FILE="$ROOT_FOLDER/${ROOT_CERTIFICATE_NAME}-truststore.jks"

# === Generate self-signed cert
echo "📜 Generating self-signed certificate: $PEM_FILE"
openssl req -x509 -new -nodes \
  -key "$KEY_FILE" \
  -sha256 \
  -days 3650 \
  -subj "$ROOT_CERTIFICATE_SUBJ_LINE" \
  -out "$PEM_FILE"

# === Convert to PKCS#12
echo "📦 Converting to PKCS#12: $P12_FILE"
openssl pkcs12 -export \
  -in "$PEM_FILE" \
  -inkey "$KEY_FILE" \
  -out "$P12_FILE" \
  -name "$ROOT_CERTIFICATE_NAME" \
  -passout pass:"$ROOT_CERTIFICATE_KEYSTORE_PASSWORD"

# === Java Keystore
echo "☕ Creating Java keystore: $KEYSTORE_FILE"
keytool -importkeystore \
  -destkeystore "$KEYSTORE_FILE" \
  -srckeystore "$P12_FILE" \
  -srcstoretype PKCS12 \
  -alias "$ROOT_CERTIFICATE_NAME" \
  -srcstorepass "$ROOT_CERTIFICATE_KEYSTORE_PASSWORD" \
  -deststorepass "$ROOT_CERTIFICATE_KEYSTORE_PASSWORD"

# === Java Truststore
echo "🤝 Creating Java truststore: $TRUSTSTORE_FILE"
keytool -importcert \
  -file "$PEM_FILE" \
  -alias "$ROOT_CERTIFICATE_NAME" \
  -keystore "$TRUSTSTORE_FILE" \
  -storepass "$ROOT_CERTIFICATE_KEYSTORE_PASSWORD" \
  -noprompt

# === Set permissions
find "$ROOT_FOLDER" -type f -exec chmod 644 {} \;
find "$ROOT_FOLDER" -type d -exec chmod 755 {} \;

echo "✅ Root CA + PKCS#12 + Keystore + Truststore created successfully."
