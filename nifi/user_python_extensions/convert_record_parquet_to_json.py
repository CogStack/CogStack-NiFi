import io
import json

from nifiapi.flowfiletransform import FlowFileTransformResult
from nifiapi.properties import ProcessContext, PropertyDescriptor
from py4j.java_gateway import JavaObject, JVMView
from pyarrow import parquet

from nifi.user_scripts.utils.nifi.base_nifi_processor import BaseNiFiProcessor
from nifi.user_scripts.utils.serialization.parquet_json_data_types_converter import parquet_json_data_type_convert


class CogStackConvertParquetToJson(BaseNiFiProcessor):
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

        self.descriptors: list[PropertyDescriptor] = self._properties

    def process(self, context: ProcessContext, flowFile: JavaObject) -> FlowFileTransformResult:
        """
 
        """

        # read avro record
        input_raw_bytes: bytes = flowFile.getContentsAsBytes()
        input_byte_buffer: io.BytesIO = io.BytesIO(input_raw_bytes)

        parquet_file = parquet.ParquetFile(input_byte_buffer)

        output_buffer: io.BytesIO = io.BytesIO()
        record_count: int = 0

        for batch in parquet_file.iter_batches(batch_size=10000):
            records: list[dict] = batch.to_pylist()

            for record in records:
                json_record = json.dumps(
                    record,
                    ensure_ascii=False,
                    separators=(",", ":"),
                    default=parquet_json_data_type_convert,
                )

                output_buffer.write(json_record.encode("utf-8"))
                output_buffer.write(b"\n")
            record_count += len(records)

        input_byte_buffer.close()

        attributes: dict = {k: str(v) for k, v in flowFile.getAttributes().items()}
        attributes["mime.type"] = "application/x-ndjson"
        attributes["record.count"] = str(record_count)

        return FlowFileTransformResult(
            relationship="success",
            attributes=attributes,
            contents=output_buffer.getvalue(),
        )
