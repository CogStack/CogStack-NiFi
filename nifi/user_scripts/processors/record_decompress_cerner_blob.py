import base64
import json
import os
import sys

try:
    from nifi.user_scripts.utils.codecs.cerner_blob import DecompressLzwCernerBlob
except ModuleNotFoundError:
    # Fallback for direct script execution when PYTHONPATH does not include repository root.
    script_dir = os.path.dirname(os.path.abspath(__file__))
    repo_root = os.path.abspath(os.path.join(script_dir, "..", "..", ".."))
    if repo_root not in sys.path:
        sys.path.insert(0, repo_root)
    from nifi.user_scripts.utils.codecs.cerner_blob import DecompressLzwCernerBlob

BINARY_FIELD_NAME = "binarydoc"
OUTPUT_TEXT_FIELD_NAME = "text"
DOCUMENT_ID_FIELD_NAME = "id"
INPUT_CHARSET = "utf-8"
OUTPUT_CHARSET = "utf-8"
OUTPUT_MODE = "base64"
BINARY_FIELD_SOURCE_ENCODING = "base64"
BLOB_SEQUENCE_ORDER_FIELD_NAME = "blob_sequence_num"
OPERATION_MODE = "base64"

for arg in sys.argv:
    _arg = arg.split("=", 1)
    if _arg[0] == "binary_field_name":
        BINARY_FIELD_NAME = _arg[1]
    elif _arg[0] == "output_text_field_name":
        OUTPUT_TEXT_FIELD_NAME = _arg[1]
    elif _arg[0] == "document_id_field_name":
        DOCUMENT_ID_FIELD_NAME = _arg[1]
    elif _arg[0] == "input_charset":
        INPUT_CHARSET = _arg[1]
    elif _arg[0] == "output_charset":
        OUTPUT_CHARSET = _arg[1]
    elif _arg[0] == "output_mode":
        OUTPUT_MODE = _arg[1]
    elif _arg[0] == "binary_field_source_encoding":
        BINARY_FIELD_SOURCE_ENCODING = _arg[1]
    elif _arg[0] == "blob_sequence_order_field_name":
        BLOB_SEQUENCE_ORDER_FIELD_NAME = _arg[1]
    elif _arg[0] == "operation_mode":
        OPERATION_MODE = _arg[1]


def load_json_records(input_raw_bytes):
    try:
        return json.loads(input_raw_bytes.decode())
    except (UnicodeDecodeError, json.JSONDecodeError):
        try:
            return json.loads(input_raw_bytes.decode(INPUT_CHARSET))
        except (UnicodeDecodeError, json.JSONDecodeError):
            try:
                return json.loads(input_raw_bytes.decode("windows-1252"))
            except (UnicodeDecodeError, json.JSONDecodeError) as exc:
                raise ValueError(
                    "Error decoding JSON after trying utf-8, "
                    + INPUT_CHARSET
                    + ", and windows-1252"
                ) from exc


def decode_blob_part(value, blob_part):
    if BINARY_FIELD_SOURCE_ENCODING == "base64":
        if not isinstance(value, str):
            raise ValueError(
                f"Expected base64 string in {BINARY_FIELD_NAME} for part {blob_part}, got {type(value)}"
            )

        try:
            return base64.b64decode(value, validate=True)
        except Exception as exc:
            raise ValueError(f"Error decoding base64 blob part {blob_part}: {exc}") from exc

    if isinstance(value, str):
        return value.encode(INPUT_CHARSET)

    if isinstance(value, list) and all(isinstance(v, int) and 0 <= v <= 255 for v in value):
        return bytes(value)

    if isinstance(value, (bytes, bytearray)):
        return bytes(value)

    raise ValueError(
        f"Expected bytes-like data in {BINARY_FIELD_NAME} for part {blob_part}, got {type(value)}"
    )


records = load_json_records(sys.stdin.buffer.read())

if isinstance(records, dict):
    records = [records]

if not records:
    raise ValueError("No records found in JSON input")

# keep the same sanity check as the extension: one flowfile should carry one document
doc_ids = {str(record.get(DOCUMENT_ID_FIELD_NAME, "")) for record in records}
if len(doc_ids) > 1:
    raise ValueError(f"Multiple document IDs in one FlowFile: {list(doc_ids)}")

concatenated_blob_sequence_order = {}
output_merged_record = {}

have_any_sequence = any(BLOB_SEQUENCE_ORDER_FIELD_NAME in record for record in records)
have_any_no_sequence = any(BLOB_SEQUENCE_ORDER_FIELD_NAME not in record for record in records)

if have_any_sequence and have_any_no_sequence:
    raise ValueError(
        f"Mixed records: some have '{BLOB_SEQUENCE_ORDER_FIELD_NAME}', some don't. "
        "Cannot safely reconstruct blob stream."
    )

for record in records:
    if BINARY_FIELD_NAME not in record or record[BINARY_FIELD_NAME] in (None, ""):
        raise ValueError(f"Missing '{BINARY_FIELD_NAME}' in a record")

    if have_any_sequence:
        sequence_number = int(record[BLOB_SEQUENCE_ORDER_FIELD_NAME])
        if sequence_number in concatenated_blob_sequence_order:
            raise ValueError(f"Duplicate {BLOB_SEQUENCE_ORDER_FIELD_NAME}: {sequence_number}")
        concatenated_blob_sequence_order[sequence_number] = record[BINARY_FIELD_NAME]
    else:
        sequence_number = len(concatenated_blob_sequence_order)
        concatenated_blob_sequence_order[sequence_number] = record[BINARY_FIELD_NAME]

# copy all non-binary fields from the first input record
for k, v in records[0].items():
    if k != BINARY_FIELD_NAME and k not in output_merged_record:
        output_merged_record[k] = v

full_compressed_blob = bytearray()
blob_sequence_keys = sorted(concatenated_blob_sequence_order.keys())

for i in range(1, len(blob_sequence_keys)):
    if blob_sequence_keys[i] != blob_sequence_keys[i - 1] + 1:
        raise ValueError(
            f"Sequence gap: missing {blob_sequence_keys[i - 1] + 1} "
            f"(have {blob_sequence_keys[i - 1]} then {blob_sequence_keys[i]})"
        )

for blob_part in blob_sequence_keys:
    full_compressed_blob.extend(
        decode_blob_part(concatenated_blob_sequence_order[blob_part], blob_part)
    )

decompress_blob = DecompressLzwCernerBlob()
decompress_blob.decompress(full_compressed_blob)
decompressed_blob = bytes(decompress_blob.output_stream)

if OUTPUT_MODE == "base64":
    output_merged_record[BINARY_FIELD_NAME] = base64.b64encode(decompressed_blob).decode(OUTPUT_CHARSET)
elif OUTPUT_MODE == "raw":
    output_merged_record[BINARY_FIELD_NAME] = decompressed_blob.decode(OUTPUT_CHARSET, errors="replace")
else:
    raise ValueError(f"Unsupported output_mode: {OUTPUT_MODE}")

sys.stdout.buffer.write(json.dumps([output_merged_record], ensure_ascii=False).encode("utf-8"))
