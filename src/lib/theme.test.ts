import { describe, expect, it } from "vitest";
import { contrastRatio, readableForeground, themeCss } from "./theme";

describe("theme", () => {
  it("contrastRatio segue o WCAG (preto × branco = 21)", () => {
    expect(contrastRatio("#000000", "#FFFFFF")).toBeCloseTo(21, 5);
    expect(contrastRatio("#fff", "#FFFFFF")).toBeCloseTo(1, 5);
  });

  it("readableForeground escolhe branco em fundo escuro e escuro em fundo claro", () => {
    expect(readableForeground("#0F766E")).toBe("#FFFFFF");
    expect(readableForeground("#F59E0B")).toBe("#0C0A09");
  });

  it("themeCss gera as CSS variables da marca", () => {
    const css = themeCss({
      primary: "#0F766E",
      accent: "#F59E0B",
      background: "#FAFAF9",
      text: "#1C1917",
    });
    expect(css).toBe(
      ":root{--brand-primary:#0F766E;--brand-primary-foreground:#FFFFFF;--brand-accent:#F59E0B;--brand-accent-foreground:#0C0A09;--brand-background:#FAFAF9;--brand-text:#1C1917;}",
    );
  });
});
