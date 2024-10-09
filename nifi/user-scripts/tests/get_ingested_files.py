import json
file_path = "../logs/processed_*.log"

json_dict = json.load(open(file_path)) 

x = 0
for i in json_dict.keys():
    x += len(json_dict[i])
    print(i, len(json_dict[i]))
