/**
 * Config validada do site. Componentes e páginas importam daqui, nunca
 * direto de `src/site.config.ts`.
 */
import rawConfig from "../site.config";
import { type CtaId, parseSiteConfig, type SiteConfig } from "./config-schema";
import { whatsappLink } from "./whatsapp";

export type { CtaId, SiteConfig } from "./config-schema";

export const siteConfig: SiteConfig = parseSiteConfig(rawConfig);

/** Mensagem de um CTA: a específica (`whatsapp.ctaMessages`) ou a padrão. */
export function ctaMessage(cta: CtaId, config: SiteConfig = siteConfig): string {
  return config.whatsapp.ctaMessages[cta] ?? config.whatsapp.defaultMessage;
}

/** Link de WhatsApp (sem UTM) de um CTA. As UTMs da visita são anexadas no browser. */
export function ctaHref(cta: CtaId, config: SiteConfig = siteConfig): string {
  return whatsappLink({ number: config.whatsapp.number, message: ctaMessage(cta, config) });
}
