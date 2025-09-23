#!/usr/bin/env bash

# ==============================================================================
# ⚠️ Legacy: NiFi Toolkit TLS Setup Script
#
# This script uses the Apache NiFi Toolkit (TLS tool) to generate:
#   - `nifi.key` (private key)
#   - `nifi.pem` (PEM-formatted cert)
#   - `nifi.crt` (X.509 DER cert)
#   - `nifi-keystore.jks` / `nifi.p12` (Java Keystore)
#   - `nifi-truststore.jks` (Truststore)
#   - `nifi.csr` (Certificate Signing Request)
#
# Output directory:
#     ../certificates/nifi/
#
# ⚠️ This script is NOT used by default — OpenSSL-based flows have replaced it.
#     Kept here for backwards compatibility or future fallback.
#
# Usage:
#     ./nifi_toolkit_security.sh
# ==============================================================================


set -euo pipefail

SECURITY_TEMPLATES_FOLDER="../templates/"
SECURITY_CERTIFICATES_FOLDER="../certificates/"
SECURITY_ENV_FOLDER="../env/"

# === Load environment variables
source ../../deploy/general.env
source ../../deploy/nifi.env
source "${SECURITY_ENV_FOLDER}certificates_general.env"
source "${SECURITY_ENV_FOLDER}certificates_nifi.env"

# === Defaults
NIFI_TOOLKIT_VERSION="${NIFI_TOOLKIT_VERSION:-${NIFI_TOOLKIT_VERSION}}"
NIFI_CERTIFICATE_TIME_VAILIDITY_IN_DAYS="${NIFI_CERTIFICATE_TIME_VAILIDITY_IN_DAYS:-1460}"
NIFI_KEYSTORE_PASSWORD="${NIFI_KEYSTORE_PASSWORD:-cogstackNifi}"
OUTPUT_DIRECTORY="${SECURITY_CERTIFICATES_FOLDER}nifi/"
SECURITY_ROOT_CA_FOLDER="${SECURITY_CERTIFICATES_FOLDER}root/"
PATH_TO_NIFI_PROPERTIES_FILE="./../../../nifi/conf/nifi.properties"
EXT_FILE="${SECURITY_TEMPLATES_FOLDER}ssl-extensions-x509.cnf"

NIFI_CERTIFICATE_NAME="nifi"
NIFI_KEY_FILE="${NIFI_CERTIFICATE_NAME}.key"
NIFI_CSR_FILE="${NIFI_CERTIFICATE_NAME}.csr"
NIFI_CRT_FILE="${NIFI_CERTIFICATE_NAME}.crt"
NIFI_PEM_FILE="${NIFI_CERTIFICATE_NAME}.pem"
NIFI_P12_FILE="${NIFI_CERTIFICATE_NAME}.p12"
NIFI_JKS_FILE="${NIFI_CERTIFICATE_NAME}-keystore.jks"
NIFI_TRUSTSTORE_FILE="${NIFI_CERTIFICATE_NAME}-truststore.jks"

ROOT_CA_PEM="${SECURITY_ROOT_CA_FOLDER}${ROOT_CERTIFICATE_NAME}.pem"
ROOT_CA_KEY="${SECURITY_ROOT_CA_FOLDER}${ROOT_CERTIFICATE_NAME}.key"


# === NiFi Toolkit Download
if [ ! -d "./nifi_toolkit" ]; then
  if [ ! -f "nifi-toolkit-${NIFI_TOOLKIT_VERSION}-bin.zip" ]; then
    wget "https://archive.apache.org/dist/nifi/${NIFI_TOOLKIT_VERSION}/nifi-toolkit-${NIFI_TOOLKIT_VERSION}-bin.zip"
  fi
  unzip "nifi-toolkit-${NIFI_TOOLKIT_VERSION}-bin.zip"
  mv "nifi-toolkit-${NIFI_TOOLKIT_VERSION}" nifi_toolkit
  rm "nifi-toolkit-${NIFI_TOOLKIT_VERSION}-bin.zip"
fi

# === Handle JVM options on Windows
OLD_JAVA_OPTS=${JAVA_OPTS:-}
export JAVA_OPTS="-Xmx2048m -Xms2048m"

echo "🧹 Cleaning up any previous certs in ${OUTPUT_DIRECTORY}"
rm -rf "${OUTPUT_DIRECTORY}nifi*"


echo "🔑 Generating NiFi private key"
openssl genrsa -out "$NIFI_KEY_FILE" 4096

echo "📄 Generating Certificate Signing Request (CSR)"
openssl req -new \
  -key "$NIFI_KEY_FILE" \
  -out "$NIFI_CSR_FILE" \
  -config "$EXT_FILE"

echo "✅ Signing CSR using Root CA with SAN + extensions"
openssl x509 -req \
  -in "$NIFI_CSR_FILE" \
  -CA "$ROOT_CA_PEM" \
  -CAkey "$ROOT_CA_KEY" \
  -CAcreateserial \
  -out "$NIFI_PEM_FILE" \
  -days "$NIFI_CERTIFICATE_TIME_VAILIDITY_IN_DAYS" \
  -sha256 \
  -extfile "$EXT_FILE" \
  -extensions v3_leaf

echo "📎 Converting PEM to DER format (.crt)"
openssl x509 -in "$NIFI_PEM_FILE" -outform DER -out "$NIFI_CRT_FILE"

echo "📦 Creating PKCS#12 Bundle"
openssl pkcs12 -export \
  -in "$NIFI_PEM_FILE" \
  -inkey "$NIFI_KEY_FILE" \
  -out "$NIFI_P12_FILE" \
  -name "$NIFI_CERTIFICATE_NAME" \
  -passout pass:"$NIFI_KEYSTORE_PASSWORD"

echo "☕ Creating Java Keystore (.jks)"
keytool -importkeystore \
  -destkeystore "$NIFI_JKS_FILE" \
  -srckeystore "$NIFI_P12_FILE" \
  -srcstoretype PKCS12 \
  -alias "$NIFI_CERTIFICATE_NAME" \
  -srcstorepass "$NIFI_KEYSTORE_PASSWORD" \
  -deststorepass "$NIFI_KEYSTORE_PASSWORD" \
  -noprompt

echo "🔐 Creating Truststore (.jks)"
keytool -importcert \
  -file "$NIFI_PEM_FILE" \
  -alias "$NIFI_CERTIFICATE_NAME" \
  -keystore "$NIFI_TRUSTSTORE_FILE" \
  -storepass "$NIFI_KEYSTORE_PASSWORD" \
  -noprompt


echo "✅ All NiFi TLS artifacts created successfully in: $SECURITY_CERTIFICATES_FOLDER"

# === Move files to output dir
mkdir -p "$OUTPUT_DIRECTORY"
mv nifi.key nifi.pem nifi-keystore.jks nifi-truststore.jks nifi.crt nifi.csr nifi.p12 "$OUTPUT_DIRECTORY"

# === Patch NiFi props
sed -i "" "s|nifi\.security\.keystorePasswd=.*|nifi.security.keystorePasswd=${NIFI_KEYSTORE_PASSWORD}|" ../../nifi/conf/nifi.properties
sed -i "" "s|nifi\.security\.keyPasswd=.*|nifi.security.keyPasswd=${NIFI_KEYSTORE_PASSWORD}|" ../../nifi/conf/nifi.properties
sed -i "" "s|nifi\.security\.truststorePasswd=.*|nifi.security.truststorePasswd=${NIFI_KEYSTORE_PASSWORD}|" ../../nifi/conf/nifi.properties

# === Patch NiFi Registry props
sed -i "" "s|nifi\.registry\.security\.keystorePasswd=.*|nifi.registry.security.keystorePasswd=${NIFI_KEYSTORE_PASSWORD}|" ../../nifi/nifi-registry/nifi-registry.properties
sed -i "" "s|nifi\.registry\.security\.keyPasswd=.*|nifi.registry.security.keyPasswd=${NIFI_KEYSTORE_PASSWORD}|" ../../nifi/nifi-registry/nifi-registry.properties
sed -i "" "s|nifi\.registry\.security\.truststorePasswd=.*|nifi.registry.security.truststorePasswd=${NIFI_KEYSTORE_PASSWORD}|" ../../nifi/nifi-registry/nifi-registry.properties

# === Reset Java opts
export JAVA_OPTS=$OLD_JAVA_OPTS

echo "✅ NiFi TLS certificates created via NiFi Toolkit and applied to config files."
