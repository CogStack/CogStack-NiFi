'''
    Provides a wrapper around all possible models that can be run on Cogstackhub
'''
from medcat.cdb import CDB
from medcat.vocab import Vocab
from medcat.cat import CAT
from . import modelsInfo
import pandas as pd
import abc


class modelRunnerFactory:
    def createModelRunner(self, modelspath, modelname):
        
        modeltype = modelsInfo.getmodelcard(modelname)['model_type']

        if modeltype == 'medcat': 
            return medcatModelRunner(modelspath, modelname)
        else:
            return nonmedcatModelRunner(modelspath, modelname)


class modelRunner(metaclass=abc.ABCMeta):

    @abc.abstractmethod
    def loadModel(self):
        pass

    @abc.abstractmethod
    def annotate(self, text):
        pass


class medcatModelRunner(modelRunner):
    def __init__(self, modelspath, modelname):
        self.modelpath = '{}/{}'.format(modelspath, modelname)
        self.modelname = modelname
        self.loadModel()

    def loadModel(self):

        vocab = Vocab.load(f'{self.modelpath}/vocab.dat')
        cdb = CDB.load(f'{self.modelpath}/cdb.dat')
        self.model = CAT(cdb=cdb, config=cdb.config, vocab=vocab)
    
    def annotate(self, text):

        doc = self.model.get_entities(text)
        df = pd.DataFrame(doc['entities'].values())
        pretty_names = list(df['pretty_name'])
        concept_ids = list(df['cui'])
        starts = list(df['start'])
        ends = list(df['end'])
        ids = list(df['id'])
        model_ids = [self.modelname] * len(ids)
        document_level_annotation = [False] * len(ids)
        
        return pretty_names, concept_ids, starts, ends, ids, model_ids, document_level_annotation

# dummy document level annotator
class nonmedcatModelRunner(modelRunner):
    def __init__(self, modelspath, modelname):
        self.modelpath = modelspath + modelname
        self.modelname = modelname
        self.loadModel()

    def loadModel(self):
        print('loaded document level annotator')
    
    def annotate(self, text):

        pretty_names = ['dummy_code', 'dummy_word', 'dummy_word2']
        concept_ids = ['d1', 'd2', 'd3']
        starts = [0,0,0] # never used but indicate that label covers entire document
        ends = [-1,-1,-1]
        ids = [0,1,2]
        model_ids = [self.modelname] * len(ids)
        document_level_annotation = [True] * len(ids)

        return pretty_names, concept_ids, starts, ends, ids, model_ids, document_level_annotation



