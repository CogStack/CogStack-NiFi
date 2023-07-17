import traceback
import io
import sys
import os
import json
import avro
from avro.datafile import DataFileReader, DataFileWriter
from avro.io import DatumReader, DatumWriter

from pydoc import locate

"""
    Use this script to test avro schemas etc with python3
"""

stream = object()

json_mapper_schema = json.loads(open("../user-schemas/cogstack_common_schema_mapping.json").read())
avro_cogstack_schema = avro.schema.parse(open("../user-schemas/cogstack_common_schema_full.avsc", "rb").read(), validate_enum_symbols=False)

test_records = [{ "docid" : "1",
  "sampleid" : 1041,
  "dct" : "2020-05-11 10:52:25.273518",
  "binarydoc": "blablabla" },
  { "docid" : "1",
  "sampleid" : 1041,
  "dct" : "2020-05-11 10:52:25.273518",
  "binarydoc": "blablabla" }]

schema_fields = avro_cogstack_schema.props["fields"]
dict_fields_types = {}
for field in schema_fields:
    dict_fields_types[field.name] = ""
    tmp_list = json.loads(str(field.type))
    if len(tmp_list) > 1 and type(tmp_list) is not str:
        if type(tmp_list[1]) is dict:
            dict_fields_types[field.name] = tmp_list[1]["type"]
        else:
            dict_fields_types[field.name] = tmp_list[1]
    else:
        dict_fields_types[field.name] = field.type

available_mapping_keys = {}
for k,v in json_mapper_schema.items():
    if v:
        available_mapping_keys[k] = v

bytes_io = io.BytesIO(bytes("", encoding="UTF-8"))

type_mapping = {"boolean": "bool", "long": "int", "int": "int", "float" : "float", "byte":"bytes", "string": "str", "double": "float"}


print(avro_cogstack_schema)

with DataFileWriter(bytes_io, DatumWriter(), avro_cogstack_schema) as writer:
    # re-map the value to the new keys

    for _record in test_records:
        record = {}

        for k, v in available_mapping_keys.items():
            if v in _record.keys():
                record[k] = _record[v] #getattr(__builtins__, type_mapping[dict_fields_types[k]])(_record[v])

        writer.append(record)  
