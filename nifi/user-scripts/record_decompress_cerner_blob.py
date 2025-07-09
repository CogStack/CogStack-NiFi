import sys
import json
import base64
from utils.cerner_blob import DecompressLzwCernerBlob


""" This script decompresses Cerner LZW compressed blobs from a JSON input stream.
    It expects a JSON array of records, each containing a field with the binary data.
    All RECORDS are expected to have the same fields, and presumably belonging to the same DOCUMENT.
    All the fields of these records should have the same field values, except for the binary data field.
    The binary data field is expected to be a base64 encoded string, which will be concatenated according to 
    the blob_sequence_order_field_name field, preserving the order of the blobs and composing the whole document (supposedly).
    The final base64 enncoded string will be decoded back to binary data, then decompressed using LZW algorithm.
"""

# This needs to be investigated, records might have different charsets,
#   currently only tested with "iso-8859-1"
#   other frequently used encodings: "utf-16le", "utf-16be"
# In some cases you will need to figure this out yourself, depending on
#   the data source
INPUT_CHARSET = "iso-8859-1"

# expected (optional)
OUTPUT_CHARSET = "windows-1252"

# possible values:
#   - base64: output base64 code
#   - string: output string after decompression 
OUTPUT_MODE = "base64"

BINARY_FIELD_NAME = "binary_data"

BINARY_FIELD_SOURCE_ENCODING = "base64"

BLOB_SEQUENCE_ORDER_FIELD_NAME = "blob_sequence_num"

for arg in sys.argv:
    _arg = arg.split("=", 1)
    if _arg[0] == "output_mode":
        OUTPUT_MODE = _arg[1]
    elif _arg[0] == "input_charset":
        INPUT_CHARSET = _arg[1]
    elif _arg[0] == "output_charset":
        OUTPUT_CHARSET = _arg[1]
    elif _arg[0] == "log_file_name":
        LOG_FILE_NAME = _arg[1]
    elif _arg[0] == "binary_field_name":
        BINARY_FIELD_NAME = _arg[1]
    elif _arg[0] == "binary_field_source_encoding":
        BINARY_FIELD_SOURCE_ENCODING = _arg[1]
    elif _arg[0] == "blob_sequence_order_field_name":
        BLOB_SEQUENCE_ORDER_FIELD_NAME = _arg[1]

records = json.loads(sys.stdin.read())

if not isinstance(records, list):
    records = [records]

concatenated_blob_sequence_order = {}

output_merged_record = {}

for record in records:
    if BLOB_SEQUENCE_ORDER_FIELD_NAME in record.keys():
        concatenated_blob_sequence_order[int(record[BLOB_SEQUENCE_ORDER_FIELD_NAME])] = record[BINARY_FIELD_NAME]


# take fields from the first record, doesn't matter which one,
# as they are expected to be the same except for the binary data field
for k, v in records[0].items():
    if k not in output_merged_record.keys() and k != BINARY_FIELD_NAME:
        output_merged_record[k] = v

del records

concatenated_blob_sequence_order = sorted(concatenated_blob_sequence_order.items())

output_merged_record[BINARY_FIELD_NAME] = bytearray()
for i in concatenated_blob_sequence_order:

    test = "fawfa"
    try:
        output_merged_record[BINARY_FIELD_NAME] = base64.b64decode(i[1])
        input_cerner_blob = str(output_merged_record[BINARY_FIELD_NAME], INPUT_CHARSET).encode(INPUT_CHARSET)

        decompress_blob = DecompressLzwCernerBlob()
        decompress_blob.decompress(input_cerner_blob) # type: ignore
        output_merged_record[BINARY_FIELD_NAME].extend(bytes(decompress_blob.output_stream))
    except Exception as exception:
        pass

del concatenated_blob_sequence_order

if OUTPUT_MODE == "base64":
    output_merged_record[BINARY_FIELD_NAME] = base64.b64encode(output_merged_record[BINARY_FIELD_NAME]).decode(OUTPUT_CHARSET)

sys.stdout.write(json.dumps(output_merged_record))
