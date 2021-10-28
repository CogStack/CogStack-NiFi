#!/usr/bin/env bash

root_project_data_dir="../../data/"

files_to_match="*.doc"

folders_to_process=('cogstack_processing_1')

encoding="utf-8"

extension=".doc"
output_extension=".txt"

LOG_FILE="__prepare_docs.log"

office_binary="/usr/bin/soffice"

if [ "$(uname)" == "Darwin" ]; then
    office_binary="/Applications/LibreOffice.app/Contents/MacOS/soffice"
elif [ "$(expr substr $(uname -s) 1 10)" == "MINGW32_NT" ]; then
    office_binary="C:/Program Files/LibreOffice/program/soffice.exe"
elif [ "$(expr substr $(uname -s) 1 10)" == "MINGW64_NT" ]; then
    office_binary="C:/Program Files/LibreOffice/program/soffice.exe"
fi

for folder_to_process in $folders_to_process; do
    if [ -d "$root_project_data_dir$folder_to_process" ]; then
        file_paths=$(find $root_project_data_dir$folder_to_process/ -name "$files_to_match")
        processed_folder_name="processed_"$folder_to_process
        
        if [ ! -d "$root_project_data_dir$processed_folder_name" ]; then
            mkdir -p $root_project_data_dir$processed_folder_name;
        fi

        for file_path in $file_paths; do
          file_name_base=$(basename $file_path)
          file_name="${file_name_base%.*}"
        
          file_path_new_file_ext=${file_name%$extension}$output_extension
         
          if [[ ! -f $root_project_data_dir$processed_folder_name/$file_path_new_file_ext ]]; then
            "$office_binary" --headless --invisible --convert-to txt:Text --outdir $root_project_data_dir$processed_folder_name $file_path >> $LOG_FILE
            echo "Finished processing : "$file_path
          else
            echo "File $file_path already processed... skipping "
          fi
        done
    fi
done