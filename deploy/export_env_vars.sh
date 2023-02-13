#!/bin/bash

set -o allexport

current_dir=$(pwd)
security_dir="../security/"

env_files=("nifi.env"
           "elasticsearch.env"
           "database.env"
           "jupyter.env"
           "nlp_service.env"
           "project.env"
           $security_dir"certificates_nifi.env"
           $security_dir"certificates_general.env"
           $security_dir"certificates_elasticsearch.env"
           $security_dir"es_cogstack_users.env"
           $security_dir"elasticsearch_users.env"
           $security_dir"database_users.env"
           )

set -a

for env_file in ${env_files[@]}; do
  source $env_file
done

set +a

set +o allexport