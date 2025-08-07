import sys
import json
import re

records = json.loads(sys.stdin.read())

TEXT_FIELD_NAME = "text"

for arg in sys.argv:
    _arg = arg.split("=", 1)
    if _arg[0] == "text_field_name":
        TEXT_FIELD_NAME = _arg[1]

if isinstance(records, dict):
    records = [records]

# List of substitutions as (pattern, replacement)
PII_PATTERNS = [
    (r"PEf", "ABCD100"),
    (r"\d\d\d?F|M", ""),  # case-insensitive matching below
    (r"RFH|CFH|BA|Barnet|BARNET", ""),
    (r"IMT|CST|AHP|CNS", ""),
    (r"GMC:\s*\d{7}", ""),
    (r"MCIRL:\s*\d{6}", ""),
    (r"NHS\s*Number:\s*\d{3}\s*\d{3}\s*\d{4}", ""),
    (r"(https?:\/\/)?www\.royalfree\.nhs\.uk[^\s]*", ""),
    (r"UCLH|UCH|NMUH|BGH|NUH", "")
]

# removes any PII from the text field
for i in range(len(records)):
    if TEXT_FIELD_NAME in records[i].keys():
        clean_text = records[i][TEXT_FIELD_NAME]
        for pattern, repl in PII_PATTERNS:
            clean_text = re.sub(pattern, repl, clean_text, flags=re.IGNORECASE)
        records[i][TEXT_FIELD_NAME] = clean_text

# Output cleaned JSON as UTF-8
sys.stdout.buffer.write(json.dumps(records, ensure_ascii=False).encode("utf-8"))
