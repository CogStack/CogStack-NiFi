#!/usr/bin/env bash
# Generate PostgreSQL leaf certificates without replacing supplied bundles.
set -euo pipefail
umask 077

# shellcheck disable=SC1090,SC1091
source "$(dirname "${BASH_SOURCE[0]}")/load_config.sh"
source "$(cogstack_env_file deploy/database.env)"
source "$(cogstack_env_file security/env/certificates_general.env)"

resolve_directory() {
  case "$1" in
    /*) printf '%s\n' "$1" ;;
    *) printf '%s/deploy/%s\n' "$COGSTACK_REPO_ROOT" "$1" ;;
  esac
}

samples_dir="$(resolve_directory "${POSTGRES_SAMPLES_TLS_DIR:-../security/certificates/postgresql/samples}")"
databank_dir="$(resolve_directory "${POSTGRES_DATABANK_TLS_DIR:-../security/certificates/postgresql/databank}")"
missing_dirs=()
for directory in "$samples_dir" "$databank_dir"; do
  if [[ -s "$directory/server.crt" && -s "$directory/server.key" && -s "$directory/ca.crt" ]]; then
    echo "PostgreSQL TLS bundle already exists: $directory; leaving it unchanged."
  elif [[ -e "$directory" && ( ! -d "$directory" || -n "$(find "$directory" -mindepth 1 -maxdepth 1 -print -quit)" ) ]]; then
    echo "ERROR: $directory contains an incomplete PostgreSQL TLS bundle; preserve and repair it before retrying." >&2
    exit 1
  else
    missing_dirs+=("$directory")
  fi
done
if [[ ${#missing_dirs[@]} == 0 ]]; then exit 0; fi
if [[ "$samples_dir" == "$databank_dir" ]]; then
  echo "ERROR: generated PostgreSQL TLS bundles require separate output directories." >&2
  exit 1
fi

root_dir="$(resolve_directory "${SECURITY_CERTIFICATES_DIR:-../security/certificates}")/root"
ca_cert="$root_dir/${ROOT_CERTIFICATE_NAME:?Set ROOT_CERTIFICATE_NAME}.pem"
ca_key="$root_dir/$ROOT_CERTIFICATE_NAME.key"
if [[ ! -s "$ca_cert" || ! -s "$ca_key" ]]; then
  echo "ERROR: shared root CA is missing; run 'make -C deploy init-security-root-ca' first." >&2
  exit 1
fi

work_dir="$(mktemp -d)"
trap 'rm -rf "$work_dir"' EXIT
generate_bundle() {
  local directory="$1" hostname="$2" alias="$3"
  if [[ -s "$directory/server.crt" && -s "$directory/server.key" && -s "$directory/ca.crt" ]]; then return; fi
  openssl req -new -newkey rsa:2048 -nodes -sha256 -subj "/CN=$hostname" \
    -keyout "$work_dir/server.key" -out "$work_dir/server.csr"
  cat > "$work_dir/extensions.cnf" <<EOF
basicConstraints=critical,CA:FALSE
keyUsage=critical,digitalSignature,keyEncipherment
extendedKeyUsage=serverAuth
subjectAltName=DNS:$hostname,DNS:$alias,DNS:localhost,IP:127.0.0.1
EOF
  openssl x509 -req -sha256 -days 365 -in "$work_dir/server.csr" \
    -CA "$ca_cert" -CAkey "$ca_key" -set_serial "0x$(openssl rand -hex 16)" \
    -extfile "$work_dir/extensions.cnf" -out "$work_dir/server.crt"
  mkdir -p "$directory"
  cp "$work_dir/server.key" "$directory/server.key"
  cp "$work_dir/server.crt" "$directory/server.crt"
  cp "$ca_cert" "$directory/ca.crt"
  chmod 755 "$directory"
  chmod 600 "$directory/server.key"
  chmod 644 "$directory/server.crt" "$directory/ca.crt"
  echo "Generated PostgreSQL TLS bundle: $directory"
}

generate_bundle "$samples_dir" samples-db cogstack-samples-db
generate_bundle "$databank_dir" cogstack-databank-db cogstack-production-databank-db
