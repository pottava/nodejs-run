import os
import sys
import time

# クライアント識別子
CLIENT_ID = "002"

# データ取得頻度
PERIOD_SEC = 60


# 送信したいメトリクスを取得
def get_data():
    from datetime import datetime

    values = {
        "key": "metric-b",  # dummy
        "value": datetime.now().strftime("%S%M%H"),  # dummy
    }
    return values


def main():
    sys.path.append("..")
    from lib.googleCloud import API_ENDPOINT, API_PATH
    from lib.request import send_data

    apiEndpoint = os.getenv("API_ENDPOINT", API_ENDPOINT)
    apiPath = os.getenv("API_PATH", API_PATH)

    while True:
        send_data(apiEndpoint + apiPath + CLIENT_ID, get_data())
        time.sleep(PERIOD_SEC)


if __name__ == "__main__":
    main()
