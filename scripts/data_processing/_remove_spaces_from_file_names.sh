#!/usr/bin/env bash

# This is the DATA directory inside the postgres database Docker image, or it could be be a folder on the local system
root_project_data_dir="../../data/"

folders_to_process=("")

# replace all file names with spaces to underscore
find $root_project_data_dir$folder_to_process/ -type f -name "* *" | while read file; do mv "$file" ${file// /_}; done