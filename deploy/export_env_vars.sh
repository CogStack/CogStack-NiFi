#!/usr/bin/env bash

# Enable strict mode (without -e to avoid exit-on-error)
set -uo pipefail


echo "🔧 Running $(basename "${BASH_SOURCE[0]}")..."

set -a

current_dir=$(pwd)

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEPLOY_DIR="$SCRIPT_DIR"
SECURITY_DIR="$SCRIPT_DIR/../security/env"
SERVICES_DIR="$SCRIPT_DIR/../services"


env_files=(
  "$SECURITY_DIR/certificates_nifi.env"
  "$SECURITY_DIR/certificates_general.env"
  "$SECURITY_DIR/certificates_elasticsearch.env"
  "$SECURITY_DIR/users_elasticsearch.env"
  "$SECURITY_DIR/users_database.env"
  "$SECURITY_DIR/users_nifi.env"
  "$SECURITY_DIR/users_nginx.env"

  "$DEPLOY_DIR/general.env"
  "$DEPLOY_DIR/nifi.env"
  "$DEPLOY_DIR/elasticsearch.env"
  "$DEPLOY_DIR/database.env"
  "$DEPLOY_DIR/network_settings.env"
  "$DEPLOY_DIR/project.env"
  "$DEPLOY_DIR/gitea.env"
  "$DEPLOY_DIR/nginx.env"

  "$SERVICES_DIR/cogstack-jupyter-hub/env/jupyter.env"
  "$SERVICES_DIR/ocr-service/env/ocr_service.env"
  "$SERVICES_DIR/cogstack-nlp/medcat-service/env/app.env"
  "$SERVICES_DIR/cogstack-nlp/medcat-service/env/medcat.env"
)

for env_file in "${env_files[@]}"; do
  if [ -f "$env_file" ]; then
    echo "✅ Sourcing $env_file"
    # shellcheck disable=SC1090
    source "$env_file"
  else
    echo "⚠️ Skipping missing env file: $env_file"
  fi
done

# for nginx vars
export DOLLAR="$"

# Disable auto-export
set +a

# Restore safe defaults for interactive/dev shell
set +u
set +o pipefail