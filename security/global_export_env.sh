#!/bin/bash

set -o allexport

current_dir=$(pwd)

env_file="./elasticsearch.env"

unamestr=$(uname)

if [ "$unamestr" = 'Linux' ]; then
  export $(grep -v '^#' $env_file | xargs -d '\n')
elif [ "$unamestr" = 'FreeBSD' ] || [ "$unamestr" = 'Darwin' ]; then
  export $(grep -v '^#' $env_file | xargs -0)
fi

set +o allexport

