#!/bin/bash

set -e

################################################################
# 
# This script creates client keys and certificates that can 
#  be used by client's applications
#
# This script should only be used for ELASTICSEARCH NATIVE 

# spin up the container that creates the certs 

if [ ! -d "es_certificates/ca" ]; then
    echo "Certificates for es_native not present, creating them now ..."
    docker-compose -f ../deploy/services.yml run es_native_create_certs
else
    echo "Certificates found, skipping creating, if you want to recreate delete the ./es_certificates/(ca|elasticsearch-1|elasticsearch-2) folders."
fi
