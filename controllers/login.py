from flask import request, redirect, render_template
from flask_login import (LoginManager, login_user, logout_user, UserMixin)

from server import app
from models.user import User as UserModel

login_manager = LoginManager()
login_manager.login_view = '/login/'
login_manager.init_app(app)


class User(UserMixin):
    def __init__(self, name, password):
        self.id = self.name = name
        self.password = password

    @staticmethod
    def get(name):
        try:
            user = UserModel.objects.get(name=name)
            return User(user.name, user.password)
        except UserModel.DoesNotExist:
            pass


@login_manager.user_loader
def load_user(name):
    return User.get(name)


@app.route('/logout/')
def logout_page():
    logout_user()
    return redirect('/')


@app.route('/login/', methods=['GET', 'POST'])
def login_page():
    if request.method == 'POST':
        user = User.get(request.form['name'])
        if user and UserModel.hash_pass(request.form['password']) == user.password:
            login_user(user, remember=True)
            return redirect(request.args.get('next') or '/')
    return render_template('login.html', title='Login')


@app.route('/register/', methods=['GET', 'POST'])
def register_page():
    if request.method == 'POST':
        user = UserModel()
        user.name = request.form['name']
        user.password = UserModel.hash_pass(request.form['password'])
        user.save()

        login_user(load_user(request.form['name']), remember=True)
        return redirect(request.args.get('next') or '/')
    return render_template('login.html', title='Register')


