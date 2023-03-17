import traceback
import io
import sys
import os

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
        reader = DataFileReader(bytes_io, DatumReader())
       
        global avro_record
        avro_record = reader.next() # Get first Avro record. Also can be iterated in loop

        binary_data = None
        for record_attr_name in avro_record.keys():
            if binary_data_property == record_attr_name:
                # remove the binary content, no need to have a duplicate
                binary_data = avro_record[binary_data_property]
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

    try:
        flowFile = session.write(flowFile, PyStreamCallback())

        avro_record_converted = {str(k) : str(v) for k,v in avro_record.iteritems()}
        flowFile = session.putAllAttributes(flowFile, avro_record_converted)

        session.transfer(flowFile, REL_SUCCESS)
    except Exception as exception:
        log.error(traceback.format_exc())
        log.error(str(exception))
        session.transfer(flowFile, REL_FAILURE)

else:
    session.transfer(flowFile, REL_FAILURE)

