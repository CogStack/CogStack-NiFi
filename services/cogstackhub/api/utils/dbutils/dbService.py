import pandas as pd
from datetime import date
from app.models import db, Dataset, Annotation, Text, Patient
from tqdm import tqdm

class DBService:

    def __init__(self, port=9200):
        # move these to config/env file
        self.db = db


    def insertdataset(self, dataset_name, dataset_df):

        dataset = Dataset()
        dataset.datasetname = dataset_name
        self.db.session.add(dataset)

        for idx, row in dataset_df.iterrows():
            
            text = Text()
            text.text =  row['text'].replace("\n", " <br> ")

            if bool(Patient.query.filter_by(patient_id=str(row['patient'])).first()):
                patient = Patient.query.filter_by(patient_id=str(row['patient'])).first()
            else:
                patient = Patient()
                patient.patient_id = row['patient']
                self.db.session.add(patient)

            text.patient = patient
            text.creationdate = date.today()
            text.dataset_id = dataset.id
            self.db.session.add(text)
        
        self.db.session.commit()


    def insertAnnotationsfordataset(self, model, dataset_name):

        dataset = Dataset.query.filter_by(datasetname=dataset_name).one()
        texts = Text.query.filter_by(dataset=dataset)

        for text in tqdm(texts):
            self.insertAnnotations(text, model)
        
        self.db.session.commit()


    def insertAnnotations(self, text, model):

        pretty_names, concept_ids, starts, ends, _, _ = model.annotate(text.text)

        for i in range(len(pretty_names)):
            annotation = Annotation()
            annotation.annotationlabel = pretty_names[i]
            annotation.annotationid = concept_ids[i]
            annotation.annotationstartindex = starts[i]
            annotation.annotationendindex = ends[i]
            annotation.creationdate = date.today()

            annotation.mlmodel_id = model.modelid
            annotation.text_id = text.id

            self.db.session.add(annotation)

    def retrieveAnnotations(self, datasetname, document_idx):

        text = self.retrieveDocument(datasetname, document_idx)
        annotations = Annotation.query.filter_by(text=text).all()

        annotation_dicts = []

        for annotation in annotations:
            annotation_dict = {}
            annotation_dict['start'] = annotation.annotationstartindex
            annotation_dict['end'] = annotation.annotationendindex
            annotation_dict['nlp_concept_ids'] = annotation.annotationid
            annotation_dict['nlp_pretty_names'] = annotation.annotationlabel
            annotation_dicts.append(annotation_dict)

        return annotation_dicts

    def retrieveDocument(self, datasetname, document_idx):

        dataset = Dataset.query.filter_by(datasetname=datasetname).first()
        text = Text.query.filter_by(dataset=dataset)[document_idx]

        return text
