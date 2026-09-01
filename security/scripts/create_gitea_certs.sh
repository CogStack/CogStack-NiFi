#!/usr/bin/env bash

# Generate a dedicated Gitea leaf certificate signed by the shared CogStack CA.

set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
SECURITY_DIR="${SECURITY_DIR_OVERRIDE:-$(cd -- "${SCRIPT_DIR}/.." && pwd)}"
SECURITY_ENV_DIR="${SECURITY_DIR}/env"
CERTIFICATES_DIR="${SECURITY_DIR}/certificates"
ROOT_CERTIFICATES_DIR="${CERTIFICATES_DIR}/root"
GITEA_CERTIFICATES_DIR="${CERTIFICATES_DIR}/gitea"
EXT_FILE="${SECURITY_DIR}/templates/ssl-extensions-x509.cnf"

# shellcheck disable=SC1091
source "${SECURITY_ENV_DIR}/certificates_general.env"

: "${ROOT_CERTIFICATE_NAME:?Must be set in certificates_general.env}"
: "${ROOT_CERTIFICATE_TIME_VAILIDITY_IN_DAYS:?Must be set in certificates_general.env}"

CA_CERT="${ROOT_CERTIFICATES_DIR}/${ROOT_CERTIFICATE_NAME}.pem"
CA_KEY="${ROOT_CERTIFICATES_DIR}/${ROOT_CERTIFICATE_NAME}.key"
KEY_FILE="${GITEA_CERTIFICATES_DIR}/gitea.key"
CSR_FILE="${GITEA_CERTIFICATES_DIR}/gitea.csr"
CERT_FILE="${GITEA_CERTIFICATES_DIR}/gitea.pem"
CRT_FILE="${GITEA_CERTIFICATES_DIR}/gitea.crt"

if [[ ! -f "$CA_CERT" || ! -f "$CA_KEY" ]]; then
  echo "ERROR: Missing root CA files. Run 'make -C deploy init-security-root-ca' first." >&2
  exit 1
fi

mkdir -p "$GITEA_CERTIFICATES_DIR"
rm -f "$KEY_FILE" "$CSR_FILE" "$CERT_FILE" "$CRT_FILE"

openssl genrsa -out "$KEY_FILE" 4096
openssl req -new \
  -key "$KEY_FILE" \
  -out "$CSR_FILE" \
  -subj "/C=UK/ST=London/L=UK/O=cogstack/OU=cogstack/CN=gitea"

openssl x509 -req \
  -in "$CSR_FILE" \
  -CA "$CA_CERT" \
  -CAkey "$CA_KEY" \
  -CAcreateserial \
  -out "$CERT_FILE" \
  -days "${GITEA_CERTIFICATE_TIME_VALIDITY_IN_DAYS:-825}" \
  -sha256 \
  -extfile "$EXT_FILE" \
  -extensions v3_gitea

openssl x509 -in "$CERT_FILE" -outform DER -out "$CRT_FILE"

chmod 600 "$KEY_FILE"
chmod 644 "$CSR_FILE" "$CERT_FILE" "$CRT_FILE"

echo "Generated Gitea leaf certificate in $GITEA_CERTIFICATES_DIR"
