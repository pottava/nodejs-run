Node.js on Cloud Run
=====

## Google Cloud 準備

### API の有効化

```sh
gcloud services enable compute.googleapis.com artifactregistry.googleapis.com \
    iamcredentials.googleapis.com run.googleapis.com bigquery.googleapis.com \
    secretmanager.googleapis.com
```

### Artifact Registry にリポジトリを作成

```sh
gcloud artifacts repositories create apps --repository-format docker --location asia-northeast1
```

### BigQuery

データセットを作成し

```sh
bq --location "asia-northeast1" mk --dataset default
```

テーブルを作成します

```sh
bq mk --table --description "Metrics table" \
    --schema 'ts:TIMESTAMP,key:STRING,metric:STRING' \
    --time_partitioning_field ts \
    --time_partitioning_type DAY \
    default.metrics
```

### API server on Cloud Run

サービスアカウントを作成し、以下の権限を付与します。

- BigQuery へデータを書き込む
- Secret Manager からデータを読み込む（次の手順）

```sh
project_id=$( gcloud config get-value project )
gcloud iam service-accounts create "sa-app" \
    --display-name "SA for APIs" --description "Service Account for APIs"
gcloud projects add-iam-policy-binding "${project_id}" \
    --member "serviceAccount:sa-app@${project_id}.iam.gserviceaccount.com" \
    --role "roles/bigquery.dataEditor"
```

### Secret Manager

外部 API 用のキーを登録

```sh
echo -n "my-super-secret-apikey" | gcloud secrets create apikey-001 \
    --replication-policy "automatic" --data-file=-
gcloud secrets add-iam-policy-binding apikey-001 \
    --member "serviceAccount:sa-app@${project_id}.iam.gserviceaccount.com" \
    --role "roles/secretmanager.secretAccessor"
```

## GitHub Actions によるトリガー

### Workload Identity Federation の準備

CI/CD 用のサービスアカウント作成

```sh
gcloud iam service-accounts create "sa-cicd" \
    --display-name "SA for CI/CD" --description "Service Account for CI/CD pipelines"
gcloud projects add-iam-policy-binding "${project_id}" \
    --member "serviceAccount:sa-cicd@${project_id}.iam.gserviceaccount.com" \
    --role "roles/viewer"
gcloud projects add-iam-policy-binding "${project_id}" \
    --member "serviceAccount:sa-cicd@${project_id}.iam.gserviceaccount.com" \
    --role "roles/storage.admin"
gcloud projects add-iam-policy-binding "${project_id}" \
    --member "serviceAccount:sa-cicd@${project_id}.iam.gserviceaccount.com" \
    --role "roles/run.developer"
```

CI ツールと連携する Workload Identity を作り

```sh
gcloud iam workload-identity-pools create "idpool-cicd" --location "global" \
    --display-name "Identity pool for CI/CD services"
gcloud iam workload-identity-pools providers create-oidc "idp-github" \
    --workload-identity-pool "idpool-cicd" --location "global" \
    --issuer-uri "https://token.actions.githubusercontent.com" \
    --attribute-mapping "google.subject=assertion.sub,attribute.repository=assertion.repository" \
    --display-name "Workload IdP for GitHub"
idp_id=$( gcloud iam workload-identity-pools describe "idpool-cicd" \
    --location "global" --format "value(name)" )
```

リポジトリに対し、この SA の利用を許可します。

```sh
repo=<org-id>/<repo-id>
gcloud iam service-accounts add-iam-policy-binding \
    sa-cicd@${project_id}.iam.gserviceaccount.com \
    --member "principalSet://iam.googleapis.com/${idp_id}/attribute.repository/${repo}" \
    --role "roles/iam.workloadIdentityUser"
cat << EOF

GOOGLE_CLOUD_PROJECT:
    ${project_id}

GOOGLE_CLOUD_WORKLOAD_IDP:
    $( gcloud iam workload-identity-pools providers describe "idp-github" \
        --workload-identity-pool "idpool-cicd" --location "global" \
        --format "value(name)" )

EOF
```

プロジェクトの Actions secrets and variables に以下の値を設定します。

- GOOGLE_CLOUD_PROJECT: プロジェクト ID
- GOOGLE_CLOUD_WORKLOAD_IDP: Workload Identity の IdP ID

### git コマンドでパイプラインを起動

```sh
git add .
git commit -m "Add files"
git push origin main
```

## ローカル開発

### API サーバーの起動

```sh
cd server/src
npm run lint
npm start
```

### Docker での API サーバー起動

```sh
docker build -t apis server/src
docker run --name apis --rm -p 8080:8080 \
    -v "$HOME/.config/gcloud:/app/config:ro" \
    --env PROJECT_ID=$PROJECT_ID \
    --env CLOUDSDK_CONFIG=/app/config \
    --env GOOGLE_APPLICATION_CREDENTIALS=/app/config/application_default_credentials.json \
    apis
```

### Cloud Run への接続

```sh
endpoint="$( gcloud run services describe "app" --region "asia-northeast1" --format 'value(status.url)' )"
curl -iXPOST -H "Authorization: Bearer $(gcloud auth print-identity-token)" \
    -H 'Content-Type: application/json' -d '{"key":1,"value":"0.1"}' \
    "${endpoint}/api/v1/external-apis/001"
```


### おまけ

デプロイした Cloud Run サービスをローカルに立てたプロキシを経由してアクセスしてみるには

```sh
gcloud beta run services proxy --region asia-northeast1 app
```
