/**
 * Config validada do site. Componentes e páginas importam daqui, nunca
 * direto de `src/site.config.ts`.
 */
import rawConfig from "../site.config";
import {
  type AnchorSection,
  type CtaId,
  parseSiteConfig,
  type SiteConfig,
  type SocialNetwork,
} from "./config-schema";
import { whatsappLink } from "./whatsapp";

export type { AnchorSection, CtaId, SiteConfig } from "./config-schema";

/**
 * Ajustes de build vindos do ambiente (não da config do usuário).
 * `SITE_ANALYTICS=off` desliga GA4/Meta Pixel: usado no build do Lighthouse CI,
 * para medir só o site (os scripts de terceiros de quem preencheu os ids não
 * entram nas notas nem no budget).
 */
export function applyBuildOverrides(
  config: SiteConfig,
  env: Record<string, string | undefined> = {},
): SiteConfig {
  if (env.SITE_ANALYTICS?.toLowerCase() === "off") return { ...config, analytics: {} };
  return config;
}

export const siteConfig: SiteConfig = applyBuildOverrides(parseSiteConfig(rawConfig), process.env);

type Sections = SiteConfig["sections"];
export type PricingPlan = Extract<Sections["pricing"], { enabled: true }>["plans"][number];

/** Mensagem de um CTA: a específica (`whatsapp.ctaMessages`) ou a padrão. */
export function ctaMessage(cta: CtaId, config: SiteConfig = siteConfig): string {
  return config.whatsapp.ctaMessages[cta] ?? config.whatsapp.defaultMessage;
}

/** Link de WhatsApp (sem UTM) de um CTA. As UTMs da visita são anexadas no browser. */
export function ctaHref(cta: CtaId, config: SiteConfig = siteConfig, message?: string): string {
  return whatsappLink({
    number: config.whatsapp.number,
    message: message ?? ctaMessage(cta, config),
  });
}

/** Mensagem do botão de um plano: a do plano ou a do CTA `pricing`. */
export function planMessage(
  plan: Pick<PricingPlan, "message">,
  config: SiteConfig = siteConfig,
): string {
  return plan.message ?? ctaMessage("pricing", config);
}

/** `id` (âncora) de cada seção na página. */
export const SECTION_ANCHORS: Record<AnchorSection | "hero" | "logos", string> = {
  hero: "inicio",
  logos: "parceiros",
  benefits: "beneficios",
  howItWorks: "como-funciona",
  testimonials: "depoimentos",
  pricing: "planos",
  faq: "duvidas",
  finalCta: "contato",
};

/** Link interno para uma seção, ou `undefined` se ela estiver desligada. */
export function sectionHref(
  target: AnchorSection,
  config: SiteConfig = siteConfig,
): string | undefined {
  return config.sections[target].enabled ? `#${SECTION_ANCHORS[target]}` : undefined;
}

/** Itens do menu do topo: seções ligadas que têm `navLabel`, na ordem da página. */
export function navItems(config: SiteConfig = siteConfig): { label: string; href: string }[] {
  const order: AnchorSection[] = [
    "benefits",
    "howItWorks",
    "testimonials",
    "pricing",
    "faq",
    "finalCta",
  ];
  return order.flatMap((key) => {
    const section = config.sections[key];
    if (!section.enabled || !section.navLabel) return [];
    return [{ label: section.navLabel, href: `#${SECTION_ANCHORS[key]}` }];
  });
}

/** Nome de cada rede social (texto acessível do link quando `label` não é definido). */
export const SOCIAL_NETWORK_NAMES: Record<SocialNetwork, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  youtube: "YouTube",
  linkedin: "LinkedIn",
  tiktok: "TikTok",
};
