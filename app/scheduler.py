import os
import atexit
import requests
from apscheduler.schedulers.background import BackgroundScheduler

from app.config import config

# Use an environment variable for the base URL, default to localhost for development
BASE_URL = os.environ.get("BASE_URL", "http://127.0.0.1:5000")
PING_URL = f"{BASE_URL}/ping"


def scheduled_ping():
    try:
        if config.SCHEDULER_ENABLED:
            response = requests.get(PING_URL, timeout=5)
            print("Scheduled ping response:", response.text)
    # pylint: disable=broad-except
    except Exception as e:
        print("Error during scheduled ping:", e)


def init_scheduler():
    scheduler = BackgroundScheduler()
    scheduler.add_job(func=scheduled_ping, trigger="interval", minutes=14)
    scheduler.start()
    atexit.register(scheduler.shutdown)
