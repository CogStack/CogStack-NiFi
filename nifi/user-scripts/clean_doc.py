import regex
import sys
import json

records = json.loads(sys.stdin.read())

TEXT_FIELD_NAME = "text"

for arg in sys.argv:
    _arg = arg.split("=", 1)
    if _arg[0] == "text_field_name":
        TEXT_FIELD_NAME = _arg[1]

if isinstance(records, dict):
    records = [records]

for i in range(len(records)):
    if TEXT_FIELD_NAME in records[i].keys():
        clean_text = records[i][TEXT_FIELD_NAME]
        clean_text = regex.sub(r"Age:\s?\d\d?y?(?:ears)?/i", "", clean_text)
        clean_text = regex.sub(r"\d\d\d?F|M/i", "", clean_text)
        clean_text = regex.sub(r"RFH|CFH|BA|Barnet|BARNET", "", clean_text)
        clean_text = regex.sub(r"IMT|CST|AHP|CNS", "", clean_text)
        clean_text = regex.sub(r"\bGMC:\s*\d{7}\b", "", clean_text)
        clean_text = regex.sub(r"\bMCIRL:\s*\d{6}\b", "", clean_text)
        clean_text = regex.sub(r"\bNHS\s*Number:\s*\d{3}\s*\d{3}\s*\d{4}\b", "", clean_text)
        clean_text = regex.sub(r"\b(https?:\/\/)?www\.royalfree\.nhs\.uk[^\s]*\b", "", clean_text)
        clean_text = regex.sub(r"UCLH|UCH|NMUH|BGH|NUH", "", clean_text)

        records[i][TEXT_FIELD_NAME] = clean_text

sys.stdout.buffer.write(records)
