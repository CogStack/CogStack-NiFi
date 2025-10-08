#!/usr/bin/env bash

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


if [ ! -d "../certificates/elastic/elasticsearch" ]; then
    echo "====================================== CREATE_ES_NATIVE_CERTS ==============================="
    source ../env/certificates_elasticsearch.env
    source ../env/users_elasticsearch.env
    echo "Removing previous cert container and volume if existent...."
    docker container rm -f $(docker ps -a -q --filter name="deploy-es_native_create_certs-run-*") || true
    docker volume rm $(docker volume ls --filter name=deploy_elasticsearch-certs- -q) -f || true

    echo "Certificates for es_native not present, creating them now ..."
    docker compose -f ../../deploy/services.yml run es_native_create_certs

    echo "Removing cert container and volume...."
    docker container rm -f $(docker ps -a -q --filter name="deploy-es_native_create_certs-run-*")
    docker volume rm $(docker volume ls --filter name=deploy_elasticsearch-certs- -q) -f
else
    echo "Certificates found, skipping creating, if you want to recreate delete the ../certificates/elastic/elasticsearch folder"
fi

chown -R $USER ../certificates/elastic/elasticsearch
