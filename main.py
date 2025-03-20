from flask import Flask, render_template
from flask_socketio import SocketIO, emit
import time
import threading

app = Flask(__name__)
socketio = SocketIO(app)

# Timer state variables
timer_running = False
time_left = 0
start_time = 0

# Timer function
def run_timer():
    global time_left, timer_running, start_time
    while timer_running:
        time.sleep(1)
        if timer_running:
            elapsed_time = int(time.time() - start_time)
            time_left = max(0, time_left - elapsed_time)
            start_time = time.time()  # Reset start time
            socketio.emit('update_timer', {'time_left': time_left})
            if time_left == 0:
                socketio.emit('timer_finished')
                timer_running = False

# Start the timer
@app.route('/start/<int:duration>')
def start_timer(duration):
    global timer_running, time_left, start_time
    time_left = duration
    start_time = time.time()
    timer_running = True
    threading.Thread(target=run_timer, daemon=True).start()
    return 'Timer started'

# Pause the timer
@app.route('/pause')
def pause_timer():
    global timer_running
    timer_running = False
    return 'Timer paused'

# Reset the timer
@app.route('/reset')
def reset_timer():
    global timer_running, time_left
    timer_running = False
    time_left = 0
    socketio.emit('update_timer', {'time_left': time_left})
    return 'Timer reset'

# Home route - serves the web interface
@app.route('/')
def index():
    return render_template('index.html')

# SocketIO event handling
@socketio.on('connect')
def on_connect():
    emit('update_timer', {'time_left': time_left})

# Start the Flask app with SocketIO
if __name__ == '__main__':
    socketio.run(app, debug=True)
