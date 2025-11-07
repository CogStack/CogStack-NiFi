import sys

sys.path.insert(0, "/opt/nifi/user-scripts")  # noqa: I001,E402

import json
import traceback

from nifiapi.flowfiletransform import FlowFileTransformResult
from nifiapi.properties import (
    ProcessContext,
    PropertyDescriptor,
    StandardValidators,
)
from nifiapi.relationship import Relationship
from overrides import override
from py4j.java_gateway import JavaObject, JVMView
from utils.helpers.base_nifi_processor import BaseNiFiProcessor


class ParseCogStackServiceResult(BaseNiFiProcessor):
    """ Normalises JSON responses from CogStack OCR or MedCAT services, reading each FlowFile,
    coercing single objects to lists.
    Exposes configurable properties for output text field name, service message type,
    document ID/text fields, and MedCAT DEID behaviour so the same processor can be reused across services.

    """

    class Java:
        implements = ['org.apache.nifi.python.processor.FlowFileTransform']

    class ProcessorDetails:
        version = '0.0.1'

    def __init__(self, jvm: JVMView):
        super().__init__(jvm)

        self.output_text_field_name: str = "text"
        self.service_message_type: str = "ocr"
        self.document_text_field_name:str = "text"
        self.document_id_field_name: str = "_id"
        self.medcat_output_mode: str = "not_set"
        self.medcat_deid_keep_annotations: bool = True

        # this is directly mirrored to the UI
        self._properties = [
            PropertyDescriptor(name="output_text_field_name",
                               description="field to store OCR output text, this can also be used"
                               " in MedCAT output in DE_ID mode",
                               default_value="text",
                               required=True,
                               validators=[StandardValidators.NON_EMPTY_VALIDATOR]),
            PropertyDescriptor(name="service_message_type",
                               description="the type of service message form this script processes," \
                               " possible values: not_set | medcat | ocr",
                               default_value="not_set",
                               required=True,
                               allowable_values=["ocr", "medcat", "not_set"]),
            PropertyDescriptor(name="document_id_field_name",
                               description="id field name of the document, this will be taken from the 'footer' usually",
                               default_value="_id",
                               required=True,
                               validators=[StandardValidators.NON_EMPTY_VALIDATOR]),
            PropertyDescriptor(name="document_text_field_name",
                               description="text field name of the document",
                               validators=[StandardValidators.NON_EMPTY_VALIDATOR],
                               required=True,
                               default_value="text"),
            PropertyDescriptor(name="medcat_output_mode",
                               description="service_message_type is set to 'medcat' \
                                  for this to work, only used for deid processing,"
                               " if the output is for deid, then we can customise the" \
                               " name of the text field, possible values: deid | not_set",
                               default_value="not_set",
                               required=True,
                               allowable_values=["deid", "not_set"],
                               ),
            PropertyDescriptor(name="medcat_deid_keep_annotations",
                               description="if set to true, " \
                               "then the annotations will be kept in the output with the text field",
                               required=True,
                               default_value="true",
                               allowable_values=["true", "false"],
                               validators=[StandardValidators.BOOLEAN_VALIDATOR],
                               )
        ]

        self._relationships = [
            Relationship(
                name="success",
                description="All FlowFiles processed successfully."
            ),
            Relationship(
                name="failure",
                description="FlowFiles that failed processing."
            )
        ]

        self.descriptors: list[PropertyDescriptor] = self._properties
        self.relationships: list[Relationship] = self._relationships

    @override
    def transform(self, context: ProcessContext, flowFile: JavaObject) -> FlowFileTransformResult: # type: ignore
        """
        Transforms the input FlowFile by parsing the service response and extracting relevant fields.

        Args:
            context (ProcessContext): The process context containing processor properties.
            flowFile (JavaObject): The FlowFile object containing the input data.

        Raises:
            Exception: If any error occurs during processing.

        Returns:
            FlowFileTransformResult: The result containing the transformed contents and updated attributes.
        """
        output_contents = []
        try:
            self.process_context: ProcessContext = context
            self.set_properties(context.getProperties())

            # read avro record
            input_raw_bytes: bytearray = flowFile.getContentsAsBytes() # type: ignore

            records: dict | list[dict] = json.loads(input_raw_bytes.decode("utf-8"))

            if isinstance(records, dict):
                records = [records]

            if self.service_message_type == "ocr":
                for record in records:
                    result = record.get("result", {})

                    _record = {}
                    _record["metadata"] = result.get("metadata", {})
                    _record["text"] = result.get("text", "")
                    _record["success"] = result.get("success", False)
                    _record["timestamp"] = result.get("timestamp", None)

                    if "footer" in result:
                        for k, v in result["footer"].items():
                            _record[k] = v

                    output_contents.append(_record)

            elif self.service_message_type == "medcat" and "result" in records[0]:
                    result = records[0].get("result", [])
                    medcat_info = records[0].get("medcat_info", {})

                    if isinstance(result, dict):
                        result = [result]

                    for annotated_record in result:
                        annotations = annotated_record.get("annotations", [])
                        annotations = annotations[0] if len(annotations) > 0 else annotations
                        footer = annotated_record.get("footer", {})

                        if self.medcat_output_mode == "deid":
                            _output_annotated_record = {}
                            _output_annotated_record["service_model"] = medcat_info
                            _output_annotated_record["timestamp"] = annotated_record.get("timestamp", None)   
                            _output_annotated_record[self.output_text_field_name] = annotated_record.get("text", "") 

                            if self.medcat_deid_keep_annotations is True:
                                _output_annotated_record["annotations"] = annotations
                            else:
                                _output_annotated_record["annotations"] = {}

                            for k, v in footer.items():
                                _output_annotated_record[k] = v
                            output_contents.append(_output_annotated_record)

                        else:
                            for annotation_id, annotation_data in annotations:
                                _output_annotated_record = {}
                                _output_annotated_record["service_model"] = medcat_info
                                _output_annotated_record["timestamp"] = annotated_record.get("timestamp", None)

                                for k, v in annotation_data.items():
                                    _output_annotated_record[k] = v

                                for k, v in footer.items():
                                    _output_annotated_record[k] = v

                                if self.document_id_field_name in footer:
                                    _output_annotated_record["annotation_id"] = \
                                        str(footer[self.document_id_field_name]) + "_" + str(annotation_id)

                                output_contents.append(_output_annotated_record)

            # add properties to flowfile attributes
            attributes: dict = {k: str(v) for k, v in flowFile.getAttributes().items()} # type: ignore
            attributes["output_text_field_name"] = str(self.output_text_field_name)
            attributes["mime.type"] = "application/json"

            return FlowFileTransformResult(relationship="success",
                                           attributes=attributes,
                                           contents=json.dumps(output_contents).encode('utf-8'))
        except Exception as exception:
            self.logger.error("Exception during flowfile processing: " + traceback.format_exc())
            raise exception
