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
#     ./es_certificates/es_native/elasticsearch/ 
#         ├── elastic-certificates.p12
#         ├── elasticsearch.key
#         ├── elasticsearch.crt
#         └── ...
#
# Notes:
#     - To force regeneration, manually delete the folder:
#       rm -rf ./es_certificates/es_native
# ================================================================================

set -euo pipefail

if [ ! -d "es_certificates/es_native/elasticsearch" ]; then

    echo "Removing previous cert container and volume if existent...."
    docker container rm -f $(docker ps -a -q --filter name="deploy_es_native_create_certs_run_*") || true
    docker volume rm $(docker volume ls --filter name=deploy_elasticsearch-certs- -q) -f || true

    echo "Certificates for es_native not present, creating them now ..."
    docker-compose -f ../deploy/services.yml run es_native_create_certs

    echo "Removing cert container and volume...."
    docker container rm -f $(docker ps -a -q --filter name="deploy_es_native_create_certs_run_*")
    docker volume rm $(docker volume ls --filter name=deploy_elasticsearch-certs- -q) -f
else
    echo "Certificates found, skipping creating, if you want to recreate delete the ./es_certificates/es_native folder"
fi

chown -R $USER ./es_certificates/elasticsearch
