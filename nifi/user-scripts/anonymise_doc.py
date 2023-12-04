from medcat.utils.ner import deid_text
import sys
import os
import json

from medcat.cat import CAT

def special_deid(cat, text, record):
    return record, deid_text(cat, text)

input_text = sys.stdin.read()

model_pack_path = os.environ.get("MODEL_PACK_PATH", "/opt/models/de_id_base.zip")
text_field_name = "document"
nproc = 100

for arg in sys.argv:
    _arg = arg.split("=", 1)
    if _arg[0] == "model_pack_path":
        model_pack_path = _arg[1]
    if _arg[0] == "text_field_name":
        text_field_name = _arg[1]
    if _arg[0] == "nproc":
        nproc = _arg[1]


records = json.loads(str(input_text))
final_records = []

cat = CAT.load_model_pack(model_pack_path)

for record in records:
    if text_field_name in record.keys():
        _anon_text = deid_text(cat, record[text_field_name])
        record[text_field_name] = _anon_text
        final_records.append(record)
    else:
        final_records.append(record)

sys.stdout.write(json.dumps(final_records))