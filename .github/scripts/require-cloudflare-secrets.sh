#!/usr/bin/env bash
# Falha com uma mensagem clara quando os secrets da Cloudflare não estão configurados.
# Uso (no workflow): env CLOUDFLARE_API_TOKEN / CLOUDFLARE_ACCOUNT_ID vindos de `secrets`.
set -euo pipefail

missing=()
[ -n "${CLOUDFLARE_API_TOKEN:-}" ] || missing+=("CLOUDFLARE_API_TOKEN")
[ -n "${CLOUDFLARE_ACCOUNT_ID:-}" ] || missing+=("CLOUDFLARE_ACCOUNT_ID")

if [ "${#missing[@]}" -eq 0 ]; then
  echo "Secrets da Cloudflare configurados."
  exit 0
fi

repo="${GITHUB_REPOSITORY:-<dono>/<repo>}"
list="${missing[*]}"

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
  echo "Depois grave os dois (ou deixe o Foreman gravar):"
  echo
  echo '```sh'
  echo "gh secret set CLOUDFLARE_API_TOKEN --repo ${repo}"
  echo "gh secret set CLOUDFLARE_ACCOUNT_ID --repo ${repo}"
  echo '```'
  echo
  echo "E rode este workflow de novo (*Re-run jobs*)."
} >>"${GITHUB_STEP_SUMMARY:-/dev/stderr}"

exit 1
