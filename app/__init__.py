from flask import Flask
from flask_socketio import SocketIO

from app.scheduler import init_scheduler

socketio = SocketIO()

def create_app():
    app = Flask(__name__, template_folder='../templates', static_folder='../static')
    app.config.from_object('app.config.Config')
    socketio.init_app(app)

    from app import routes
    app.register_blueprint(routes.bp)

    init_scheduler()

    return app
