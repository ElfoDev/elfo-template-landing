import { describe, expect, it } from "vitest";
import rawConfig from "../site.config";
import { formatPath, localAssetPaths, parseSiteConfig, SiteConfigError } from "./config-schema";

/** Config "solta" para os testes poderem apagar/estragar qualquer campo. */
// biome-ignore lint/suspicious/noExplicitAny: os testes montam configs inválidas de propósito.
type LooseConfig = Record<string, any>;

/** Cópia profunda da config de exemplo para mexer à vontade nos testes. */
function sample(): LooseConfig {
  return structuredClone(rawConfig) as LooseConfig;
}

function issuesOf(input: unknown): string[] {
  try {
    parseSiteConfig(input);
  } catch (error) {
    if (error instanceof SiteConfigError) return error.issues;
    throw error;
  }
  throw new Error("era esperado que a config fosse inválida");
}

describe("parseSiteConfig", () => {
  it("aceita a config de exemplo do template", () => {
    const config = parseSiteConfig(rawConfig);
    expect(config.brand.name).toBe("Aurora Studio");
    expect(config.whatsapp.number).toBe("5511999999999");
  });

  it("aplica os defaults (locale pt-BR, analytics desligado, fontes, ctaLabel)", () => {
    const input = sample();
    delete input.seo.locale;
    delete input.analytics;
    delete input.brand.fonts;
    delete input.whatsapp.ctaLabel;
    delete input.whatsapp.ctaMessages;

    const config = parseSiteConfig(input);
    expect(config.seo.locale).toBe("pt-BR");
    expect(config.analytics).toEqual({});
    expect(config.brand.fonts).toEqual({ heading: "Manrope", body: "Inter" });
    expect(config.whatsapp.ctaLabel).toBe("Falar no WhatsApp");
    expect(config.whatsapp.ctaMessages).toEqual({});
  });

  it("normaliza o número do WhatsApp", () => {
    const input = sample();
    input.whatsapp.number = "+55 (11) 99999-9999";
    expect(parseSiteConfig(input).whatsapp.number).toBe("5511999999999");
  });

  it("diz qual campo obrigatório está faltando", () => {
    const input = sample();
    delete input.sections.hero.title;
    delete input.seo.description;

    const issues = issuesOf(input);
    expect(issues).toContain("sections.hero.title: campo obrigatório não preenchido");
    expect(issues).toContain("seo.description: campo obrigatório não preenchido");
  });

  it("mostra a mensagem do erro com o caminho do campo", () => {
    const input = sample();
    delete input.brand.name;
    expect(() => parseSiteConfig(input)).toThrow(
      /src\/site\.config\.ts[\s\S]*brand\.name: campo obrigatório/,
    );
  });

  it("rejeita número de WhatsApp inválido", () => {
    const input = sample();
    input.whatsapp.number = "11 9999";
    expect(issuesOf(input)).toEqual([
      expect.stringMatching(/^whatsapp\.number: número inválido.*E\.164/),
    ]);
  });

  it("rejeita cores fora do formato hexadecimal", () => {
    const input = sample();
    input.brand.colors.primary = "teal";
    expect(issuesOf(input)).toEqual([
      expect.stringMatching(/^brand\.colors\.primary: use uma cor hexadecimal/),
    ]);
  });

  it("aponta campos desconhecidos (erros de digitação)", () => {
    const input = sample();
    input.seo.tittle = "Oops";
    expect(issuesOf(input)).toEqual(["campo desconhecido em seo: tittle (erro de digitação?)"]);
  });

  it("aponta o índice de itens inválidos em listas", () => {
    const input = sample();
    input.sections.faq.items[1].answer = "   ";
    expect(issuesOf(input)).toEqual(["sections.faq.items[1].answer: não pode ficar vazio"]);
  });

  it("não exige conteúdo de seções desligadas", () => {
    const input = sample();
    input.sections.testimonials = { enabled: false };
    input.sections.faq = { enabled: false, title: "rascunho" };
    const config = parseSiteConfig(input);
    expect(config.sections.testimonials.enabled).toBe(false);
  });

  it("pede enabled quando a seção não diz se está ligada", () => {
    const input = sample();
    delete input.sections.benefits.enabled;
    expect(issuesOf(input)).toEqual([expect.stringMatching(/^sections\.benefits.*enabled: true/)]);
  });

  it("valida a URL do site e os ids de analytics", () => {
    const input = sample();
    input.seo.siteUrl = "example.com";
    input.analytics = { ga4Id: "UA-123", metaPixelId: "abc" };
    const issues = issuesOf(input);
    expect(issues).toEqual([
      expect.stringMatching(/^seo\.siteUrl: use a URL completa/),
      expect.stringMatching(/^analytics\.ga4Id: .*G-XXXXXXXXXX/),
      expect.stringMatching(/^analytics\.metaPixelId: /),
    ]);
  });

  it("exige caminhos de imagem começando com / ou URL", () => {
    const input = sample();
    input.brand.favicon = "favicon.svg";
    expect(issuesOf(input)).toEqual([expect.stringMatching(/^brand\.favicon: use um caminho/)]);
  });
});

describe("helpers", () => {
  it("formatPath", () => {
    expect(formatPath(["sections", "faq", "items", 0, "question"])).toBe(
      "sections.faq.items[0].question",
    );
    expect(formatPath([])).toBe("");
  });

  it("localAssetPaths lista só arquivos locais", () => {
    const input = sample();
    input.seo.ogImage = "https://cdn.example.com/og.png";
    expect(localAssetPaths(parseSiteConfig(input))).toEqual(["/logo.svg", "/favicon.svg"]);
  });
});
