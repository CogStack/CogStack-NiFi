import base64
import json

from nifiapi.flowfiletransform import FlowFileTransformResult
from nifiapi.properties import (
    ProcessContext,
    PropertyDescriptor,
    StandardValidators,
)
from py4j.java_gateway import JavaObject, JVMView

from nifi.user_scripts.utils.codecs.cerner_blob import DecompressLzwCernerBlob
from nifi.user_scripts.utils.nifi.base_nifi_processor import BaseNiFiProcessor


class CogStackJsonRecordDecompressCernerBlob(BaseNiFiProcessor):
    """ This script decompresses Cerner LZW compressed blobs from a JSON input stream.
    It expects a JSON array of records, each containing a field with the binary data.
    All RECORDS are expected to have the same fields, and presumably belonging to the same DOCUMENT.
    All the fields of these records should have the same field values, except for the binary data field.
    The binary data field is expected to be a base64 encoded string, which will be concatenated according to 
    the blob_sequence_order_field_name field, preserving the order of the blobs and composing 
    the whole document (supposedly).
    The final base64 encoded string will be decoded back to binary data, then decompressed using LZW algorithm.

    """


    class Java:
        implements = ['org.apache.nifi.python.processor.FlowFileTransform']

    class ProcessorDetails:
        version = '0.0.2'
        description = "Decompresses Cerner LZW compressed blobs from a JSON input stream"
        tags = ["cerner", "oracle", "blob"]

    def __init__(self, jvm: JVMView):
        super().__init__(jvm)

        self.operation_mode: str = "base64"
        self.binary_field_name: str = "binarydoc"
        self.output_text_field_name: str = "text"
        self.document_id_field_name: str = "id"
        self.input_charset: str = "utf-8"
        self.output_charset: str = "utf-8"
        self.output_mode: str = "base64"
        self.binary_field_source_encoding: str = "base64"
        self.blob_sequence_order_field_name: str = "blob_sequence_num"
        self.blob_sequence_order_resolve_duplicate_policy: str = "fail"

        # this is directly mirrored to the UI
        self._properties = [
            PropertyDescriptor(name="binary_field_name",
                               description="Avro field containing binary data",
                               default_value="binarydoc",
                               required=True,
                               validators=[StandardValidators.NON_EMPTY_VALIDATOR]),
            PropertyDescriptor(name="output_text_field_name",
                               description="Field to store  output text",
                               default_value="text",
                               required=True),
            PropertyDescriptor(name="operation_mode",
                               description="Decoding mode (e.g. base64 or raw)",
                               default_value="base64",
                               allowable_values=["base64", "raw"],
                               required=True),
            PropertyDescriptor(name="document_id_field_name",
                               description="Field name containing document ID",
                               default_value="id",),
            PropertyDescriptor(name="input_charset",
                               description="Input character set encoding",
                               default_value="utf-8",
                               required=True),
            PropertyDescriptor(name="output_charset",
                               description="Output character set encoding",
                               default_value="utf-8",
                               required=True),
            PropertyDescriptor(name="output_mode",
                               description="Output encoding mode (e.g. base64 or raw)",
                               default_value="base64",
                               required=True,
                               allowable_values=["base64", "raw"]),
            PropertyDescriptor(name="binary_field_source_encoding",
                               description="Binary field source encoding (e.g. base64 or raw)",
                               default_value="base64",
                               required=True,
                               allowable_values=["base64", "raw"]),
            PropertyDescriptor(name="blob_sequence_order_field_name",
                               description="Blob sequence order field name, \
                                  if the blob is split across multiple records",
                               required=False,
                               default_value="blob_sequence_num"),
            PropertyDescriptor(name="blob_sequence_order_resolve_duplicate_policy",
                               description="What to do when duplicate blob sequences are detected ? fail? continue going ?",
                               required=False,
                               default_value="fail",
                               allowable_values=["fail", "keep_first", "keep_last"]),
        ]

        self.descriptors: list[PropertyDescriptor] = self._properties

    def _load_json_records(self, input_raw_bytes: bytes | bytearray) -> list | dict:
        try:
            return json.loads(input_raw_bytes.decode())
        except json.JSONDecodeError as exc:
            self.logger.error(f"Error decoding JSON: {exc} \nAttempting to decode as {self.input_charset}")
            try:
                return json.loads(input_raw_bytes.decode(self.input_charset))
            except json.JSONDecodeError as exc2:
                self.logger.error(f"Error decoding JSON: {exc2} \nAttempting to decode as windows-1252")
                try:
                    return json.loads(input_raw_bytes.decode("windows-1252"))
                except json.JSONDecodeError as exc3:
                    raise ValueError(
                        "Error decoding JSON after trying utf-8, "
                        f"{self.input_charset}, and windows-1252: {exc3}"
                    ) from exc3

    @staticmethod
    def _strip_known_blob_wrappers(payload: bytes | bytearray) -> bytes:
        output = bytes(payload)
        for wrapper in (b"\nocf_blob\x00", b"ocf_blob\x00", b"ocr_blob\x00"):
            output = output.replace(wrapper, b"")
        return output

    def _extract_pdf_payload(self, payload: bytes | bytearray) -> bytes | None:
        cleaned_payload = self._strip_known_blob_wrappers(payload)
        pdf_start = cleaned_payload.find(b"%PDF-")
        if pdf_start == -1:
            return None

        pdf_end = cleaned_payload.rfind(b"%%EOF")
        if pdf_end == -1 or pdf_end < pdf_start:
            raise ValueError("Not a valid PDF stream - no %%EOF byte")

        return cleaned_payload[pdf_start:pdf_end + len(b"%%EOF")]

    def _extract_rtf_payload(self, payload: bytes | bytearray) -> bytes | None:
        cleaned_payload = self._strip_known_blob_wrappers(payload)
        rtf_start = cleaned_payload.find(b"{\\rtf")
        if rtf_start == -1:
            return None

        rtf_end = cleaned_payload.rfind(b"}")
        if rtf_end == -1 or rtf_end < rtf_start:
            raise ValueError("Invalid RTF stream in blob payload")

        return cleaned_payload[rtf_start:rtf_end + 1]

    def _try_extract_embedded_payload(
        self,
        payload: bytes | bytearray,
        payload_source_prefix: str,
        fail_on_invalid_stream: bool,
    ) -> tuple[bytes | None, str, str]:
        extraction_errors: list[str] = []

        try:
            pdf_payload = self._extract_pdf_payload(payload)
        except ValueError as exc:
            if fail_on_invalid_stream:
                raise
            extraction_errors.append(f"pdf: {exc}")
        else:
            if pdf_payload is not None:
                return pdf_payload, f"{payload_source_prefix}_pdf", ""

        try:
            rtf_payload = self._extract_rtf_payload(payload)
        except ValueError as exc:
            if fail_on_invalid_stream:
                raise
            extraction_errors.append(f"rtf: {exc}")
        else:
            if rtf_payload is not None:
                return rtf_payload, f"{payload_source_prefix}_rtf", ""

        return None, "", "; ".join(extraction_errors)

    @staticmethod
    def _decompress_cerner_lzw(payload: bytes | bytearray) -> bytes:
        decompress_blob = DecompressLzwCernerBlob()
        try:
            decompress_blob.decompress(bytearray(payload))
        except Exception as exc:
            raise ValueError(
                "Blob payload is not an embedded PDF/RTF stream and did not decode "
                "as a Cerner LZW stream"
            ) from exc

        output_payload = bytes(decompress_blob.output_stream)
        if not output_payload:
            raise ValueError("Cerner LZW decode produced an empty payload")

        return output_payload

    def process(self, context: ProcessContext, flowFile: JavaObject) -> FlowFileTransformResult:
        """
        Transforms the input FlowFile by decompressing Cerner blob data from JSON records.

        Args:
            context (ProcessContext): The process context containing processor properties.
            flowFile (JavaObject): The incoming FlowFile containing JSON records.

        Returns:
            FlowFileTransformResult: The result of the transformation, including updated attributes and contents.

        Raises:
            Exception: If any error occurs during processing or decompression.
        """

        output_contents: list = []
        attributes: dict = {k: str(v) for k, v in flowFile.getAttributes().items()}

        # read avro record
        input_raw_bytes: bytes | bytearray = flowFile.getContentsAsBytes()

        records: list | dict = self._load_json_records(input_raw_bytes)

        if not isinstance(records, list):
            records = [records]

        if not records:
            raise ValueError("No records found in JSON input")

        # sanity check:  blobs are from the same document_id
        doc_ids: set = {str(r.get(self.document_id_field_name, "")) for r in records}
        if len(doc_ids) > 1:
            raise ValueError(f"Multiple document IDs in one FlowFile: {list(doc_ids)}")

        concatenated_blob_sequence_order: dict = {}
        output_merged_record: dict = {}

        have_any_sequence: bool = any(self.blob_sequence_order_field_name in record for record in records)
        have_any_no_sequence: bool = any(self.blob_sequence_order_field_name not in record for record in records)

        if have_any_sequence and have_any_no_sequence:
            raise ValueError(
                f"Mixed records: some have '{self.blob_sequence_order_field_name}', some don't. "
                "Cannot safely reconstruct blob stream."
            )

        for record in records:
            if self.binary_field_name not in record or record[self.binary_field_name] in (None, ""):
                raise ValueError(f"Missing '{self.binary_field_name}' in a record")

            if have_any_sequence:
                seq = int(record[self.blob_sequence_order_field_name])
                if seq in concatenated_blob_sequence_order:
                    if self.blob_sequence_order_resolve_duplicate_policy == "keep_first":
                        self.logger.info(
                            f"Duplicate record found '{self.blob_sequence_order_field_name}': {seq} "
                            "| handling via 'keep_first' policy"
                        )
                    elif self.blob_sequence_order_resolve_duplicate_policy == "keep_last":
                        self.logger.info(
                            f"Duplicate record found '{self.blob_sequence_order_field_name}': {seq} "
                            "| handling via 'keep_last' policy"
                        )
                        concatenated_blob_sequence_order[seq] = record[self.binary_field_name]
                    else:
                        raise ValueError(f"Duplicate {self.blob_sequence_order_field_name}: {seq}")
                else:
                    concatenated_blob_sequence_order[seq] = record[self.binary_field_name]
            else:
                # no sequence anywhere: preserve record order (0..n-1)
                seq = len(concatenated_blob_sequence_order)
                concatenated_blob_sequence_order[seq] = record[self.binary_field_name]

        # take fields from the first record, doesn't matter which one,
        # as they are expected to be the same except for the binary data field
        # e.g: take fields like id, dates etc, non-binary/blob fields...

        for k, v in records[0].items():
            if k not in output_merged_record and k != self.binary_field_name:
                output_merged_record[k] = v

        full_compressed_blob = bytearray()

        # double check to make sure there is no gap in the blob sequence, i.e missing blob.
        order_of_blobs_keys = sorted(concatenated_blob_sequence_order.keys())
         
        for i in range(1, len(order_of_blobs_keys)):
            if order_of_blobs_keys[i] != order_of_blobs_keys[i-1] + 1:
                raise ValueError(
                    f"Sequence gap: missing {order_of_blobs_keys[i-1] + 1} "
                    f"(have {order_of_blobs_keys[i-1]} then {order_of_blobs_keys[i]})"
                )

        for k in order_of_blobs_keys:
            v = concatenated_blob_sequence_order[k]

            temporary_blob: bytes = b""

            if self.binary_field_source_encoding == "base64":
                if not isinstance(v, str):
                    raise ValueError(
                        f"Expected base64 string in {self.binary_field_name} for part {k}, got {type(v)}"
                    )
                try:
                    temporary_blob = base64.b64decode(v, validate=True)
                except Exception as exc:
                    raise ValueError(f"Error decoding base64 blob part {k}: {exc}") from exc
            else:
                # raw bytes path
                if isinstance(v, (bytes, bytearray)):
                    temporary_blob = v
                else:
                    raise ValueError(
                        f"Expected bytes in {self.binary_field_name} for part {k}, got {type(v)}"
                    )

            full_compressed_blob.extend(temporary_blob)

        # build / add new attributes to dict before doing anything else to have some trace.
        attributes["document_id_field_name"] = str(self.document_id_field_name)
        attributes["document_id"] = str(output_merged_record.get(self.document_id_field_name, ""))
        attributes["binary_field"] = str(self.binary_field_name)
        attributes["output_text_field_name"] = str(self.output_text_field_name)
        attributes["mime.type"] = "application/json"
        attributes["blob_parts"] = str(len(order_of_blobs_keys))
        attributes["blob_sequence"] = str(order_of_blobs_keys)
        attributes["blob_seq_min"] = str(order_of_blobs_keys[0]) if order_of_blobs_keys else ""
        attributes["blob_seq_max"] = str(order_of_blobs_keys[-1]) if order_of_blobs_keys else ""
        attributes["compressed_len"] = str(len(full_compressed_blob))
        attributes["compressed_head_hex"] = bytes(full_compressed_blob[:16]).hex()

        # If payload already contains an embedded PDF/RTF stream, extract it directly.
        # Otherwise run the Cerner LZW decompressor. Any error bubbles to transform(),
        # which handles routing to failure.
        output_bytes_decompressed: bytes | bytearray | None = None
        payload_source: str = ""
        is_lzw_compressed: bool = False

        output_bytes_decompressed, payload_source, extraction_error = self._try_extract_embedded_payload(
            full_compressed_blob,
            "embedded",
            fail_on_invalid_stream=False,
        )
        if extraction_error:
            attributes["embedded_payload_extract_error"] = extraction_error

        if output_bytes_decompressed is None:
            lzw_payload = self._decompress_cerner_lzw(full_compressed_blob)
            is_lzw_compressed = True
            attributes["decompressed_len"] = str(len(lzw_payload))
            attributes["decompressed_head_hex"] = lzw_payload[:16].hex()

            output_bytes_decompressed, payload_source, _ = self._try_extract_embedded_payload(
                lzw_payload,
                "cerner_lzw",
                fail_on_invalid_stream=True,
            )
            if output_bytes_decompressed is None:
                payload_source = "cerner_lzw"
                output_bytes_decompressed = lzw_payload

        if not output_bytes_decompressed:
            raise ValueError("Could not locate or decompress blob payload")

        attributes["blob_payload_source"] = payload_source
        attributes["is_lzw_compressed"] = str(is_lzw_compressed).lower()

        output_merged_record[self.binary_field_name] = bytes(output_bytes_decompressed)

        if self.output_mode == "base64":
            output_merged_record[self.binary_field_name] = \
                base64.b64encode(output_merged_record[self.binary_field_name]).decode(self.output_charset)

        output_contents.append(output_merged_record)

        return FlowFileTransformResult(relationship=self.REL_SUCCESS.name,
                                       attributes=attributes,
                                       contents=json.dumps(output_contents).encode("utf-8"))
