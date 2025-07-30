#!/bin/bash

set -o allexport

current_dir=$(pwd)
env_dir="./env/"

env_files=(
           $env_dir"general.env"
           $env_dir"jupyter.env"
           )

set -a

for env_file in ${env_files[@]}; do
  source $env_file
done

# for nginx vars
export DOLLAR="$"

set +a

set +o allexport