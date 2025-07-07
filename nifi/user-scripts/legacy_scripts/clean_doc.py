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


# removes any PII from the text field

for i in range(len(records)):
    if TEXT_FIELD_NAME in records[i].keys():
        clean_text = records[i][TEXT_FIELD_NAME]
        clean_text = regex.sub(r"Age:\s?\d\d?y?(?:ears)?/i", "", clean_text)
        clean_text = regex.sub(r"\d\d\d?F|M/i", "", clean_text)
        clean_text = regex.sub(r"RFH|CFH|BA|Barnet|BARNET", "", clean_text)
        clean_text = regex.sub(r"IMT|CST|AHP|CNS", "", clean_text)
        clean_text = regex.sub(r"GMC:\s*\d{7}", "", clean_text)
        clean_text = regex.sub(r"MCIRL:\s*\d{6}", "", clean_text)
        clean_text = regex.sub(r"NHS\s*Number:\s*\d{3}\s*\d{3}\s*\d{4}", "", clean_text)
        clean_text = regex.sub(r"(https?:\/\/)?www\.royalfree\.nhs\.uk[^\s]*", "", clean_text)
        clean_text = regex.sub(r"UCLH|UCH|NMUH|BGH|NUH", "", clean_text)

        records[i][TEXT_FIELD_NAME] = clean_text

sys.stdout.write(json.dumps(records))
