#!/usr/bin/env bash
# Falha com uma mensagem clara quando os secrets da Cloudflare não estão configurados.
# Uso (no workflow): env CLOUDFLARE_API_TOKEN / CLOUDFLARE_ACCOUNT_ID vindos de `secrets`.
# Grava `ready=true|false` em $GITHUB_OUTPUT: os passos seguintes só rodam com `ready=true`.
# Com SKIP_IF_MISSING=true (o próprio repositório-template, que pode não ter conta da Cloudflare),
# a falta dos secrets vira um aviso e o deploy é pulado em vez de falhar. Repositórios criados
# a partir do template continuam falhando até a Cloudflare ser conectada no Elfo.
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
  echo "::notice title=Deploy pulado no template::Este é o repositório-template e não tem ${list// /, }; nada foi publicado. Repositórios criados a partir dele publicam assim que a Cloudflare é conectada no Elfo."
  {
    echo "## ⏭️ Deploy pulado"
    echo
    echo "\`${repo}\` é um repositório-template sem os secrets da Cloudflare"
    echo "(faltando: \`${list// /\`, \`}\`), então nada foi publicado."
    echo
    echo "Para publicar o próprio template, conecte a Cloudflare no board dele no Elfo"
    echo "(Settings → Deploy) ou grave os secrets (veja 'Deploy' no README)."
  } >>"${GITHUB_STEP_SUMMARY:-/dev/stderr}"
  exit 0
fi

echo "::error title=Cloudflare não conectada::Faltam ${list// /, }. No Elfo, abra o board deste repositório → Settings → Deploy e conecte a Cloudflare: o Elfo grava os secrets e roda o deploy de novo."

{
  echo "## ❌ Cloudflare não conectada"
  echo
  echo "O deploy precisa dos secrets da Cloudflare no repositório. Faltando: \`${list// /\`, \`}\`."
  echo
  echo "**Com o Elfo:** abra o board deste repositório → **Settings → Deploy** e conecte a"
  echo "Cloudflare. O Elfo grava \`CLOUDFLARE_API_TOKEN\` e \`CLOUDFLARE_ACCOUNT_ID\` e dispara o deploy."
  echo
  echo "**Sem o Elfo:** crie um token com permissão de editar Workers"
  echo "(https://dash.cloudflare.com/profile/api-tokens → template *Edit Cloudflare Workers*), pegue o"
  echo "Account ID (\`pnpm exec wrangler whoami\`), grave os dois e rode este workflow de novo (*Re-run jobs*):"
  echo
  echo '```sh'
  echo "gh secret set CLOUDFLARE_API_TOKEN --repo ${repo}"
  echo "gh secret set CLOUDFLARE_ACCOUNT_ID --repo ${repo}"
  echo '```'
} >>"${GITHUB_STEP_SUMMARY:-/dev/stderr}"

exit 1
