import json
import os
import sys
import uuid
from datetime import datetime as time

import avro
from avro.datafile import DataFileWriter
from avro.io import DatumWriter

log_file_path = "/opt/nifi/user-scripts/logs/parse_json/parse-json-to-avro_file_"

time = str(time.now().timestamp())

input_stream = sys.stdin.read()
records_stream = None

try:
    records_stream = json.loads(input_stream)
except Exception:
    _log_file_path = log_file_path + time + ".log"
    with open(_log_file_path, "a+") as log_file:
        log_file.write(input_stream)


schema = {
  "type": "record",
  "name": "inferAvro",
  "namespace":"org.apache.nifi",
  "fields": []
}

fields = list(records_stream[0].keys())

for field_name in fields:
    schema["fields"].append({"name": field_name, "type": ["null", {"type": "long", "logicalType": "timestamp-millis"}, "string"]})

avro_schema = avro.schema.parse(json.dumps(schema))

file_id = str(uuid.uuid4().hex) 

tmp_file_path = os.path.join("/opt/nifi/user-scripts/tmp/" + file_id + ".avro")

with open(tmp_file_path, mode="wb+") as tmp_file:
    writer = DataFileWriter(tmp_file, DatumWriter(), avro_schema)

    for _record in records_stream:
        writer.append(_record)

    writer.close()

tmp_file = open(tmp_file_path, "rb")

tmp_file_data = tmp_file.read()

tmp_file.close()

# delete file temporarly created above
if os.path.isfile(tmp_file_path):
    os.remove(tmp_file_path)

sys.stdout.buffer.write(tmp_file_data)
