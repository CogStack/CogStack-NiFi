import json
import os

def chunk(input_list: list, num_slices: int):
    for i in range(0, len(input_list), num_slices):
        yield input_list[i:i + num_slices]

# function to convert a dictionary to json and write to file (d: dictionary, fn: string (filename))
def dict2json_file(input_dict: dict, file_path: str):
    # write the json file
    with open(file_path, "a+", encoding="utf-8") as outfile:
        json.dump(input_dict, outfile, ensure_ascii=False, indent=None, separators=(",", ":"))

def dict2json_truncate_add_to_file(input_dict: dict, file_path: str):

    if os.path.exists(file_path):
        with open(file_path, "a+") as outfile:
            outfile.seek(outfile.tell() - 1, os.SEEK_SET)
            outfile.truncate()
            outfile.write(",")
            json_string = json.dumps(input_dict, separators=(",", ":"))
            json_string = json_string[1:]

            outfile.write(json_string)
    else:
        dict2json_file(input_dict, file_path)
