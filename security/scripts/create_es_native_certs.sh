#!/usr/bin/env bash
# shellcheck disable=SC1090,SC1091 # Security env files are selected through runtime paths.

# ================================================================================
# 🛡️ Create client keys and certificates for Elasticsearch Native mode
#
# This script:
#   - Spins up a temporary container (`es_native_create_certs`) to generate certs
#   - Automatically skips if certs already exist at expected path
#   - Cleans up temporary container and volume after cert generation
#
# Usage:
#     ./create_es_native_certs.sh
#
# Output:
#     ../certificates//elastic/elasticsearch/ 
#         ├── elastic-certificates.p12
#         ├── elasticsearch.key
#         ├── elasticsearch.crt
#         └── ...
#
# Notes:
#     - To force regeneration, manually delete the folder:
#       rm -rf ../elastic/es_native
# ================================================================================

set -euo pipefail

cleanup_es_native_artifacts() {
    docker ps -a -q --filter name="deploy-es_native_create_certs-run-*" |
        while IFS= read -r container_id; do
            [[ -n "$container_id" ]] && docker container rm -f "$container_id"
        done

    docker volume ls --filter name=deploy_elasticsearch-certs- -q |
        while IFS= read -r volume_id; do
            [[ -n "$volume_id" ]] && docker volume rm -f "$volume_id"
        done
}


if [ ! -d "../certificates/elastic/elasticsearch" ]; then
    echo "====================================== CREATE_ES_NATIVE_CERTS ==============================="
    source ../env/certificates_elasticsearch.env
    source ../env/users_elasticsearch.env
    echo "Removing previous cert container and volume if existent...."
    cleanup_es_native_artifacts || true

    echo "Certificates for es_native not present, creating them now ..."
    docker compose -f ../../deploy/services.yml run es_native_create_certs

    echo "Removing cert container and volume...."
    cleanup_es_native_artifacts
else
    echo "Certificates found, skipping creating, if you want to recreate delete the ../certificates/elastic/elasticsearch folder"
fi

chown -R "$USER" ../certificates/elastic/elasticsearch
