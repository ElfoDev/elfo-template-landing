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
- Biome (lint + format), `astro check` (typecheck), Vitest (unit), Playwright (e2e + axe) e
  Lighthouse CI (`lhci`, budget em `lighthouserc.json`).
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
| `pnpm e2e`        | Playwright (smoke, interações, axe, SEO) em 360/768/1280px  |
| `pnpm lighthouse` | Lighthouse CI mobile contra o `dist/` (≥ 95 nas 4 notas)    |

O `pnpm e2e` builda antes quando roda local; com `CI` setado (CI, runner do Foreman) usa o
`dist/` existente, então rode `pnpm build` antes. Na primeira vez:
`pnpm exec playwright install chromium`. O `pnpm lighthouse` também usa o `dist/` existente e
precisa de um Chrome instalado.

## Estrutura

```
src/
  site.config.ts          ← ÚNICO arquivo que o usuário edita (marca, WhatsApp, textos, negócio, SEO, analytics)
  lib/
    config-schema.ts      schema zod da config + mensagens de erro em PT
    config.ts             config validada (`siteConfig`) + helpers (`ctaHref`, `ctaMessage`, `planMessage`,
                          `SECTION_ANCHORS`, `navItems`, `sectionHref`)
    whatsapp.ts           `whatsappLink({ number, message, utm })` e helpers (puros, testados)
    theme.ts              cores da marca (claro/escuro) → CSS variables, token `surface`, avisos de contraste
    icons.ts              ícones SVG por nome (usados na config: `icon: "users"`)
    format.ts             `*destaque*`, `{modelos}`, nota, telefone, iniciais
    seo.ts                JSON-LD (LocalBusiness), robots.txt e sitemap.xml
    floating.ts           regras do botão flutuante (quando aparece/some)
    *.test.ts             testes unitários (Vitest)
  layouts/BaseLayout.astro  <head>: SEO, Open Graph, JSON-LD, favicon, fontes, cores, analytics; skip link
  components/
    WhatsAppButton.astro  todo CTA de WhatsApp passa por aqui (variantes primary/inverted/outline/link)
    FloatingWhatsApp.astro  botão flutuante (CTA `floating`)
    Section.astro         moldura comum das seções (id, etiqueta, título, subtítulo, fundo `tint`)
    Icon.astro, Stars.astro, Logo.astro, ConfigImage.astro (fotos via astro:assets)
    Header.astro, Footer.astro, Analytics.astro
    sections/             uma seção por arquivo (Hero, Logos, Benefits, HowItWorks, Testimonials,
                          Pricing, Faq, FinalCta)
  scripts/
    whatsapp-cta.ts       no browser: anexa as UTMs da visita aos CTAs e dispara eventos de conversão
    landing.ts            microinterações: header, botão flutuante, entrada das seções, "digitando…"
  styles/global.css       Tailwind + tokens (`bg-primary`, `bg-surface`, `text-text`, `font-heading`...)
  pages/index.astro       a página: monta as seções na ordem
  pages/robots.txt.ts, pages/sitemap.xml.ts
  assets/                 (opcional) fotos otimizadas no build, referenciadas como "~/assets/foto.jpg"
public/                   logo (claro e escuro), favicon, imagem OG e demais arquivos estáticos
e2e/                      testes Playwright (smoke, interações, qualidade: axe + SEO)
lighthouserc.json         Lighthouse CI: notas mínimas e budget
astro.config.ts           lê a config validada (site URL, fontes), checa arquivos e contraste
foreman.json              lido pelo Foreman para configurar o board/deploy
```

## Convenções

- **Nenhum texto, cor, número ou URL hardcoded em componente.** Tudo vem de `siteConfig`
  (`src/lib/config.ts`). Componentes nunca importam `src/site.config.ts` direto. Textos de
  interface genéricos (acessibilidade etc.) ficam em `labels`, com padrão em PT no schema.
- Cores só pelos tokens do Tailwind (`bg-primary`, `text-primary-foreground`, `bg-accent`,
  `bg-background`, `bg-surface` (cards), `text-text`, `text-text/70`...). Nada de `#hex` ou paleta
  fixa do Tailwind em componentes: o site tem que funcionar com qualquer cor da config, nos
  temas claro e escuro. Texto secundário no mínimo `text-text/70` (contraste AA).
- Ids/âncoras das seções vêm de `SECTION_ANCHORS` (`src/lib/config.ts`).
- Animações: sutis, e sempre desligadas com `prefers-reduced-motion` (já tratado no
  `global.css`). Conteúdo nunca depende de JS para aparecer.
- Fontes: `font-heading` (títulos) e `font-body` (texto, padrão).
- Links de WhatsApp sempre via `WhatsAppButton` (ou `ctaHref`/`whatsappLink`), nunca montando
  a URL na mão. Todo CTA tem `data-whatsapp-cta="<id>"` (usado por UTMs, analytics e e2e).
- Mobile first. Nada pode gerar scroll horizontal em 360px (o e2e verifica).
- Lógica nova vai em `src/lib/*.ts` como funções puras, com teste ao lado (`*.test.ts`).
- Textos de UI, mensagens de erro e comentários em português.
- Imports relativos; formatação é do Biome (`pnpm format`), não discuta estilo.

## Como mudar marca, textos ou número

Só edite `src/site.config.ts`:

- **Marca**: `brand.name`, `brand.logo`, `brand.logoDark` (opcional, para o tema escuro),
  `brand.favicon` (arquivos em `public/`, referenciados com `/` na frente), `brand.colors` (hex),
  `brand.colorScheme` (`"light"`, `"dark"` ou `"auto"`), `brand.darkColors` (obrigatório fora do
  `"light"`) e `brand.fonts` (nome de qualquer família do [Fontsource](https://fontsource.org),
  ex.: `"Poppins"`). O build avisa se o contraste das cores não passar no WCAG AA.
- **WhatsApp**: `whatsapp.number` em E.164 só com dígitos (`5511999999999`),
  `whatsapp.defaultMessage`, `whatsapp.ctaLabel` e, opcional, `whatsapp.ctaMessages.<cta>`
  (`header`, `hero`, `howItWorks`, `pricing`, `faq`, `finalCta`, `footer`, `floating`). Cada plano
  de `sections.pricing.plans` pode ter a sua `message`.
- **Seções**: `sections.<seção>` com `enabled: true | false` e o conteúdo (`hero`, `logos`,
  `benefits`, `howItWorks`, `testimonials`, `pricing`, `faq`, `finalCta`, `footer`, `floating`).
  `navLabel` põe a seção no menu do topo; `*asteriscos*` no título do hero destacam um trecho.
- **Ícones**: nomes de `src/lib/icons.ts` (ex.: `"users"`); nos benefícios, emoji também vale.
- **Fotos**: `"~/assets/foto.jpg"` (em `src/assets/`, otimizada: AVIF/WebP e `srcset`),
  `"/foto.jpg"` (em `public/`, servida como está) ou URL.
- **Negócio** (rodapé + JSON-LD): `business.type` (schema.org), `phone`, `email`, `address`,
  `hours` (com `schema: "Mo-Fr 06:00-21:00"` para o Google), `socials` e `legalId`.
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
   `<Section id=... kicker=... title=... subtitle=...>`. O id vai em `SECTION_ANCHORS`; para
   aparecer no menu, aceite `navLabel` e inclua a seção em `ANCHOR_SECTIONS`/`navItems`.
4. **Página**: inclua o componente em `src/pages/index.astro` na posição desejada.
5. **CTA próprio?** Adicione o id em `CTA_IDS` (`config-schema.ts`) e use
   `<WhatsAppButton cta="<id>" />`; a mensagem pode ser definida em `whatsapp.ctaMessages.<id>`.
6. **Testes**: ajuste `src/lib/config-schema.test.ts` se houver regra de validação nova; o e2e
   já verifica todos os CTAs `a[data-whatsapp-cta]` automaticamente.
7. Rode `pnpm check`, `pnpm e2e` e, se mexer em layout/imagens/fontes, `pnpm lighthouse`.

## Regras

- **Nunca commite secrets** (tokens, chaves, `.env`, `.dev.vars`). Ids de GA4/Meta Pixel são
  públicos e podem ficar na config; qualquer coisa secreta vai em secrets do GitHub/Cloudflare.
- **Mantenha `pnpm check` verde** (e `pnpm e2e`/`pnpm lighthouse` quando mexer em
  página/CTA/layout) antes de commitar. Não desligue regras de lint nem testes para "passar".
- Dependências: versões estáveis; atualize o `pnpm-lock.yaml` junto (`pnpm install`).
