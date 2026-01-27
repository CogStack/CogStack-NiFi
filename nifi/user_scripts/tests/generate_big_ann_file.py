import json

f_path = "../../../data/cogstack-cohort/medical_reports_anns_medcat_medmen__*.json"


def chunk(input_list: list, num_slices: int):
    for i in range(0, len(input_list), num_slices):
        yield input_list[i:i + num_slices]


contents = None

add_records = 400000

first_annotation = contents[0]

for i in range(add_records):
    contents.append(first_annotation)

export_path = "../../../data/medical_reports_anns_medcat_medmen__test_big.json"

with open(export_path, mode="w+") as f:
    f.write(json.dumps(contents))
