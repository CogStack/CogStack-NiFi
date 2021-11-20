from elasticsearch import Elasticsearch
import os
from . import elasticfilters as elasticfilters


class ElasticService:

    def __init__(self, port=9200):
        # move these to config/env file
        es_host =  os.getenv("ES_HOST", "0.0.0.0")
        self.es = Elasticsearch([{'host': es_host, 'port': port}], http_auth=('admin','admin'))


    def getelasticindices(self, search_string):
        
        # remove kibana security logs from list of indices, priority tables maps important terms for a index
        remove = ['.kibana', 'security-auditlog', '.opendistro', 'priorities']
        all_indices = list(self.es.indices.get_alias(search_string).keys())
        selected_indices = []

        for index in all_indices:
            if all(r not in index for r in remove):
                selected_indices.append(index)

        return selected_indices


    def searchindex(self, index, search_string, filters):

        if search_string == "":
            return self.es.search(index=index, body=elasticfilters.searchbyfilters(filters))
        else:
            return self.es.msearch(elasticfilters.searchbystringandfilters(index, 
                                                                            search_string, 
                                                                            filters))['responses'][0]


    def searchindexbypatient(self, index, search_string, patient_idx, filters):

        all_patients = self.searchallpatients(index)
        patient = all_patients[patient_idx]['key']


        results = self.es.search(index=index,body=elasticfilters.searchstringforpatient(search_string, 
                                                                                patient, 
                                                                                filters))

        no_patients = len(all_patients)
        return results, patient, no_patients


    def searchallpatients(self, index):

        return self.es.search(index=index, body=elasticfilters.searchallpatients(index))['aggregations'][index]['buckets']

    def searchallnotetypes(self, index):

        return self.es.search(index=index, body=elasticfilters.searchallnotetypes(index))['aggregations'][index]['buckets']

    def uploaddatatoelastic(self, index_name, index_df, meta_fields, refresh=False):

        # create mapping
        # make fields searchable (this assumes meta fields contains patient!)
        self.es.indices.create(index=index_name, body=elasticfilters.initialiseindexwithmapping())

        # iterate over each document and insert into index
        for idx, row in index_df.iterrows():

            entry = {
                "type": 'document',
                "note": row['text'].replace("\n", " <br> "),
            }
            
            for meta_field in meta_fields:
                print(f'loading meta_field {meta_field}')
                entry[meta_field] = str(row[meta_field]).strip().replace(' ', '_')

            self.es.index(index=index_name, id=idx, body=entry, refresh=refresh)

        # insert priority label for new index
        if not self.es.indices.exists('priorities'):
            self.es.indices.create(index='priorities')
