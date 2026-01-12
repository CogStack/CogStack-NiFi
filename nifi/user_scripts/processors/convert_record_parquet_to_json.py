import io
import json
import sys
import traceback
from logging import Logger

from pyarrow import parquet
from nifi.user_python_extensions.convert_record_parquet_to_json import parquet_json_data_type_convert
from utils.generic import get_logger

logger: Logger = get_logger(__name__)
input_byte_buffer: io.BytesIO =  io.BytesIO(sys.stdin.buffer.read())

record_count: int = 0
error_record_count: int = 0

output_buffer: io.BytesIO = io.BytesIO()

try:
    parquet_file = parquet.ParquetFile(input_byte_buffer)

    for batch in parquet_file.iter_batches(batch_size=10000):
        records: list[dict] = batch.to_pylist()

        for record in records:
            json_record = json.dumps(
                record,
                ensure_ascii=False,
                separators=(",", ":"),
                default=parquet_json_data_type_convert
            )

except Exception as exception:
    


    #for batch in parquet_file.iter_batches(batch_size=10000):
    #    table = pyarrow.Table.from_batches([batch])
    #    json_str = table.to_pydict()
    #    records.extend(parquet_json_data_type_convert(json_str))
#
#
    #for batch in parquet_file.iter_batches(batch_size=10000):
    #    records: list[dict] = batch.to_pylist()
#
    #    for record in records:
    #        json_record = json.dumps(
    #            record,
    #            ensure_ascii=False,
    #            separators=(",", ":"),
    #            default=parquet_json_data_type_convert,
    #        )
#
    #        output_buffer.write(json_record.encode("utf-8"))
    #        output_buffer.write(b"\n")
    #    record_count += len(records)


# Output cleaned JSON as UTF-8
sys.stdout.buffer.write(json.dumps(records, ensure_ascii=False).encode("utf-8"))
