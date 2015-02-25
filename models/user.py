from hashlib import md5
import server


class User(server.db.Document):
    name = server.db.StringField(max_length=60, unique=True)
    password = server.db.StringField(min_length=8, max_length=60)

    @staticmethod
    def hash_pass(password):
        salted_password = password + server.app.config['SECRET_KEY']
        return md5(salted_password).hexdigest()
