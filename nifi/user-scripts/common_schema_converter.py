import traceback
import io
import sys
import os
import json
import avro.schema

# jython packages
import java.io
from org.apache.commons.io import IOUtils
from java.nio.charset import StandardCharsets
from org.apache.nifi.processor.io import StreamCallback,InputStreamCallback
import org.apache.nifi.logging.ComponentLog

# other packages, normally available to python 2.7
from avro.datafile import DataFileReader, DataFileWriter
from avro.io import DatumReader, DatumWriter

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

        json_data_records = json.loads(str(bytes_io.read()).encode("UTF-8"))

        type_mapping = {"long": "int", "int": "int", "float" : "float", "string": "str", "boolean": "bool", "double": "float", "byte": "bytes"}

        available_mapping_keys = {}
        for k,v in json_mapper_schema.iteritems():
            if v is not "":
                available_mapping_keys[k] = v

        new_json = []
        for _record in json_data_records:
            record = {}
            for k, v in available_mapping_keys.iteritems():
                    if v in _record.keys():
                        record[k] = _record[v]
            new_json.append(record)

        outputStream.write(json.dumps(new_json).encode("UTF-8"))

        """
        with DataFileWriter(outputStream, DatumWriter(), avro_cogstack_schema) as writer, \
            DataFileReader(bytes_io, DatumReader()) as reader:

            schema_fields = avro_cogstack_schema.props["fields"]
            dict_fields_types = {}

            for field in schema_fields:
                dict_fields_types[field.name] = "string"
                tmp_list = json.loads(str(field.type))
                
                if len(tmp_list) > 1 and type(tmp_list) is not str:
                    if type(tmp_list[1]) is dict:
                        dict_fields_types[field.name] = tmp_list[1]["type"]
                    elif type(tmp_list[0]) is dict:
                        dict_fields_types[field.name] = tmp_list[0]["type"]
                    elif str(tmp_list[1]) != "null":
                        dict_fields_types[field.name] = tmp_list[1]
                    elif str(tmp_list[0]) != "null":
                        dict_fields_types[field.name] = tmp_list[0]
                else:
                    dict_fields_types[field.name] = field.type
                
            available_mapping_keys = {}
            for k,v in json_mapper_schema.iteritems():
                if v is not "":
                    available_mapping_keys[k] = v
            
            test_records = [{ "docid" : "1",
            "sampleid" : 1,
            "dct" : "sf",
            "binarydoc": bytes("test")}]

            bytes_writer = io.BytesIO()
            encoder = avro.io.BinaryEncoder(bytes_writer)

            test_schema = avro.schema.parse(reader.schema, validate_enum_symbols=False)
            test_writer = DatumWriter(avro_cogstack_schema)
            #test_writer.write_data(avro_cogstack_schema, test_records[0], encoder)

            # re-map the value to the new keys
            for _record in reader:
                record = {}
                
                for k, v in available_mapping_keys.iteritems():
                    if v in _record.keys():
                        record[k] = str(_record[v]).encode("utf-8") #getattr(__builtins__, type_mapping[dict_fields_types[k]])(_record[v])
                        #log.info(str(type(getattr(__builtins__, type_mapping[dict_fields_types[k]]))))
                        #_record[v] #
                #for k in json_mapper_schema.keys():
                #    if k not in record.keys():
                #        record[k] = None
                #writer.append({"document_Fields_text": "1", "document_Id": "1"})
                log.info(str(record))
                test_writer.write_data(avro_cogstack_schema, record, encoder)
                log.info("DONE")
        """

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
    except Exception as exception:
        log.error(traceback.format_exc())
        session.transfer(flowFile, REL_FAILURE)

else:
    session.transfer(flowFile, REL_FAILURE)
