#!/bin/bash

set -o allexport

current_dir=$(pwd)

env_files=("nifi" "elasticsearch.env" "certificates_nifi.env" "certificates_general.env" "certificates_elasticsearch.env" "es_cogstack_users.env" "es_kibana_users.env" "es_internal_users.env")

unamestr=$(uname)

for $env_file in $env_files; do
  if [ "$unamestr" = 'Linux' ]; then
    export $(grep -v '^#' $env_file | xargs -d '\n')
  elif [ "$unamestr" = 'FreeBSD' ] || [ "$unamestr" = 'Darwin' ]; then
    export $(grep -v '^#' $env_file | xargs -0)
  fi
done

set +o allexport

