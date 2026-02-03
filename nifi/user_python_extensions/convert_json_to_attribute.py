import json
import re
import traceback

from nifiapi.flowfiletransform import FlowFileTransformResult
from nifiapi.properties import ProcessContext, PropertyDescriptor, StandardValidators
from overrides import overrides
from py4j.java_gateway import JavaObject, JVMView

from nifi.user_scripts.utils.nifi.base_nifi_processor import BaseNiFiProcessor


class CogStackConvertJsonToAttribute(BaseNiFiProcessor):
    """
        Reads merged JSON records [{ "desired_field_name": "123" }, ...] (or {"records":[...]})
        and sets:
        - ids_csv   (e.g. "123,456,789")
        - ids_count
        - ids_len
        Content is unchanged.
    """


    class Java:
        implements = ['org.apache.nifi.python.processor.FlowFileTransform']

    class ProcessorDetails:
        version = '0.0.1'
        description = "Build ids_csv attribute from merged JSON records (dedupe, numeric-only)"
        tags = ["ids", "sql", "in-clause"]

    def __init__(self, jvm: JVMView):
        super().__init__(jvm)

        self.field_name: str = "id"

        # this is directly mirrored to the UI
        self._properties: list[PropertyDescriptor] = [
           PropertyDescriptor(name="field_name",
                               description="field name to transfer to attribute",
                               required=True, 
                               validators=[StandardValidators.NON_EMPTY_VALIDATOR])
        ]

        self.descriptors: list[PropertyDescriptor] = self._properties

    @overrides
    def transform(self, context: ProcessContext, flowFile: JavaObject) -> FlowFileTransformResult:
        DIGITS = re.compile(r"^\d+$")
        try:
            self.process_context = context
            self.set_properties(context.getProperties())

            # read avro record
            input_raw_bytes: bytes = flowFile.getContentsAsBytes()
            text = (input_raw_bytes.decode("utf-8", errors="replace").strip() if input_raw_bytes else "[]")

            try:
                parsed = json.loads(text) if text else []
            except Exception:
                parsed = []

            records = parsed if isinstance(parsed, list) else parsed.get("records", [])
            if not isinstance(records, list):
                records = []

            ids = []
            for r in records:
                if not isinstance(r, dict):
                    continue
                v = r.get(self.field_name)
                if v is None:
                    continue
                s = str(v).strip()
                if DIGITS.match(s):
                    ids.append(s)

            ids_csv = ",".join(ids)
            return FlowFileTransformResult(
                relationship="success",
                attributes={
                    "ids_csv": ids_csv,
                    "ids_count": str(len(ids)),
                    "ids_len": str(len(ids_csv)),
                },
            )
        except Exception as exception:
            self.logger.error("Exception during Avro processing: " + traceback.format_exc())
            raise exception