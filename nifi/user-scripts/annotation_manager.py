import os
import json
import traceback
import datetime
import sys
from utils.sqlite_query import connect_and_query,check_db_exists,create_db_from_file,create_connection

global DOCUMENT_ID_FIELD_NAME
global DOCUMENT_TEXT_FIELD_NAME
global USER_SCRIPT_DB_DIR
global DB_FILE_NAME
global LOG_FILE_NAME
global OPERATION_MODE

ANNOTATION_DB_SQL_FILE_PATH = "/opt/cogstack-db/sqlite/schemas/annotations_nlp_create_schema.sql"

# default values from /deploy/nifi.env
USER_SCRIPT_DB_DIR = os.getenv("USER_SCRIPT_DB_DIR")
USER_SCRIPT_LOGS_DIR = os.getenv("USER_SCRIPT_LOGS_DIR")

# possible values:
#   - check - check if a document ID has already been annotated
#   - insert - inserts new annotation(s) into DB
OPERATION_MODE = "check"

LOG_FILE_NAME = "annotation_manager.log"

# get the arguments from the "Command Arguments" property in NiFi, we are looking at anything after the 1st arg (which is the script name)
for arg in sys.argv:
    _arg = arg.split("=", 1)
    if _arg[0] == "index_db_file_name":
        INDEX_DB_FILE_NAME = _arg[1] 
    elif _arg[0] == "document_id_field":
        DOCUMENT_ID_FIELD_NAME = _arg[1]
    elif _arg[0] == "document_text_field":
        DOCUMENT_TEXT_FIELD_NAME = _arg[1]
    elif _arg[0] == "user_script_db_dir":
        USER_SCRIPT_DB_DIR = _arg[1]
    elif _arg[0] == "log_file_name":
        LOG_FILE_NAME = _arg[1]
    elif _arg[0] == "operation_mode":
        OPERATION_MODE = _arg[1]


def main():
    input_stream = sys.stdin.read()

    output_stream = {}

    try:
        log_file_path = os.path.join(USER_SCRIPT_LOGS_DIR, str(LOG_FILE_NAME))
        db_file_path = os.path.join(USER_SCRIPT_DB_DIR, INDEX_DB_FILE_NAME)

        json_data_records = json.loads(input_stream)

        if len(check_db_exists("annotations", db_file_path)) == 0:
            create_db_from_file(ANNOTATION_DB_SQL_FILE_PATH, db_file_path)

        records = json_data_records

        _sqlite_connection_ro = None
        _sqlite_connection_rw = None

        if isinstance(records, dict):
            if "content" in json_data_records.keys():
                records = json_data_records["content"]
            if len(records) <= 1 and isinstance(records, dict):
                records = [records]

        if OPERATION_MODE == "check":
            output_stream = {}
            # keep original structure of JSON:
            output_stream["content"] = []
            _sqlite_connection_ro = create_connection(db_file_path, read_only_mode=True)

        if OPERATION_MODE == "insert":
            del output_stream
            output_stream = []
            _sqlite_connection_rw = create_connection(db_file_path, read_only_mode=False)

        _cursor = _sqlite_connection_ro.cursor() if _sqlite_connection_ro is not None else _sqlite_connection_rw.cursor()

        for record in records:
            if OPERATION_MODE == "check":
                document_id = str(record[DOCUMENT_ID_FIELD_NAME])
                query = "SELECT id FROM annotations WHERE id LIKE '%" + document_id + "%' LIMIT 1"
                result = connect_and_query(query, db_file_path, sqlite_connection=_sqlite_connection_ro, cursor=_cursor, keep_conn_open=True)

                if len(result) < 1:
                    output_stream["content"].append(record)

            if OPERATION_MODE == "insert":
                document_id = str(record["meta." + DOCUMENT_ID_FIELD_NAME])
                nlp_id = str(record["nlp.id"])
                query = "INSERT OR REPLACE INTO annotations (id) VALUES (" + '"' + document_id + "_" + nlp_id + '"' + ")"
                result = connect_and_query(query, db_file_path, sqlite_connection=_sqlite_connection_rw, sql_script_mode=True, cursor=_cursor, keep_conn_open=True)
                output_stream.append(record)

        if _cursor is not None: 
            _cursor.close()
        if _sqlite_connection_ro is not None:
            _sqlite_connection_ro.close()
        if _sqlite_connection_rw is not None:
            _sqlite_connection_rw.close()
    except Exception as exception:
        time = datetime.datetime.now()
        with open(log_file_path, "a+") as log_file:
            log_file.write("\n" + str(time) + ": " + str(exception))
            log_file.write("\n" + str(time) + ": " + traceback.format_exc())

    return output_stream


sys.stdout.write(json.dumps(main()))
