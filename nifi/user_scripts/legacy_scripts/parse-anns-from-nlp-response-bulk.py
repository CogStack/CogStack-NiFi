import io
import json
import sys
import traceback

# jython packages
from org.apache.commons.io import IOUtils
from org.apache.nifi.processor.io import OutputStreamCallback, StreamCallback
from org.python.core.util import StringUtil

global flowFile

global DOCUMENT_ID_FIELD_NAME

global ANNOTATION_ID_FIELD_NAME
global ANNOTATION_TYPES_TO_IGNORE

flowFile = session.get()

flowFiles = []

FIELD_NLP_PREFIX = 'nlp.'
FIELD_META_PREFIX = 'meta.'


class WriteContentCallback(OutputStreamCallback):
    def __init__(self, content):
        self.content_text = content

    def process(self, outputStream):
        try:
            outputStream.write(StringUtil.toBytes(self.content_text))
        except Exception:
            traceback.print_exc(file=sys.stdout)
            raise


class PyStreamCallback(StreamCallback):
    def __init__(self):
        pass

    def process(self, inputStream, outputStream):
        bytes_arr = IOUtils.toByteArray(inputStream)
        bytes_io = io.BytesIO(bytes_arr)

        json_data_records = json.loads(bytes_io.read())

        bytes_io.close()

        result = json_data_records

        if ANNOTATION_OUTPUT_TYPE == "medcat":
            result = json_data_records["result"]
            medcat_info = json_data_records["medcat_info"]
        elif type(json_data_records) is list:
            medcat_info = json_data_records[0]["nlp_service_info"]

        for annotated_text_record in result:
            doc_id = ""
            if ANNOTATION_OUTPUT_TYPE != "medcat":
                annotated_text_record = annotated_text_record["nlp_output"]
                doc_id = str(annotated_text_record["record_metadata"]["id"])

            # skip if this document has no annotations
            if "annotations" not in annotated_text_record:
                continue
            if len(annotated_text_record["annotations"]) == 0:
                continue

            annotations = annotated_text_record["annotations"]

            footer = {}
            if "footer" in list(annotated_text_record.keys()):
                footer = annotated_text_record["footer"]

            new_footer = {}

            if ANNOTATION_OUTPUT_TYPE == "medcat":
                assert DOCUMENT_ID_FIELD_NAME in footer.keys()
                doc_id = footer[DOCUMENT_ID_FIELD_NAME]
            else:
                # this seciton is for non-medcat annotations (e.g dt4h-annotator)
                # skip if no doc id is found
                if not doc_id:
                    continue

                # transform to medcat format
                if type(annotations) is list:
                    _annotaitions = {}
                    for i in range(len(annotations)):
                        _annotaitions[str(i)] = annotations[i]
                    annotations = _annotaitions

            for k,v in footer.iteritems():
                if k in ORIGINAL_FIELDS_TO_INCLUDE:
                    new_footer[str(FIELD_META_PREFIX + k)] = v

            # sometimes there's an empty annotation list
            if type(annotations) is dict and len(annotations.keys()) == 0:
                log.info("Empty annotation list - " + str(footer[DOCUMENT_ID_FIELD_NAME]))
                continue

            anns_ids = []
            for ann_id, annotation in annotations.iteritems():
                ignore_annotation = False
                anns_ids.append(ann_id)

                for type_to_ignore in ANNOTATION_TYPES_TO_IGNORE:
                    if type_to_ignore in annotation["types"]:
                        ignore_annotation = True
                        break

                if ignore_annotation is False:
                    new_ann_record = {}
                    for k,v in annotation.iteritems():
                        new_ann_record[FIELD_NLP_PREFIX + str(k)] = v

                    new_ann_record["service_model"] = medcat_info["service_model"]
                    new_ann_record["service_version"] = medcat_info["service_version"]

                    if "timestamp" not in new_ann_record.keys():
                        new_ann_record["timestamp"] = annotated_text_record["record_metadata"]["nlp_processing_date"]
                    else:
                        new_ann_record["timestamp"] = annotated_text_record["timestamp"]

                    log.info(str(doc_id))
                    # create the new _id for the annotation record in ElasticSearch

                    new_ann_record[FIELD_META_PREFIX + DOCUMENT_ID_FIELD_NAME] = doc_id
                    new_ann_record.update(new_footer)

                    if ANNOTATION_OUTPUT_TYPE != "medcat":
                        document_annotation_id = str(doc_id) + "_" + str(ann_id)
                    else:
                        document_annotation_id = str(doc_id) + "_" + str(annotation[ANNOTATION_ID_FIELD_NAME])

                    new_flow_file = session.create(flowFile)
                    new_flow_file = session.putAttribute(new_flow_file, "document_annotation_id", document_annotation_id)
                    new_flow_file = session.putAttribute(new_flow_file, "mime.type", "application/json")
                    new_flow_file = session.write(new_flow_file, WriteContentCallback(json.dumps(new_ann_record).encode("UTF-8")))
                    flowFiles.append(new_flow_file)


if flowFile is not None:
    DOCUMENT_ID_FIELD_NAME = str(context.getProperty("document_id_field"))
    ANNOTATION_ID_FIELD_NAME = str(context.getProperty("annotation_id_field"))

    _tmp_ann_type_ignore = str(context.getProperty("ignore_annotation_types"))
    _tmp_original_record_fields_to_include = str(context.getProperty("original_record_fields_to_include"))

    ANNOTATION_OUTPUT_TYPE = str(context.getProperty("annotation_output_type")).strip().lower()
    ANNOTATION_OUTPUT_TYPE = "other" if ANNOTATION_OUTPUT_TYPE not in ["medcat", ""] else "medcat"

    ORIGINAL_FIELDS_TO_INCLUDE = _tmp_original_record_fields_to_include.split(",") if _tmp_original_record_fields_to_include.lower() != "none" else []
    ANNOTATION_TYPES_TO_IGNORE = _tmp_ann_type_ignore.split(",") if _tmp_ann_type_ignore.lower() != "none" else []

    try:
        flowFile = session.write(flowFile, PyStreamCallback())
        session.transfer(flowFiles, REL_SUCCESS)
        session.remove(flowFile)
    except Exception:
        log.error(traceback.format_exc())
        session.transfer(flowFile, REL_FAILURE)

else:
    session.transfer(flowFile, REL_FAILURE)
