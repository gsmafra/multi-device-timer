import os


class Config:
    # pylint: disable=too-few-public-methods
    DEBUG = False
    SCHEDULER_ENABLED = os.environ.get("SCHEDULER_ENABLED", False)


config = Config()
