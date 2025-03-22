import atexit
import requests
from apscheduler.schedulers.background import BackgroundScheduler

def scheduled_ping():
    try:
        # Pinging your own /ping endpoint
        response = requests.get('http://127.0.0.1:5000/ping')
        print("Scheduled ping response:", response.text)
    except Exception as e:
        print("Error during scheduled ping:", e)

scheduler = BackgroundScheduler()
scheduler.add_job(func=scheduled_ping, trigger="interval", minutes=14)
scheduler.start()

# Ensure the scheduler shuts down when exiting the app
atexit.register(lambda: scheduler.shutdown())
