Node.js on Cloud Run
=====

## Google Cloud 準備

### API の有効化

```sh
gcloud services enable compute.googleapis.com artifactregistry.googleapis.com \
    iamcredentials.googleapis.com run.googleapis.com
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

### Cloud Run

BigQuery へデータを書き込むためのサービスアカウントを作成します。

```sh
project_id=$( gcloud config get-value project )
gcloud iam service-accounts create "sa-app" \
    --display-name "SA for APIs" --description "Service Account for APIs"
gcloud projects add-iam-policy-binding "${project_id}" \
    --member "serviceAccount:sa-app@${project_id}.iam.gserviceaccount.com" \
    --role "roles/bigquery.dataEditor"
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

### おまけ

デプロイした Cloud Run サービスをローカルに立てたプロキシを経由してアクセスしてみるには

```sh
gcloud beta run services proxy --region asia-northeast1 app
```
