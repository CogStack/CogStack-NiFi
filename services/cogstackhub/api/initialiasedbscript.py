from app.models import db, User, MLModel, MLModelAccess
from elasticsearch import Elasticsearch
import os

# Create an empty database
db.create_all()

# Create a dummy user account
user1 = User(username='user1', password='user1')
db.session.add(user1)
db.session.commit()

# Verify that user has been added
print(User.query.filter_by(username='user1').first())

# Create elasticsearch priorities table
es_host =  os.getenv("ES_HOST", "0.0.0.0")
es = Elasticsearch([{'host': es_host, 'port': 9200}], http_auth=('admin','admin'))

es.indices.create(index='priorities')