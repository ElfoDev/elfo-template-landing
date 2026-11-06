/**
 * Schema (zod) do `src/site.config.ts`.
 *
 * O build falha com uma lista dos campos errados/ausentes se a config não
 * passar aqui. Para adicionar um campo novo, declare-o neste arquivo e ele
 * passa a ser validado e tipado no `site.config.ts`.
 */
import { z } from "zod";
import { isValidWhatsAppNumber, normalizeWhatsAppNumber } from "./whatsapp";

// ---------------------------------------------------------------------------
// Tipos básicos
// ---------------------------------------------------------------------------

const text = z.string().trim().min(1, "não pode ficar vazio");

const hexColor = z
  .string()
  .regex(/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, 'use uma cor hexadecimal, ex.: "#25D366"');

/** Arquivo em `public/` (começa com `/`) ou URL absoluta. */
const assetPath = z
  .string()
  .regex(
    /^(?:\/(?!\/)|https?:\/\/)/,
    'use um caminho de arquivo em public/ começando com "/" (ex.: "/logo.svg") ou uma URL https://',
  );

const image = z.strictObject({
  src: assetPath,
  alt: z.string().trim(),
});

const whatsappNumber = z
  .string()
  .refine(
    isValidWhatsAppNumber,
    'número inválido; use o formato E.164 só com dígitos, com DDI e DDD (ex.: "5511999999999")',
  )
  .transform(normalizeWhatsAppNumber);

/**
 * Seção que liga/desliga. Com `enabled: false` o conteúdo é opcional (pode
 * ficar lá, só não é validado nem renderizado).
 */
function section<Shape extends z.ZodRawShape>(shape: Shape) {
  return z.discriminatedUnion("enabled", [
    z.looseObject({ enabled: z.literal(false) }),
    z.strictObject({ enabled: z.literal(true), ...shape }),
  ]);
}

// ---------------------------------------------------------------------------
// Blocos da config
// ---------------------------------------------------------------------------

const brandSchema = z.strictObject({
  name: text,
  logo: image.extend({ alt: z.string().trim().optional() }),
  favicon: assetPath,
  colors: z.strictObject({
    /** Cor principal: botões de CTA, links. */
    primary: hexColor,
    /** Cor de destaque: detalhes, selos, ícones. */
    accent: hexColor,
    background: hexColor,
    text: hexColor,
  }),
  /** Nomes de famílias do Fontsource (https://fontsource.org), baixadas e servidas pelo próprio site no build. */
  fonts: z
    .strictObject({
      heading: text.default("Manrope"),
      body: text.default("Inter"),
    })
    .default({ heading: "Manrope", body: "Inter" }),
});

/** CTAs que podem ter mensagem própria. Adicione uma chave aqui ao criar um CTA novo. */
export const CTA_IDS = ["header", "hero", "finalCta"] as const;
export type CtaId = (typeof CTA_IDS)[number];

const whatsappSchema = z.strictObject({
  number: whatsappNumber,
  defaultMessage: text,
  /** Texto padrão dos botões de WhatsApp quando a seção não define o seu. */
  ctaLabel: text.default("Falar no WhatsApp"),
  /** Mensagem específica por CTA; quando ausente usa `defaultMessage`. */
  ctaMessages: z
    .strictObject(
      Object.fromEntries(CTA_IDS.map((id) => [id, text.optional()])) as {
        [K in CtaId]: z.ZodOptional<typeof text>;
      },
    )
    .default({}),
});

const sectionsSchema = z.strictObject({
  hero: section({
    eyebrow: text.optional(),
    title: text,
    subtitle: text.optional(),
    ctaLabel: text.optional(),
    image: image.optional(),
  }),
  benefits: section({
    title: text,
    subtitle: text.optional(),
    items: z
      .array(
        z.strictObject({
          /** Emoji ou caractere curto. */
          icon: text.optional(),
          title: text,
          description: text,
        }),
      )
      .min(1, "adicione pelo menos um item"),
  }),
  howItWorks: section({
    title: text,
    subtitle: text.optional(),
    steps: z
      .array(z.strictObject({ title: text, description: text }))
      .min(1, "adicione pelo menos um passo"),
  }),
  testimonials: section({
    title: text,
    subtitle: text.optional(),
    items: z
      .array(
        z.strictObject({
          quote: text,
          name: text,
          role: text.optional(),
          avatar: assetPath.optional(),
        }),
      )
      .min(1, "adicione pelo menos um depoimento"),
  }),
  faq: section({
    title: text,
    subtitle: text.optional(),
    items: z
      .array(z.strictObject({ question: text, answer: text }))
      .min(1, "adicione pelo menos uma pergunta"),
  }),
  finalCta: section({
    title: text,
    subtitle: text.optional(),
    ctaLabel: text.optional(),
  }),
});

const seoSchema = z.strictObject({
  title: text,
  description: text,
  /** URL pública do site (usada em canonical e Open Graph). */
  siteUrl: z.url({
    protocol: /^https?$/,
    error: 'use a URL completa do site, ex.: "https://minhaempresa.com.br"',
  }),
  /** Imagem de compartilhamento (1200×630). */
  ogImage: assetPath,
  locale: z
    .string()
    .regex(/^[a-z]{2,3}(?:-[A-Z]{2})?$/, 'use um locale BCP 47, ex.: "pt-BR"')
    .default("pt-BR"),
});

/** Desligado por padrão: só carrega o script se o id estiver preenchido. */
const analyticsSchema = z
  .strictObject({
    ga4Id: z
      .string()
      .regex(/^G-[A-Z0-9]{4,}$/, 'id do GA4 tem o formato "G-XXXXXXXXXX"')
      .optional(),
    metaPixelId: z
      .string()
      .regex(/^\d{5,20}$/, "id do Meta Pixel tem só dígitos")
      .optional(),
  })
  .default({});

export const siteConfigSchema = z.strictObject({
  brand: brandSchema,
  whatsapp: whatsappSchema,
  sections: sectionsSchema,
  seo: seoSchema,
  analytics: analyticsSchema,
});

/** O que se escreve no `site.config.ts` (campos com default são opcionais). */
export type SiteConfigInput = z.input<typeof siteConfigSchema>;
/** A config já validada, com defaults aplicados. */
export type SiteConfig = z.output<typeof siteConfigSchema>;

// ---------------------------------------------------------------------------
// Validação com erro legível
// ---------------------------------------------------------------------------

export class SiteConfigError extends Error {
  readonly issues: string[];

  constructor(issues: string[]) {
    super(
      [
        "src/site.config.ts tem problemas:",
        ...issues.map((issue) => `  • ${issue}`),
        "",
        "Corrija os campos acima em src/site.config.ts.",
      ].join("\n"),
    );
    this.name = "SiteConfigError";
    this.issues = issues;
  }
}

/** `["sections", "faq", "items", 0, "question"]` → `sections.faq.items[0].question` */
export function formatPath(path: readonly PropertyKey[]): string {
  return path.reduce<string>((acc, key) => {
    if (typeof key === "number") return `${acc}[${key}]`;
    return acc ? `${acc}.${String(key)}` : String(key);
  }, "");
}

const ptBR = z.locales.pt();

/** Mensagens em português; "campo obrigatório" quando o campo simplesmente não existe. */
const errorMap: z.core.$ZodErrorMap = (issue) => {
  if (issue.code === "invalid_type" && issue.input === undefined) {
    return "campo obrigatório não preenchido";
  }
  if (
    issue.code === "invalid_union" &&
    "discriminator" in issue &&
    issue.discriminator === "enabled"
  ) {
    return "defina enabled: true (mostra a seção) ou enabled: false (esconde)";
  }
  return ptBR.localeError(issue);
};

function describeIssue(issue: z.core.$ZodIssue): string {
  const path = formatPath(issue.path);
  if (issue.code === "unrecognized_keys") {
    const where = path ? ` em ${path}` : "";
    return `campo desconhecido${where}: ${issue.keys.join(", ")} (erro de digitação?)`;
  }
  return `${path || "(raiz)"}: ${issue.message}`;
}

/**
 * Valida a config e aplica os defaults.
 * @throws {SiteConfigError} com um item por campo inválido.
 */
export function parseSiteConfig(input: unknown): SiteConfig {
  const result = siteConfigSchema.safeParse(input, { error: errorMap });
  if (!result.success) {
    throw new SiteConfigError(result.error.issues.map(describeIssue));
  }
  return result.data;
}

/** Caminhos locais (em `public/`) referenciados pela config, para checar se existem no build. */
export function localAssetPaths(config: SiteConfig): string[] {
  const { brand, sections, seo } = config;
  const paths = [brand.logo.src, brand.favicon, seo.ogImage];
  if (sections.hero.enabled && sections.hero.image) paths.push(sections.hero.image.src);
  if (sections.testimonials.enabled) {
    for (const item of sections.testimonials.items) if (item.avatar) paths.push(item.avatar);
  }
  return paths.filter((path) => path.startsWith("/"));
}
