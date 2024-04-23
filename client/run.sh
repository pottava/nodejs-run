#!/bin/bash
set -eu

cmdname=$( basename "$0" )

usage() {
  echo "使い方: ${cmdname} [-c client-id]" 1>&2
  echo "  -c : クライアント ID" 1>&2
  echo "  -l : ローカル実行 (default: false)" 1>&2
  echo "" 1>&2
  echo "例: ${cmdname} -c 001" 1>&2
  echo "" 1>&2
  exit 1
}

id=""
local=false

while getopts c:l:h opt
do
  case $opt in
    "c" ) id="${OPTARG}" ;;
    "l" ) local="${OPTARG}" ;;
    "h" ) usage ;;
      * ) usage ;;
  esac
done

if [ ! -e "${id}" ]; then
  echo -e "クライアント ID を指定してください.\n" 1>&2
  usage
fi

# クライアントの最新情報を確認
endpoint=""
versions=""
if [ $local ]; then
  versions="$( curl -s http://localhost:8080/api/v1/versions )"
else
  endpoint="$( gcloud run services describe "app" --region "asia-northeast1" --format 'value(status.url)' )"
  versions="$( curl -sH "Authorization: Bearer $( gcloud auth print-identity-token )" ${endpoint}/api/v1/versions )"
fi
tag="$( echo "${versions}" | jq -r '.client_001' )"

# イメージの取得
if [ $local ]; then
  tag="client-001"
else
  gcloud auth configure-docker asia-northeast1-docker.pkg.dev --quiet >/dev/null 2>&1
  docker pull "${tag}"
fi

# 処理実行
if [ $local ]; then
  endpoint="http://host.docker.internal:8080"
  secured="False"
else
  secured="True"
fi
docker run -d --name "uploader" --restart "always" \
    --net host --add-host "host.docker.internal:host-gateway" \
    -v "$HOME/.config/gcloud:/app/config:ro" \
    -e GOOGLE_APPLICATION_CREDENTIALS=/app/config/application_default_credentials.json \
    -e API_ENDPOINT="${endpoint}" -e API_SECURED="${secured}" \
    "${tag}"
