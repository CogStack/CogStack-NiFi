import sys

sys.path.insert(0, "/opt/nifi/user-scripts")

import io
import json
import traceback

import pyarrow
from nifiapi.flowfiletransform import FlowFileTransformResult
from nifiapi.properties import (
    ProcessContext,
    PropertyDescriptor,
    StandardValidators,
)
from nifiapi.relationship import Relationship
from overrides import overrides
from py4j.java_gateway import JavaObject, JVMView
from pyarrow import parquet
from utils.helpers.base_nifi_processor import BaseNiFiProcessor
from utils.helpers.parquet_json_data_types_converter import parquet_json_data_type_convert


class ConvertParquetToJson(BaseNiFiProcessor):
    """NiFi Python processor Read parquet file and output as JSON.
    """

    class Java:
        implements = ['org.apache.nifi.python.processor.FlowFileTransform']

    class ProcessorDetails:
        version = '0.0.1'

    def __init__(self, jvm: JVMView):
        super().__init__(jvm)

        # this is directly mirrored to the UI
        self._properties = []

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

    @overrides
    def transform(self, context: ProcessContext, flowFile: JavaObject) -> FlowFileTransformResult:
        """
 
        """
        try:
            self.process_context = context
            self.set_properties(context.getProperties())

            # read avro record
            input_raw_bytes: bytes = flowFile.getContentsAsBytes()
            input_byte_buffer: io.BytesIO  = io.BytesIO(input_raw_bytes)

            parquet_file = parquet.ParquetFile(input_byte_buffer)
            parquet_table: pyarrow.Table = parquet_file.read()

            records: list[dict] = parquet_table.to_pylist()

            output_contents = json.dumps(
                records,
                ensure_ascii=False,
                separators=(",", ":"),
                default=parquet_json_data_type_convert,
            ).encode("utf-8")

            input_byte_buffer.close()

            attributes: dict = {k: str(v) for k, v in flowFile.getAttributes().items()}
            attributes["mime.type"] = "application/json"

            return FlowFileTransformResult(relationship="success",
                                           attributes=attributes,
                                           contents=output_contents)
        except Exception as exception:
            self.logger.error("Exception during Avro processing: " + traceback.format_exc())
            raise exception
