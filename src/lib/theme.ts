/**
 * Cores da marca → CSS variables. O `src/styles/global.css` mapeia essas
 * variáveis para tokens do Tailwind (`bg-primary`, `text-accent`...).
 */
import type { SiteConfig } from "./config-schema";

type Colors = SiteConfig["brand"]["colors"];

function toRgb(hex: string): [number, number, number] {
  let value = hex.replace("#", "");
  if (value.length === 3) value = [...value].map((c) => c + c).join("");
  const n = Number.parseInt(value, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Luminância relativa (WCAG 2.x). */
export function luminance(hex: string): number {
  const [r, g, b] = toRgb(hex).map((channel) => {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

/** Texto legível (branco ou quase preto) sobre uma cor de fundo. */
export function readableForeground(background: string): string {
  const light = "#FFFFFF";
  const dark = "#0C0A09";
  return contrastRatio(background, light) >= contrastRatio(background, dark) ? light : dark;
}

/** Bloco `:root { ... }` com as cores da marca e as cores de texto calculadas. */
export function themeCss(colors: Colors): string {
  const vars: Record<string, string> = {
    "--brand-primary": colors.primary,
    "--brand-primary-foreground": readableForeground(colors.primary),
    "--brand-accent": colors.accent,
    "--brand-accent-foreground": readableForeground(colors.accent),
    "--brand-background": colors.background,
    "--brand-text": colors.text,
  };
  const body = Object.entries(vars)
    .map(([name, value]) => `${name}:${value};`)
    .join("");
  return `:root{${body}}`;
}
