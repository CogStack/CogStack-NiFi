from enum import unique
from app import db
from sqlalchemy.ext.hybrid import hybrid_property
from werkzeug.security import generate_password_hash, check_password_hash


class User(db.Model):
    __tablename__ = 'user'

    id = db.Column(db.Integer, primary_key=True) # primary keys are required by SQLAlchemy
    username = db.Column(db.String(1000), unique=True, nullable=False)
    _password_hash = db.Column('password',db.String(100))

    @classmethod
    def authenticate(cls, **kwargs):
        username = kwargs.get('username')
        password = kwargs.get('password')
        
        if not username or not password:
            return None

        user = User.query.filter_by(username=username).first_or_404()

        if user.validate_password(password):
            print('user found', user)
            return user
        else:
            return None

    @hybrid_property
    def password(self):
        return self._password_hash

    @password.setter
    def password(self, plaintext):
        self._password_hash = generate_password_hash(plaintext)

    def validate_password(self, password):
        return check_password_hash(self._password_hash, password)

    def to_dict(self):
        return dict(id=self.id, username=self.username)
    
    # Flask-Login integration
    @property
    def is_authenticated(self):
        return True
    
    # Flask-Login integration
    @property
    def is_active(self):
        return True

    # Flask-Login integration
    @property
    def is_anonymous(self):
        return False

    def get_id(self):
        return self.id

    # # Required for administrative interface
    # def __unicode__(self):
    #     return self.username
    
    def __repr__(self):
        return self.username


''''
Class for storing available models, docker status (online/offline) etc
'''
class MLModel(db.Model):
    __tablename__ = 'mlmodel'

    id = db.Column(db.Integer, primary_key=True) # primary keys are required by SQLAlchemy
    modelname = db.Column(db.String(1000), unique=True, nullable=False)
    modeladdress = db.Column(db.String(1000), unique=True, nullable=False)
    modeltype = db.Column(db.String(1000), unique=True, nullable=False)
    modeldescription = db.Column(db.String(1000), unique=True, nullable=False)

    def __repr__(self):
        return self.modelname

''''
Class for mapping models to users
'''
class MLModelAccess(db.Model):
    __tablename__ = 'mlmodelaccess'

    id = db.Column(db.Integer, primary_key=True) # primary keys are required by SQLAlchemy

    users_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    users = db.relationship("User", backref=db.backref('mlmodelaccess', cascade='delete, delete-orphan'))

    mlmodel_id = db.Column(db.Integer, db.ForeignKey('mlmodel.id'), nullable=False)
    mlmodel = db.relationship("MLModel", backref=db.backref('mlmodelaccess', cascade='delete, delete-orphan'))


''''
Class for datasets 
'''
class Dataset(db.Model):
    __tablename__ = 'dataset'

    id = db.Column(db.Integer, primary_key=True) # primary keys are required by SQLAlchemy
    datasetname = db.Column(db.String(1000), nullable=False, unique=True)
    description = db.Column(db.String(1000), nullable=True)

    def __repr__(self):
        return self.datasetname


''''
Class for Text 
'''
class Text(db.Model):
    __tablename__ = 'text'

    id = db.Column(db.Integer, primary_key=True) # primary keys are required by SQLAlchemy
    text = db.Column(db.Text, nullable=False)
    creationdate = db.Column(db.DateTime, nullable=False)

    dataset_id = db.Column(db.Integer, db.ForeignKey('dataset.id'), nullable=False)
    dataset = db.relationship("Dataset", backref=db.backref('text', cascade='delete, delete-orphan'))

    patient_id = db.Column(db.Integer, db.ForeignKey('patient.id'), nullable=False)
    patient = db.relationship("Patient", backref=db.backref('text', cascade='delete, delete-orphan'))




''''
Class for storing annotations
'''
class Annotation(db.Model):
    __tablename__ = 'annotation'

    id = db.Column(db.Integer, primary_key=True) # primary keys are required by SQLAlchemy
    annotationlabel = db.Column(db.String(1000), nullable=False)
    annotationid = db.Column(db.String(1000), nullable=False)
    annotationstartindex = db.Column(db.Integer, nullable=False)
    annotationendindex = db.Column(db.Integer, nullable=False)
    creationdate = db.Column(db.DateTime, nullable=True)

    annotationsourcevalue = db.Column(db.String(1000), nullable=True)
    annotationconcepttype = db.Column(db.String(1000), nullable=True)
    annotationdomain = db.Column(db.String(1000), nullable=True)
    annotationaccuracy = db.Column(db.Float, nullable=True)

    mlmodel_id = db.Column(db.Integer, db.ForeignKey('mlmodel.id'), nullable=False)
    mlmodel = db.relationship("MLModel", backref=db.backref('annotation', cascade='delete, delete-orphan'))

    text_id = db.Column(db.Integer, db.ForeignKey('text.id'), nullable=False)
    text = db.relationship("Text", backref=db.backref('annotation', cascade='delete, delete-orphan'))

    __table_args__ = (db.UniqueConstraint('text_id', 'mlmodel_id', 'annotationid', 'annotationstartindex', 'annotationendindex', name='_annotation_uc'),) 


''''
Class for storing meta annotations
'''
class MetaAnnotation(db.Model):
    __tablename__ = 'metaannotation'

    id = db.Column(db.Integer, primary_key=True) # primary keys are required by SQLAlchemy
    type = db.Column(db.String(1000), nullable=False) # attribute (negation/experiencer) or relation (e.g. (500mg) is DOSE OF (paracetemol))
    metaannotationtask = db.Column(db.String(1000), nullable=False) # e.g negation, experiencer
    metaannotationvalue = db.Column(db.String(1000), nullable=False) # e.g negation->negated/affirmed
    creationdate = db.Column(db.DateTime, nullable=True)

    annotation_id = db.Column(db.Integer, db.ForeignKey('annotation.id'), nullable=False)
    annotation = db.relationship("Annotation", backref=db.backref('metaannotation', cascade='delete, delete-orphan'))

    __table_args__ = (db.UniqueConstraint('annotation_id', 'metaannotationtask', name='_metaannotation_uc'),) 

''''
Class for storing patients
'''
class Patient(db.Model):
    __tablename__ = 'patient'

    id = db.Column(db.Integer, primary_key=True) # primary keys are required by SQLAlchemy
    patient_id = db.Column(db.String(1000), nullable=False, unique=True)
    date_of_birth = db.Column(db.DateTime, nullable=True)
    gender = db.Column(db.String(1000), nullable=True)
    ethnicity = db.Column(db.String(1000), nullable=True)