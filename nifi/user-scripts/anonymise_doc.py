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

# if there are issues with DE-ID model not working on certain long documents please play around with the character limit
# dependent on the tokenizer used
char_limit = 512

for arg in sys.argv:
    _arg = arg.split("=", 1)
    if _arg[0] == "model_pack_path":
        model_pack_path = _arg[1]
    if _arg[0] == "text_field_name":
        text_field_name = _arg[1]
    if _arg[0] == "nproc":
        nproc = _arg[1]
    if _arg[0] == "char_limit":
        char_limit = _arg[1]


records = json.loads(str(input_text))
final_records = []

cat = CAT.load_model_pack(model_pack_path)

for record in records:
    if text_field_name in record.keys():
        text_field = record[text_field_name]
        _anon_text = ""
        if len(text_field) > char_limit:
            sections = int(len(text_field_name) / char_limit)

            for i in range(sections):
                _tmp_text = text_field[i * char_limit: (i + 1) * char_limit]
                _anon_text += deid_text(cat, _tmp_text)
        else:
            _anon_text = deid_text(cat, text_field)
        record[text_field_name] = _anon_text
        final_records.append(record)
    else:
        final_records.append(record)

sys.stdout.write(json.dumps(final_records))