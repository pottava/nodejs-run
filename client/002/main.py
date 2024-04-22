import os
import sys
import time

# クライアント識別子
CLIENT_ID = "002"


# 送信したい指標を取得
def get_data():
    from datetime import datetime

    values = {
        "key": "metric-b",  # dummy
        "value": datetime.now().strftime("%S%M%H"),  # dummy
    }
    return values


sys.path.append("..")
from lib.googleCloud import API_ENDPOINT, API_PATH
from lib.request import send_data

while True:
    send_data(
        os.getenv("API_ENDPOINT", API_ENDPOINT)
        + os.getenv("API_PATH", API_PATH)
        + CLIENT_ID,
        get_data(),
    )
    time.sleep(60)
