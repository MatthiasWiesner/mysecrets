from datetime import timedelta

from flask import Flask
from flask_mongoengine import MongoEngine

app = Flask(__name__)
app.config.from_pyfile('config.py')

db = MongoEngine()
db.init_app(app)

if not app.config['DEBUG']:
    app.permanent_session_lifetime = timedelta(seconds=app.config['SESSION_LIFETIME'])

# register routes from controllers
from controllers import login
from controllers import main

