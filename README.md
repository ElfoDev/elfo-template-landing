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
pnpm e2e        # Playwright: CTAs, interações, axe e SEO em 360/768/1280px
                # (1ª vez: pnpm exec playwright install chromium)
pnpm lighthouse # Lighthouse CI mobile contra o dist/ (≥ 95 em todas as notas)
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
