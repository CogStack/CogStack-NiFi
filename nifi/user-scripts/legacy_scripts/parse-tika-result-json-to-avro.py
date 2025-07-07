import traceback
import io
import sys
import os
import json
import ast

# jython packages
import java.io
from org.apache.commons.io import IOUtils
from java.nio.charset import StandardCharsets
from org.apache.nifi.processor.io import StreamCallback,InputStreamCallback
import org.apache.nifi.logging.ComponentLog

"""
    We add this because we have extra pip packages installed in our separate version of Jython
    this is usually declared in he "Module Directory" property of the ExecuteScript NiFi processor,
    if it is declared there there's no need to include it here.
"""
JYTHON_HOME = os.environ.get("JYTHON_HOME", "")
sys.path.append(JYTHON_HOME + "/Lib/site-packages")

global flowFile

flowFile = session.get()

class PyStreamCallback(StreamCallback):
    def __init__(self):
        pass

    def process(self, inputStream, outputStream):
        bytes_arr = IOUtils.toByteArray(inputStream)
        bytes_io = io.BytesIO(bytes_arr)

        json_data_record = json.loads(str(bytes_io.read()).encode("UTF-8"))

        # add text and metadata column to record
        avro_data_dict["text"] = json_data_record["result"]["text"]
        avro_data_dict["ocr_metadata"] = json_data_record["result"]["metadata"]
        avro_data_dict["ocr_timestamp"] = json_data_record["result"]["timestamp"]

        outputStream.write(json.dumps(avro_data_dict).encode("UTF-8"))

if flowFile != None:
    DOC_ID_ATTRIBUTE_NAME = "document_id_field"
    BINARY_FIELD_NAME = "binary_field"
    OUTPUT_TEXT_FIELD_NAME = "output_text_field_name"

    doc_id_property = str(flowFile.getAttribute(DOC_ID_ATTRIBUTE_NAME))
    binary_data_property = str(flowFile.getAttribute(BINARY_FIELD_NAME))
    global output_text_property
    output_text_property = str(flowFile.getAttribute(OUTPUT_TEXT_FIELD_NAME))

    try:
        # these are the column names from the DB/data_source
        avro_record_data_source_columns = ast.literal_eval(str(flowFile.getAttribute("avro_keys")))

        global avro_data_dict
        avro_data_dict = {}

        for column_name in avro_record_data_source_columns:
            avro_data_dict[column_name] = flowFile.getAttribute(column_name)

        flowFile = session.write(flowFile, PyStreamCallback())
        session.transfer(flowFile, REL_SUCCESS)
    except Exception as exception:
        log.error(traceback.format_exc())
        log.error(str(exception))
        session.transfer(flowFile, REL_FAILURE)

else:
    session.transfer(flowFile, REL_FAILURE)
