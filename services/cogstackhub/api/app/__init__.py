from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_admin import Admin
from flask_admin.contrib.sqla import ModelView

user = 'root'
password = 'root'
host = 'host.docker.internal'
port = '5555'
database = 'cogstack_db'
db_config = f'postgresql+psycopg2://{user}:{password}@{host}:{port}/{database}'


# instantiate the app
# DEBUG = True
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = db_config
app.config['SECRET_KEY'] = 'randomsecretkey'
app.config['SQLALCHEMY_COMMIT_ON_TEARDOWN'] = True
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['FLASK_ADMIN_SWATCH'] = 'cerulean'

# load app into database
db = SQLAlchemy(app)
# set optional bootswatch theme

# admin = Admin(app, name='microblog', template_mode='bootstrap3')
# admin.add_view(ModelView(app.User, db.session))

# Add administrative views here
# enable CORS
CORS(app, resources={r'/*': {'origins': '*'}})
