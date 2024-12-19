import os
import json
import traceback
import sys
from utils.sqlite_query import connect_and_query,check_db_exists,create_db_from_file

global DOCUMENT_ID_FIELD_NAME
global DOCUMENT_TEXT_FIELD_NAME
global USER_SCRIPT_DB_DIR
global DB_FILE_NAME
global LOG_FILE_NAME
global OPERATION_MODE

global output_stream

ANNOTATION_DB_SQL_FILE_PATH = "/opt/cogstack-db/sqlite/schemas/annotations_nlp_create_schema.sql"

# default values from /deploy/nifi.env
USER_SCRIPT_DB_DIR = os.getenv("USER_SCRIPT_DB_DIR")
USER_SCRIPT_LOGS_DIR = os.getenv("USER_SCRIPT_LOGS_DIR")

LOG_FILE_NAME = "annotation_manager.log"

# get the arguments from the "Command Arguments" property in NiFi, we are looking at anything after the 1st arg (which is the script name)
for arg in sys.argv:
    _arg = arg.split("=", 1)
    if _arg[0] == "index_db_file_name":
        INDEX_DB_FILE_NAME = _arg[1] 
    elif _arg[0] == "document_id_field":
        DOCUMENT_ID_FIELD_NAME = _arg[1]
    elif _arg[0] == "user_script_db_dir":
        USER_SCRIPT_DB_DIR = _arg[1]
    elif _arg[0] == "log_file_name":
        LOG_FILE_NAME = _arg[1]

def main():
    input_stream = sys.stdin.read()

    try:
        log_file_path = os.path.join(USER_SCRIPT_LOGS_DIR, str(LOG_FILE_NAME))
        db_file_path = os.path.join(USER_SCRIPT_DB_DIR, INDEX_DB_FILE_NAME)

        json_data_records = json.loads(input_stream)
        records = json_data_records["result"]

        if len(check_db_exists("annotations", db_file_path)) == 0:
            create_db_from_file(ANNOTATION_DB_SQL_FILE_PATH, db_file_path)

        output_stream = {}

        # keep original structure of JSON:
        output_stream["result"] = []
        output_stream["medcat_info"] = json_data_records["medcat_info"]
        for record in records:
            query = "INSERT INTO annotations (elasticsearch_id) VALUES (" + '"' + str(record["footer"][DOCUMENT_ID_FIELD_NAME]) + "_" + str(1) + '"' + ")"
            result = connect_and_query(query, db_file_path, sql_script_mode=True)
            output_stream["result"].append(record)

    except Exception as exception:
        if os.path.exists(log_file_path):
            with open(log_file_path, "a+") as log_file:
                log_file.write("\n" + str(traceback.print_exc()))
        else:
            with open(log_file_path, "a+") as log_file:
                log_file.write("\n" + str(traceback.print_exc()))
    finally:
        return output_stream

sys.stdout.write(json.dumps(main()))
