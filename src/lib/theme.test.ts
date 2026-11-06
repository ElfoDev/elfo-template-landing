import { describe, expect, it } from "vitest";
import {
  contrastRatio,
  contrastWarnings,
  mix,
  readableForeground,
  surfaceColor,
  themeColorMetas,
  themeCss,
} from "./theme";

const light = { primary: "#0F766E", accent: "#F59E0B", background: "#FAFAF9", text: "#1C1917" };
const dark = { primary: "#2DD4BF", accent: "#FBBF24", background: "#0C1312", text: "#F2F2F0" };

describe("theme", () => {
  it("contrastRatio segue o WCAG (preto × branco = 21)", () => {
    expect(contrastRatio("#000000", "#FFFFFF")).toBeCloseTo(21, 5);
    expect(contrastRatio("#fff", "#FFFFFF")).toBeCloseTo(1, 5);
  });

  it("readableForeground escolhe branco em fundo escuro e escuro em fundo claro", () => {
    expect(readableForeground("#0F766E")).toBe("#FFFFFF");
    expect(readableForeground("#F59E0B")).toBe("#0C0A09");
  });

  it("mix mistura em sRGB", () => {
    expect(mix("#000000", "#FFFFFF", 0)).toBe("#000000");
    expect(mix("#000000", "#FFFFFF", 1)).toBe("#FFFFFF");
    expect(mix("#000", "#FFF", 0.5)).toBe("#808080");
  });

  it("surfaceColor clareia bastante o fundo claro e só um pouco o escuro", () => {
    expect(surfaceColor("#FAFAF9")).toBe("#FEFEFD");
    expect(surfaceColor("#0C1312")).toBe("#181F1E");
  });

  it("themeCss gera as CSS variables da marca (só claro)", () => {
    expect(themeCss({ colors: light, colorScheme: "light" })).toBe(
      ":root{--brand-primary:#0F766E;--brand-primary-foreground:#FFFFFF;--brand-accent:#F59E0B;--brand-accent-foreground:#0C0A09;--brand-background:#FAFAF9;--brand-surface:#FEFEFD;--brand-text:#1C1917;color-scheme:light;}",
    );
  });

  it("themeCss com colorScheme auto põe as cores escuras num @media", () => {
    const css = themeCss({ colors: light, darkColors: dark, colorScheme: "auto" });
    expect(css).toMatch(/^:root\{--brand-primary:#0F766E;.*color-scheme:light;\}/);
    expect(css).toContain(
      "@media (prefers-color-scheme:dark){:root{--brand-primary:#2DD4BF;--brand-primary-foreground:#0C0A09;",
    );
    expect(css).toContain("color-scheme:dark;}}");
  });

  it("themeCss com colorScheme dark usa só as cores escuras", () => {
    const css = themeCss({ colors: light, darkColors: dark, colorScheme: "dark" });
    expect(css).toContain("--brand-background:#0C1312;");
    expect(css).not.toContain("#FAFAF9");
    expect(css).not.toContain("@media");
  });

  it("themeColorMetas tem uma cor por tema", () => {
    expect(themeColorMetas({ colors: light, colorScheme: "light" })).toEqual([
      { content: "#FAFAF9" },
    ]);
    expect(themeColorMetas({ colors: light, darkColors: dark, colorScheme: "auto" })).toEqual([
      { content: "#FAFAF9", media: "(prefers-color-scheme: light)" },
      { content: "#0C1312", media: "(prefers-color-scheme: dark)" },
    ]);
  });

  it("contrastWarnings: nada a reclamar das paletas de exemplo", () => {
    expect(contrastWarnings(light)).toEqual([]);
    expect(contrastWarnings(dark, "brand.darkColors")).toEqual([]);
  });

  it("contrastWarnings aponta cor primária clara demais sobre fundo claro", () => {
    const warnings = contrastWarnings({ ...light, primary: "#FDE68A" });
    expect(warnings).toEqual([
      expect.stringMatching(/^brand\.colors: primary sobre background tem contraste 1\.\d+:1/),
    ]);
  });
});
