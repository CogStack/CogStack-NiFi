from flask import json, jsonify, request
import pandas as pd
from datetime import datetime, timezone, timedelta
import jwt
from functools import wraps
from werkzeug.utils import secure_filename
from utils.modelutils.modelsInfo import getLatestReleaseNames, getmodelurl, getmodelcardbyid, checkmodelonline
from utils.elasticutils.annotationLoader import addAnnotations
from utils.elasticutils.annotationUpdater import updateElasticSearchAnnotationswithmodel
from utils.elasticutils.priorityMapping import mapcodestopriority
from utils.elasticutils.elasticService import ElasticService
from utils.dbutils.dbService import DBService
from utils.dbutils.annotationUtils import addSpanLevelAnnotations
from utils.modelutils.modelRunnerApi import modelRunnerApi
import os

from app import app
from app.models import User
from app.admin import admin_comp
from spacy.lang.en import English
from spacy.symbols import ORTH

nlp = English()
tokenizer = nlp.tokenizer
tokenizer.add_special_case("<br>", [{ORTH: "<br>"}])

esclient = ElasticService()
dbclient = DBService()

def login_required(f):
    @wraps(f)
    def _verify(*args, **kwargs):
        auth_headers = request.headers.get('Authorization', '').split()
        print('validating token')
        invalid_msg = {
            'message': 'Invalid token. Registration and / or authentication required',
            'authenticated': False
        }
        expired_msg = {
            'message': 'Expired token. Reauthentication required.',
            'authenticated': False
        }

        try:
            token = auth_headers[0]
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            user = User.query.filter_by(username=data['user']).first()
            if not user:
                raise RuntimeError('User not found')
            return f(user, *args, **kwargs)
        except jwt.ExpiredSignatureError:
            return jsonify(expired_msg), 401 # 401 is Unauthorized HTTP status code
        except jwt.InvalidTokenError:
            return jsonify(invalid_msg), 401
        except Exception as e:
            print(e)
            return {'message': 'Internal error occurred'}, 500

    return _verify


@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.authenticate(**data)

    if not user:
        return jsonify('login failed'), 400
    
    token = jwt.encode({'user': user.username, 'iat': datetime.now(timezone.utc),
                        'exp': datetime.now(timezone.utc) + timedelta(minutes=60)},
                        app.config['SECRET_KEY'])

    print('printing token')

    return jsonify({'token': token.decode('UTF-8')})
    
@app.route('/refreshtoken', methods=['POST'])
def refreshtoken():
    auth_headers = request.headers.get('Authorization', '').split()
    username = request.get_json()['user']

    newtoken = jwt.encode({'user': username, 'iat': datetime.now(timezone.utc),
                        'exp': datetime.now(timezone.utc) + timedelta(minutes=60)},
                        app.config['SECRET_KEY'])

    invalid_msg = {
            'message': 'Invalid token. Registration and / or authentication required',
            'authenticated': False
        }

    try:
        token = auth_headers[0]
        data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        if not user:
            raise RuntimeError('User not found')
        return jsonify({'token': newtoken.decode('UTF-8')})
    except jwt.ExpiredSignatureError:
        return jsonify({'token': newtoken.decode('UTF-8')})
    except (jwt.InvalidTokenError, Exception) as e:
            print(e)
            return jsonify(invalid_msg), 400
    

@app.route('/getelasticindices', methods=['POST'])
@login_required
def getelasticindices(user):
    req_data = request.get_json()
    search_string = "*" + req_data['searchstring'] + "*"

    return jsonify({
        'indices': esclient.getelasticindices(search_string)
    })


@app.route('/retrieveAnnotations', methods=['POST'])
@login_required
def retrieveAnnotations(user):

    req_data = request.get_json()
    index = req_data['index']
    document_idx = int(req_data['document_idx'])

    text = dbclient.retrieveDocument(index, document_idx)
    tokens = tokenizer(text.text).to_json()['tokens']
    annotations = dbclient.retrieveAnnotations(index, document_idx)

    span_annotations = addSpanLevelAnnotations(annotations, tokens)

    return jsonify({
            'span_annotations': span_annotations
        })


@app.route('/searchindex', methods=['POST'])
@login_required
def searchindex(user):
    req_data = request.get_json()
    search_string = req_data['searchstring'] 
    index = req_data['index']

    results = esclient.searchindex(index, search_string, req_data)

    # Retrieve all meta data
    meta_data = [l['_source'] for l in results['hits']['hits']]
    meta_data = [{i:m[i] for i in m if i not in ['annotations', 'note']} for m in meta_data]

    return jsonify({
        'results': results['hits'],
        'meta_data': meta_data,
        'hits': results['hits']['total']['value'],
        'resultmessage': ''
    })

@app.route('/searchindexforpatients', methods=['POST'])
@login_required
def searchindexforpatients(user):
    req_data = request.get_json()
    search_string = req_data['searchstring'] 
    index = req_data['index']
    patient_idx = req_data['patient_idx']

    results, patient, no_patients = esclient.searchindexbypatient(index, search_string, patient_idx, req_data)

    # Retrieve all meta data
    meta_data = [l['_source'] for l in results['hits']['hits']]
    meta_data = [{i:m[i] for i in m if i not in ['annotations', 'note']} for m in meta_data]

    # Get patient level annotations
    span_annotations = []

    # Get patient level annotations
    patient_level_annotations = {
        'doc_annotations': [],
        # 'grouped_span_annotations': mapcodestopriority(esclient.es, index, unqiue_span_level_annotations_patview),
        # 'span_annotations': unqiue_span_level_annotations_df.to_dict("records"),
    }

    

    return jsonify({
        'results': results['hits'],
        'meta_data': meta_data,
        'hits': no_patients,
        'no_patients': no_patients,
        'patientindx': patient_idx,
        'patient': patient,
        'resultmessage': ''       
    })


@app.route('/searchindexforpatients_zzz', methods=['POST'])
@login_required
def searchindexforpatients_zzz(user):
    req_data = request.get_json()
    search_string = req_data['searchstring'] 
    index = req_data['index']
    patient_idx = req_data['patient_idx']

    results, patient, no_patients = esclient.searchindexbypatient(index, search_string, patient_idx, req_data)

    if not(results['hits']['hits']):
        return jsonify({
            'results': [],
            'meta_data': [],
            'hits': 0,
            'tokens': [],
            'document_level_annotations': [],
            'resultmessage': 'No patient records found',
            'no_patients': no_patients,
            'patientindx': patient_idx,
            'patient': patient,
            'patientLevelAnnotations': [],
        })

    tokens = [tokenizer(hit['_source']['note']).to_json() for hit in results['hits']['hits']]

    # Gather data for visualising spans
    span_level_annotations, document_level_annotations = addAnnotations(results, tokens)    
    span_level_annotations_per_doc_df = [pd.DataFrame(s) for s in span_level_annotations]    
    span_level_annotations_per_doc_df = [s[s['annotated']==True] for s in span_level_annotations_per_doc_df]

    for i in range(len(span_level_annotations_per_doc_df)):
        span_level_annotations_per_doc_df[i]['document_idx'] = i
        span_level_annotations_per_doc_df[i]['document_type'] = results['hits']['hits'][i]['_source']['notetype']
        span_level_annotations_per_doc_df[i]['date'] = results['hits']['hits'][i]['_source']['date']
    
    unqiue_span_level_annotations_df = pd.concat(span_level_annotations_per_doc_df)
    pat_meta_dict = unqiue_span_level_annotations_df.copy()
    pat_meta_dict['dict']= unqiue_span_level_annotations_df.to_dict("records")
    pat_meta_dict = pat_meta_dict[['nlp_concept_ids','dict']]
    pat_meta_dict = pat_meta_dict.groupby('nlp_concept_ids')['dict'].apply(list) 
    pat_meta_dict = pat_meta_dict.to_dict()

    unqiue_span_level_annotations_patview = unqiue_span_level_annotations_df[['nlp_concept_ids', 'nlp_pretty_names', 'document_type', 'date']].drop_duplicates(subset='nlp_concept_ids').to_dict('records')

    for u in unqiue_span_level_annotations_patview:
        concept_id = u['nlp_concept_ids']
        print(concept_id)
        if concept_id == 'G01':
            print(1)
        u['meta_data'] = pat_meta_dict[concept_id]

    patient_level_annotations = {
        'doc_annotations': [],
        'grouped_span_annotations': mapcodestopriority(esclient.es, index, unqiue_span_level_annotations_patview),
        'span_annotations': unqiue_span_level_annotations_df.to_dict("records"),
    }

    # Retrieve all meta data
    meta_data = [l['_source'] for l in results['hits']['hits']]
    meta_data = [{i:m[i] for i in m if i not in ['annotations', 'note']} for m in meta_data]

    return jsonify({
        'results': results['hits'],
        'meta_data': meta_data,
        'hits': results['hits']['total']['value'],
        'tokens': span_level_annotations,
        'document_level_annotations': document_level_annotations,
        'resultmessage': '',
        'no_patients': no_patients,
        'patientindx': patient_idx,
        'patient': patient,
        'patientLevelAnnotations': patient_level_annotations, 
    })


@app.route('/uploaddataset', methods=['POST'])
@login_required
def insertdataintoelastic(user):
    print('loading file into memory..')
    if 'file' not in request.files:
        print('file not posted')
    
    file = request.files['file']
    filename = secure_filename(file.filename)
    index_name = filename.split('.csv')[0]
    file.save(filename)
    
    df = pd.read_csv(filename)

    # meta fields are all additional fields except text field
    meta_fields = list(df.columns)
    meta_fields.remove('text')

    # create index and insert data
    esclient.uploaddatatoelastic(index_name, df, meta_fields)

    # insert data into postgres db
    dbclient.insertdataset(index_name, df)
    
    # remove created file
    os.remove(filename)

    return jsonify({
        'status': 'success'
    }) 


@app.route('/fetchmodelnames', methods=['GET'])
@login_required
def fetchmodelnames(user):
    
    results = getLatestReleaseNames(user)
    
    for model in results:
        model['online'] = checkmodelonline(model['model_id'])

    return jsonify({
        'modelnames': results
    })  

@app.route('/fetchmodelcard', methods=['POST'])
def fetchmodelcard():
    
    req_data = request.get_json()
    modelid = req_data['modelid']
    
    modelcard = getmodelcardbyid(modelid)

    return jsonify({
        'modelcard': modelcard
    })  

@app.route("/annotatenoteswithmodel_zzz", methods=['POST'])
@login_required
def annotatenoteswithmodel_zzz(user):

    req_data = request.get_json()
    model = modelRunnerApi(req_data['modelid'], getmodelurl(req_data['modelid']))
    selecteddataset = req_data['selecteddataset']

    updateElasticSearchAnnotationswithmodel(model, selecteddataset, esclient.es)
    dbclient.insertAnnotationsfordataset(model, selecteddataset)

    return jsonify({
        'status': 'success'
    }) 

@app.route("/annotatenoteswithmodel", methods=['POST'])
@login_required
def annotatenoteswithmodel(user):

    req_data = request.get_json()
    model = modelRunnerApi(req_data['modelid'], getmodelurl(req_data['modelid']))
    selecteddataset = req_data['selecteddataset']

    dbclient.insertAnnotationsfordataset(model, selecteddataset)

    return jsonify({
        'status': 'success'
    }) 

@app.route("/annotatesinglenotewithmodel", methods=['POST'])
@login_required
def annotatesinglenotewithmodel(user):

    req_data = request.get_json()
    text = req_data['text']
    
    model = modelRunnerApi(req_data['modelid'], getmodelurl(req_data['modelid']))
    results = model.requestannotations(text)

    return jsonify({
        'results': results
    })

@app.route("/fetchnotetypes", methods=['GET'])
@login_required
def getnotetypes(user):
    index = request.args.get('index')
    note_types = sorted([notetype['key'] for notetype in esclient.searchallnotetypes(index)])
    return jsonify(note_types)

@app.route("/testendpoint", methods=['POST'])
@login_required
def testendpoint(user):
    print('arrived at endpoint')
    return 'succesfully reached endpoint'


if __name__ == '__main__':    
   app.run(host='0.0.0.0', port=5001)