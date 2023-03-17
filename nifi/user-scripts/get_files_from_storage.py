#!/usr/bin/python3

import os
import json
import traceback
import pandas
import re
import numpy
import base64
import sys

# This is the DATA directory inside the postgres database Docker image, or it could be be a folder on the local system
root_project_data_dir="/opt/data/ingestion/"
folder_to_ingest="test_folder"

processed_folder_dump="processed_" + folder_to_ingest
file_name_pattern="*"

file_ext_to_match=".txt"

encoding="UTF-8"

processed_folder_dump_path = os.path.join(root_project_data_dir, processed_folder_dump)
ingested_folders_file = processed_folder_dump_path + ".txt"

# create the folder
# pathlib.Path(processed_folder_dump_path).mkdir(parents=True, exist_ok=True)

folder_pattern = ".*\d{4}\/\d{2}\/\d{2}"
pattern_c = re.compile(folder_pattern)

folders_ingested = {}

if os.path.exists(ingested_folders_file):
    _folders_ingested_file = open(ingested_folders_file, "r+")
    contents = _folders_ingested_file.read()
    folders_ingested = json.loads(contents) if len(contents) > 0 else {}
    _folders_ingested_file.close()
    
output_data = []

def get_files_and_metadata():
    """_summary_
        This will read the pdf documents and metadata.csv file from one folder and output them as a json,
        NiFi will handle the conversion of this json to a proper flowfile using the ConvertRecord processor.

        It will only ingest one folder of that matches the yyyy/mm/dd pattern, then stop declared in the 'folder_pattern' variable.
        The ingested folder is added to the list of ingested folders along with its files.

        # folder & file structure
        └── root_folder
            └── 202x
                └── 08
                    └── 01
                        ├── aaaabbbbccccdddd.pdf <- file is the ID
                        └── metadata.csv <- contains file ID for matching

    """
    for root, sub_directories, files in os.walk(os.path.join(root_project_data_dir, folder_to_ingest)):
        
        # it will only ingest
        if root not in list(folders_ingested.keys()) and pattern_c.match(root):
            txt_file_df = []
            doc_files = {}
            
            no_jsons = [file_name for file_name in files if "json" not in file_name]
            for file_name in no_jsons:
                extensionless_file_name = file_name[: -(len(file_name.split(".")[-1]) + 1)]
            
                file_path = os.path.join(root, file_name)
                try:
                    if "pdf" in file_name:
                        with open(file_path, mode="rb") as original_file_contents:
                            original_file = original_file_contents.read()
                            doc_files[extensionless_file_name] = original_file 

                    elif "csv" in file_name:
                        txt_file_df = pandas.read_csv(file_path, sep="|", encoding=encoding)
                        txt_file_df["binarydoc"] = pandas.Series(dtype=str)
                        txt_file_df["text"] = pandas.Series(dtype=str)
                        
                except Exception as e:
                    print("Failed to open file:" + file_path)   
                    traceback.print_exc()

            try:
                if pattern_c.match(root):
                    folders_ingested[root] = []

                    for i in range(0, len(txt_file_df)):
                        file_id = txt_file_df.iloc[i]["source_object_id"]
                        if file_id in list(doc_files.keys()):
                            txt_file_df.at[i, "binarydoc"] = base64.b64encode(doc_files[file_id]).decode()
                            txt_file_df.at[i, "text"] = ""
                            folders_ingested[root].append(file_id) 

                    txt_file_df = txt_file_df.loc[txt_file_df["binarydoc"].notna()]
                    txt_file_df = txt_file_df.replace(numpy.nan,'',regex=True)

                    global output_data
                    
                    for i in range(0, len(txt_file_df)):
                        output_data.append(txt_file_df.iloc[i].to_dict())
               
            except Exception as e:
                print("failure")
                traceback.print_exc()

get_files_and_metadata()

with open(ingested_folders_file, "w+") as f:
    f.write(json.dumps(folders_ingested))

sys.stdout.write(json.dumps(output_data))
