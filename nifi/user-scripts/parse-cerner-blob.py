import sys
from utils.cerner_blob import DecompressLzwCernerBlob

# This needs to be investigated, records might have different charsets,
#   currently only tested with "iso-8859-1"
#   other frequently used encodings: "utf-16le", "utf-16be"
# In some cases you will need to figure this out yourself, depending on
#   the data source
INPUT_CHARSET = "iso-8859-1"

# expected (optional)
OUTPUT_CHARSET = "windows-1252"

input_cerner_blob = str(sys.stdin.buffer.read(), INPUT_CHARSET).encode(INPUT_CHARSET)

for arg in sys.argv:
    _arg = arg.split("=", 1)

    if _arg[0] == "input_charset":
        INPUT_CHARSET = str(_arg[1]).lower()
    elif _arg[0] == "output_charset":
        OUTPUT_CHARSET = str(_arg[1]).lower()

decompress_blob = DecompressLzwCernerBlob()
decompress_blob.decompress(input_cerner_blob)

sys.stdout.write(decompress_blob.output_stream.decode(encoding=OUTPUT_CHARSET))
