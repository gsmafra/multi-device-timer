import os
import atexit
import requests
from apscheduler.schedulers.background import BackgroundScheduler

# Use an environment variable for the base URL, default to localhost for development
BASE_URL = os.environ.get("BASE_URL", "http://127.0.0.1:5000")
PING_URL = f"{BASE_URL}/ping"

def scheduled_ping():
    try:
        response = requests.get(PING_URL)
        print("Scheduled ping response:", response.text)
    except Exception as e:
        print("Error during scheduled ping:", e)

scheduler = BackgroundScheduler()
scheduler.add_job(func=scheduled_ping, trigger="interval", minutes=14)
scheduler.start()

atexit.register(lambda: scheduler.shutdown())
