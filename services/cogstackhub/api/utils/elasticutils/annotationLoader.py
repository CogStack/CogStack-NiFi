import pandas as pd

def addAnnotations(results, tokens, remove_overlapping=True):

    span_level_annotations = []
    document_level_annotations = []

    for idx, result in enumerate(results['hits']['hits']):

        annotation_fields = ['nlp_starts','nlp_ends','nlp_concept_ids','nlp_pretty_names','nlp_document_level_annotation']
        result_annotations = {key: result['_source']['annotations'][key] for key in annotation_fields}
        # result_annotations['type'] = [result['_source']['type']] * len(result_annotations['nlp_concept_ids'])
        df = pd.DataFrame(result_annotations)

        span_level_df = df[df['nlp_document_level_annotation'] == False]
        document_level_df = df[df['nlp_document_level_annotation'] == True]

        span_level_annotations.append(addSpanLevelAnnotations(span_level_df, tokens, idx, remove_overlapping))
        document_level_annotations.append(addDocumentLevelAnnotations(document_level_df))

    return span_level_annotations, document_level_annotations

def addSpanLevelAnnotations(df, tokens, idx, remove_overlapping):
    df = df.rename(columns={'nlp_starts': 'start', 'nlp_ends': 'end'})
    df['annotated'] = True

    df_tokens = pd.DataFrame(tokens[idx]['tokens'])
    df_tokens['annotated'] = False
    df_tokens['nlp_document_level_annotation'] = False
    df_tokens['nlp_concept_ids'] = ''
    df_tokens['nlp_pretty_names'] = ''
    df_tokens = df_tokens.drop(columns=['id'])
    
    big_df = df_tokens.append(df, ignore_index=True)
    big_df= big_df.sort_values(['start','end'])

    if remove_overlapping:
        big_df = big_df.drop_duplicates('start', keep='last')
        big_df = big_df.drop_duplicates('end', keep='first')
    
    return big_df.to_dict('records')


def addDocumentLevelAnnotations(df):
    return df.to_dict('records')