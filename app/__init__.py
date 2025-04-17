from flask import Flask
from app import routes
from app.socketio import socketio
from app.scheduler import init_scheduler


def create_app():
    app = Flask(__name__, template_folder="../templates", static_folder="../static")
    app.config.from_object("app.config.Config")
    socketio.init_app(app)
    app.register_blueprint(routes.bp)

    init_scheduler()

    return app
