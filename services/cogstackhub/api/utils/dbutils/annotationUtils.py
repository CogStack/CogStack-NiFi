import pandas as pd

def addSpanLevelAnnotations(annotations, tokens, remove_overlapping=True):
    
    df = pd.DataFrame(annotations)

    df['annotated'] = True

    df_tokens = pd.DataFrame(tokens)
    df_tokens['annotated'] = False
    df_tokens['nlp_concept_ids'] = ''
    df_tokens['nlp_pretty_names'] = ''
    df_tokens = df_tokens.drop(columns=['id'])
    
    big_df = df_tokens.append(df, ignore_index=True)
    big_df= big_df.sort_values(['start','end'])

    if remove_overlapping:
        big_df = big_df.drop_duplicates('start', keep='last')
        big_df = big_df.drop_duplicates('end', keep='first')
    
    return big_df.to_dict('records')