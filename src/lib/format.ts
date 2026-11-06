/**
 * Formatação de textos da config: destaque com `*asteriscos*`, modelos com
 * `{chave}`, notas, telefones e iniciais. Funções puras, testadas.
 */

export interface TextPart {
  text: string;
  highlight: boolean;
}

const HIGHLIGHT = /\*([^*]+)\*/g;

/** `"Menos dor, *mais leveza*"` → partes, com `highlight: true` no trecho entre asteriscos. */
export function parseHighlight(input: string): TextPart[] {
  const parts: TextPart[] = [];
  let last = 0;
  for (const match of input.matchAll(HIGHLIGHT)) {
    if (match.index > last) parts.push({ text: input.slice(last, match.index), highlight: false });
    parts.push({ text: match[1] ?? "", highlight: true });
    last = match.index + match[0].length;
  }
  if (last < input.length) parts.push({ text: input.slice(last), highlight: false });
  return parts;
}

/** O texto sem os asteriscos de destaque (para `<title>`, testes, leitores de tela). */
export function stripHighlight(input: string): string {
  return parseHighlight(input)
    .map((part) => part.text)
    .join("");
}

/** `fillTemplate("Nota {value} de 5", { value: "4,9" })` → `"Nota 4,9 de 5"`. Chaves desconhecidas ficam como estão. */
export function fillTemplate(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (whole, key: string) =>
    key in values ? String(values[key]) : whole,
  );
}

/** Nota com no máximo 1 casa decimal, no formato do locale (`4.9` → `"4,9"` em pt-BR). */
export function formatRating(value: number, locale = "pt-BR"): string {
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(value);
}

/**
 * Número E.164 (só dígitos) para exibição. Números do Brasil viram
 * `(11) 98765-4321`; os demais, `+<dígitos>`.
 */
export function formatPhone(digits: string): string {
  const br = /^55(\d{2})(\d{4,5})(\d{4})$/.exec(digits);
  if (br) return `(${br[1]}) ${br[2]}-${br[3]}`;
  return `+${digits}`;
}

/** Link `tel:` a partir de um telefone em qualquer formato (`(11) 3456-7890` com DDI padrão 55). */
export function telHref(phone: string, defaultCountry = "55"): string {
  const hasCountry = phone.trim().startsWith("+");
  const digits = phone.replace(/\D/g, "");
  return `tel:+${hasCountry ? digits : defaultCountry + digits}`;
}

/** Iniciais para o avatar sem foto: `"Ana Paula R."` → `"AP"`. */
export function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((word) => word.replace(/[^\p{L}\p{N}]/gu, ""))
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");
}
