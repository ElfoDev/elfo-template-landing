/**
 * Schema (zod) do `src/site.config.ts`.
 *
 * O build falha com uma lista dos campos errados/ausentes se a config não
 * passar aqui. Para adicionar um campo novo, declare-o neste arquivo e ele
 * passa a ser validado e tipado no `site.config.ts`.
 */
import { z } from "zod";
import { ICON_NAMES, type IconName, isIconName, looksLikeIconName } from "./icons";
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

/**
 * Foto: como `assetPath` ou `~/assets/...` (arquivo em `src/assets/`, que o
 * build otimiza com `astro:assets`: AVIF/WebP e vários tamanhos).
 */
const photoPath = z
  .string()
  .regex(
    /^(?:\/(?!\/)|https?:\/\/|~\/assets\/)/,
    'use "~/assets/foto.jpg" (arquivo em src/assets/, otimizado no build), "/foto.jpg" (em public/) ou uma URL https://',
  );

const image = z.strictObject({
  src: assetPath,
  alt: z.string().trim(),
});

const photo = z.strictObject({
  src: photoPath,
  /** Descreva a foto; deixe "" se ela for só decorativa. */
  alt: z.string().trim(),
});

/** Nome de um ícone de `src/lib/icons.ts` (ex.: "users", "clock"). */
const iconName = z.enum(ICON_NAMES, {
  error: `ícone desconhecido; use um destes: ${ICON_NAMES.join(", ")}`,
});

/** Nome de ícone ou um emoji. */
const iconOrEmoji = text.refine(
  (value) => isIconName(value) || !looksLikeIconName(value),
  `ícone desconhecido; use um emoji ou um destes: ${ICON_NAMES.join(", ")}`,
);

const whatsappNumber = z
  .string()
  .refine(
    isValidWhatsAppNumber,
    'número inválido; use o formato E.164 só com dígitos, com DDI e DDD (ex.: "5511999999999")',
  )
  .transform(normalizeWhatsAppNumber);

/** Nota de 0 a 5 (ex.: 4.9). */
const rating = z.number().min(0, "a nota vai de 0 a 5").max(5, "a nota vai de 0 a 5");

/** Rótulo do item no menu do topo; sem ele a seção não aparece no menu. */
const navLabel = text.optional();

/** Etiqueta pequena acima do título da seção (ex.: "Depoimentos"). */
const kicker = text.optional();

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

const colorsSchema = z.strictObject({
  /** Cor principal: botões de CTA, links. */
  primary: hexColor,
  /** Cor de destaque: detalhes, selos, ícones. */
  accent: hexColor,
  background: hexColor,
  text: hexColor,
});

export const COLOR_SCHEMES = ["light", "dark", "auto"] as const;

const brandSchema = z
  .strictObject({
    name: text,
    logo: image.extend({ alt: z.string().trim().optional() }),
    /** Logo para o tema escuro (texto claro). Sem ele, usa `logo` nos dois temas. */
    logoDark: assetPath.optional(),
    favicon: assetPath,
    colors: colorsSchema,
    /** Cores do tema escuro. Obrigatórias se `colorScheme` for "dark" ou "auto". */
    darkColors: colorsSchema.optional(),
    /**
     * "light": só o tema claro (`colors`). "dark": só o escuro (`darkColors`).
     * "auto": segue o sistema do visitante.
     */
    colorScheme: z.enum(COLOR_SCHEMES).default("light"),
    /** Nomes de famílias do Fontsource (https://fontsource.org), baixadas e servidas pelo próprio site no build. */
    fonts: z
      .strictObject({
        heading: text.default("Manrope"),
        body: text.default("Inter"),
      })
      .default({ heading: "Manrope", body: "Inter" }),
  })
  .superRefine((brand, ctx) => {
    if (brand.colorScheme !== "light" && !brand.darkColors) {
      ctx.addIssue({
        code: "custom",
        path: ["darkColors"],
        message: `obrigatório com colorScheme: "${brand.colorScheme}" (ou use colorScheme: "light")`,
      });
    }
  });

/** CTAs que podem ter mensagem própria. Adicione uma chave aqui ao criar um CTA novo. */
export const CTA_IDS = [
  "header",
  "hero",
  "howItWorks",
  "pricing",
  "faq",
  "finalCta",
  "footer",
  "floating",
] as const;
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

/** Seções que podem ser alvo de link interno (menu, botão secundário do hero). */
export const ANCHOR_SECTIONS = [
  "benefits",
  "howItWorks",
  "testimonials",
  "pricing",
  "faq",
  "finalCta",
] as const;
export type AnchorSection = (typeof ANCHOR_SECTIONS)[number];

const sectionsSchema = z.strictObject({
  hero: section({
    /** Selo acima do título. */
    eyebrow: text.optional(),
    /** Use `*asteriscos*` para destacar um trecho na cor da marca. */
    title: text,
    subtitle: text.optional(),
    ctaLabel: text.optional(),
    /** Texto pequeno abaixo do botão (ex.: tempo de resposta). */
    ctaNote: text.optional(),
    /** Botão secundário que rola até outra seção da página. */
    secondaryCta: z.strictObject({ label: text, target: z.enum(ANCHOR_SECTIONS) }).optional(),
    /** Linha de prova social: nota em estrelas, texto em destaque e avatares com iniciais. */
    proof: z
      .strictObject({
        rating: rating.optional(),
        highlight: text.optional(),
        text: text,
        initials: z.array(text.max(3, "use até 3 letras")).max(5, "use até 5 avatares").default([]),
      })
      .optional(),
    /** Foto ao lado do texto. Sem foto, entra a ilustração nas cores da marca. */
    image: photo.optional(),
    /** Ilustração padrão quando não há `image`. Com `false` (e sem foto), o hero fica centralizado. */
    illustration: z.boolean().default(true),
    /** Selos sobre a ilustração/foto (até 2). */
    badges: z
      .array(z.strictObject({ icon: iconName.optional(), text }))
      .max(2, "use até 2 selos")
      .default([]),
    /** Cartão de conversa sobre a ilustração; a mensagem enviada é a do CTA do hero. */
    chat: z
      .strictObject({
        status: text.default("online agora"),
        reply: text,
        time: text.default("09:41"),
      })
      .optional(),
  }),
  logos: section({
    title: text,
    items: z
      .array(
        z.strictObject({
          name: text,
          /** Ícone ao lado do nome. */
          icon: iconName.optional(),
          /** Imagem do logo (substitui ícone + nome; o nome vira o texto alternativo). */
          image: assetPath.optional(),
        }),
      )
      .min(1, "adicione pelo menos um logo"),
  }),
  benefits: section({
    navLabel,
    kicker,
    title: text,
    subtitle: text.optional(),
    items: z
      .array(
        z.strictObject({
          /** Nome de um ícone (ex.: "users", veja src/lib/icons.ts) ou um emoji. */
          icon: iconOrEmoji.optional(),
          title: text,
          description: text,
        }),
      )
      .min(1, "adicione pelo menos um item"),
  }),
  howItWorks: section({
    navLabel,
    kicker,
    title: text,
    subtitle: text.optional(),
    steps: z
      .array(
        z.strictObject({
          title: text,
          description: text,
          /** Etiqueta pequena abaixo do passo (ex.: "Grátis"). */
          tag: text.optional(),
          tagIcon: iconName.optional(),
        }),
      )
      .min(1, "adicione pelo menos um passo"),
    /** Botão de WhatsApp abaixo dos passos (CTA `howItWorks`). Sem ele, não há botão. */
    ctaLabel: text.optional(),
    ctaNote: text.optional(),
  }),
  testimonials: section({
    navLabel,
    kicker,
    title: text,
    subtitle: text.optional(),
    /** Nota geral (ex.: do Google), mostrada abaixo do título. */
    rating: z.strictObject({ value: rating, text: text }).optional(),
    items: z
      .array(
        z.strictObject({
          quote: text,
          name: text,
          role: text.optional(),
          /** Foto; sem ela, aparece um avatar com as iniciais. */
          avatar: photoPath.optional(),
          /** Estrelas (1 a 5). */
          rating: z.number().int().min(1).max(5).optional(),
        }),
      )
      .min(1, "adicione pelo menos um depoimento"),
  }),
  pricing: section({
    navLabel,
    kicker,
    title: text,
    subtitle: text.optional(),
    /** Selo do plano em destaque. */
    featuredLabel: text.default("Mais escolhido"),
    currency: text.default("R$"),
    plans: z
      .array(
        z.strictObject({
          name: text,
          description: text.optional(),
          /** Só o valor, sem moeda (ex.: "280"). */
          price: text,
          period: text.default("/mês"),
          priceNote: text.optional(),
          features: z.array(text).default([]),
          ctaLabel: text.optional(),
          /** Mensagem de WhatsApp deste plano; sem ela usa `whatsapp.ctaMessages.pricing`. */
          message: text.optional(),
          featured: z.boolean().default(false),
        }),
      )
      .min(1, "adicione pelo menos um plano"),
    /** Observação abaixo dos planos (formas de pagamento etc.). */
    footnote: text.optional(),
  }),
  faq: section({
    navLabel,
    kicker,
    title: text,
    subtitle: text.optional(),
    items: z
      .array(z.strictObject({ question: text, answer: text }))
      .min(1, "adicione pelo menos uma pergunta"),
    /** Deixa a primeira pergunta aberta. */
    openFirst: z.boolean().default(true),
    /** Bloco "Ainda com dúvida?" com botão de WhatsApp (CTA `faq`). */
    help: z
      .strictObject({ title: text, text: text.optional(), ctaLabel: text.optional() })
      .optional(),
  }),
  finalCta: section({
    navLabel,
    title: text,
    subtitle: text.optional(),
    ctaLabel: text.optional(),
    /** Linha abaixo do botão (ex.: horários de atendimento). */
    note: text.optional(),
  }),
  /** Rodapé completo (contato, endereço, horários e redes de `business`). Desligado: só o copyright. */
  footer: section({
    /** Frase abaixo do logo. */
    description: text.optional(),
    contactTitle: text.default("Contato"),
    addressTitle: text.default("Endereço"),
    hoursTitle: text.default("Horários"),
    directionsLabel: text.default("Como chegar"),
    rights: text.default("Todos os direitos reservados."),
  }),
  /** Botão flutuante de WhatsApp (CTA `floating`). */
  floating: section({
    /** Texto para leitores de tela e da dica ao passar o mouse; padrão: `whatsapp.ctaLabel`. */
    label: text.optional(),
  }),
});

/** Redes aceitas em `business.socials` (o nome também é o do ícone). */
export const SOCIAL_NETWORKS = [
  "instagram",
  "facebook",
  "youtube",
  "linkedin",
  "tiktok",
] as const satisfies readonly IconName[];
export type SocialNetwork = (typeof SOCIAL_NETWORKS)[number];

/** Dados do negócio: rodapé e dados estruturados (JSON-LD) para o Google. */
const businessSchema = z
  .strictObject({
    /** Tipo do schema.org: "LocalBusiness", "HealthClub", "MedicalClinic", "Dentist"... */
    type: z
      .string()
      .regex(/^[A-Z][A-Za-z]+$/, 'use um tipo do schema.org, ex.: "LocalBusiness"')
      .default("LocalBusiness"),
    description: text.optional(),
    /** Telefone fixo para exibição (ex.: "(11) 3456-7890" ou "+1 415 555 2671"). */
    phone: text.optional(),
    email: z.email({ error: "e-mail inválido" }).optional(),
    address: z
      .strictObject({
        street: text,
        district: text.optional(),
        city: text,
        region: text,
        postalCode: text.optional(),
        country: text.default("BR"),
        /** Link do "Como chegar" (Google Maps etc.). */
        mapsUrl: z
          .url({ error: "use a URL completa, ex.: https://maps.google.com/..." })
          .optional(),
      })
      .optional(),
    hours: z
      .array(
        z.strictObject({
          /** Ex.: "Seg. a sex." */
          days: text,
          /** Ex.: "6h às 21h" ou "fechado". */
          time: text,
          /** Formato schema.org para o Google, ex.: "Mo-Fr 06:00-21:00". */
          schema: z
            .string()
            .regex(
              /^(?:Mo|Tu|We|Th|Fr|Sa|Su)(?:[-,](?:Mo|Tu|We|Th|Fr|Sa|Su))* \d{2}:\d{2}-\d{2}:\d{2}$/,
              'use o formato "Mo-Fr 06:00-21:00"',
            )
            .optional(),
        }),
      )
      .default([]),
    socials: z
      .array(
        z.strictObject({
          network: z.enum(SOCIAL_NETWORKS),
          url: z.url({ error: "use a URL completa do perfil" }),
          /** Nome acessível; padrão: nome da rede. */
          label: text.optional(),
        }),
      )
      .default([]),
    /** Ex.: "CNPJ 12.345.678/0001-90". */
    legalId: text.optional(),
  })
  .default({ type: "LocalBusiness", hours: [], socials: [] });

const seoSchema = z.strictObject({
  title: text,
  description: text,
  /** URL pública do site (usada em canonical, Open Graph, sitemap e robots.txt). */
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

/** Textos de interface (acessibilidade e afins), com padrão em português. */
const labelsSchema = z
  .strictObject({
    skipToContent: text.default("Pular para o conteúdo"),
    navigation: text.default("Seções da página"),
    /** `{value}` vira a nota (ex.: "Nota 4,9 de 5"). */
    rating: text.default("Nota {value} de 5"),
    /** Nota geral ao lado das estrelas (ex.: "4,9 de 5"). */
    ratingValue: text.default("{value} de 5"),
  })
  .default({
    skipToContent: "Pular para o conteúdo",
    navigation: "Seções da página",
    rating: "Nota {value} de 5",
    ratingValue: "{value} de 5",
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
  business: businessSchema,
  seo: seoSchema,
  labels: labelsSchema,
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

/**
 * Arquivos locais referenciados pela config (`/x` em `public/`, `~/assets/x`
 * em `src/assets/`), para checar se existem no build. URLs ficam de fora.
 */
export function localAssetPaths(config: SiteConfig): string[] {
  const { brand, sections, seo } = config;
  const paths = [brand.logo.src, brand.favicon, seo.ogImage];
  if (brand.logoDark) paths.push(brand.logoDark);
  if (sections.hero.enabled && sections.hero.image) paths.push(sections.hero.image.src);
  if (sections.logos.enabled) {
    for (const item of sections.logos.items) if (item.image) paths.push(item.image);
  }
  if (sections.testimonials.enabled) {
    for (const item of sections.testimonials.items) if (item.avatar) paths.push(item.avatar);
  }
  return paths.filter((path) => path.startsWith("/") || path.startsWith("~/"));
}

/** Caminho do arquivo, relativo à raiz do projeto: `/logo.svg` → `public/logo.svg`, `~/assets/a.jpg` → `src/assets/a.jpg`. */
export function assetFilePath(path: string): string {
  if (path.startsWith("~/")) return `src/${path.slice(2)}`;
  return `public/${path.replace(/^\/+/, "")}`;
}
