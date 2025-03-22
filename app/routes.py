import time
import threading
from os import environ

from flask import Blueprint, render_template
from flask_socketio import emit

import firebase_admin
from firebase_admin import credentials, db

# Create a blueprint for our routes
bp = Blueprint('routes', __name__)

# Initialize Firebase Admin SDK if not already initialized.
if not firebase_admin._apps:
    cred = credentials.Certificate(environ['FIREBASE_KEY_PATH'])
    firebase_admin.initialize_app(cred, {
        'databaseURL': 'https://multi-device-timer-default-rtdb.firebaseio.com/'
    })

# Get a reference to the Firebase realtime database
timer_ref = db.reference('timer')

# Import the shared SocketIO instance from __init__.py
from app import socketio

# Timer function using a fixed end_time for accuracy
def run_timer(end_time):
    while True:
        time.sleep(0.5)  # Check more frequently for smoother updates
        current_time = time.time()

        # Check if the timer is still running
        timer_data = timer_ref.get()
        if not timer_data.get('running', False):
            break

        time_left = int(max(0, end_time - current_time))
        timer_ref.update({'time_left': time_left})
        socketio.emit('update_timer', {'time_left': time_left})

        if time_left == 0:
            socketio.emit('timer_finished')
            timer_ref.update({'running': False})
            break

@bp.route('/start/<int:duration>')
def start_timer(duration):
    end_time = time.time() + duration
    timer_ref.set({
        'running': True,
        'time_left': duration,
        'end_time': end_time
    })
    threading.Thread(target=run_timer, args=(end_time,), daemon=True).start()
    return 'Timer started'

@bp.route('/pause')
def pause_timer():
    timer_ref.update({'running': False})
    return 'Timer paused'

@bp.route('/claim_active/<deviceid>')
def claim_active(deviceid):
    active_ref = db.reference('active_device')
    active_ref.set(deviceid)
    socketio.emit('active_device', {'active_device': deviceid})
    return 'Active device claimed'

@bp.route('/ping')
def ping():
    return 'Pong', 200

@bp.route('/')
def index():
    return render_template('index.html')

@socketio.on('connect')
def on_connect():
    timer_data = timer_ref.get()
    time_left = timer_data['time_left'] if timer_data else 0
    emit('update_timer', {'time_left': time_left})
    active_ref = db.reference('active_device')
    active = active_ref.get() or ''
    emit('active_device', {'active_device': active})
