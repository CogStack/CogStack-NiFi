import json

def chunk(input_list: list, num_slices: int):
    for i in range(0, len(input_list), num_slices):
        yield input_list[i:i + num_slices]

# function to convert a dictionary to json and write to file (d: dictionary, fn: string (filename))
def dict2json_file(input_dict: dict, file_name: str):
    # write the json file
    with open(file_name, 'w', encoding='utf-8') as outfile:
        json.dump(input_dict, outfile, ensure_ascii=False, indent=None, separators=(',',':'))