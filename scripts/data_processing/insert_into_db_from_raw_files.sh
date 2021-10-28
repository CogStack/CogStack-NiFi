#!/usr/bin/env bash

# env variables

POSTGRES_USER="admin"
POSTGRES_PASSWORD="admin"
POSTGRES_DATABANK_DB="project_data"

# This is the DATA directory inside the postgres database Docker image, or it could be be a folder on the local system
root_project_data_dir="../../data/"

files_to_match="*.txt"
additional_data_file_extension=".json"

folders_to_process=('cogstack_processing_1' 'cogstack_processing_2')

docker_db_container_name="cogstack-pipeline_databank-db_1"

docker_db_container_ip_address=$(docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' $docker_db_container_name)

for folder_to_process in $folders_to_process; do
    if [ -d "$root_project_data_dir$folder_to_process" ]; then
      
        file_paths=$(find $root_project_data_dir$folder_to_process/ -name "$files_to_match")

        processed_folder_name="processed_"$folder_to_process

        if [ ! -d "$root_project_data_dir$processed_folder_name" ]; then
            mkdir -p $root_project_data_dir$processed_folder_name;
        fi
        
        for file_path in $file_paths; do
            file_name=$(basename $file_path)
            file_name="${file_name%.*}"
            sub_path="${file_path//$root_project_data_dir$folder_to_process\/}"
            master_dir_path=${sub_path#\/}
            master_dir_path=${master_dir_path%%\/*}


            ### JSON to CSV ###

            # get the .json file #
            sub_path_no_file_ext="${sub_path%.*}"
            additional_file_path="$root_project_data_dir$folder_to_process/$sub_path_no_file_ext$additional_data_file_extension"
            additional_file_sub_path="${additional_file_path//$root_project_data_dir$folder_to_process\/}"
            additional_file_name=$(basename $additional_file_path)
            additional_file_name="${additional_file_path%.*}"

            # check if file exists
            if [[ -z $additional_file_path ]]; then
            
            fi

            # convert it to CSV
            json_to_string=$(jq -r 'keys[] as $k | "\(.[$k]),"' $additional_file_path)
            json_to_csv="$(echo "$json_to_string" | awk 1 ORS='')"

            # the resulting CSV : "filename, col1, col2, col3 ....."
            file_name_and_json_columns_sql_format=$file_name","$json_to_csv
            
            ### import text file contents in base 64 mode
            FILE_CONTENTS=$( base64 < $file_path) 

            ## when we insert we convert it to text
            # INSERT INTO TABLENAME (doc_id, col1, col2 ...., inserted_timestamp) VALUES ("$file_name_and_json_columns_sql_format" DECODE(E'$FILE_CONTENTS', 'base64')::text, CURRENT_TIMESTAMP);
       
            # gets the file name and adds it to the CSV (the delimiter in this case is a pipe "|") file as a field at the beginning : file_ID|column1|column2...
            sed -i -e "/^$file_name|/!s/$file_name\|/$file_name\|/" $file_path

            # add the master folder name (tope level folder) to the CSV field as well 
            sed -i -e "/^$master_dir_path\|$file_name|/!s/$master_dir_path\|$file_name\|/$master_dir_path\|$file_name\|/" $file_path

# inserts it into the DB
# --username "$POSTGRES_USER" --dbname "$POSTGRES_DATABANK_DB" --host "$docker_db_container_ip_address"
# date time year errors can be avoided by setting the datestyle 
psql -v ON_ERROR_STOP=1 "postgresql://$POSTGRES_USER:$POSTGRES_PASSWORD@$docker_db_container_ip_address/$POSTGRES_DATABANK_DB"<<-EOSQL
    SET datestyle = dmy;
    -- include first line as header    \copy TABLENAME from $file_path delimiter '|' csv header NULL '' encoding  encoding 'iso-8859-1'; 
    \copy TABLENAME from $file_path delimiter '|'  NULL '' encoding  encoding 'iso-8859-1'; 
EOSQL
            
            # moves it to a processed folder if successful query
            if [ $? -ne 0 ]; then
                echo "error when processing file: "$file_path 
            else
                mkdir -p "$root_project_data_dir$processed_folder_name/${sub_path/\/$file_name.*}"
                mv $file_path "$root_project_data_dir$processed_folder_name/${sub_path/\/$file_name.*}"
                mv $additional_file_path "$root_project_data_dir$processed_folder_name/${sub_path/\/$additional_file_name.*}"
                echo "Finished processing file:"$file_path
            fi
        done
    fi
done

