import pytest
import pandas as pd
import time
from utils.elasticutils.elasticService import ElasticService
 
@pytest.fixture(scope="function")
def esservice():
    es_service = ElasticService(port=9300)
    data = [{'text':'test document', 'date': '2020/08/31', 'notetype':'letter', 'patient':'p_a'},
            {'text':'test document 2', 'date': '2020/08/30', 'notetype':'letter', 'patient':'p_a'}]

    df = pd.DataFrame(data)
    meta_fields = list(df.columns)
    meta_fields.remove('text')

    # Upload dataset to elasticsearch
    es_service.uploaddatatoelastic('test-index', df, meta_fields, refresh=True)

    yield es_service

    es_service.es.indices.delete('test-index')


def test_uploaddatatoelastic(esservice):

    index_name = 'test-index-2'
    data = [{'text':'test document', 'date': '2020/08/31', 'notetype':'letter', 'patient':'p_a'}]
    df = pd.DataFrame(data)
    meta_fields = list(df.columns)
    meta_fields.remove('text')

    # Upload dataset to elasticsearch
    esservice.uploaddatatoelastic(index_name, df, meta_fields)

    # Verify index has been created
    assert index_name in esservice.getelasticindices('')

    # remove database 
    esservice.es.indices.delete(index_name)


def test_searchindexbypatient(esservice):

    index_name = 'test-index'
    patient_idx = 0
    filters = {'start_date':'01/01/1970',
                'end_date': '31/12/2999',
                'pageNo':0,
                'resultsperpage':10,
                'notetype':'',
                'patient_id':'',
                'document_id':''}

    results, patient, no_patients = esservice.searchindexbypatient(index=index_name, 
                                            search_string='', 
                                            patient_idx=patient_idx, 
                                            filters=filters)

    assert len(results['hits']['hits']) == 2
    assert no_patients == 1


def test_searchindex_(esservice):
    
    index_name = 'test-index'
    patient_idx = 0
    filters = {'start_date':'01/01/1970',
                'end_date': '31/12/2999',
                'pageNo':0,
                'resultsperpage':10,
                'notetype':'',
                'patient_id':'',
                'document_id':''}

    results = esservice.searchindex(index_name, 'test', filters)
    assert len(results['hits']['hits']) == 2