import json

from flask import render_template, request, Response, send_from_directory
from flask_login import login_required, current_user

from server import app
from models.comment import Comment
from models.user import User


@app.route('/comments/', methods=['GET'])
@login_required
def comments():
    return render_template('comment.html')


@app.route('/comment/', methods=['GET'])
@login_required
def get_comments():
    comments = [c.to_dict() for c in Comment.objects.all()]
    return Response(json.dumps(comments), mimetype='application/json',
                    status=200)


@app.route('/comment/', methods=['POST'])
@login_required
def save_comment():
    content = request.form['content']
    if not content:
        print "WTF"
        raise Exception('missing content')

    if 'id' in request.form:
        comment = Comment.objects.with_id(request.form['id'])
        comment.content = content
        comment.save()
    else:
        comment = Comment()
        comment.content = content
        comment.user = User.objects.get(name=current_user.name)
        comment.save()
    return Response(json.dumps(comment.to_dict()), mimetype='application/json',
                    status=200)


@app.route('/comment/', methods=['DELETE'])
@login_required
def delete_comment():
    id = request.form['id']
    if not id:
        raise Exception('missing id')

    comment = Comment.objects.with_id(request.form['id'])
    if comment.user != User.objects.get(name=current_user.name):
        raise Exception('wrong user')

    comment.delete()
    return Response('', status=200)
