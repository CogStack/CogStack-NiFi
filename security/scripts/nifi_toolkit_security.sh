#!/usr/bin/env bash

# ==============================================================================
# ⚠️ Legacy: NiFi Toolkit TLS Setup Script
#
# This script uses the Apache NiFi Toolkit (TLS tool) to generate:
#   - `nifi.key` (private key)
#   - `nifi.pem` (PEM-formatted cert)
#   - `nifi.crt` (X.509 DER cert)
#   - `nifi.jks` / `nifi.p12` (Java Keystore)
#   - `nifi-truststore.jks` (Truststore)
#   - `nifi.csr` (Certificate Signing Request)
#
# Output directory:
#     ./nifi_certificates/
#
# ⚠️ This script is NOT used by default — OpenSSL-based flows have replaced it.
#     Kept here for backwards compatibility or future fallback.
#
# Usage:
#     ./nifi_toolkit_security.sh
# ==============================================================================


set -euo pipefail

# === Load environment variables
source ../deploy/general.env
source ../deploy/nifi.env
source certificates_general.env
source certificates_nifi.env

# === Defaults
NIFI_TOOLKIT_VERSION="${NIFI_TOOLKIT_VERSION:-${NIFI_TOOLKIT_VERSION}}"
NIFI_CERTIFICATE_TIME_VAILIDITY_IN_DAYS="${NIFI_CERTIFICATE_TIME_VAILIDITY_IN_DAYS:-1460}"
NIFI_SUBJ_LINE_CERTIFICATE_CN="${NIFI_SUBJ_LINE_CERTIFICATE_CN:-CN=cogstack,OU=NIFI,C=UK,ST=UK,L=UK,O=cogstack}"
NIFI_SUBJ_ALT_NAMES="${NIFI_SUBJ_ALT_NAMES:-subjectAltName=IP:127.0.0.1,DNS:cogstack,DNS:nifi,DNS:localhost,EMAIL:${COGSTACK_ADMIN_EMAIL:-admin@cogstack.net}}"
NIFI_KEYSTORE_PASSWORD="${NIFI_KEYSTORE_PASSWORD:-cogstackNifi}"
KEY_SIZE=4096
HOSTNAMES="nifi,cogstack-nifi,cogstack,nifi-registry"
OUTPUT_DIRECTORY="../certificates/nifi/nifi_certificates"
PATH_TO_NIFI_PROPERTIES_FILE="./../../../nifi/conf/nifi.properties"

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

echo "🧹 Cleaning up any previous certs in ${OUTPUT_DIRECTORY}/"
rm -rf "${OUTPUT_DIRECTORY}/nifi*"

echo "🔑 Creating NiFi keypair (nifi.jks)..."
keytool -genkeypair -alias "nifi" \
  -dname "${NIFI_SUBJ_LINE_CERTIFICATE_CN}" \
  -ext "${NIFI_SUBJ_ALT_NAMES}" \
  -storepass "${NIFI_KEYSTORE_PASSWORD}" \
  -keysize "${KEY_SIZE}" \
  -validity "${NIFI_CERTIFICATE_TIME_VAILIDITY_IN_DAYS}" \
  -sigalg "SHA256withRSA" \
  -keyalg RSA \
  -keystore nifi.jks \
  -noprompt -v

echo "📨 Creating CSR (nifi.csr)..."
keytool -certreq -alias "nifi" -keystore nifi.jks \
  -file nifi.csr \
  -storepass "${NIFI_KEYSTORE_PASSWORD}" \
  -ext "${NIFI_SUBJ_ALT_NAMES}" \
  -sigalg "SHA256withRSA"

echo "📦 Converting to PKCS#12 (nifi.p12)..."
keytool -importkeystore \
  -srckeystore nifi.jks \
  -destkeystore nifi.p12 \
  -deststoretype PKCS12 \
  -srcalias nifi -destalias nifi \
  -storepass "${NIFI_KEYSTORE_PASSWORD}" \
  -srcstorepass "${NIFI_KEYSTORE_PASSWORD}" \
  -noprompt

echo "🔏 Exporting certificate (.crt)"
keytool -exportcert -alias nifi -keystore nifi.jks \
  -file nifi.crt -storepass "${NIFI_KEYSTORE_PASSWORD}" -noprompt

echo "📜 Exporting PEM (.pem)"
keytool -exportcert -keystore nifi.jks \
  -alias nifi -rfc -file nifi.pem \
  -storepass "${NIFI_KEYSTORE_PASSWORD}" -noprompt

echo "🔐 Extracting private key from PKCS#12"
openssl pkcs12 -in nifi.p12 -out nifi.key -nodes -passin pass:${NIFI_KEYSTORE_PASSWORD}

echo "🔐 Creating truststore (nifi-truststore.jks)..."
keytool -importcert -keystore nifi-truststore.jks \
  -storetype JKS \
  -alias "nifi" \
  -file nifi.crt \
  -deststorepass "${NIFI_KEYSTORE_PASSWORD}" \
  -noprompt

# === Move files to output dir
mkdir -p "$OUTPUT_DIRECTORY"
mv nifi.key nifi.pem nifi.jks nifi-truststore.jks nifi.crt nifi.csr nifi.p12 "$OUTPUT_DIRECTORY"

# === Patch NiFi props
sed -i "" "s|nifi\.security\.keystorePasswd=.*|nifi.security.keystorePasswd=${NIFI_KEYSTORE_PASSWORD}|" ../nifi/conf/nifi.properties
sed -i "" "s|nifi\.security\.keyPasswd=.*|nifi.security.keyPasswd=${NIFI_KEYSTORE_PASSWORD}|" ../nifi/conf/nifi.properties
sed -i "" "s|nifi\.security\.truststorePasswd=.*|nifi.security.truststorePasswd=${NIFI_KEYSTORE_PASSWORD}|" ../nifi/conf/nifi.properties

# === Patch NiFi Registry props
sed -i "" "s|nifi\.registry\.security\.keystorePasswd=.*|nifi.registry.security.keystorePasswd=${NIFI_KEYSTORE_PASSWORD}|" ../nifi/nifi-registry/nifi-registry.properties
sed -i "" "s|nifi\.registry\.security\.keyPasswd=.*|nifi.registry.security.keyPasswd=${NIFI_KEYSTORE_PASSWORD}|" ../nifi/nifi-registry/nifi-registry.properties
sed -i "" "s|nifi\.registry\.security\.truststorePasswd=.*|nifi.registry.security.truststorePasswd=${NIFI_KEYSTORE_PASSWORD}|" ../nifi/nifi-registry/nifi-registry.properties

# === Reset Java opts
export JAVA_OPTS=$OLD_JAVA_OPTS

echo "✅ NiFi TLS certificates created via NiFi Toolkit and applied to config files."
