import google.auth
import google.auth.transport.requests

# API 接続先
API_ENDPOINT = "https://app-xxxxx-an.a.run.app"
API_PATH = "/api/v1/metrics/"


# 認証
def auth():
    credentials, _ = google.auth.default()
    credentials.refresh(google.auth.transport.requests.Request())
    return credentials.id_token
