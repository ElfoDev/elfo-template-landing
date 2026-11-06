import { describe, expect, it } from "vitest";
import {
  fillTemplate,
  formatPhone,
  formatRating,
  initials,
  parseHighlight,
  stripHighlight,
  telHref,
} from "./format";

describe("parseHighlight / stripHighlight", () => {
  it("separa o trecho entre asteriscos", () => {
    expect(parseHighlight("Menos dor, *mais leveza* no dia")).toEqual([
      { text: "Menos dor, ", highlight: false },
      { text: "mais leveza", highlight: true },
      { text: " no dia", highlight: false },
    ]);
  });

  it("aceita vários destaques e destaque no começo/fim", () => {
    expect(parseHighlight("*a* b *c*")).toEqual([
      { text: "a", highlight: true },
      { text: " b ", highlight: false },
      { text: "c", highlight: true },
    ]);
  });

  it("texto sem asteriscos (ou com um só) fica inteiro", () => {
    expect(parseHighlight("Sem destaque")).toEqual([{ text: "Sem destaque", highlight: false }]);
    expect(parseHighlight("5 * 3")).toEqual([{ text: "5 * 3", highlight: false }]);
  });

  it("stripHighlight remove só os asteriscos", () => {
    expect(stripHighlight("Menos dor, *mais leveza* no dia")).toBe("Menos dor, mais leveza no dia");
  });
});

describe("helpers de texto", () => {
  it("fillTemplate troca {chaves} e mantém as desconhecidas", () => {
    expect(fillTemplate("Nota {value} de 5", { value: "4,9" })).toBe("Nota 4,9 de 5");
    expect(fillTemplate("{a} e {b}", { a: 1 })).toBe("1 e {b}");
  });

  it("formatRating usa o separador do locale e 1 casa", () => {
    expect(formatRating(4.9)).toBe("4,9");
    expect(formatRating(5)).toBe("5");
    expect(formatRating(4.86, "en-US")).toBe("4.9");
  });

  it("formatPhone formata números do Brasil e deixa os outros com +", () => {
    expect(formatPhone("5511987654321")).toBe("(11) 98765-4321");
    expect(formatPhone("551134567890")).toBe("(11) 3456-7890");
    expect(formatPhone("14155552671")).toBe("+14155552671");
  });

  it("telHref usa +55 quando o número não tem DDI", () => {
    expect(telHref("(11) 3456-7890")).toBe("tel:+551134567890");
    expect(telHref("+1 415 555 2671")).toBe("tel:+14155552671");
  });

  it("initials pega as duas primeiras iniciais", () => {
    expect(initials("Ana Paula R.")).toBe("AP");
    expect(initials("Carlos M.")).toBe("CM");
    expect(initials("  joão  ")).toBe("J");
    expect(initials("Élio Ávila")).toBe("ÉÁ");
  });
});
