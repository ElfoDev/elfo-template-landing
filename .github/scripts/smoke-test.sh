#!/usr/bin/env bash
# Smoke test de um site publicado: responde 200 e tem um CTA de WhatsApp (wa.me).
# Uso: smoke-test.sh <url>
# Tenta SMOKE_ATTEMPTS vezes (padrão 12, ~2 min) com 10 s de intervalo: logo após o deploy
# a URL pode levar um tempo para responder (DNS/TLS de preview novo leva alguns minutos).
set -euo pipefail

url="${1:?uso: smoke-test.sh <url>}"
url="${url%/}/"
attempts="${SMOKE_ATTEMPTS:-12}"
body="$(mktemp)"
trap 'rm -f "$body"' EXIT

status="000"
for i in $(seq 1 "$attempts"); do
  status="$(curl -sS -L -o "$body" -w '%{http_code}' --max-time 20 "$url" || echo "000")"
  if [ "$status" = "200" ] && grep -Eq 'href="https://wa\.me/[0-9]+' "$body" \
    && grep -q 'data-whatsapp-cta=' "$body"; then
    echo "✅ $url respondeu 200 e tem CTA de WhatsApp (tentativa $i)."
    exit 0
  fi
  echo "Tentativa $i/$attempts: HTTP $status, CTA wa.me ainda não encontrado."
  [ "$i" -eq "$attempts" ] || sleep 10
done

if [ "$status" = "200" ]; then
  echo "::error title=Smoke test falhou::$url respondeu 200, mas sem CTA de WhatsApp (link https://wa.me/... com data-whatsapp-cta)."
else
  echo "::error title=Smoke test falhou::$url respondeu HTTP $status (esperado 200)."
fi
exit 1
