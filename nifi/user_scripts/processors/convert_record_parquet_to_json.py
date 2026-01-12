import io
import json
import sys
import traceback
from logging import Logger

from pyarrow import parquet

from nifi.user_scripts.utils.generic import get_logger
from nifi.user_scripts.utils.serialization.parquet_json_data_types_converter import (
    parquet_json_data_type_convert,
)

logger: Logger = get_logger(__name__)
input_byte_buffer: io.BytesIO =  io.BytesIO(sys.stdin.buffer.read())

output_buffer = sys.stdout.buffer

try:
    parquet_file = parquet.ParquetFile(input_byte_buffer)

    for batch in parquet_file.iter_batches(batch_size=10000):
        for record in batch.to_pylist(): 
            output_buffer.write(json.dumps(
                record,
                ensure_ascii=False,
                separators=(",", ":"),
                default=parquet_json_data_type_convert
            ).encode("utf-8"))
            output_buffer.write(b"\n")


except Exception as exception:
    logger.error("Exception during Parquet file processing: " + traceback.format_exc())
    raise exception

finally:
    input_byte_buffer.close()
    output_buffer.close()
