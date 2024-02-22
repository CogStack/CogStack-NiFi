import json
import sys
import logging
import datetime
import os
import traceback
import regex
import multiprocess

from multiprocess import Pool, Queue
from collections import defaultdict, Counter
from datetime import datetime
from utils.ethnicity_map import ethnicity_map, ethnicity_map_detail
from utils.generic import chunk, dict2json_file

ANNOTATION_DOCUMENT_ID_FIELD_NAME = "meta.docid"
DOCUMENT_ID_FIELD_NAME = "docid"

PATIENT_ID_FIELD_NAME = "patient"
PATIENT_ETHNICITY_FIELD_NAME = "ethnicity"
PATIENT_GENDER_FIELD_NAME = "gender"
PATIENT_BIRTH_DATE_FIELD_NAME = "birthdate"
PATIENT_DEATH_DATE_FIELD_NAME = "deathdate"

OUTPUT_FOLDER_PATH = os.path.join(os.getenv("NIFI_DATA_PATH", "/opt/data/"), "cogstack-cohort")

# this is a json exported by NiFi to some path in the NIFI_DATA_PATH
INPUT_PATIENT_RECORDS_PATH = ""
INPUT_ANNOTATIONS_RECORDS_PATH = ""

DATE_TIME_FORMAT = "%Y-%m-%d"

TIMEOUT = 3600

CPU_THREADS = os.getenv("CPU_THREADS", int(multiprocess.cpu_count() / 2))

for arg in sys.argv:
    _arg = arg.split("=", 1)
    if _arg[0] == "annotation_document_id_field_name":
        ANNOTATION_DOCUMENT_ID_FIELD_NAME = _arg[1]
    if _arg[0] == "input_patient_records_path":
        INPUT_PATIENT_RECORDS_PATH = _arg[1]
    if _arg[0] == "input_annotations_records_path":
        INPUT_ANNOTATIONS_RECORDS_PATH = _arg[1]
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
    if _arg[0] == "patient_gender_field_name":
        PATIENT_GENDER_FIELD_NAME = _arg[1]
    if _arg[0] == "document_id_field_name":
        DOCUMENT_ID_FIELD_NAME  = _arg[1]
    if _arg[0] == "cpu_threads":
        CPU_THREADS = _arg[1]
    if _arg[0] == "timeout":
        TIMEOUT = _arg[1]
    if _arg[0] == "output_folder_path":
        OUTPUT_FOLDER_PATH = _arg[1]


# json file containing annotations exported by NiFi, the input format is expected to be one provided
# by MedCAT Service which was stored in an Elasticsearch index
input_annotations = json.loads(open(INPUT_ANNOTATIONS_RECORDS_PATH, mode="r+").read())

# json file containing record data from a SQL database or from Elasticsearch
input_patient_record_data = json.loads(open(INPUT_PATIENT_RECORDS_PATH, mode="r+").read())

# cui2ptt_pos.jsonl each line is a dictionary of cui and the value is a dictionary of patients with a count {<cui>: {<patient_id>:<count>, ...}}\n...
cui2ptt_pos = defaultdict(Counter) # store the count of a SNOMED term for a patient

# cui2ptt_tsp.jsonl each line is a dictionary of cui and the value is a dictionary of patients with a timestamp {<cui>: {<patient_id>:<tsp>, ...}}\n...
cui2ptt_tsp = defaultdict(lambda: defaultdict(int)) # store the first mention timestamp of a SNOMED term for a patient

# doc2ptt is a dictionary {<doc_id> : <patient_id>, ...}
doc2ptt = {}

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


def process_patient_records(patient_records: list):
    _ptt2sex, _ptt2eth, _ptt2dob, _ptt2age, _ptt2dod, _doc2ptt = {}, {}, {}, {}, {}, {}
  
    for patient_record in patient_records:
        
        _ethnicity = str(patient_record[PATIENT_ETHNICITY_FIELD_NAME]).lower().replace("-", " ").replace("_", " ") if PATIENT_ETHNICITY_FIELD_NAME in patient_record.keys() else "other"
        
        if _ethnicity in ethnicity_map.keys():
            _ptt2eth[patient_record[PATIENT_ID_FIELD_NAME]] = ethnicity_map[_ethnicity].title()
        else:
            _ptt2eth[patient_record[PATIENT_ID_FIELD_NAME]] = _ethnicity.title()

        # based on: https://www.datadictionary.nhs.uk/attributes/person_gender_code.html    
        _tmp_gender = str(patient_record[PATIENT_GENDER_FIELD_NAME]).lower() if PATIENT_GENDER_FIELD_NAME in patient_record.keys() else "Unknown"
        if _tmp_gender in ["male", "1", "m"]:
            _tmp_gender = "Male"
        elif _tmp_gender in ["female", "2", "f"]:
            _tmp_gender = "Female"
        else:
            _tmp_gender = "Unknown"

        _ptt2sex[patient_record[PATIENT_ID_FIELD_NAME]] = _tmp_gender

        dob = datetime.strptime(patient_record[PATIENT_BIRTH_DATE_FIELD_NAME], DATE_TIME_FORMAT)
        
        dod =  patient_record[PATIENT_DEATH_DATE_FIELD_NAME] if PATIENT_DEATH_DATE_FIELD_NAME in patient_record.keys() else None
        patient_age = 0

        if dod not in [None, "null", 0]:
            dod = datetime.strptime(patient_record[PATIENT_DEATH_DATE_FIELD_NAME], DATE_TIME_FORMAT)
            patient_age = dod.year - dob.year
        else:
            patient_age = datetime.now().year - dob.year

        # convert to ints
        dod = int(dod.strftime("%Y%m%d%H%M%S")) if dod not in [None, "null"] else 0
        dob = int(dob.strftime("%Y%m%d%H%M%S"))

        # change records
        _ptt2dod[patient_record[PATIENT_ID_FIELD_NAME]] = dod
        _ptt2dob[patient_record[PATIENT_ID_FIELD_NAME]] = dob
        _ptt2age[patient_record[PATIENT_ID_FIELD_NAME]] = patient_age

        _derived_document_id_field_from_ann = ANNOTATION_DOCUMENT_ID_FIELD_NAME.removeprefix("meta.")
        if DOCUMENT_ID_FIELD_NAME in patient_record.keys():
            docid = patient_record[DOCUMENT_ID_FIELD_NAME]
        else:
            docid = _derived_document_id_field_from_ann

        _doc2ptt[docid] = patient_record[PATIENT_ID_FIELD_NAME]

    return _ptt2sex, _ptt2eth, _ptt2dob, _ptt2age, _ptt2dod, _doc2ptt 

def process_annotation_records(annotation_records: list, _doc2ptt: dict):

    _cui2ptt_pos = defaultdict(Counter)
    _cui2ptt_tsp = defaultdict(lambda: defaultdict(int))

    try:

        # for each part of the MedCAT output (e.g., part_0.pickle)
        for annotation_record in annotation_records:
            annotation_entity = annotation_record   
            if "_source" in annotation_record.keys():
                annotation_entity = annotation_record["_source"]
            docid = annotation_entity[ANNOTATION_DOCUMENT_ID_FIELD_NAME]

            if docid in list(_doc2ptt.keys()):
                patient_id = _doc2ptt[docid]
                cui = annotation_entity["nlp.cui"]

                if annotation_entity["nlp.meta_anns"]["Subject"]["value"] == "Patient" and annotation_entity["nlp.meta_anns"]["Presence"]["value"] == "True" and annotation_entity["nlp.meta_anns"]["Time"]["value"] != "Future":
                    _cui2ptt_pos[cui][patient_id] += 1

                    if "timestamp" in annotation_entity.keys():
                        time =  int(round(datetime.fromisoformat(annotation_entity["timestamp"]).timestamp()))
                        if _cui2ptt_tsp[cui][patient_id] == 0 or time < _cui2ptt_tsp[cui][patient_id]:
                            _cui2ptt_tsp[cui][patient_id] = time
    except Exception:
        raise Exception("exception generated by process_annotation_records: " + str(traceback.format_exc()))

    return _cui2ptt_pos, _cui2ptt_tsp

patient_process_pool_results = []
annotation_process_pool_results = []

with Pool(processes=CPU_THREADS) as patient_process_pool:
    results = list()

    record_chunks = list(chunk(input_patient_record_data, CPU_THREADS))

    counter = 0
    for record_chunk in record_chunks:
        patient_process_pool_results.append(patient_process_pool.starmap_async(process_patient_records, [(record_chunk,)], chunksize=1, error_callback=logging.error))
        counter += 1

    try:
        for result in patient_process_pool_results:
            result_data = result.get(timeout=TIMEOUT)
            _ptt2sex, _ptt2eth, _ptt2dob, _ptt2age, _ptt2dod, _doc2ptt = result_data[0][0], result_data[0][1], result_data[0][2], result_data[0][3], result_data[0][4], result_data[0][5]
            
            ptt2sex.update(_ptt2sex)
            ptt2eth.update(_ptt2eth)
            ptt2dob.update(_ptt2dob)
            ptt2age.update(_ptt2age)
            ptt2dod.update(_ptt2dod)
            doc2ptt.update(_doc2ptt)

    except Exception:
        raise Exception("exception generated by worker: " + str(traceback.format_exc()))


with Pool(processes=CPU_THREADS) as annotations_process_pool:
    results = list()

    record_chunks = list(chunk(input_annotations, CPU_THREADS))

    counter = 0
    for record_chunk in record_chunks:
        annotation_process_pool_results.append(annotations_process_pool.starmap_async(process_annotation_records, [(record_chunk, doc2ptt )], chunksize=1, error_callback=logging.error))
        counter += 1

    try:
        for result in annotation_process_pool_results:
            result_data = result.get(timeout=TIMEOUT)

            _cui2ptt_pos, _cui2ptt_tsp = result_data[0][0], result_data[0][1]
            cui2ptt_pos.update(_cui2ptt_pos)
            cui2ptt_tsp.update(_cui2ptt_tsp)

    except Exception:
        raise Exception("exception generated by worker: " + str(traceback.format_exc()))

dict2json_file(ptt2sex, os.path.join(OUTPUT_FOLDER_PATH, "ptt2sex.json"))
dict2json_file(ptt2eth, os.path.join(OUTPUT_FOLDER_PATH, "ptt2eth.json"))
dict2json_file(ptt2dob, os.path.join(OUTPUT_FOLDER_PATH, "ptt2dob.json"))
dict2json_file(ptt2dod, os.path.join(OUTPUT_FOLDER_PATH, "ptt2dod.json"))
dict2json_file(ptt2age, os.path.join(OUTPUT_FOLDER_PATH, "ptt2age.json"))
dict2json_file(cui2ptt_pos, os.path.join(OUTPUT_FOLDER_PATH, "cui2ptt_pos.jsonl"))
dict2json_file(cui2ptt_tsp, os.path.join(OUTPUT_FOLDER_PATH, "cui2ptt_tsp.jsonl"))
