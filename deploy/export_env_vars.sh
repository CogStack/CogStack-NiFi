#!/bin/bash

# Enable strict mode (without -e to avoid exit-on-error)
set -uo pipefail


echo "🔧 Running $(basename "$0")..."

set -a

current_dir=$(pwd)
security_dir="../security/"
services_dir="../services/"

env_files=(
          "${security_dir}certificates_nifi.env"
          "${security_dir}certificates_general.env"
          "${security_dir}certificates_elasticsearch.env"
          "${security_dir}users_elasticsearch.env"
          "${security_dir}users_database.env"
          "${security_dir}users_nifi.env"
          "${security_dir}users_nginx.env"
          "general.env"
          "nifi.env"
          "elasticsearch.env"
          "database.env"
          "network_settings.env"
          "project.env"
          "gitea.env"
          "nginx.env"
          "${services_dir}cogstack-jupyter-hub/env/jupyter.env"
          "${services_dir}ocr-service/env/ocr_service.env"
          "${services_dir}cogstack-nlp/medcat_service/app.env"
          "${services_dir}cogstack-nlp/medcat_service/medcat.env"
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