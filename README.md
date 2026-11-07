# elfo-template-landing

Template [Elfo](https://elfo.dev) de **landing page de conversão**:
site estático e responsivo cujo objetivo é levar o visitante para o **WhatsApp**.
Astro + Tailwind CSS v4, deploy na Cloudflare.

## Rodar local

Requisitos: Node 22 e pnpm (`corepack enable` usa a versão fixada no `package.json`).

```sh
pnpm install
pnpm dev        # http://localhost:4321
pnpm check      # lint + typecheck + testes unitários
pnpm build      # site estático em dist/
pnpm e2e        # Playwright: CTAs, interações, axe e SEO em 360/768/1280px
                # (1ª vez: pnpm exec playwright install chromium)
pnpm lighthouse # Lighthouse CI mobile (build próprio sem analytics; ≥ 95 em todas as notas)
```

## Personalizar

Edite **só** o [`src/site.config.ts`](src/site.config.ts):

- **marca**: nome, logo (e versão escura), favicon, cores, tema claro/escuro/automático e fontes
  (qualquer família do [Fontsource](https://fontsource.org));
- **WhatsApp**: número em E.164 (`5511999999999`), mensagem padrão e mensagem por botão/plano;
- **seções**: hero, logos de parceiros, benefícios, como funciona, depoimentos, planos, FAQ,
  CTA final, rodapé e botão flutuante, cada uma com `enabled`;
- **negócio**: telefone, e-mail, endereço, horários, redes e CNPJ (rodapé e dados para o Google);
- **SEO**: título, descrição, URL do site, imagem de compartilhamento e locale;
- **analytics** (opcional): GA4 e Meta Pixel.

Logo, favicon e imagem OG vão em `public/` e são referenciados com `/` (ex.: `public/logo.svg` →
`"/logo.svg"`). Fotos podem ir em `src/assets/` (`"~/assets/foto.jpg"`) para o build otimizar.
Se faltar ou estiver errado algum campo, o build para e diz qual.

O site já sai com `sitemap.xml`, `robots.txt`, Open Graph e JSON-LD (LocalBusiness).

UTMs da visita (`?utm_source=...`) são anexadas automaticamente à mensagem do WhatsApp, para você
saber de onde veio cada contato. Cada botão tem `data-whatsapp-cta="<id>"` e, com GA4/Meta Pixel
ligados, um clique dispara `generate_lead`/`Contact` com o id do botão (e o plano, se houver).

Detalhes de estrutura e convenções: [`CLAUDE.md`](CLAUDE.md).

## Deploy

O site é publicado na **Cloudflare Workers** (só arquivos estáticos, sem servidor, sem banco).

### Com o Elfo

1. No board do repositório, abra **Settings → Deploy** e conecte a sua conta da Cloudflare.
2. Pronto: o Elfo grava os secrets `CLOUDFLARE_API_TOKEN` e `CLOUDFLARE_ACCOUNT_ID` no repositório e
   dispara o primeiro deploy sozinho. A URL aparece no board.

O site não tem secrets próprios: o número do WhatsApp e o resto ficam no
[`src/site.config.ts`](src/site.config.ts).

### Branches e ambientes

| Branch                 | Publica                                                 | Worker             | Environment (GitHub) |
| ---------------------- | ------------------------------------------------------- | ------------------ | -------------------- |
| `production`           | o site de produção, a cada push/merge                   | `<nome>`           | `production`         |
| `staging` (opcional)   | uma cópia separada para testar antes, a cada push/merge | `<nome>-staging`   | `staging`            |
| PR (para qualquer uma) | uma URL de preview fixa, comentada no PR                | versão de `<nome>` | `preview-pr-<n>`     |

- [`deploy.yml`](.github/workflows/deploy.yml): check → build → `wrangler deploy` → smoke test (200 +
  CTA do WhatsApp). Roda a cada push em `production` ou `staging`, ou à mão em _Actions → Deploy →
  Run workflow_ escolhendo uma dessas branches.
- **Staging é opcional**: marque _Staging_ no Elfo (ele cria a branch `staging` a partir de `production`
  e os agentes abrem PRs nela) ou crie a branch você mesmo. Sem a branch `staging`, nada de staging é
  publicado. Para levar algo à produção, abra um PR de `staging` (ou só do que interessa) para `production`.
- Preview: [`preview.yml`](.github/workflows/preview.yml) sobe uma versão do Worker de produção sem
  publicá-la, em `https://pr-<n>-<nome>.<seu-subdomínio>.workers.dev`. Se o Worker ainda não existe
  (nenhum deploy de produção deu certo), ele publica antes a branch `production` (nunca o código do PR).
- O `<nome>` do Worker é o nome do repositório (normalizado para `a-z`, `0-9` e `-`). Para usar outro,
  crie a variável de repositório `CLOUDFLARE_WORKER_NAME` (_Settings → Secrets and variables → Actions →
  Variables_). Prefira nomes curtos: `pr-<n>-<nome>` precisa caber em 63 caracteres.

Sem os secrets da Cloudflare, os workflows falham dizendo o que conectar. A exceção é o próprio
repositório-template (marcado como _Template repository_ no GitHub): lá o deploy e o preview são
pulados com um aviso.

### Sem o Elfo

1. Crie um token em [dash.cloudflare.com/profile/api-tokens](https://dash.cloudflare.com/profile/api-tokens)
   → _Create Token_ → template **Edit Cloudflare Workers**. O **Account ID** sai em
   `pnpm exec wrangler whoami` (ou na URL do painel, `https://dash.cloudflare.com/<account-id>`).
2. Grave os secrets (o [GitHub CLI](https://cli.github.com) pede o valor) e publique:

   ```sh
   gh secret set CLOUDFLARE_API_TOKEN
   gh secret set CLOUDFLARE_ACCOUNT_ID
   gh workflow run deploy.yml --ref production
   ```

Se a conta da Cloudflare for nova, abra _Workers & Pages_ no painel uma vez para escolher o seu
subdomínio `*.workers.dev`.

Deploy manual, do seu computador (usa o `name` do [`wrangler.jsonc`](wrangler.jsonc)):

```sh
pnpm exec wrangler login
pnpm run deploy   # build + wrangler deploy ("pnpm deploy" sozinho é outro comando do pnpm)
```

### Domínio próprio (opcional)

O domínio precisa estar na mesma conta da Cloudflare (como zona ativa). Ele vale só para a produção; a
staging fica sempre no `workers.dev` (o `env.staging` do `wrangler.jsonc` tem `"routes": []` de propósito).

1. No [`wrangler.jsonc`](wrangler.jsonc), descomente o bloco `routes` e troque pelo seu domínio:

   ```jsonc
   "routes": [
     { "pattern": "minhaempresa.com.br", "custom_domain": true },
     { "pattern": "www.minhaempresa.com.br", "custom_domain": true }
   ],
   ```

2. Em [`src/site.config.ts`](src/site.config.ts), coloque o domínio em `seo.siteUrl`.
3. Se o token da Cloudflare não alcança a zona do domínio, reconecte a Cloudflare no Elfo (ou edite o
   token para incluir a zona em _Zone Resources_).
4. Faça merge em `production`. A Cloudflare cria o DNS e o certificado sozinha; o environment
   **production** passa a apontar para o domínio, e o `workers.dev` continua funcionando.
