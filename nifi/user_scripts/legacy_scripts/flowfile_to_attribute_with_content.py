import copy
import io
import json
import traceback

# jython packages
# other packages, normally available to python 2.7
from avro.datafile import DataFileReader
from avro.io import DatumReader
from org.apache.commons.io import IOUtils
from org.apache.nifi.processor.io import OutputStreamCallback, StreamCallback
from org.python.core.util import StringUtil

"""
    This script converts a flow file with avro/json content with all the record's fields that has to flow file attributes.
"""

global flowFile

global OPERATION_MODE
global FIELD_NAMES_TO_KEEP_AS_CONTENT

flowFile = session.get()

output_flowFiles = []

class WriteContentCallback(OutputStreamCallback):
    def __init__(self, content):
        self.content_text = content

    def process(self, outputStream):
        try:
            outputStream.write(StringUtil.toBytes(self.content_text))
        except:
            traceback.print_exc(file=sys.stdout)
            raise

class PyStreamCallback(StreamCallback):
    def __init__(self):
        pass

    def process(self, inputStream, outputStream):
        bytes_arr = IOUtils.toByteArray(inputStream)
        bytes_io = io.BytesIO(bytes_arr)


        if OPERATION_MODE == "json":
            records = json.loads(bytes_io.read())
        elif OPERATION_MODE == "avro":
            records = DataFileReader(bytes_io, DatumReader())
            
        for record in records:
            metadata = copy.deepcopy(records.meta)
            schema_from_file = json.loads(metadata["avro.schema"])
            new_flow_file = session.create(flowFile)

            new_flow_file = session.putAttribute(new_flow_file, "attribute_list", str(list(record.keys())))
            new_flow_file = session.putAttribute(new_flow_file, "avro_schema", json.dumps(schema_from_file))

            for k, v in record.iteritems():
                if k != FIELD_NAMES_TO_KEEP_AS_CONTENT:
                    new_flow_file = session.putAttribute(new_flow_file, k, str(v))
                if FIELD_NAMES_TO_KEEP_AS_CONTENT != "" and k == FIELD_NAMES_TO_KEEP_AS_CONTENT:
                    new_flow_file = session.write(new_flow_file, WriteContentCallback(str(v).encode("UTF-8")))
            output_flowFiles.append(new_flow_file)

        if type(records) == DataFileReader:
            records.close()


if flowFile != None:
    # possible values:
    #  - avro, convert avro flowfile fields to flowfile attributes, keep only what is needed as content
    #  - json, convert json flowfile fields to attributes
    OPERATION_MODE_PROPERTY_NAME = "operation_mode" 

    FIELD_NAMES_TO_KEEP_AS_CONTENT_PROPERTY_NAME = "keep_fields_as_content"

    FIELD_NAMES_TO_KEEP_AS_CONTENT = []

    OPERATION_MODE = str(context.getProperty(OPERATION_MODE_PROPERTY_NAME)).lower()

    if OPERATION_MODE == "" or OPERATION_MODE is None:
        OPERATION_MODE = "avro"
    
    FIELD_NAMES_TO_KEEP_AS_CONTENT = str(context.getProperty(FIELD_NAMES_TO_KEEP_AS_CONTENT_PROPERTY_NAME)).lower()

    try:
        #flowFile_content = IOUtils.toString(session.read(flowFile), StandardCharsets.UTF_8)
        flowFile = session.write(flowFile, PyStreamCallback())

        session.transfer(output_flowFiles, REL_SUCCESS)
        session.remove(flowFile)
    except Exception:
        log.error(traceback.format_exc())
        session.transfer(flowFile, REL_FAILURE)

else:
    session.transfer(flowFile, REL_FAILURE)
