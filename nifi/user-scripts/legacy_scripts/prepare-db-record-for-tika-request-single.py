import base64
import io
import os
import sys
import traceback

# jython packages
from org.apache.commons.io import IOUtils
from org.apache.nifi.processor.io import StreamCallback

"""
    We add this because we have extra pip packages installed in our separate version of Jython
    this is usually declared in he "Module Directory" property of the ExecuteScript NiFi processor,
    if it is declared there there's no need to include it here.
"""
JYTHON_HOME = os.environ.get("JYTHON_HOME", "")
sys.path.append(JYTHON_HOME + "/Lib/site-packages")

# other packages, normally available to python 2.7
from avro.datafile import DataFileReader
from avro.io import DatumReader

"""
    Below are the object descriptions, these are used throughout NiFi jython/groovy scripts
    - flowfile: https://www.javadoc.io/doc/org.apache.nifi/nifi-api/latest/org/apache/nifi/flowfile/FlowFile.html
    - context: https://www.javadoc.io/doc/org.apache.nifi/nifi-api/latest/org/apache/nifi/processor/ProcessContext.html 
    - session: https://www.javadoc.io/doc/org.apache.nifi/nifi-api/latest/org/apache/nifi/processor/ProcessSession.html
    - log: https://www.javadoc.io/doc/org.apache.nifi/nifi-api/latest/org/apache/nifi/logging/ComponentLog.html
    - propertyValue: https://www.javadoc.io/doc/org.apache.nifi/nifi-api/latest/org/apache/nifi/components/PropertyValue.html
"""

global flowFile
global OPERATION_MODE

flowFile = session.get()

class PyStreamCallback(StreamCallback):
    def __init__(self):
        pass

    def process(self, inputStream, outputStream):
        bytes_arr = IOUtils.toByteArray(inputStream)
        bytes_io = io.BytesIO(bytes_arr)
        reader = DataFileReader(bytes_io, DatumReader())

        global avro_record
        avro_record = reader.next() # Get first Avro record. Also can be iterated in loop

        binary_data = None
        for record_attr_name in avro_record.keys():
            if binary_data_property == record_attr_name:
                # remove the binary content, no need to have a duplicate
                binary_data = avro_record[binary_data_property]

                if OPERATION_MODE == "base64":
                    binary_data = base64.b64decode(binary_data).decode()

                del avro_record[binary_data_property]
                break

        # write the binary directly to the flow file
        outputStream.write(binary_data)

if flowFile != None:
    DOC_ID_ATTRIBUTE_NAME = "document_id_field"
    BINARY_FIELD_NAME = "binary_field"
    OUTPUT_TEXT_FIELD_NAME = "output_text_field_name"

    doc_id_property = str(context.getProperty(DOC_ID_ATTRIBUTE_NAME))
    binary_data_property = str(context.getProperty(BINARY_FIELD_NAME))
    output_text_property = str(context.getProperty(OUTPUT_TEXT_FIELD_NAME))

    # check if this has been set
    OPERATION_MODE = str(context.getProperty("operation_mode"))

    try:
        flowFile = session.write(flowFile, PyStreamCallback())

        out_data = {k : str(v) for k,v in avro_record.iteritems()}
        out_data["avro_keys"] = str(out_data.keys())
        out_data["output_text_property"] = output_text_property
        out_data[DOC_ID_ATTRIBUTE_NAME] = doc_id_property
        out_data[BINARY_FIELD_NAME] = binary_data_property
        out_data[OUTPUT_TEXT_FIELD_NAME] = output_text_property

        flowFile = session.putAllAttributes(flowFile, out_data)

        session.transfer(flowFile, REL_SUCCESS)
    except Exception as exception:
        log.error(traceback.format_exc())
        log.error(str(exception))
        session.transfer(flowFile, REL_FAILURE)

else:
    session.transfer(flowFile, REL_FAILURE)

