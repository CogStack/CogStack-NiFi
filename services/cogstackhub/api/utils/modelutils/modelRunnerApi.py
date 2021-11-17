import pandas as pd
import requests

class modelRunnerApi():
    def __init__(self, modelid, modeladdress):
        self.modelid = modelid
        self.modeladdress = modeladdress

    def requestannotations(self, text):

        headers = {'accept': 'application/json',}
        params = (('text', text),)
        annotateurl = self.modeladdress + 'process'

        response = requests.post(annotateurl, headers=headers, params=params)
        return  response.json()['annotations']
    
    def annotate(self, text):
        
        annotations = self.requestannotations(text)
        df = pd.DataFrame(annotations)
        if df.empty:
            return [], [], [], [], [], []
        pretty_names = list(df['label_name'])
        concept_ids = list(df['label_id'])
        starts = list(df['start'])
        ends = list(df['end'])
        # ids = list(df['id'])
        model_ids = [self.modelid] * len(ends)
        document_level_annotation = [False] * len(ends)
        
        return pretty_names, concept_ids, starts, ends, model_ids, document_level_annotation