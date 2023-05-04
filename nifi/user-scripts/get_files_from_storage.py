#!/usr/bin/python3

import os
import json
import traceback
import pandas
import re
import numpy
import base64
import sys

# get the arguments from the "Command Arguments" property in NiFi, we are looking at anything after the 1st arg (which is the script name)
# example args: ['/opt/nifi/user-scripts/get_files_from_storage.py', 'root_project_data_dir=/opt/data/', 'folder_pattern=.*\\d{4}\\/\\d{2}\\/\\d{2}', 'folder_to_ingest=2022', 'file_id_csv_column_name_match=file_name_id_no_ext']

folder_to_ingest = "2022"
folder_pattern = ".*\d{4}\/\d{2}\/\d{2}"
file_id_csv_column_name_match = "file_name_id_no_ext"
root_project_data_dir = "/opt/data/"
csv_separator = "|"
output_batch_size = 1000

# default: None, possible values: "files_only" - read files and only store their text & binary content (pre-ocr) and the file name as the document_Id
operation_mode = ""

encoding="UTF-8"

for arg in sys.argv:
    _arg = arg.split("=", 1)
    if _arg[0] == "folder_pattern":
        folder_pattern = _arg[1] 
    elif _arg[0] == "folder_to_ingest":
        folder_to_ingest = _arg[1]
    elif _arg[0] == "file_id_csv_column_name_match":
        file_id_csv_column_name_match = _arg[1]
    elif _arg[0] == "root_project_data_dir":
        root_project_data_dir = _arg[1]
    elif _arg[0] == "csv_separator":
        csv_separator = _arg[1]
    elif _arg[0] == "output_batch_size":
        output_batch_size = int(_arg[1])
    elif _arg[0] == "operation_mode":
        operation_mode = str(_arg[1])


# This is the DATA directory inside the postgres database Docker image, or it could be a folder on the local system
processed_folder_dump="processed_" + folder_to_ingest
processed_folder_dump_path = os.path.join(str(os.environ.get("USER_SCRIPT_LOGS_DIR", "/opt/nifi/user-scripts/logs/")), processed_folder_dump)

# log file name
ingested_folders_file = processed_folder_dump_path + ".log"

pattern_c = re.compile(folder_pattern)

folders_ingested = {}

if os.path.exists(ingested_folders_file):
    _folders_ingested_file = open(ingested_folders_file, "r+")
    contents = _folders_ingested_file.read()
    folders_ingested = json.loads(contents) if len(contents) > 0 else {}
    _folders_ingested_file.close()
    
output_data = []

def get_files_and_metadata():
    '''_summary_
        This will read the pdf documents and metadata.csv file from one folder and output them as a json,
        NiFi will handle the conversion of this json to a proper flowfile using the ConvertRecord processor.

        It will only ingest one folder of that matches the yyyy/mm/dd pattern, then stop declared in the 'folder_pattern' variable.
        The ingested folder is added to the list of ingested folders along with its files.

        # EXAMPLE folder & file structure
        └── root_folder
            └── 2022
                └── 08
                    └── 01
                        ├── aaaabbbbccccdddd.pdf <- file is the ID
                        └── metadata.csv <- contains file ID for matching

    '''

    record_counter = 0

    full_ingest_path = os.path.join(root_project_data_dir, folder_to_ingest)

    if not os.path.exists(full_ingest_path):
        print("Could not open or find ingestion folder:" + str(full_ingest_path))

    for root, sub_directories, files in os.walk(full_ingest_path):
        # it will only ingest
        if pattern_c.match(root):
            if root not in folders_ingested:
                folders_ingested[root] = []

            txt_file_df = None
            
            doc_files = {}
            csv_files = []

            non_csvs = [file_name if "csv" not in file_name else csv_files.append(file_name) for file_name in files]
            non_csvs = [file_name for file_name in non_csvs if file_name is not None]

            if len(non_csvs) != len(folders_ingested[root]):

                if operation_mode == "":
                    for csv_file_name in csv_files:
                        file_path = os.path.join(root, csv_file_name)
                        _txt_file_df = pandas.read_csv(file_path, sep=csv_separator, encoding=encoding)
                        _txt_file_df["binarydoc"] = pandas.Series(dtype=str)
                        _txt_file_df["text"] = pandas.Series(dtype=str)

                        if txt_file_df is not None:
                            txt_file_df.append(_txt_file_df)
                        else:
                            txt_file_df = _txt_file_df

                for file_name in non_csvs:
                    extensionless_file_name = file_name[: - (len(file_name.split(".")[-1]) + 1)]

                    if extensionless_file_name not in folders_ingested[root]:
                        file_path = os.path.join(root, file_name)
                        try:
                            if record_counter < output_batch_size:
                                with open(file_path, mode="rb") as original_file_contents:
                                    original_file = original_file_contents.read()
                                    doc_files[extensionless_file_name] = original_file
                                record_counter += 1
                            else:
                                break
                        except Exception as e:
                            print("Failed to open file:" + file_path)   
                            traceback.print_exc()

                try:
                    if txt_file_df is None and operation_mode == "files_only":

                        # field names are taken from the cogstack common schema dict (cogstack_common_schema_mapping.json)
                        txt_file_df = pandas.DataFrame()
                        txt_file_df["document_Id"] = pandas.Series(dtype=str)
                        txt_file_df["binarydoc"] = pandas.Series(dtype=str)
                        txt_file_df["document_Fields_text"] = pandas.Series(dtype=str)

                    if txt_file_df is not None:
                        if operation_mode == "files_only":
                            for file_id in list(doc_files.keys()):
                                if file_id not in folders_ingested[root]:
                                    txt_file_df = pandas.concat([txt_file_df, pandas.DataFrame.from_dict([{
                                       "document_Id" : str(file_id),
                                       "binarydoc" : base64.b64encode(doc_files[file_id]).decode(),
                                       "document_Fields_text" : ""
                                    }], orient="columns")])
                        else:
                            for i in range(0, len(txt_file_df)):
                                file_id = txt_file_df.iloc[i][file_id_csv_column_name_match]

                                if file_id not in folders_ingested[root]:
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

            elif record_counter >= output_batch_size - 1:
                break

get_files_and_metadata()

with open(ingested_folders_file, "w+") as f:
    f.write(json.dumps(folders_ingested))

sys.stdout.write(json.dumps(output_data))