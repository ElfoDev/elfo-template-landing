/**
 * Links de WhatsApp (`https://wa.me/<número>?text=<mensagem>`).
 *
 * Funções puras, sem dependência de DOM: rodam no build (Astro), no browser
 * (script que anexa UTMs) e nos testes.
 */

/** Chaves de UTM reconhecidas, na ordem em que entram na mensagem. */
export const UTM_KEYS = ["source", "medium", "campaign", "term", "content"] as const;

export type UtmKey = (typeof UTM_KEYS)[number];
export type Utm = Partial<Record<UtmKey, string | null | undefined>>;

export interface WhatsAppLinkOptions {
  /** Número em formato E.164, só dígitos (ex.: `5511999999999`). `+`, espaços, `-`, `.` e parênteses são tolerados. */
  number: string;
  /** Mensagem que já vem escrita na conversa. */
  message?: string;
  /** UTMs da visita; são anexadas ao fim da mensagem para o atendente saber a origem do lead. */
  utm?: Utm;
}

export class InvalidWhatsAppNumberError extends Error {
  constructor(input: string) {
    super(
      `Número de WhatsApp inválido: "${input}". Use o formato E.164 só com dígitos, com DDI e DDD (ex.: 5511999999999).`,
    );
    this.name = "InvalidWhatsAppNumberError";
  }
}

/** E.164: até 15 dígitos, sem zero à esquerda. Exigimos no mínimo 8 para pegar números claramente incompletos. */
const E164_DIGITS = /^[1-9]\d{7,14}$/;

/**
 * Remove a formatação comum (`+55 (11) 99999-9999`) e valida o número.
 * @throws {InvalidWhatsAppNumberError} se o resultado não for um E.164 válido.
 */
export function normalizeWhatsAppNumber(input: string): string {
  const digits = input.trim().replace(/[\s+().-]/g, "");
  if (!E164_DIGITS.test(digits)) {
    throw new InvalidWhatsAppNumberError(input);
  }
  return digits;
}

export function isValidWhatsAppNumber(input: string): boolean {
  try {
    normalizeWhatsAppNumber(input);
    return true;
  } catch {
    return false;
  }
}

/**
 * Texto de UTM anexado à mensagem, ex.: `utm_source=instagram&utm_campaign=promo`.
 * Retorna string vazia se não houver nenhuma UTM preenchida.
 */
export function formatUtm(utm: Utm = {}): string {
  return UTM_KEYS.flatMap((key) => {
    const value = utm[key]?.trim();
    return value ? [`utm_${key}=${value}`] : [];
  }).join("&");
}

/** Mensagem final: a mensagem do CTA e, se houver UTMs, uma linha `ref: ...` no fim. */
export function buildMessage(message = "", utm?: Utm): string {
  const base = message.trim();
  const ref = formatUtm(utm);
  if (!ref) return base;
  return base ? `${base}\n\nref: ${ref}` : `ref: ${ref}`;
}

/** Monta o link `https://wa.me/<número>?text=<mensagem codificada>`. */
export function whatsappLink({ number, message, utm }: WhatsAppLinkOptions): string {
  const digits = normalizeWhatsAppNumber(number);
  const text = buildMessage(message, utm);
  const url = `https://wa.me/${digits}`;
  return text ? `${url}?text=${encodeURIComponent(text)}` : url;
}

/** Lê as UTMs de uma query string (`?utm_source=...`). */
export function utmFromSearch(search: string): Utm {
  const params = new URLSearchParams(search);
  const utm: Utm = {};
  for (const key of UTM_KEYS) {
    const value = params.get(`utm_${key}`);
    if (value?.trim()) utm[key] = value.trim();
  }
  return utm;
}
