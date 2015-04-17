import os
import json
from datetime import timedelta

HOST = os.environ.get('HOST', '0.0.0.0')
PORT = os.environ.get('PORT', 5000)
DEBUG = os.environ.get('DEBUG', 'False') == 'True'
SESSION_LIFETIME = os.environ.get('SESSION_LIFETIME', 3600)

SECRET_KEY = os.environ.get('SECRET_KEY', 'mysecretkey')
REMEMBER_COOKIE_DURATION = timedelta(seconds=os.environ.get('TOKEN_DURATION', 10))

MONGODB_SETTINGS = {'db': 'testing'}

try:
    cred_file = open(os.environ.get('CRED_FILE', ''))
    creds = json.load(cred_file)
    MONGODB_SETTINGS = {
        'db': creds['MONGOLAB']['MONGOLAB_URI'].split('/')[-1],
        'host': creds['MONGOLAB']['MONGOLAB_URI']
    }
except IOError:
    pass
