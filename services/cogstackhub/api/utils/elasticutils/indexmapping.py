
def setpatientindexmap(es, indexname, patientfieldname):

    body = {
        "properties": {
            patientfieldname:{
                "type": "text",
                "fielddata": True                
            }
        }
    }

    return es.indices.put_mapping(index=indexname, body=body)