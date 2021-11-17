import pandas as pd

def updateElasticSearchAnnotationswithmodel(model, selecteddataset, elasticsearchclient):

    # Get dataset from elasticsearch
    query = {"from": 0, "size": 10000, "query": {"match_all" : {}}}
    results = elasticsearchclient.search(index=selecteddataset, body=query)

    for i, document in enumerate(results['hits']['hits']):
        print(i)
        snippet = document['_source']['note']
        pretty_names, concept_ids, starts, ends, model_ids, document_level_annotation = model.annotate(snippet)
        
        new_annotations = {"nlp_pretty_names": pretty_names,
                                "nlp_concept_ids": concept_ids,
                                "nlp_starts": starts,
                                "nlp_ends": ends,
                                "nlp_model_id": model_ids,
                                "nlp_document_level_annotation": document_level_annotation}
                
        updated_annotations_df = updateQueryBodywithAnnotations(new_annotations, document['_source']['annotations'])
        updated_annotations = {"nlp_pretty_names": list(updated_annotations_df['nlp_pretty_names']),
                                "nlp_concept_ids": list(updated_annotations_df['nlp_concept_ids']),
                                "nlp_starts": list(updated_annotations_df['nlp_starts']),
                                "nlp_ends": list(updated_annotations_df['nlp_ends']),
                                "nlp_model_id": list(updated_annotations_df['nlp_model_id']),
                                "nlp_document_level_annotation": list(updated_annotations_df['nlp_document_level_annotation'])
                            }

        entry = document['_source']
        entry['annotations'] = updated_annotations
        
        elasticsearchclient.index(index=selecteddataset, id=i, body=entry)


def updateQueryBodywithAnnotations(new_annotations, existing_annotations):
    
    new_annotations_df = pd.DataFrame(new_annotations)
    existing_annotations_df = pd.DataFrame(existing_annotations)

    return pd.concat([new_annotations_df,existing_annotations_df]).drop_duplicates(subset=['nlp_concept_ids','nlp_starts', 'nlp_ends', 'nlp_model_id']).reset_index(drop=True)
