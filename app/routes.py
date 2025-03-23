import time
import threading
from os import environ

from flask import Blueprint, render_template
from flask_socketio import emit

import firebase_admin
from firebase_admin import credentials, db

bp = Blueprint('routes', __name__)

def init_firebase():
    cred = credentials.Certificate(environ['FIREBASE_KEY_PATH'])
    firebase_admin.initialize_app(cred, {'databaseURL': environ['FIREBASE_URL']})

# Call the initialization function during blueprint registration or app startup.
init_firebase()

def get_timer_ref():
    return db.reference('timer')

def get_active_ref():
    return db.reference('active_device')

from app import socketio

def run_timer(end_time):
    timer_ref = get_timer_ref()
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
    timer_ref = get_timer_ref()
    # Stop any currently running timer by updating the DB
    timer_ref.update({'running': False})

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
    get_timer_ref().update({'running': False})
    return 'Timer paused'

@bp.route('/claim_active/<deviceid>')
def claim_active(deviceid):
    active_ref = get_active_ref()
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
    timer_ref = get_timer_ref()
    timer_data = timer_ref.get()
    time_left = timer_data['time_left'] if timer_data else 0
    emit('update_timer', {'time_left': time_left})
    
    active_ref = get_active_ref()
    active = active_ref.get() or ''
    emit('active_device', {'active_device': active})
