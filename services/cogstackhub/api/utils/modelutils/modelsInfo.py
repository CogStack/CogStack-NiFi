import sys, os
sys.path.append(os.path.abspath(os.path.join(os.getcwd(), '../..')))
from app.models import db, MLModel, User, MLModelAccess
from .modelRunnerApi import modelRunnerApi

def getLatestReleaseNames(user):
    ml_models = [m.mlmodel for m in  MLModelAccess.query.filter_by(users=user).all()]
    ml_model_cards = [getmodelcard(ml_model) for ml_model in ml_models]

    return ml_model_cards

def getmodelcard(mlmodel):
    model_card_dict = {
        'model_name': mlmodel.modelname,
        'model_type': mlmodel.modeltype,
        'model_id': mlmodel.id
    }
    
    return model_card_dict

def getmodelcardbyid(mlmodelid):
    mlmodel = MLModel.query.filter_by(id=mlmodelid).first()
    model_card_dict = {
        'model_name': mlmodel.modelname,
        'model_type': mlmodel.modeltype,
        'model_id': mlmodel.id
    }
    
    return model_card_dict

def getmodelurl(mlmodelid):
    return MLModel.query.filter_by(id=mlmodelid).first().modeladdress

def checkmodelonline(mlmodelid):
    model = modelRunnerApi(mlmodelid, getmodelurl(mlmodelid))
    try:
        # ideally each model should have an endpoint that does not require running actual model
        results = model.requestannotations(text='')
        online = True if results == [] else False
    except:
        online = False
    
    return online

