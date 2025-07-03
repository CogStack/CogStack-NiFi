#!/bin/bash

set -e

################################################################
# 
# This script creates client keys and certificates that can 
#  be used by client's applications
#
# This script should only be used for ELASTICSEARCH NATIVE 

# spin up the container that creates the certs 

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
