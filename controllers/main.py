import os
import re
import json

from flask import render_template, request, Response, send_from_directory
from flask_login import login_required, current_user

from server import app
from models.secret import get_user_secret_model, get_salted_classname


@app.route('/favicon.ico')
def favicon():
    return send_from_directory(os.path.join(app.root_path, 'static'), 'favicon.ico', mimetype='image/vnd.microsoft.icon')


@app.route('/')
@login_required
def main():
    return render_template('main.html', prefix=get_salted_classname(current_user))


@app.route('/secret/', methods=['GET'])
@login_required
def get_secrets():
    model = get_user_secret_model(current_user)
    collection = model.objects.all()
    data = [secret.to_dict() for secret in collection]
    return Response(json.dumps(data), mimetype='application/json', status=200)


@app.route('/secret/', methods=['POST'])
@login_required
def save_secret():
    data = request.form['data']
    if not data:
        raise Exception('missing data')
    model = get_user_secret_model(current_user)

    if 'id' in request.form:
        secret = model.objects.with_id(request.form['id'])
        secret.data = data
        if 'tags' in request.form:
            secret.tags = _convert_tags(request.form['tags'])
        secret.save()
    else:
        secret = model()
        secret.category = request.form['category']
        secret.data = request.form['data']
        if 'tags' in request.form:
            secret.tags = _convert_tags(request.form['tags'])
        secret.save()
    return Response(json.dumps(secret.to_dict()), mimetype='application/json', status=200)


@app.route('/secret/', methods=['DELETE'])
@login_required
def delete_secret():
    id = request.form['id']
    if not id:
        raise Exception('missing id')

    model = get_user_secret_model(current_user)
    secret = model.objects.with_id(request.form['id'])
    secret.delete()
    return Response('', status=200)


def _convert_tags(tags):
    taglist = re.split('[,; ]', tags)
    return [x for x in taglist if x]

