#!/usr/bin/env bash
# Diz se o Worker já existe na conta da Cloudflare (`wrangler versions upload` só funciona
# depois que o Worker foi criado por um `wrangler deploy`).
# Uso: worker-exists.sh <nome-do-worker>   (env CLOUDFLARE_API_TOKEN e CLOUDFLARE_ACCOUNT_ID)
# Grava `exists=true|false` em $GITHUB_OUTPUT. Só um 404 da API conta como "não existe":
# qualquer outra resposta (erro de rede, token sem permissão de leitura...) vira um aviso e
# `exists=true`, para o upload rodar e mostrar o erro real do wrangler.
set -euo pipefail

name="${1:?uso: worker-exists.sh <nome-do-worker>}"
: "${CLOUDFLARE_API_TOKEN:?CLOUDFLARE_API_TOKEN não definido}"
: "${CLOUDFLARE_ACCOUNT_ID:?CLOUDFLARE_ACCOUNT_ID não definido}"
output="${GITHUB_OUTPUT:-/dev/null}"

body="$(mktemp)"
trap 'rm -f "$body"' EXIT

url="https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/workers/scripts/${name}/settings"
status="$(curl -sS -o "$body" -w '%{http_code}' --max-time 30 \
  -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" "$url" || echo "000")"

case "$status" in
  200)
    echo "Worker '$name' já existe."
    echo "exists=true" >>"$output"
    ;;
  404)
    echo "::notice title=Worker ainda não existe::O Worker '$name' ainda não foi criado (nenhum deploy de produção deu certo). O preview vai publicar a branch principal primeiro para criá-lo."
    echo "exists=false" >>"$output"
    ;;
  *)
    echo "::warning title=Não deu para checar o Worker::A API da Cloudflare respondeu HTTP $status ao procurar o Worker '$name'; seguindo com o upload do preview."
    echo "exists=true" >>"$output"
    ;;
esac
