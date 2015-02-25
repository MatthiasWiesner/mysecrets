from flask_script import Manager, Server

from server import app

manager = Manager(app)
manager.add_command('runserver', Server(
    host=app.config['HOST'], port=app.config['PORT']))

if __name__ == "__main__":
    manager.run()
