from medcat.utils.ner.deid import DeIdModel
import sys
import os
input_text = sys.stdin.read()

model_pack_path = os.environ.get("MODEL_PACK_PATH", "/opt/models/de_id_base.zip")

for arg in sys.argv:
    _arg = arg.split("=", 1)
    if _arg[0] == "model_pack_path":
        model_pack_path = _arg[1]

cat = DeIdModel.load_model_pack(model_pack_path)

anon_text = cat.deid_text(input_text, redact=True)

sys.stdout.write(anon_text)