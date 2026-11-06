/**
 * Cores da marca → CSS variables. O `src/styles/global.css` mapeia essas
 * variáveis para tokens do Tailwind (`bg-primary`, `text-accent`, `bg-surface`...).
 */
import type { SiteConfig } from "./config-schema";

type Brand = SiteConfig["brand"];
export type Colors = Brand["colors"];

function toRgb(hex: string): [number, number, number] {
  let value = hex.replace("#", "");
  if (value.length === 3) value = [...value].map((c) => c + c).join("");
  const n = Number.parseInt(value, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function toHex([r, g, b]: [number, number, number]): string {
  return `#${[r, g, b].map((c) => Math.round(c).toString(16).padStart(2, "0").toUpperCase()).join("")}`;
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

/** Mistura duas cores em sRGB: `amount` 0 = só `a`, 1 = só `b`. */
export function mix(a: string, b: string, amount: number): string {
  const [ar, ag, ab] = toRgb(a);
  const [br, bg, bb] = toRgb(b);
  const at = (from: number, to: number) => from + (to - from) * amount;
  return toHex([at(ar, br), at(ag, bg), at(ab, bb)]);
}

export function isDark(hex: string): boolean {
  return luminance(hex) < 0.18;
}

/** Texto legível (branco ou quase preto) sobre uma cor de fundo. */
export function readableForeground(background: string): string {
  const light = "#FFFFFF";
  const dark = "#0C0A09";
  return contrastRatio(background, light) >= contrastRatio(background, dark) ? light : dark;
}

/** Fundo dos cards: um pouco mais claro que o fundo da página (bem pouco no tema escuro). */
export function surfaceColor(background: string): string {
  return mix(background, "#FFFFFF", isDark(background) ? 0.05 : 0.7);
}

/** CSS variables de uma paleta. */
export function themeVars(colors: Colors): Record<string, string> {
  return {
    "--brand-primary": colors.primary,
    "--brand-primary-foreground": readableForeground(colors.primary),
    "--brand-accent": colors.accent,
    "--brand-accent-foreground": readableForeground(colors.accent),
    "--brand-background": colors.background,
    "--brand-surface": surfaceColor(colors.background),
    "--brand-text": colors.text,
  };
}

function declarations(colors: Colors, scheme: string): string {
  const vars = Object.entries(themeVars(colors))
    .map(([name, value]) => `${name}:${value};`)
    .join("");
  return `${vars}color-scheme:${scheme};`;
}

type ThemeInput = Pick<Brand, "colors" | "darkColors" | "colorScheme">;

/**
 * Bloco `:root { ... }` com as cores da marca e as cores derivadas. Com
 * `colorScheme: "auto"`, as cores escuras entram num `@media (prefers-color-scheme: dark)`.
 */
export function themeCss({ colors, darkColors, colorScheme }: ThemeInput): string {
  if (colorScheme === "dark" && darkColors) return `:root{${declarations(darkColors, "dark")}}`;
  if (colorScheme === "auto" && darkColors) {
    return `:root{${declarations(colors, "light")}}@media (prefers-color-scheme:dark){:root{${declarations(darkColors, "dark")}}}`;
  }
  return `:root{${declarations(colors, "light")}}`;
}

/** Cores de `<meta name="theme-color">`, com `media` quando há dois temas. */
export function themeColorMetas({
  colors,
  darkColors,
  colorScheme,
}: ThemeInput): { content: string; media?: string }[] {
  if (colorScheme === "dark" && darkColors) return [{ content: darkColors.background }];
  if (colorScheme === "auto" && darkColors) {
    return [
      { content: colors.background, media: "(prefers-color-scheme: light)" },
      { content: darkColors.background, media: "(prefers-color-scheme: dark)" },
    ];
  }
  return [{ content: colors.background }];
}

/**
 * Avisos de contraste (WCAG AA) de uma paleta: texto sobre o fundo e a cor
 * primária usada como texto (títulos pequenos, links, botões de contorno).
 */
export function contrastWarnings(colors: Colors, where = "brand.colors"): string[] {
  const warnings: string[] = [];
  const check = (fg: string, bg: string, min: number, label: string) => {
    const ratio = contrastRatio(fg, bg);
    if (ratio < min) {
      warnings.push(
        `${where}: ${label} tem contraste ${ratio.toFixed(2)}:1 (mínimo ${min}:1 pelo WCAG AA)`,
      );
    }
  };
  check(colors.text, colors.background, 4.5, "text sobre background");
  check(colors.primary, colors.background, 4.5, "primary sobre background");
  check(readableForeground(colors.primary), colors.primary, 4.5, "texto dos botões sobre primary");
  return warnings;
}
