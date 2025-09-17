import io
import json
import traceback

import avro.schema

# jython packages
# other packages, normally available to python 2.7
from org.apache.commons.io import IOUtils
from org.apache.nifi.processor.io import StreamCallback

"""
    Avro schemas: https://avro.apache.org/docs/current/api/java/org/apache/avro/Schema.Field.html
"""

global flowFile

flowFile = session.get()

global avro_cogstack_schema
global json_mapper_schema

class PyStreamCallback(StreamCallback):
    def __init__(self):
        pass

    def process(self, inputStream, outputStream):
        bytes_arr = IOUtils.toByteArray(inputStream)
        bytes_io = io.BytesIO(bytes_arr)

        json_data_records = json.loads(bytes_io.read())
        available_mapping_keys = {}
        for k,v in json_mapper_schema.iteritems():
            if v != "":
                available_mapping_keys[k] = v
      
        new_json = []
        for _record in json_data_records:
            record = {}
            for k, v in available_mapping_keys.iteritems():
                if v in _record.keys():
                    if type(v) is dict:
                        record[k] = {}
                        for k_child, v_child in v.iteritems():
                            record[k][k_child] = v[k_child]
                    else:
                        record[k] = _record[v]
                elif type(v) is dict:
                    record[k] = {}
                    for k_child, v_child in v.iteritems():
                            record[k][k_child] = _record[v_child]
            new_json.append(record)

        outputStream.write(json.dumps(new_json).encode("UTF-8"))
       

if flowFile != None:
    JSON_MAPPER_SCHEMA_LOCATION_PROPERTY_NAME="mapper_schema_location"
    AVRO_SCHEMA_LOCATION_PROPERTY_NAME="avro_common_schema_location"
    
    json_mapper_schema = {}
    avro_cogstack_schema = {}
    
    with open(str(context.getProperty(JSON_MAPPER_SCHEMA_LOCATION_PROPERTY_NAME))) as json_file:
        json_mapper_schema = json.loads(json_file.read().encode("utf-8"))

    with open(str(context.getProperty(AVRO_SCHEMA_LOCATION_PROPERTY_NAME)), mode="rb") as avro_file:
        avro_cogstack_schema = avro.schema.parse(avro_file.read().encode("utf-8"), validate_enum_symbols=False)

    try:
        flowFile = session.write(flowFile, PyStreamCallback())

        session.transfer(flowFile, REL_SUCCESS)
    except Exception:
        log.error(traceback.format_exc())
        session.transfer(flowFile, REL_FAILURE)

else:
    session.transfer(flowFile, REL_FAILURE)
