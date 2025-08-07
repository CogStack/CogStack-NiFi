import rancoord as rc
import os
import json
import sys
import traceback
from random import randrange

global LOCATIONS
global NIFI_USER_SCRIPT_LOGS_DIR
global SUBJECT_ID_FIELD_NAME
global LOCATION_NAME_FIELD

global output_stream

LOG_FILE_NAME = "location_gen.log"
LOCATION_NAME_FIELD = "gen_location"

for arg in sys.argv:
    _arg = arg.split("=", 1)
    if _arg[0] == "locations":
        LOCATIONS = _arg[1] 
    elif _arg[0] == "user_script_logs_dir":
        NIFI_USER_SCRIPT_LOGS_DIR = _arg[1]
    elif _arg[0] == "subject_id_field":
        SUBJECT_ID_FIELD_NAME = _arg[1]
    elif _arg[0] == "location_name_field":
        LOCATION_NAME_FIELD = _arg[1]


# generates a map polygon based on city names given
def poly_creator(city: str):
    box = rc.nominatim_geocoder(city)
    poly = rc.polygon_from_boundingbox(box)
    return poly


def main():
    input_stream = sys.stdin.read()

    try:
        log_file_path = os.path.join(NIFI_USER_SCRIPT_LOGS_DIR, str(LOG_FILE_NAME))
        patients = json.loads(input_stream)

        locations = [poly_creator(location) for location in LOCATIONS.split(",")]

        output_stream = []
        for patient in patients:
            to_append = {}

            id = patient["_source"][SUBJECT_ID_FIELD_NAME]
            idx = randrange(len(locations)) # pick a random location specified
            lat, lon, _ = rc.coordinates_randomizer(polygon = locations[idx], num_locations = 1) # generate latitude and longitude

            to_append[SUBJECT_ID_FIELD_NAME] = id
            to_append[LOCATION_NAME_FIELD] = "POINT (" + str(lon[0]) + " " + str(lat[0]) + ")"
            output_stream.append(to_append)
    except Exception as exception:
        if os.path.exists(log_file_path):
            with open(log_file_path, "a+") as log_file:
                log_file.write("\n" + str(traceback.print_exc()))
        else:
            with open(log_file_path, "a+") as log_file:
                log_file.write("\n" + str(traceback.print_exc()))
    finally:
        return output_stream


sys.stdout.write(json.dumps(main()))
