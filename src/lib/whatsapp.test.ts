import { describe, expect, it } from "vitest";
import {
  buildMessage,
  formatUtm,
  InvalidWhatsAppNumberError,
  isValidWhatsAppNumber,
  normalizeWhatsAppNumber,
  utmFromSearch,
  whatsappLink,
} from "./whatsapp";

const NUMBER = "5511999999999";

function decodedText(link: string): string | null {
  return new URL(link).searchParams.get("text");
}

describe("whatsappLink", () => {
  it("monta o link wa.me com a mensagem codificada", () => {
    expect(whatsappLink({ number: NUMBER, message: "Olá! Quero um orçamento" })).toBe(
      "https://wa.me/5511999999999?text=Ol%C3%A1!%20Quero%20um%20or%C3%A7amento",
    );
  });

  it("codifica caracteres especiais, emoji e quebras de linha sem perder nada", () => {
    const message = "Oi 👋 preço: R$ 100 & 50% off? #promo\nlinha 2 / a+b=c";
    const link = whatsappLink({ number: NUMBER, message });

    // Nada que quebre a query string pode sobrar sem codificar.
    expect(link.split("?text=")[1]).not.toMatch(/[ #&?\n+/]/);
    expect(decodedText(link)).toBe(message);
  });

  it("omite ?text= quando não há mensagem nem UTM", () => {
    expect(whatsappLink({ number: NUMBER })).toBe("https://wa.me/5511999999999");
    expect(whatsappLink({ number: NUMBER, message: "   " })).toBe("https://wa.me/5511999999999");
  });

  it("aceita número com formatação e normaliza para só dígitos", () => {
    expect(whatsappLink({ number: "+55 (11) 99999-9999", message: "oi" })).toBe(
      "https://wa.me/5511999999999?text=oi",
    );
  });

  it.each([
    ["vazio", ""],
    ["com letras", "55119999abc99"],
    ["curto demais", "1234567"],
    ["longo demais (> 15 dígitos)", "1234567890123456"],
    ["começando com zero", "011999999999"],
    ["com caracteres estranhos", "55*11*99999"],
  ])("lança erro para número inválido: %s", (_label, number) => {
    expect(() => whatsappLink({ number, message: "oi" })).toThrow(InvalidWhatsAppNumberError);
    expect(() => whatsappLink({ number, message: "oi" })).toThrow(/E\.164/);
  });

  it("anexa as UTMs ao fim da mensagem", () => {
    const link = whatsappLink({
      number: NUMBER,
      message: "Quero saber mais",
      utm: { source: "instagram", medium: "bio", campaign: "black-friday" },
    });

    expect(decodedText(link)).toBe(
      "Quero saber mais\n\nref: utm_source=instagram&utm_medium=bio&utm_campaign=black-friday",
    );
  });

  it("anexa só as UTMs preenchidas, na ordem padrão", () => {
    const link = whatsappLink({
      number: NUMBER,
      message: "Oi",
      utm: { campaign: "promo", source: "google", medium: "  ", term: undefined, content: null },
    });

    expect(decodedText(link)).toBe("Oi\n\nref: utm_source=google&utm_campaign=promo");
  });

  it("não mexe na mensagem quando as UTMs estão vazias", () => {
    expect(decodedText(whatsappLink({ number: NUMBER, message: "Oi", utm: {} }))).toBe("Oi");
  });

  it("usa só a UTM quando não há mensagem", () => {
    expect(decodedText(whatsappLink({ number: NUMBER, utm: { source: "ads" } }))).toBe(
      "ref: utm_source=ads",
    );
  });
});

describe("helpers", () => {
  it("normalizeWhatsAppNumber remove +, espaços, hífens, pontos e parênteses", () => {
    expect(normalizeWhatsAppNumber(" +1 (415) 555.2671 ")).toBe("14155552671");
  });

  it("isValidWhatsAppNumber", () => {
    expect(isValidWhatsAppNumber(NUMBER)).toBe(true);
    expect(isValidWhatsAppNumber("abc")).toBe(false);
  });

  it("formatUtm e buildMessage", () => {
    expect(formatUtm()).toBe("");
    expect(buildMessage("  Oi  ")).toBe("Oi");
    expect(buildMessage("Oi", { source: "x" })).toBe("Oi\n\nref: utm_source=x");
  });

  it("utmFromSearch lê só as utm_* conhecidas e ignora vazias", () => {
    expect(utmFromSearch("?utm_source=instagram&utm_medium=&utm_campaign=promo&foo=bar")).toEqual({
      source: "instagram",
      campaign: "promo",
    });
    expect(utmFromSearch("")).toEqual({});
  });
});
