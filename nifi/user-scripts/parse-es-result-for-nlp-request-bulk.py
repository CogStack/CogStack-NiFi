import traceback
import io
import json

# jython packages
from org.apache.commons.io import IOUtils
from org.apache.nifi.processor.io import StreamCallback,InputStreamCallback
import org.apache.nifi.logging.ComponentLog

global flowFile
global DOCUMENT_ID_FIELD_NAME
global DOCUMENT_TEXT_FIELD_NAME

flowFile = session.get()

class PyStreamCallback(StreamCallback):
    def __init__(self):
        pass

    def process(self, inputStream, outputStream):
        bytes_arr = IOUtils.toByteArray(inputStream)
        bytes_io = io.BytesIO(bytes_arr)
        json_data_records = json.loads(str(bytes_io.read()).encode("UTF-8"))

        out_records = []
        for record in json_data_records:
            out_record = {"footer" : {}}
            for k, v in record["_source"].iteritems():
                if k!= DOCUMENT_TEXT_FIELD_NAME:
                    out_record["footer"][k] = v
            
            if DOCUMENT_ID_FIELD_NAME == "_id":
                out_record["id"] = record["_id"]
            else:
                if DOCUMENT_ID_FIELD_NAME in record["_source"].keys():
                    out_record["id"] = record["_source"][DOCUMENT_ID_FIELD_NAME]
                
            if DOCUMENT_TEXT_FIELD_NAME in record["_source"].keys():
                out_record["text"] = record["_source"][DOCUMENT_TEXT_FIELD_NAME]
                out_records.append(out_record)
            else:
                log.debug("Document id :" + str(record["_id"]) + " , has no ID, document will not be added to the queue.")

        outputStream.write(json.dumps({"content": out_records}).encode("UTF-8"))

if flowFile != None:
    DOCUMENT_ID_PROPERTY_NAME="document_id_field"
    DOCUMENT_TEXT_PROPERTY_NAME="document_text_field"

    DOCUMENT_ID_FIELD_NAME = str(context.getProperty(DOCUMENT_ID_PROPERTY_NAME))
    DOCUMENT_TEXT_FIELD_NAME = str(context.getProperty(DOCUMENT_TEXT_PROPERTY_NAME))
    
    try:
        flowFile = session.write(flowFile, PyStreamCallback())

        session.transfer(flowFile, REL_SUCCESS)
    except Exception as exception:
        log.error(traceback.format_exc())
        session.transfer(flowFile, REL_FAILURE)

else:
    session.transfer(flowFile, REL_FAILURE)