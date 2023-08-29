import sys
import os
import uuid
import random

path = "../../../data/ingestion/2022/"

str_file_name = "ex1.pdf"
tmp_pdf_path = "./test_files/" + str_file_name

tmp_pdf = open(tmp_pdf_path, "r+", encoding="utf-8", errors="ignore").read()

csv_header = "file_name_id_no_ext|file_ext"

for i in range(1,13):
    month_path = "0" + str(i) if i < 10 else str(i)

    for j in range(1,32):
        day_path = "0" + str(j) if j < 10 else str(j)

        day_dir_path = os.path.join(path, month_path,str(day_path))
        os.makedirs(day_dir_path, exist_ok=True)

        metadata_csv = csv_header
        for file_counter in range(0, random.randint(2, 5)):
            uid = str(uuid.uuid4().hex)
            new_file_name_no_ext = str_file_name + "_" + uid
            metadata_csv += "\n" + new_file_name_no_ext + "|pdf"

            with open(os.path.join(day_dir_path, new_file_name_no_ext + ".pdf"), "w+") as file:
                file.write(tmp_pdf)

        with(open(os.path.join(day_dir_path, "metadata.csv"), "w+")) as csv_file:
            csv_file.write(metadata_csv)
