from numpy import empty
import pandas as pd

def mapcodestopriority(es, index, span_annotations):

    res = es.search(index="priorities", doc_type="_doc", body = {
        'size' : 10000,
        'query': {
            'match_all' : {}
        }
        })

    df = pd.json_normalize(res['hits']['hits'])

    if df.empty:
        return span_annotations

    terms = list(df[df['_source.table'] == index]['_source.term'])
  
    for span_annotation in span_annotations:

        pretty_name = span_annotation['nlp_pretty_names'].lower()

        if termoverlap(terms, pretty_name):
            span_annotation['priority'] = 'priority'
        else:
            span_annotation['priority'] = ''

    return span_annotations

def termoverlap(terms, pretty_name):

    return any(word in pretty_name for word in terms)

def createprioritymappingforindex(es,index):
    pass 