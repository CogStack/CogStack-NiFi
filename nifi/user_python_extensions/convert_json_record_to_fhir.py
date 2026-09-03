import json
import re

from fhir.resources import get_fhir_model_class

from nifiapi.flowfiletransform import FlowFileTransformResult
from nifiapi.properties import (
    ProcessContext,
    PropertyDescriptor,
    StandardValidators,
)
from py4j.java_gateway import JavaObject, JVMView

from nifi.user_scripts.utils.nifi.base_nifi_processor import BaseNiFiProcessor


class CogStackFHIRProcessor(BaseNiFiProcessor):

    class Java:
        implements = ["org.apache.nifi.python.processor.FlowFileTransform"]

    class ProcessorDetails:
        version = "0.0.1"
        description = (
            "Parse and validate HL7 FHIR JSON resources using "
            "fhir.resources 8.x. Adds resourceType and valid "
            "FlowFile attributes."
        )
        tags = ["fhir", "hl7", "ehr", "healthcare", "validation"]

    def __init__(self, jvm: JVMView):
        super().__init__(jvm)

        self.pretty_print: bool = False
        self.suppress_narrative: bool = False
        self.omit_resource_id: bool = False
        self.strip_reference_versions: bool = True

        self._properties = [
            PropertyDescriptor(
                name="pretty_print",
                description="Pretty-print output FHIR JSON.",
                default_value="false",
                required=True,
                validators=[StandardValidators.BOOLEAN_VALIDATOR],
            ),
            PropertyDescriptor(
                name="suppress_narrative",
                description="Remove top-level FHIR Narrative text.",
                default_value="false",
                required=True,
                validators=[StandardValidators.BOOLEAN_VALIDATOR],
            ),
            PropertyDescriptor(
                name="omit_resource_id",
                description="Remove the top-level FHIR resource id.",
                default_value="false",
                required=True,
                validators=[StandardValidators.BOOLEAN_VALIDATOR],
            ),
            PropertyDescriptor(
                name="strip_reference_versions",
                description=(
                    "Strip /_history/<version> from FHIR reference values."
                ),
                default_value="true",
                required=True,
                validators=[StandardValidators.BOOLEAN_VALIDATOR],
            ),
        ]

        self.descriptors: list[PropertyDescriptor] = self._properties

    @staticmethod
    def _strip_reference_versions(value):
        if isinstance(value, dict):
            for key, child in value.items():
                if key == "reference" and isinstance(child, str):
                    value[key] = re.sub(
                        r"/_history/[^/]+$",
                        "",
                        child,
                    )
                else:
                    CogStackFHIRProcessor._strip_reference_versions(child)

        elif isinstance(value, list):
            for child in value:
                CogStackFHIRProcessor._strip_reference_versions(child)

    @staticmethod
    def _remove_narrative(resource):
        """
        Remove Resource.text only.

        Do not recursively remove every field named 'text', since fields
        such as CodeableConcept.text and HumanName.text are legitimate
        FHIR data.
        """
        if isinstance(resource, dict):
            resource.pop("text", None)

    def process(
        self,
        context: ProcessContext,
        flowFile: JavaObject,
    ) -> FlowFileTransformResult:

        input_raw_bytes: bytes = flowFile.getContentsAsBytes()

        if not input_raw_bytes:
            raise ValueError("FHIR FlowFile content is empty")

        records: dict | list[dict] = json.loads(input_raw_bytes.decode("utf-8"))

        if isinstance(records, dict):
            records = [records]

        output = []
        resource_types = []

        for record in records:
            if not isinstance(record, dict):
                raise ValueError("Each FHIR resource must be a JSON object")

            resource_type = record.get("resourceType")
            if not resource_type:
                raise ValueError(
                    "FHIR resource does not contain resourceType"
                )

            resource_class = get_fhir_model_class(resource_type)
            resource = resource_class.model_validate(record)

            validated = resource.model_dump(
                exclude_none=True,
                mode="json",
            )

            if self.omit_resource_id:
                validated.pop("id", None)
            if self.suppress_narrative:
                self._remove_narrative(validated)
            if self.strip_reference_versions:
                self._strip_reference_versions(validated)

            output.append(validated)
            resource_types.append(resource_type)

        contents = json.dumps(
            output,
            indent=2 if self.pretty_print else None,
            separators=None if self.pretty_print else (",", ":"),
        ).encode("utf-8")

        return FlowFileTransformResult(
            relationship=self.REL_SUCCESS.name,
            attributes={
                "resourceType": (resource_types[0]
                                 if len(set(resource_types)) == 1 
                                 else "mixed"),
                "valid": "true",
                "mime.type": "application/fhir+json",
            },
            contents=contents,
        )

