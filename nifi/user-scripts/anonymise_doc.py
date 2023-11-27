from medcat.utils.ner.deid import DeIdModel
import sys

input_text = sys.stdin.read()

model_pack_path = "/opt/models/de_id_base.zip"

cat = DeIdModel.load_model_pack(model_pack_path)

anon_text = cat.deid_text(input_text, redact=True)

sys.stdout.write(anon_text)