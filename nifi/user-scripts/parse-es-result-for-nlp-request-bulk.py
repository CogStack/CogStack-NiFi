import traceback
import io
import json
import os

# jython packages
from org.apache.commons.io import IOUtils
from org.apache.nifi.processor.io import StreamCallback
import org.apache.nifi.logging.ComponentLog

global flowFile

global DOCUMENT_ID_FIELD_NAME
global DOCUMENT_TEXT_FIELD_NAME

global invalid_record_ids

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

            FIELD_TO_CHECK = "_source"
            if "fields" in record.keys():
                FIELD_TO_CHECK = "fields"

            for k, v in record[FIELD_TO_CHECK].iteritems():
                if k!= DOCUMENT_TEXT_FIELD_NAME:
                    out_record["footer"][k] = v
            
            if DOCUMENT_ID_FIELD_NAME == "_id":
                out_record["id"] = record["_id"]
            else:
                if DOCUMENT_ID_FIELD_NAME in record[FIELD_TO_CHECK].keys():
                    out_record["id"] = record[FIELD_TO_CHECK][DOCUMENT_ID_FIELD_NAME]
                
            if DOCUMENT_TEXT_FIELD_NAME in record[FIELD_TO_CHECK].keys() :
                if len(record[FIELD_TO_CHECK][DOCUMENT_TEXT_FIELD_NAME]) > 1:
                    out_record["text"] = record[FIELD_TO_CHECK][DOCUMENT_TEXT_FIELD_NAME]
                    out_records.append(out_record)
                else:
                    invalid_record_ids.append(record["_id"])
                    log.debug("Document id :" + str(record["_id"]) + ", text field has no content, document will not be added to the queue.")
            else:
                invalid_record_ids.append(record["_id"])
                log.debug("Document id :" + str(record["_id"]) + " , has no field named " + DOCUMENT_TEXT_FIELD_NAME + ", document will not be added to the queue.")

        outputStream.write(json.dumps({"content": out_records}).encode("UTF-8"))

if flowFile != None:

    DOCUMENT_ID_PROPERTY_NAME="document_id_field"
    DOCUMENT_TEXT_PROPERTY_NAME="document_text_field"

    DOCUMENT_ID_FIELD_NAME = str(context.getProperty(DOCUMENT_ID_PROPERTY_NAME))
    DOCUMENT_TEXT_FIELD_NAME = str(context.getProperty(DOCUMENT_TEXT_PROPERTY_NAME))
    
    # needs to be set to True/False
    LOG_INVALID_RECORDS = bool(str(context.getProperty("log_invalid_records_to_file")))
    LOG_FILE_NAME = str(context.getProperty("log_file_name"))
    
    invalid_record_ids = []

    try:
        flowFile = session.write(flowFile, PyStreamCallback())
        flowFile = session.putAttribute(flowFile, "invalid_record_ids", str(invalid_record_ids))
        session.transfer(flowFile, REL_SUCCESS)
    except Exception as exception:
        log.error(traceback.format_exc())
        flowFile = session.putAttribute(flowFile, "invalid_record_ids", str(invalid_record_ids))
        session.transfer(flowFile, REL_FAILURE)
    finally:
        if LOG_INVALID_RECORDS:
            log_file_path = os.path.join(str(os.environ.get("USER_SCRIPT_LOGS_DIR", "/opt/nifi/user-scripts/logs/")), str(LOG_FILE_NAME))
            _out_list = ','.join(str(x) for x in invalid_record_ids)
            if os.path.exists(log_file_path) and len(invalid_record_ids) > 0:
                with open(log_file_path, "a+") as log_file:
                    log_file.write("," + _out_list)
            else:
                with open(log_file_path, "w+") as log_file:
                    log_file.write(_out_list)
else:
    session.transfer(flowFile, REL_FAILURE)