import os
import random
import uuid

from reportlab.pdfgen import canvas

path = "../../../data/ingestion/2022/"

str_file_name = "ex1.pdf"
tmp_pdf_path = "./test_files/" + str_file_name

tmp_pdf = open(tmp_pdf_path, mode="rb").read()

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

            with open(os.path.join(day_dir_path, new_file_name_no_ext + ".pdf"), "wb") as file:
                file.write(tmp_pdf)

        with(open(os.path.join(day_dir_path, "metadata.csv"), "w+")) as csv_file:
            csv_file.write(metadata_csv)


def create_long_pdf_over_char_limit(file_path, text):
    c = canvas.Canvas(file_path)
    # Set font and size
    c.setFont("Helvetica", 12)

    # Set margin
    margin = 50
    width, height = c._pagesize

    # Split the text into lines
    lines = [text[i:i + 100] for i in range(0, len(text), 100)]  # Adjust line length as needed

    # Write lines to PDF
    y = height - margin
    for line in lines:
        c.drawString(margin, y, line)
        y -= 12 + 2  # Adjust spacing between lines as needed

    c.save()

# this is a string over the int limit (for testing the built in jackson XML parser)
over_char_text = "a" * 2147483647

#create_long_pdf_over_char_limit(path + "long_pdf.pdf", over_char_text)