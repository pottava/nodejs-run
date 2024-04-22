import json
import logging
import os
import sys

import requests

from .googleCloud import auth

logging.basicConfig(
    stream=sys.stdout,
    level=logging.DEBUG,
    format="%(asctime)s, %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)


# データ送信
def send_data(url, data):
    headers = {"Content-Type": "application/json"}
    if str(os.getenv("API_SECURED")).lower() == "true":
        headers["Authorization"] = "Bearer " + auth()
    try:
        res = requests.post(url, data=json.dumps(data), headers=headers)
        res.raise_for_status()
    except requests.exceptions.HTTPError as e:
        logging.error(f"HTTP error occurred: {e}, Status code: {res.status_code}")
        return False
    except requests.exceptions.RequestException as e:
        logging.error(f"Request failed: {e}")
        return False
    logging.debug(f"Response: {res}")
    return True
