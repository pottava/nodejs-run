Client apps
===

## ローカル開発

### 依存関係解決

```sh
python -m pip install requests google.auth flake8 isort black
```

### Google Cloud 認証

```sh
gcloud auth application-default login
```

### データ送信実行

```sh
cd 001
endpoint="$( gcloud run services describe "app" --region "asia-northeast1" --format 'value(status.url)' )"
API_ENDPOINT=${endpoint} API_SECURED=True python main.py
```

### ツール

Format

```sh
python -m black .
python -m isort .
```

Lint

```sh
python -m flake8 --exclude=.venv --extend-ignore=E203,E402 --max-line-length=120 --show-source .
```

## コンテナ

### ビルド

```sh
docker build -t client-001 --build-arg CLIENT=001 .
```

### 実行

```sh
docker run --rm \
    -v "$HOME/.config/gcloud:/app/config:ro" \
    -e GOOGLE_APPLICATION_CREDENTIALS=/app/config/application_default_credentials.json \
    -e API_ENDPOINT=$( gcloud run services describe "app" --region "asia-northeast1" --format 'value(status.url)' ) \
    -e API_SECURED=True \
    client-001
```
