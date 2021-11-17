from flask_admin.contrib.sqla import ModelView
from flask_security import Security, SQLAlchemyUserDatastore, UserMixin, RoleMixin, login_required, current_user
from flask import Flask, url_for, redirect, render_template, request
from flask_admin import Admin, expose, helpers
import flask_admin as admin
from app.models import User, MLModel, MLModelAccess
from app import app, db
import flask_login as login
from wtforms import form, fields, validators

# Define login and registration forms (for flask-login)
class LoginForm(form.Form):
    login = fields.StringField(validators=[validators.required()])
    password = fields.PasswordField(validators=[validators.required()])

    def validate_login(self, field):
        user = self.get_user()

        if user is None:
            raise validators.ValidationError('Invalid user')

        # we're comparing the plaintext pw with the the hash from the db
        if not user.validate_password(self.password.data):
        # to compare plain text passwords use
        # if user.password != self.password.data:
            raise validators.ValidationError('Invalid password')

    def get_user(self):
        return db.session.query(User).filter_by(username=self.login.data).first()

# Create customized model view class
class MyModelView(ModelView):

    # column_editable_list = (MLModelAccess.users_id, 'mlmodel')

    def is_accessible(self):
        return login.current_user.is_authenticated

# Initialize flask-login
def init_login():
    login_manager = login.LoginManager()
    login_manager.init_app(app)

    # Create user loader function
    @login_manager.user_loader
    def load_user(user_id):
        return db.session.query(User).get(user_id)

# Create customized index view class that handles login & registration
class MyAdminIndexView(admin.AdminIndexView):

    @expose('/')
    def index(self):
        if not login.current_user.is_authenticated:
            return redirect(url_for('.login_view'))
        return super(MyAdminIndexView, self).index()

    @expose('/login/', methods=('GET', 'POST'))
    def login_view(self):
        # handle user login
        form = LoginForm(request.form)
        if helpers.validate_form_on_submit(form):
            user = form.get_user()
            login.login_user(user)

        if login.current_user.is_authenticated:
            return redirect(url_for('.index'))

        self._template_args['form'] = form
        return super(MyAdminIndexView, self).index()


    @expose('/logout/')
    def logout_view(self):
        login.logout_user()
        return redirect(url_for('.index'))


init_login()
app.config['FLASK_ADMIN_SWATCH'] = 'cerulean'

# Create admin
admin_comp = admin.Admin(app, 'CogstackHub Backend', index_view=MyAdminIndexView(), base_template='my_master.html', template_mode='bootstrap4')

# Add views
admin_comp.add_view(MyModelView(User, db.session))
admin_comp.add_view(MyModelView(MLModel, db.session))
admin_comp.add_view(MyModelView(MLModelAccess, db.session))