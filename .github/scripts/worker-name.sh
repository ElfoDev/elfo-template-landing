#!/usr/bin/env bash
# Nome do Worker na Cloudflare (vira o subdomínio <nome>.<conta>.workers.dev).
# Usa a variável CLOUDFLARE_WORKER_NAME se existir; senão, o nome do repositório
# normalizado (minúsculas, só [a-z0-9-]). O sufixo opcional (ex.: `-staging`) vai no fim e o
# total cabe em 63 caracteres: o nome é cortado antes do sufixo, nunca o sufixo.
# Uso: worker-name.sh <nome-do-repo> [sufixo]   → imprime o nome
#   worker-name.sh meu-site            → meu-site           (produção)
#   worker-name.sh meu-site -staging   → meu-site-staging   (staging)
set -euo pipefail

raw="${CLOUDFLARE_WORKER_NAME:-${1:?uso: worker-name.sh <nome-do-repo> [sufixo]}}"
suffix="${2:-}"

name="$(printf '%s' "$raw" | tr '[:upper:]' '[:lower:]' | sed -E 's/[^a-z0-9-]+/-/g; s/-+/-/g; s/^-+//; s/-+$//')"
name="${name:0:$((63 - ${#suffix}))}"
name="${name%-}"

if [ -z "$name" ]; then
  echo "::error title=Nome do Worker inválido::'$raw' não gera um nome válido; defina a variável CLOUDFLARE_WORKER_NAME (só a-z, 0-9 e -)." >&2
  exit 1
fi

printf '%s%s\n' "$name" "$suffix"
