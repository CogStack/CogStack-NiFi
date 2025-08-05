#!/bin/bash

set -o allexport

current_dir=$(pwd)
security_dir="../security/"

env_files=(
           $security_dir"certificates_nifi.env"
           $security_dir"certificates_general.env"
           $security_dir"certificates_elasticsearch.env"
           $security_dir"users_elasticsearch.env"
           $security_dir"users_database.env"
           $security_dir"users_nifi.env"
           $security_dir"users_nginx.env"
           "general.env"
           "nifi.env"
           "elasticsearch.env"
           "database.env"
           "network_settings.env"
           "project.env"
           "gitea.env"
           )

for env_file in ${env_files[@]}; do
  source $env_file
done

# for nginx vars
export DOLLAR="$"

set +o allexport