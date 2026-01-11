import json
import re
import sys
import traceback
from collections import defaultdict
from logging import Logger

logger: Logger = Logger(__name__)

origin_index_mapping = json.loads(sys.stdin.read())

INPUT_INDEX_NAME = ""
OUTPUT_INDEX_NAME = ""
OUTPUT_FILE_NAME = ""
JSON_FIELD_MAPPER_SCHEMA_FILE_PATH = ""
TRANSFORM_KEYS_LOWER_CASE = False

for arg in sys.argv:
    _arg = arg.split("=", 1)
    _arg[0] = _arg[0].lower()
    if _arg[0] == "input_index_name":
        INPUT_INDEX_NAME = _arg[1]
    if _arg[0] == "output_index_name":
        OUTPUT_INDEX_NAME = _arg[1]
    if _arg[0] == "output_file_name":
        OUTPUT_FILE_NAME = _arg[1]
    if _arg[0] == "json_field_mapper_schema_file_path":
        JSON_FIELD_MAPPER_SCHEMA_FILE_PATH = _arg[1]

try:
    json_field_mapper: dict = {}
    with open(JSON_FIELD_MAPPER_SCHEMA_FILE_PATH) as file:
        json_field_mapper = json.load(file)

    output_index_mapping: dict = {}

    origin_index_name = INPUT_INDEX_NAME if INPUT_INDEX_NAME else \
                        origin_index_mapping[list(origin_index_mapping.keys())[0]]

    for origin_field_name, origin_field_es_properties in origin_index_mapping["mappings"]["properties"]:
        pass

    for curr_field_name, curr_field_value in record.items():
        curr_field_name = str(curr_field_name).lower()
        if curr_field_name in new_schema_field_names:
            # check if the mapping is not a dict (nested field)
            if isinstance(json_mapper_schema[curr_field_name], str): 
                new_record.update({json_mapper_schema[curr_field_name] : curr_field_value})
            elif isinstance(json_mapper_schema[curr_field_name], dict):
                # nested field
                new_record.update({curr_field_name: {}})
                for nested_field_name, nested_field_value in curr_field_value.items():
                    if nested_field_name in json_mapper_schema[curr_field_name].keys():
                        new_record[curr_field_name].update({ \
                            json_mapper_schema[curr_field_name][nested_field_name]: nested_field_value})

    

except Exception as exception:
    logger.error("Exception during flowfile processing: " + traceback.format_exc())
    raise exception

# Output cleaned JSON as UTF-8
sys.stdout.buffer.write(json.dumps(output_index_mapping, ensure_ascii=False).encode("utf-8"))
