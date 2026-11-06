#!/usr/bin/env bash
# Nome do Worker na Cloudflare (vira o subdomínio <nome>.<conta>.workers.dev).
# Usa a variável CLOUDFLARE_WORKER_NAME se existir; senão, o nome do repositório
# normalizado (minúsculas, só [a-z0-9-], até 63 caracteres).
# Uso: worker-name.sh <nome-do-repo>   → imprime o nome
set -euo pipefail

raw="${CLOUDFLARE_WORKER_NAME:-${1:?uso: worker-name.sh <nome-do-repo>}}"

name="$(printf '%s' "$raw" | tr '[:upper:]' '[:lower:]' | sed -E 's/[^a-z0-9-]+/-/g; s/-+/-/g; s/^-+//; s/-+$//')"
name="${name:0:63}"
name="${name%-}"

if [ -z "$name" ]; then
  echo "::error title=Nome do Worker inválido::'$raw' não gera um nome válido; defina a variável CLOUDFLARE_WORKER_NAME (só a-z, 0-9 e -)." >&2
  exit 1
fi

printf '%s\n' "$name"
