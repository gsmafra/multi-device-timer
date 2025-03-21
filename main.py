import time
import threading
from os import environ

import firebase_admin
from firebase_admin import credentials, db
from flask import Flask, render_template
from flask_socketio import SocketIO, emit

import scheduler

# Initialize Firebase Admin SDK
cred = credentials.Certificate(environ['FIREBASE_KEY_PATH'])
firebase_admin.initialize_app(cred, {'databaseURL': 'https://multi-device-timer-default-rtdb.firebaseio.com/'})

app = Flask(__name__)
socketio = SocketIO(app)

# Firebase database reference
timer_ref = db.reference('timer')

# Timer function
def run_timer():
    while True:
        timer_data = timer_ref.get()
        if timer_data and timer_data['running']:
            time.sleep(1)
            elapsed_time = int(time.time() - timer_data['start_time'])
            time_left = max(0, timer_data['time_left'] - elapsed_time)
            timer_ref.update({
                'time_left': time_left,
                'start_time': time.time()  # Reset start time
            })
            socketio.emit('update_timer', {'time_left': time_left})
            if time_left == 0:
                socketio.emit('timer_finished')
                timer_ref.update({'running': False})

# Start the timer
@app.route('/start/<int:duration>')
def start_timer(duration):
    timer_ref.set({
        'running': True,
        'time_left': duration,
        'start_time': time.time()
    })
    threading.Thread(target=run_timer, daemon=True).start()
    return 'Timer started'

# Pause the timer
@app.route('/pause')
def pause_timer():
    timer_ref.update({'running': False})
    return 'Timer paused'

# Resume the timer
@app.route('/resume')
def resume_timer():
    # Reset start_time on resume to avoid a jump in elapsed time
    timer_ref.update({
        'running': True,
        'start_time': time.time()
    })
    return 'Timer resumed'

# Add an endpoint to claim active status
@app.route('/claim_active/<deviceid>')
def claim_active(deviceid):
    active_ref = db.reference('active_device')
    active_ref.set(deviceid)
    # Emit new active device to all clients
    socketio.emit('active_device', {'active_device': deviceid})
    return 'Active device claimed'

# Ping endpoint
@app.route('/ping')
def ping():
    return 'Pong', 200

# Home route - serves the web interface
@app.route('/')
def index():
    return render_template('index.html')

# SocketIO event handling
@socketio.on('connect')
def on_connect():
    timer_data = timer_ref.get()
    time_left = timer_data['time_left'] if timer_data else 0
    emit('update_timer', {'time_left': time_left})
    active_ref = db.reference('active_device')
    active = active_ref.get() or ''
    emit('active_device', {'active_device': active})

# Start the Flask app with SocketIO
if __name__ == '__main__':
    port = int(environ.get('PORT', 5000))
    socketio.run(app, host='0.0.0.0', port=port, allow_unsafe_werkzeug=True)
