# tested with medcat==1.5.3

import ast
import json
import os
import sys

from medcat.cat import CAT
from medcat.utils.ner import deid_text

input_text = sys.stdin.read()

MODEL_PACK_PATH = os.environ.get("MODEL_PACK_PATH", "/opt/models/de_id_base.zip")

TEXT_FIELD_NAME = "document"
NPROC = 100

# if there are issues with DE-ID model not working on certain long documents please play around with the character limit
# dependent on the tokenizer used
CHAR_LIMIT = 512

REDACT = True

for arg in sys.argv:
    _arg = arg.split("=", 1)
    if _arg[0] == "model_pack_path":
        MODEL_PACK_PATH = _arg[1]
    if _arg[0] == "text_field_name":
        TEXT_FIELD_NAME = _arg[1]
    if _arg[0] == "nproc":
        NPROC = _arg[1]
    if _arg[0] == "char_limit":
        CHAR_LIMIT = int(_arg[1])
    if _arg[0] == "redact":
        REDACT = ast.literal_eval(_arg[1])

records = json.loads(str(input_text))
final_records = []

cat = CAT.load_model_pack(MODEL_PACK_PATH)

for record in records:
    if TEXT_FIELD_NAME in record.keys():
        text_field = record[TEXT_FIELD_NAME]
        _anon_text = ""
        if len(text_field) > CHAR_LIMIT:
            sections = int(len(text_field) / CHAR_LIMIT)

            for i in range(0, sections):
                _tmp_text = text_field[i * CHAR_LIMIT:(i + 1) * CHAR_LIMIT]
                _anon_text += deid_text(cat, _tmp_text, redact=REDACT)
        else:
            _anon_text = deid_text(cat, text_field, redact=REDACT)
        record[TEXT_FIELD_NAME] = _anon_text
        final_records.append(record)
    else:
        final_records.append(record)

sys.stdout.write(json.dumps(final_records))