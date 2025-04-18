#!/bin/bash

set -o allexport

current_dir=$(pwd)
security_dir="../security/"

env_files=("general.env"
           "nifi.env"
           "elasticsearch.env"
           "database.env"
           "jupyter.env"
           "nlp_service.env"
           "ocr_service.env"
           "network_settings.env"
           "project.env"
           $security_dir"certificates_nifi.env"
           $security_dir"certificates_general.env"
           $security_dir"certificates_elasticsearch.env"
           $security_dir"elasticsearch_users.env"
           $security_dir"database_users.env"
           )

set -a

for env_file in ${env_files[@]}; do
  source $env_file
done

# for nginx vars
export DOLLAR="$"

set +a

set +o allexport