import json
import sys
import logging
from datetime import datetime, timezone
import os
import traceback
import multiprocess
from multiprocess import Pool, Queue
from collections import defaultdict, Counter
from utils.ethnicity_map import ethnicity_map
from utils.generic import chunk, dict2jsonl_file, dict2json_file

# default values from /deploy/nifi.env
NIFI_USER_SCRIPT_LOGS_DIR = os.getenv("NIFI_USER_SCRIPT_LOGS_DIR", "")

LOG_FILE_NAME = "cohort_export.log"
log_file_path = os.path.join(NIFI_USER_SCRIPT_LOGS_DIR, str(LOG_FILE_NAME))


ANNOTATION_DOCUMENT_ID_FIELD_NAME = "meta.docid"
DOCUMENT_ID_FIELD_NAME = "docid"

PATIENT_ID_FIELD_NAME = "patient"
PATIENT_ETHNICITY_FIELD_NAME = "ethnicity"
PATIENT_GENDER_FIELD_NAME = "gender"
PATIENT_BIRTH_DATE_FIELD_NAME = "birthdate"
PATIENT_DEATH_DATE_FIELD_NAME = "deathdate"
PATIENT_DEATH_DATE_BACKUP_FIELD_NAME = ""

OUTPUT_FOLDER_PATH = os.path.join(os.getenv("NIFI_DATA_PATH", "/opt/data/"), "cogstack-cohort")

# this is a json exported by NiFi to some path in the NIFI_DATA_PATH
INPUT_PATIENT_RECORDS_PATH = ""
INPUT_ANNOTATIONS_RECORDS_PATH = ""

DATE_TIME_FORMAT = "%Y-%m-%d"

TIMEOUT = 360

CPU_THREADS = int(os.getenv("CPU_THREADS", int(multiprocess.cpu_count() / 2)))

INPUT_FOLDER_PATH = ""

# json file(s) containing annotations exported by NiFi, the input format is expected to be one provided
# by MedCAT Service which was stored in an Elasticsearch index
INPUT_PATIENT_RECORD_FILE_NAME_PATTERN = ""
INPUT_ANNOTATIONS_RECORDS_FILE_NAME_PATTERN = ""

EXPORT_ONLY_PATIENT_RECORDS = "false"

# if this is enabled, the maximum patient age will be somewhere between 90 and 99 IF there is no DATE OF DEATH available
# calculated as: current_year - patient_year_of_birth, if > 100, patient_age = rand(90,99)
ENABLE_PATIENT_AGE_LIMIT = "false"

for arg in sys.argv:
    _arg = arg.split("=", 1)
    if _arg[0] == "annotation_document_id_field_name":
        ANNOTATION_DOCUMENT_ID_FIELD_NAME = _arg[1]
    if _arg[0] == "date_time_format":
        DATE_TIME_FORMAT = _arg[1]
    if _arg[0] == "patient_id_field_name":
        PATIENT_ID_FIELD_NAME = _arg[1]
    if _arg[0] == "patient_ethnicity_field_name":
        PATIENT_ETHNICITY_FIELD_NAME = _arg[1]
    if _arg[0] == "patient_birth_date_field_name":
        PATIENT_BIRTH_DATE_FIELD_NAME = _arg[1]
    if _arg[0] == "patient_death_date_field_name":
        PATIENT_DEATH_DATE_FIELD_NAME = _arg[1]
    if _arg[0] == "patient_death_date_backup_field_name":
        PATIENT_DEATH_DATE_BACKUP_FIELD_NAME = _arg[1]
    if _arg[0] == "patient_gender_field_name":
        PATIENT_GENDER_FIELD_NAME = _arg[1]
    if _arg[0] == "document_id_field_name":
        DOCUMENT_ID_FIELD_NAME  = _arg[1]
    if _arg[0] == "cpu_threads":
        CPU_THREADS = int(_arg[1])
    if _arg[0] == "timeout":
        TIMEOUT = int(_arg[1])
    if _arg[0] == "output_folder_path":
        OUTPUT_FOLDER_PATH = _arg[1]
    if _arg[0] == "input_folder_path":
        INPUT_FOLDER_PATH = _arg[1]
    if _arg[0] == "input_patient_record_file_name_pattern":
        INPUT_PATIENT_RECORD_FILE_NAME_PATTERN = _arg[1]
    if _arg[0] == "input_annotations_records_file_name_pattern":
        INPUT_ANNOTATIONS_RECORDS_FILE_NAME_PATTERN = _arg[1]
    if _arg[0] == "enable_patient_age_limit":
        ENABLE_PATIENT_AGE_LIMIT = str(_arg[1]).lower()


def _process_patient_records(patient_records: list):
    _ptt2sex, _ptt2eth, _ptt2dob, _ptt2age, _ptt2dod, _doc2ptt = {}, {}, {}, {}, {}, {}

    for patient_record in patient_records:
        if PATIENT_ID_FIELD_NAME in patient_record.keys():
            try:
                _ethnicity = str(patient_record[PATIENT_ETHNICITY_FIELD_NAME]).lower().replace("-", " ").replace("_", " ") if PATIENT_ETHNICITY_FIELD_NAME in patient_record.keys() else "other"

                _PATIENT_ID = str(patient_record[PATIENT_ID_FIELD_NAME]).replace("\"", "").replace("\'", "").strip()

                if _ethnicity in ethnicity_map.keys():
                    _ptt2eth[_PATIENT_ID] = ethnicity_map[_ethnicity].title()
                else:
                    _ptt2eth[_PATIENT_ID] = _ethnicity.title()

                # based on: https://www.datadictionary.nhs.uk/attributes/person_gender_code.html    
                _tmp_gender = str(patient_record[PATIENT_GENDER_FIELD_NAME]).lower() if PATIENT_GENDER_FIELD_NAME in patient_record.keys() else "Unknown"
                if _tmp_gender in ["male", "1", "m"]:
                    _tmp_gender = "Male"
                elif _tmp_gender in ["female", "2", "f"]:
                    _tmp_gender = "Female"
                else:
                    _tmp_gender = "Unknown"

                _ptt2sex[_PATIENT_ID] = _tmp_gender

                dob = patient_record[PATIENT_BIRTH_DATE_FIELD_NAME] if PATIENT_BIRTH_DATE_FIELD_NAME in patient_record.keys() else 0
                dod = patient_record[PATIENT_DEATH_DATE_FIELD_NAME] if PATIENT_DEATH_DATE_FIELD_NAME in patient_record.keys() else \
                    patient_record[PATIENT_DEATH_DATE_BACKUP_FIELD_NAME] if PATIENT_DEATH_DATE_BACKUP_FIELD_NAME in patient_record.keys() else 0

                if dob in [None, "", "null"]:
                    dob = 0
                if dod in [None, "", "null"]:
                    dod = 0

                patient_age = 0

                if isinstance(dob, int):
                    dob = datetime.fromtimestamp(dob / 1000, tz=timezone.utc)
                elif isinstance(dob, str):
                    dob = datetime.strptime(str(dob), DATE_TIME_FORMAT)

                if dod not in [None, "null", 0]:
                    if isinstance(dod, int):
                        dod = datetime.fromtimestamp(dod / 1000, tz=timezone.utc)
                    elif isinstance(dod, str):
                        dod = datetime.strptime(str(dod), DATE_TIME_FORMAT)

                    patient_age = abs(dod.year - dob.year)
                else:
                    patient_age = abs(datetime.now().year - dob.year)
                    if patient_age >= 100 and ENABLE_PATIENT_AGE_LIMIT == "true":
                        dod = datetime.now(tz=timezone.utc)
                        patient_age = -1

                # convert to ints
                dod = int(dod.strftime("%Y%m%d%H%M%S")) if dod not in [0, None, "null"] else 0
                dob = int(dob.strftime("%Y%m%d%H%M%S")) if dob not in [0, None, "null"] else 0

                # change records
                _ptt2dod[_PATIENT_ID] = dod
                _ptt2dob[_PATIENT_ID] = dob
                _ptt2age[_PATIENT_ID] = patient_age

                _derived_document_id_field_from_ann = ANNOTATION_DOCUMENT_ID_FIELD_NAME.removeprefix("meta.")
                if DOCUMENT_ID_FIELD_NAME in patient_record.keys():
                    docid = patient_record[DOCUMENT_ID_FIELD_NAME]
                else:
                    docid = _derived_document_id_field_from_ann

                _doc2ptt[docid] = _PATIENT_ID
            except ValueError:
                continue

    return _ptt2sex, _ptt2eth, _ptt2dob, _ptt2age, _ptt2dod, _doc2ptt 


def _process_annotation_records(annotation_records: list):

    _cui2ptt_pos = defaultdict(Counter)
    _cui2ptt_tsp = defaultdict(lambda: defaultdict(int))

    try:

        # for each part of the MedCAT output (e.g., part_0.pickle)
        for annotation_record in annotation_records:
            annotation_entity = annotation_record   
            if "_source" in annotation_record.keys():
                annotation_entity = annotation_record["_source"]
            docid = annotation_entity[ANNOTATION_DOCUMENT_ID_FIELD_NAME]

            if str(docid) in global_doc2ptt.keys():
                patient_id = global_doc2ptt[str(docid)]
                cui = annotation_entity["nlp.cui"]

                if annotation_entity["nlp.meta_anns"]["Subject"]["value"] == "Patient" and \
                    annotation_entity["nlp.meta_anns"]["Presence"]["value"] == "True" and \
                        annotation_entity["nlp.meta_anns"]["Time"]["value"] != "Future":

                    _cui2ptt_pos[cui][patient_id] += 1

                    if "timestamp" in annotation_entity.keys():
                        time = int(round(datetime.fromisoformat(annotation_entity["timestamp"]).timestamp()))

                        if _cui2ptt_tsp[cui][patient_id] == 0 or time < _cui2ptt_tsp[cui][patient_id]:
                            _cui2ptt_tsp[cui][patient_id] = time
    except Exception:
        raise Exception("exception generated by process_annotation_records: " + str(traceback.format_exc()))

    return _cui2ptt_pos, _cui2ptt_tsp


def multiprocess_patient_records(input_patient_record_data: dict):

    # ptt2sex.json a dictionary for gender of each patient {<patient_id>:<gender>, ...}
    ptt2sex = {}
    # ptt2eth.json a dictionary for ethnicity of each patient {<patient_id>:<ethnicity>, ...}
    ptt2eth = {}
    # ptt2dob.json a dictionary for date of birth of each patient {<patient_id>:<dob>, ...}
    ptt2dob = {}
    # ptt2age.json a dictionary for age of each patient {<patient_id>:<age>, ...}
    ptt2age = {}
    # ptt2dod.json a dictionary for dod if the patient has died {<patient_id>:<dod>, ...}
    ptt2dod = {}

    # doc2ptt is a dictionary {<doc_id> : <patient_id>, ...}
    doc2ptt = {}

    patient_process_pool_results = []

    with Pool(processes=CPU_THREADS) as patient_process_pool:
        rec_que = Queue()

        record_chunks = list(chunk(input_patient_record_data, int(len(input_patient_record_data) / CPU_THREADS)))

        counter = 0
        for record_chunk in record_chunks:
            rec_que.put(record_chunk)
            patient_process_pool_results.append(patient_process_pool.starmap_async(_process_patient_records, [(rec_que.get(),)], error_callback=logging.error))
            counter += 1

        for result in patient_process_pool_results:
            try:
                result_data = result.get(timeout=TIMEOUT)
                _ptt2sex, _ptt2eth, _ptt2dob, _ptt2age, _ptt2dod, _doc2ptt = result_data[0][0], result_data[0][1], result_data[0][2], result_data[0][3], result_data[0][4], result_data[0][5]

                ptt2sex.update(_ptt2sex)
                ptt2eth.update(_ptt2eth)
                ptt2dob.update(_ptt2dob)
                ptt2age.update(_ptt2age)
                ptt2dod.update(_ptt2dod)
                doc2ptt.update(_doc2ptt)

            except Exception as exception:
                time = datetime.now()
                with open(log_file_path, "a+") as log_file:
                    log_file.write("\n" + str(time) + ": " + str(exception))
                    log_file.write("\n" + str(time) + ": " + traceback.format_exc())

    return doc2ptt, ptt2dod, ptt2age, ptt2dob, ptt2eth, ptt2sex


def multiprocess_annotation_records(input_annotations: dict):

    # cui2ptt_pos.jsonl each line is a dictionary of cui and the value is a dictionary of patients with a count {<cui>: {<patient_id>:<count>, ...}}\n...
    cui2ptt_pos = defaultdict(Counter) # store the count of a SNOMED term for a patient

    # cui2ptt_tsp.jsonl each line is a dictionary of cui and the value is a dictionary of patients with a timestamp {<cui>: {<patient_id>:<tsp>, ...}}\n...
    cui2ptt_tsp = defaultdict(lambda: defaultdict(int)) # store the first mention timestamp of a SNOMED term for a patient

    annotation_process_pool_results = []

    with Pool(processes=CPU_THREADS) as annotations_process_pool:
        rec_que = Queue()

        try:
            if len(input_annotations) > 1:
                record_chunks = list(chunk(input_annotations, int(len(input_annotations) / CPU_THREADS)))
            else:
                record_chunks = input_annotations

            counter = 0
            for record_chunk in record_chunks:
                rec_que.put(record_chunk)
                annotation_process_pool_results.append(annotations_process_pool.starmap_async(_process_annotation_records, [(rec_que.get(),)], error_callback=logging.error))
                counter += 1

            for result in annotation_process_pool_results:
                result_data = result.get(timeout=TIMEOUT)

                _cui2ptt_pos, _cui2ptt_tsp = result_data[0][0], result_data[0][1]

                for cui, patient_id_count_vals in _cui2ptt_pos.items():
                    if cui not in cui2ptt_pos.keys():
                        cui2ptt_pos[cui] = patient_id_count_vals
                    else:
                        for patient_id, count in patient_id_count_vals.items():
                            if patient_id not in cui2ptt_pos[cui].keys():
                                cui2ptt_pos[cui][patient_id] = count
                            else:
                                cui2ptt_pos[cui][patient_id] += count

                for cui, patient_id_timestamps in _cui2ptt_tsp.items():
                    if cui not in cui2ptt_tsp.keys():
                        cui2ptt_tsp[cui] = patient_id_timestamps
                    else:
                        for patient_id, timestamp in patient_id_timestamps.items():
                            if patient_id not in cui2ptt_tsp[cui].keys():
                                cui2ptt_tsp[cui][patient_id] = timestamp
                            else:
                                cui2ptt_tsp[cui][patient_id] = timestamp

        except Exception as exception:
            time = datetime.now()
            with open(log_file_path, "a+") as log_file:
                log_file.write("\n" + str(time) + ": " + str(exception))
                log_file.write("\n" + str(time) + ": " + traceback.format_exc())

    return cui2ptt_pos, cui2ptt_tsp


#############################################


# for testing
#OUTPUT_FOLDER_PATH = "../../data/cogstack-cohort/"
#INPUT_FOLDER_PATH = "../../data/cogstack-cohort/"
#INPUT_ANNOTATIONS_RECORDS_FILE_NAME_PATTERN = "medical_reports_anns_"
#INPUT_PATIENT_RECORD_FILE_NAME_PATTERN = "medical_reports_text__"

global_doc2ptt = {}

if INPUT_PATIENT_RECORD_FILE_NAME_PATTERN:
    ptt2dod, ptt2age, ptt2dob, ptt2eth, ptt2sex = {}, {}, {}, {}, {}

    # read each of the patient record files one by one
    for root, sub_directories, files in os.walk(INPUT_FOLDER_PATH):
        for file_name in files:
            if INPUT_PATIENT_RECORD_FILE_NAME_PATTERN in file_name:
                f_path = os.path.join(root,file_name)

                contents = []

                with open(f_path, mode="r+") as f:
                    contents = json.loads(f.read())
                    _doc2ptt, _ptt2dod, _ptt2age, _ptt2dob, _ptt2eth, _ptt2sex = multiprocess_patient_records(contents)

                    if _ptt2sex != {}:
                        ptt2sex.update(_ptt2sex)
                    if _ptt2eth != {}:
                        ptt2eth.update(_ptt2eth)
                    if _ptt2dob != {}:
                        ptt2dob.update(_ptt2dob)
                    if _ptt2dod != {}:
                        ptt2dod.update(_ptt2dod)
                    if _ptt2age != {}:
                        ptt2age.update(_ptt2age)
                    if _doc2ptt != {}:
                        global_doc2ptt.update(_doc2ptt)

                with open(log_file_path, "a+") as log_file:
                    time = datetime.now()
                    log_file.write("\n" + str(time) + ": processed file " + str(file_name))

    dict2json_file(ptt2sex, os.path.join(OUTPUT_FOLDER_PATH, "ptt2sex.json"))
    dict2json_file(ptt2eth, os.path.join(OUTPUT_FOLDER_PATH, "ptt2eth.json"))
    dict2json_file(ptt2dob, os.path.join(OUTPUT_FOLDER_PATH, "ptt2dob.json"))
    dict2json_file(ptt2dod, os.path.join(OUTPUT_FOLDER_PATH, "ptt2dod.json"))
    dict2json_file(ptt2age, os.path.join(OUTPUT_FOLDER_PATH, "ptt2age.json"))


# dump patients for future ref
doc2ptt_path = os.path.join(OUTPUT_FOLDER_PATH, "doc2ptt.json")
if global_doc2ptt != {}:
    with open(doc2ptt_path, "w") as doc2ptt_file:
        doc2ptt_file.write(json.dumps(global_doc2ptt))

# if we have no patients, perhaps we have a list that is already present, ready to be used
#   so that we only care about generating the annotations...
if len(global_doc2ptt.keys()) < 1:
    if os.path.exists(doc2ptt_path):
        with open(doc2ptt_path, "r+") as f:
            global_doc2ptt = f.read()
            global_doc2ptt = json.loads(global_doc2ptt)

if INPUT_ANNOTATIONS_RECORDS_FILE_NAME_PATTERN:
    # read each of the patient record files one by one
    for root, sub_directories, files in os.walk(INPUT_FOLDER_PATH):
        for file_name in files:
            if INPUT_ANNOTATIONS_RECORDS_FILE_NAME_PATTERN in file_name:
                f_path = os.path.join(root,file_name)

                contents = []

                with open(f_path, mode="r+") as f:
                    contents = json.loads(f.read())

                    cui2ptt_pos, cui2ptt_tsp = multiprocess_annotation_records(contents)
                    dict2jsonl_file(cui2ptt_pos, os.path.join(OUTPUT_FOLDER_PATH, "cui2ptt_pos.jsonl"))
                    dict2jsonl_file(cui2ptt_tsp, os.path.join(OUTPUT_FOLDER_PATH, "cui2ptt_tsp.jsonl"))

                with open(log_file_path, "a+") as log_file:
                    time = datetime.now()
                    log_file.write("\n" + str(time) + ": processed file " + str(file_name))

    # merge all records
    cui2ptt_pos = defaultdict(Counter) # store the count of a SNOMED term for a patient
    cui2ptt_tsp = defaultdict(lambda: defaultdict(int)) # store the first mention timestamp of a SNOMED term for a patient

    with open(os.path.join(OUTPUT_FOLDER_PATH, "cui2ptt_tsp.jsonl"), "r+", encoding="utf-8") as cui2ptt_tspfile:

        for line in cui2ptt_tspfile:
            _dict_line = json.loads(line)

            for cui, cui_timestamps in _dict_line.items():
                if cui not in cui2ptt_tsp.keys():
                    cui2ptt_tsp[cui] = cui_timestamps
                else:
                    for pttid, timestamp in cui_timestamps.items():
                        if pttid not in cui2ptt_tsp[cui].keys():
                            cui2ptt_tsp[cui][pttid] = int(timestamp)
                        else:
                            if int(cui2ptt_tsp[cui][pttid]) < int(timestamp):
                                cui2ptt_tsp[cui][pttid] = timestamp

    os.rename(os.path.join(OUTPUT_FOLDER_PATH, "cui2ptt_tsp.jsonl"), os.path.join(OUTPUT_FOLDER_PATH, "cui2ptt_tsp.jsonl.bk"))
    dict2jsonl_file(cui2ptt_tsp, os.path.join(OUTPUT_FOLDER_PATH, "cui2ptt_tsp.jsonl"))

    with open(os.path.join(OUTPUT_FOLDER_PATH, "cui2ptt_pos.jsonl"), "r+", encoding="utf-8") as cui2ptt_posfile:

        for line in cui2ptt_posfile:
            _dict_line = json.loads(line)

            for cui, pttid_cui_count in _dict_line.items():
                if cui not in cui2ptt_pos.keys():
                    cui2ptt_pos[cui] = pttid_cui_count
                else:
                    for pttid, cui_count in pttid_cui_count.items():
                        if pttid not in cui2ptt_pos[cui].keys():
                            cui2ptt_pos[cui][pttid] = int(cui_count)
                        else:
                            cui2ptt_pos[cui][pttid] += int(cui_count)

    os.rename(os.path.join(OUTPUT_FOLDER_PATH, "cui2ptt_pos.jsonl"), os.path.join(OUTPUT_FOLDER_PATH, "cui2ptt_pos.jsonl.bk"))
    dict2jsonl_file(cui2ptt_pos, os.path.join(OUTPUT_FOLDER_PATH, "cui2ptt_pos.jsonl"))