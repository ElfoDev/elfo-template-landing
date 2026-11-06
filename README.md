# foreman-template-landing

Template [Foreman](https://foreman.plagesribeiro.workers.dev) de **landing page de conversão**:
site estático e responsivo cujo objetivo é levar o visitante para o **WhatsApp**.
Astro + Tailwind CSS v4, deploy na Cloudflare.

## Rodar local

Requisitos: Node 22 e pnpm (`corepack enable` usa a versão fixada no `package.json`).

```sh
pnpm install
pnpm dev        # http://localhost:4321
pnpm check      # lint + typecheck + testes unitários
pnpm build      # site estático em dist/
pnpm e2e        # smoke tests (1ª vez: pnpm exec playwright install chromium)
```

## Personalizar

Edite **só** o [`src/site.config.ts`](src/site.config.ts):

- **marca**: nome, logo, favicon, cores e fontes (qualquer família do [Fontsource](https://fontsource.org));
- **WhatsApp**: número em E.164 (`5511999999999`), mensagem padrão e mensagem por botão;
- **seções**: hero, benefícios, como funciona, depoimentos, FAQ e CTA final, cada uma com `enabled`;
- **SEO**: título, descrição, URL do site, imagem de compartilhamento e locale;
- **analytics** (opcional): GA4 e Meta Pixel.

Imagens vão em `public/` e são referenciadas com `/` (ex.: `public/logo.svg` → `"/logo.svg"`).
Se faltar ou estiver errado algum campo, o build para e diz qual.

UTMs da visita (`?utm_source=...`) são anexadas automaticamente à mensagem do WhatsApp, para você
saber de onde veio cada contato.

Detalhes de estrutura e convenções: [`CLAUDE.md`](CLAUDE.md).
