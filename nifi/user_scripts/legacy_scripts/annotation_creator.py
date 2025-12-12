import json
import os
import sys
import traceback

from utils.sqlite_query import check_db_exists, connect_and_query, create_db_from_file

ANNOTATION_DB_SQL_FILE_PATH = "/opt/cogstack-db/sqlite/schemas/annotations_nlp_create_schema.sql"

# default values from /deploy/nifi.env
NIFI_USER_SCRIPT_DB_DIR = os.getenv("NIFI_USER_SCRIPT_DB_DIR")
NIFI_USER_SCRIPT_LOGS_DIR = os.getenv("NIFI_USER_SCRIPT_LOGS_DIR")

for arg in sys.argv:
    _arg = arg.split("=", 1)
    if _arg[0] == "index_db_file_name":
        INDEX_DB_FILE_NAME = _arg[1] 

LOG_FILE_NAME = "annotation_manager.log"


def main():
    input_stream = sys.stdin.read()

    try:
        log_file_path = os.path.join(NIFI_USER_SCRIPT_LOGS_DIR, str(LOG_FILE_NAME))
        db_file_path = os.path.join(NIFI_USER_SCRIPT_DB_DIR, INDEX_DB_FILE_NAME)

        json_data_records = json.loads(input_stream)

        if len(check_db_exists("annotations", db_file_path)) == 0:
            create_db_from_file(ANNOTATION_DB_SQL_FILE_PATH, db_file_path)

        output_stream = {}
        # keep original structure of JSON:
        output_stream["content"] = []

        records = json_data_records["langs"]["buckets"]
        for record in records:
            query = "INSERT INTO annotations (elasticsearch_id) VALUES (" + '"' + str(record["key"]) + "_" + str(1) + '"' + ")"
            result = connect_and_query(query, db_file_path, sql_script_mode=True)

            if len(result) == 0:
                    output_stream["content"].append(record)

    except Exception:
        if os.path.exists(log_file_path):
            with open(log_file_path, "a+") as log_file:
                log_file.write("\n" + str(traceback.print_exc()))
        else:
            with open(log_file_path, "a+") as log_file:
                log_file.write("\n" + str(traceback.print_exc()))
    finally:
        return output_stream

sys.stdout.write(json.dumps(main()))
