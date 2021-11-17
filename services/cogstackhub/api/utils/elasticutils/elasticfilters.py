def searchbyfilters(filters):
 
    return {
                "from": (filters['pageNo'] - 1) * filters['resultsperpage'],
                "size": filters['resultsperpage'],
                "query": {
                    "bool":{
                        "must": {
                            "match_all": {}
                        },
                        "filter": _get_filters(start_date=filters['start_date'], 
                                                end_date=filters['end_date'], 
                                                notetype=filters['notetype'], 
                                                patient_id=filters['patient_id'],
                                                document_id=filters['document_id'])
                    }
                },
                "sort": [
                    {
                        "date": {
                            "order": "desc"
                        }
                    }
                ]
            }

def searchbystringandfilters(index, search_string, filters):

    return [{"index":index},
            {"query":{"bool":
                        {"must":[{"query_string":
                                    {"query": search_string + '*',
                                    "analyze_wildcard":True,
                                    "default_field":"*"}}],
                        "filter": _get_filters(start_date=filters['start_date'], 
                                                end_date=filters['end_date'], 
                                                notetype=filters['notetype'], 
                                                patient_id=filters['patient_id'],
                                                document_id=filters['document_id']),
                        "should":[],
                        "must_not":[]}},
                "sort": [
                {
                    "date": {
                        "order": "desc"
                    }
                }
            ]}]    

def searchallpatients(index):

    return {
        "size": 0,
        "query": {
            "bool":{
                "must": {
                    "match_all": {}
                }
            }
        },
        "aggs" : {
            index : {
                "terms" : { "field" : "patient",  "size" : 50000 }
            }
        },
        "sort": [
            {
                "date": {
                    "order": "desc"
                }
            }
        ]
    }

def searchallnotetypes(index):

    return {
        "size": 0,
        "query": {
            "bool":{
                "must": {
                    "match_all": {}
                }
            }
        },
        "aggs" : {
            index : {
                "terms" : { "field" : "notetype",  "size" : 50000 }
            }
        }
    }

def searchstringforpatient(search_string, patient, filters):

    return {
        "from": 0,
        "size": 10000,
        "query": {
            "bool":{
                "must": {
                    "match_all": {}
                },
                "filter":[
                    {
                        "bool":{
                        "filter":[
                            {
                                "bool":{
                                    "should":[
                                    {
                                        "match_phrase":{
                                            "patient":patient
                                        }
                                    }
                                    ],
                                    "minimum_should_match":1
                                }
                            },
                            {
                                "multi_match":{
                                    "type":"best_fields",
                                    "query":search_string if search_string!='' else patient,
                                    "lenient":True
                                }
                            },
                            {
                                "range": {
                                    "date": {
                                        "gte": filters['start_date'],
                                        "lte": filters['end_date'],
                                        "format": "dd/MM/yyyy"
                                    }
                                }
                            }
                        ]
                        }
                    }
                ],
                "should":[

                ],
                "must_not":[

                ]
            }
        },
        "sort": [
            {
                "date": {
                    "order": "desc"
                }
            }
        ]
    }

def initialiseindexwithmapping():

    return '''
    {
        "mappings":{
            "properties": {
                "patient": {
                    "type": "text",
                    "fielddata": true,
                    "fields": {
                        "raw": {
                            "type": "keyword"
                        }
                    }
                },
                "date": {
                    "type": "date",
                    "format" : "yyyy-MM-dd HH:mm:ss||dd/MM/yyyy||dd-MM-yyyy||yyyy-MM-dd||yyyy/MM/dd"
                },
                "notetype": {
                    "type": "text",
                    "fielddata": true,
                    "fields": {
                        "raw": {
                            "type": "keyword"
                        }
                    }
                }
            }
        }
    }
    '''

def _get_filters(start_date, end_date, notetype, patient_id, document_id):
    filter = [{
        "bool": {
            "filter": [
                {
                    "range": {
                        "date": {
                            "gte": start_date,
                            "lte": end_date,
                            "format": "dd/MM/yyyy"
                        }
                    }
                }
            ]
        }
    }]

    if notetype.strip() != "":
        filter[0]["bool"]["filter"].append({
            "term": {
                "notetype": notetype.strip()
            }
        })
    if patient_id.strip() != "":
        filter[0]["bool"]["filter"].append({
            "term": {
                "patient": patient_id.strip()
            }
        })
    if document_id.strip() != "":
        filter[0]["bool"]["filter"].append({
            "term": {
                "_id": document_id.strip()
            }
        })
    
    return filter