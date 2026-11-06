# CLAUDE.md

Template Foreman de **landing page de conversão**: site estático, só front-end, cujo único
objetivo é levar o visitante para uma conversa no WhatsApp. Deploy na Cloudflare.

## Stack

- [Astro](https://astro.build) 7 com saída estática (`output: "static"`), sem framework de UI.
  Só use React/ilhas se um componente realmente precisar de estado no browser.
- Tailwind CSS v4 (via `@tailwindcss/vite`, configurado em CSS: `src/styles/global.css`).
- TypeScript strict (`astro/tsconfigs/strict`).
- zod 4 para validar `src/site.config.ts` no build.
- Fontes do Fontsource pela Fonts API do Astro: baixadas no build e servidas pelo próprio site.
- Biome (lint + format), `astro check` (typecheck), Vitest (unit), Playwright (e2e smoke).
- pnpm (versão fixa em `packageManager`) e Node 22 (`.node-version`).

## Comandos

| Comando           | O que faz                                                   |
| ----------------- | ----------------------------------------------------------- |
| `pnpm dev`        | servidor de desenvolvimento em http://localhost:4321        |
| `pnpm lint`       | Biome (lint + checagem de formatação), sem alterar arquivos |
| `pnpm format`     | Biome aplicando formatação e fixes seguros                  |
| `pnpm typecheck`  | `astro check` (TS + `.astro`)                               |
| `pnpm test`       | Vitest (testes unitários em `src/**/*.test.ts`)             |
| `pnpm build`      | build estático em `dist/` (valida o `site.config.ts` antes) |
| `pnpm check`      | lint + typecheck + test (**é o que agents e CI rodam**)     |
| `pnpm e2e`        | Playwright (smoke) contra o build estático                  |
| `pnpm run deploy` | build + `wrangler deploy` manual (`pnpm deploy` é do pnpm)  |

O `pnpm e2e` builda antes quando roda local; com `CI` setado (CI, runner do Foreman) usa o
`dist/` existente, então rode `pnpm build` antes. Na primeira vez:
`pnpm exec playwright install chromium`.

## Estrutura

```
src/
  site.config.ts          ← ÚNICO arquivo que o usuário edita (marca, WhatsApp, textos, SEO, analytics)
  lib/
    config-schema.ts      schema zod da config + mensagens de erro em PT
    config.ts             config validada (`siteConfig`) + helpers de CTA (`ctaHref`, `ctaMessage`)
    whatsapp.ts           `whatsappLink({ number, message, utm })` e helpers (puros, testados)
    theme.ts              cores da marca → CSS variables
    *.test.ts             testes unitários (Vitest)
  layouts/BaseLayout.astro  <head>: SEO, Open Graph, favicon, fontes, cores, analytics
  components/
    WhatsAppButton.astro  todo CTA de WhatsApp passa por aqui
    Section.astro         moldura comum das seções (id, título, subtítulo)
    Header.astro, Footer.astro, Analytics.astro
    sections/             uma seção por arquivo (Hero, Benefits, HowItWorks, Testimonials, Faq, FinalCta)
  scripts/whatsapp-cta.ts no browser: anexa as UTMs da visita aos CTAs e dispara eventos de conversão
  styles/global.css       Tailwind + tokens (`bg-primary`, `text-text`, `font-heading`...)
  pages/index.astro       a página: monta as seções na ordem
public/                   logo, favicon, imagem OG e demais arquivos estáticos
e2e/                      testes Playwright (smoke)
astro.config.ts           lê a config validada (site URL, fontes)
wrangler.jsonc            Cloudflare Workers só com static assets (`dist/`), domínio próprio opcional
foreman.json              lido pelo Foreman para configurar o board/deploy (inclui os secrets exigidos)
.github/
  workflows/ci.yml        PR e main: check + build + e2e
  workflows/deploy.yml    push em main: check → build → wrangler deploy → smoke (environment `production`)
  workflows/preview.yml   PR: build → wrangler versions upload --preview-alias pr-<n> → comentário com a URL
  scripts/*.sh            checagem dos secrets, nome do Worker e smoke test usados pelos workflows
```

## Deploy

Cloudflare Workers (static assets). Precisa dos secrets `CLOUDFLARE_API_TOKEN` e
`CLOUDFLARE_ACCOUNT_ID`; sem eles os workflows falham explicando o que configurar. O nome do
Worker vem do repositório (ou da variável `CLOUDFLARE_WORKER_NAME`). Passo a passo e domínio
próprio: seção "Deploy em 3 passos" do `README.md`.

## Convenções

- **Nenhum texto, cor, número ou URL hardcoded em componente.** Tudo vem de `siteConfig`
  (`src/lib/config.ts`). Componentes nunca importam `src/site.config.ts` direto.
- Cores só pelos tokens do Tailwind (`bg-primary`, `text-primary-foreground`, `bg-accent`,
  `bg-background`, `text-text`, `text-text/70`...). Nada de `#hex` ou paleta fixa do Tailwind
  em componentes: o site tem que funcionar com qualquer cor da config.
- Fontes: `font-heading` (títulos) e `font-body` (texto, padrão).
- Links de WhatsApp sempre via `WhatsAppButton` (ou `ctaHref`/`whatsappLink`), nunca montando
  a URL na mão. Todo CTA tem `data-whatsapp-cta="<id>"` (usado por UTMs, analytics e e2e).
- Mobile first. Nada pode gerar scroll horizontal em 360px (o e2e verifica).
- Lógica nova vai em `src/lib/*.ts` como funções puras, com teste ao lado (`*.test.ts`).
- Textos de UI, mensagens de erro e comentários em português.
- Imports relativos; formatação é do Biome (`pnpm format`), não discuta estilo.

## Como mudar marca, textos ou número

Só edite `src/site.config.ts`:

- **Marca**: `brand.name`, `brand.logo`, `brand.favicon` (arquivos em `public/`, referenciados com
  `/` na frente), `brand.colors` (hex) e `brand.fonts` (nome de qualquer família do
  [Fontsource](https://fontsource.org), ex.: `"Poppins"`).
- **WhatsApp**: `whatsapp.number` em E.164 só com dígitos (`5511999999999`),
  `whatsapp.defaultMessage`, `whatsapp.ctaLabel` e, opcional, `whatsapp.ctaMessages.<cta>`.
- **Seções**: `sections.<seção>` com `enabled: true | false` e o conteúdo.
- **SEO**: `seo.title`, `seo.description`, `seo.siteUrl`, `seo.ogImage` (1200×630), `seo.locale`.
- **Analytics** (desligados por padrão): `analytics.ga4Id`, `analytics.metaPixelId`.

Se algo estiver errado o `pnpm dev`/`pnpm build` para e lista os campos, ex.:
`sections.hero.title: campo obrigatório não preenchido`.

## Como adicionar uma seção

1. **Schema**: em `src/lib/config-schema.ts`, adicione a seção em `sectionsSchema` usando
   `section({ ...campos })` (isso já dá o `enabled` liga/desliga).
2. **Config**: adicione o conteúdo de exemplo em `src/site.config.ts` (`sections.<nova>`).
3. **Componente**: crie `src/components/sections/<Nova>.astro` lendo
   `siteConfig.sections.<nova>`, renderizando só se `enabled`, de preferência dentro de
   `<Section id="..." title=... subtitle=...>`.
4. **Página**: inclua o componente em `src/pages/index.astro` na posição desejada.
5. **CTA próprio?** Adicione o id em `CTA_IDS` (`config-schema.ts`) e use
   `<WhatsAppButton cta="<id>" />`; a mensagem pode ser definida em `whatsapp.ctaMessages.<id>`.
6. **Testes**: ajuste `src/lib/config-schema.test.ts` se houver regra de validação nova; o e2e
   já verifica todos os CTAs `a[data-whatsapp-cta]` automaticamente.
7. Rode `pnpm check` e `pnpm e2e`.

## Regras

- **Nunca commite secrets** (tokens, chaves, `.env`, `.dev.vars`). Ids de GA4/Meta Pixel são
  públicos e podem ficar na config; qualquer coisa secreta vai em secrets do GitHub/Cloudflare.
- **Mantenha `pnpm check` verde** (e `pnpm e2e` quando mexer em página/CTA/layout) antes de
  commitar. Não desligue regras de lint nem testes para "passar".
- Dependências: versões estáveis; atualize o `pnpm-lock.yaml` junto (`pnpm install`).
