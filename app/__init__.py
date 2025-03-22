from flask import Flask
from flask_socketio import SocketIO

from app import scheduler  # Scheduler is now part of the app package

socketio = SocketIO()

def create_app():
    # Specify the template folder location relative to this file.
    app = Flask(__name__, template_folder='../templates', static_folder='../static')
    app.config.from_object('app.config.Config')
    
    # Initialize extensions
    socketio.init_app(app)
    
    # Register blueprints
    from app import routes
    app.register_blueprint(routes.bp)

    return app
