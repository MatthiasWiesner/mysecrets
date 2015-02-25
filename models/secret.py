from datetime import datetime
from hashlib import md5

import server


class Secret(object):
    category = server.db.StringField(required=True)
    data = server.db.StringField(required=True)
    tags = server.db.ListField()
    date = server.db.DateTimeField(default=datetime.now())

    def to_dict(self):
        return dict(
            id=str(self.id),
            category=self.category,
            data=self.data,
            tags=self.tags,
            date=self.date.strftime('%Y-%m-%d %H:%M:%S'))


def get_salted_classname(user):
    return md5(user.name + user.password + server.app.config['SECRET_KEY']).hexdigest()


def get_user_secret_model(user):
    klass = server.db.Document.__metaclass__(get_salted_classname(user), (server.db.Document, Secret), {})
    return klass