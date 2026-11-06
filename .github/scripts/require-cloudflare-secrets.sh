#!/usr/bin/env bash
# Falha com uma mensagem clara quando os secrets da Cloudflare não estão configurados.
# Uso (no workflow): env CLOUDFLARE_API_TOKEN / CLOUDFLARE_ACCOUNT_ID vindos de `secrets`.
# Grava `ready=true|false` em $GITHUB_OUTPUT: os passos seguintes só rodam com `ready=true`.
# Com SKIP_IF_MISSING=true (o próprio repositório-template, que não tem conta da Cloudflare),
# a falta dos secrets vira um aviso e o deploy é pulado em vez de falhar. Repositórios criados
# a partir do template continuam falhando até os secrets serem configurados.
set -euo pipefail

output="${GITHUB_OUTPUT:-/dev/null}"

missing=()
[ -n "${CLOUDFLARE_API_TOKEN:-}" ] || missing+=("CLOUDFLARE_API_TOKEN")
[ -n "${CLOUDFLARE_ACCOUNT_ID:-}" ] || missing+=("CLOUDFLARE_ACCOUNT_ID")

if [ "${#missing[@]}" -eq 0 ]; then
  echo "Secrets da Cloudflare configurados."
  echo "ready=true" >>"$output"
  exit 0
fi

echo "ready=false" >>"$output"

repo="${GITHUB_REPOSITORY:-<dono>/<repo>}"
list="${missing[*]}"

if [ "${SKIP_IF_MISSING:-false}" = "true" ]; then
  echo "::notice title=Deploy pulado no template::Este é o repositório-template e não tem ${list// /, }; nada foi publicado. Repositórios criados a partir dele publicam normalmente depois de configurar os secrets."
  {
    echo "## ⏭️ Deploy pulado"
    echo
    echo "\`${repo}\` é um repositório-template sem os secrets da Cloudflare"
    echo "(faltando: \`${list// /\`, \`}\`), então nada foi publicado."
    echo
    echo "Para publicar o próprio template, grave os secrets (veja 'Deploy em 3 passos' no README)."
  } >>"${GITHUB_STEP_SUMMARY:-/dev/stderr}"
  exit 0
fi

echo "::error title=Faltam secrets da Cloudflare::Configure ${list// /, } em Settings → Secrets and variables → Actions (veja 'Deploy em 3 passos' no README)."

{
  echo "## ❌ Faltam secrets da Cloudflare"
  echo
  echo "O deploy precisa de dois secrets no repositório. Faltando: \`${list// /\`, \`}\`."
  echo
  echo "1. **CLOUDFLARE_API_TOKEN**: em https://dash.cloudflare.com/profile/api-tokens → *Create Token* →"
  echo "   template **Edit Cloudflare Workers**."
  echo "2. **CLOUDFLARE_ACCOUNT_ID**: o código de 32 caracteres na URL do painel"
  echo "   (https://dash.cloudflare.com/<account-id>), em *Workers & Pages* → *Account details*,"
  echo "   ou na saída de \`pnpm exec wrangler whoami\`."
  echo
  echo "Depois grave os dois (ou deixe o Elfo gravar):"
  echo
  echo '```sh'
  echo "gh secret set CLOUDFLARE_API_TOKEN --repo ${repo}"
  echo "gh secret set CLOUDFLARE_ACCOUNT_ID --repo ${repo}"
  echo '```'
  echo
  echo "E rode este workflow de novo (*Re-run jobs*)."
} >>"${GITHUB_STEP_SUMMARY:-/dev/stderr}"

exit 1
