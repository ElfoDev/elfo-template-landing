# elfo-template-landing

Template [Elfo](https://foreman.plagesribeiro.workers.dev) de **landing page de conversão**:
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

## Deploy em 3 passos

O site é publicado na **Cloudflare Workers** (só arquivos estáticos, sem servidor):

- todo **merge em `main`** publica em `https://<repo>.<seu-subdomínio>.workers.dev`
  ([`deploy.yml`](.github/workflows/deploy.yml): check → build → `wrangler deploy` → smoke test);
- todo **PR** ganha uma URL de preview fixa, `https://pr-<n>-<repo>.<seu-subdomínio>.workers.dev`,
  comentada no próprio PR ([`preview.yml`](.github/workflows/preview.yml)).

Tudo depende de dois secrets do GitHub: `CLOUDFLARE_API_TOKEN` e `CLOUDFLARE_ACCOUNT_ID`.
Sem eles, os workflows falham dizendo o que configurar.

### Com o Elfo

1. Conecte sua conta da Cloudflare no Elfo.
2. O Elfo grava `CLOUDFLARE_API_TOKEN` e `CLOUDFLARE_ACCOUNT_ID` no repositório (são os secrets
   listados em [`foreman.json`](foreman.json)).
3. Faça merge de um PR (ou push) em `main`. A URL de produção aparece no board.

### Sem o Elfo

1. **Crie o token** em [dash.cloudflare.com/profile/api-tokens](https://dash.cloudflare.com/profile/api-tokens)
   → _Create Token_ → template **Edit Cloudflare Workers** → escolha a sua conta → _Create Token_.
   Anote também o **Account ID**: é o código de 32 caracteres na URL do painel
   (`https://dash.cloudflare.com/<account-id>`), ou rode `pnpm exec wrangler whoami`.
2. **Grave os secrets** no repositório (com o [GitHub CLI](https://cli.github.com); ele pede o valor):

   ```sh
   gh secret set CLOUDFLARE_API_TOKEN
   gh secret set CLOUDFLARE_ACCOUNT_ID
   ```

3. **Faça push em `main`**:

   ```sh
   git push origin main
   ```

   Acompanhe em _Actions → Deploy_; a URL fica no environment **production** do repositório.

Se a conta da Cloudflare for nova, abra _Workers & Pages_ no painel uma vez para escolher o seu
subdomínio `*.workers.dev`. O preview de PR só funciona depois do primeiro deploy em `main`
(é ele que cria o Worker e liga as preview URLs).

O nome do Worker é o nome do repositório (normalizado para `a-z`, `0-9` e `-`). Para usar outro,
crie a variável de repositório `CLOUDFLARE_WORKER_NAME` (_Settings → Secrets and variables →
Actions → Variables_). Prefira nomes curtos: `pr-<n>-<nome>` precisa caber em 63 caracteres.

Deploy manual, do seu computador (usa o `name` do [`wrangler.jsonc`](wrangler.jsonc)):

```sh
pnpm exec wrangler login
pnpm run deploy   # build + wrangler deploy ("pnpm deploy" sozinho é outro comando do pnpm)
```

### Domínio próprio (opcional)

O domínio precisa estar na mesma conta da Cloudflare (como zona ativa). Então:

1. No [`wrangler.jsonc`](wrangler.jsonc), descomente o bloco `routes` e troque pelo seu domínio:

   ```jsonc
   "routes": [
     { "pattern": "minhaempresa.com.br", "custom_domain": true },
     { "pattern": "www.minhaempresa.com.br", "custom_domain": true }
   ],
   ```

2. Em [`src/site.config.ts`](src/site.config.ts), coloque o domínio em `seo.siteUrl`.
3. Se o token foi criado antes, edite-o para incluir a zona do domínio (o template "Edit Cloudflare
   Workers" pede _Zone Resources_).
4. Faça merge em `main`. A Cloudflare cria o DNS e o certificado sozinha; o environment
   **production** passa a apontar para o domínio, e o `workers.dev` continua funcionando.
