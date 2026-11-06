import { describe, expect, it } from "vitest";
import rawConfig from "../site.config";
import {
  assetFilePath,
  formatPath,
  localAssetPaths,
  parseSiteConfig,
  SiteConfigError,
} from "./config-schema";

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
    expect(config.whatsapp.number).toBe("5511987654321");
  });

  it("aplica os defaults (locale pt-BR, analytics desligado, fontes, ctaLabel, tema)", () => {
    const input = sample();
    delete input.seo.locale;
    delete input.analytics;
    delete input.brand.fonts;
    delete input.brand.colorScheme;
    delete input.brand.darkColors;
    delete input.whatsapp.ctaLabel;
    delete input.whatsapp.ctaMessages;
    delete input.business;
    delete input.labels;

    const config = parseSiteConfig(input);
    expect(config.seo.locale).toBe("pt-BR");
    expect(config.analytics).toEqual({});
    expect(config.brand.fonts).toEqual({ heading: "Manrope", body: "Inter" });
    expect(config.brand.colorScheme).toBe("light");
    expect(config.whatsapp.ctaLabel).toBe("Falar no WhatsApp");
    expect(config.whatsapp.ctaMessages).toEqual({});
    expect(config.business).toEqual({ type: "LocalBusiness", hours: [], socials: [] });
    expect(config.labels.skipToContent).toBe("Pular para o conteúdo");
  });

  it("aplica os defaults das seções (rodapé, planos, FAQ, hero)", () => {
    const input = sample();
    delete input.sections.pricing.featuredLabel;
    delete input.sections.pricing.plans[0].period;
    delete input.sections.pricing.plans[0].featured;
    delete input.sections.faq.openFirst;
    delete input.sections.hero.illustration;
    delete input.sections.hero.badges;
    input.sections.footer = { enabled: true };

    const { sections } = parseSiteConfig(input);
    if (!sections.pricing.enabled || !sections.faq.enabled) throw new Error("seções ligadas");
    if (!sections.hero.enabled || !sections.footer.enabled) throw new Error("seções ligadas");
    expect(sections.pricing.featuredLabel).toBe("Mais escolhido");
    expect(sections.pricing.plans[0]).toMatchObject({ period: "/mês", featured: false });
    expect(sections.faq.openFirst).toBe(true);
    expect(sections.hero.illustration).toBe(true);
    expect(sections.hero.badges).toEqual([]);
    expect(sections.footer.contactTitle).toBe("Contato");
  });

  it("exige darkColors com colorScheme auto ou dark", () => {
    for (const colorScheme of ["auto", "dark"]) {
      const input = sample();
      input.brand.colorScheme = colorScheme;
      delete input.brand.darkColors;
      expect(issuesOf(input)).toEqual([
        expect.stringMatching(
          new RegExp(`^brand\\.darkColors: obrigatório com colorScheme: "${colorScheme}"`),
        ),
      ]);
    }
  });

  it("rejeita colorScheme desconhecido", () => {
    const input = sample();
    input.brand.colorScheme = "escuro";
    expect(issuesOf(input)).toEqual([expect.stringMatching(/^brand\.colorScheme: /)]);
  });

  it("aceita nome de ícone ou emoji nos benefícios e aponta ícone desconhecido", () => {
    const input = sample();
    input.sections.benefits.items[0].icon = "⚡";
    input.sections.benefits.items[1].icon = "sparkles";
    expect(() => parseSiteConfig(input)).not.toThrow();

    input.sections.benefits.items[2].icon = "usres";
    expect(issuesOf(input)).toEqual([
      expect.stringMatching(/^sections\.benefits\.items\[2\]\.icon: ícone desconhecido.*users/),
    ]);
  });

  it("aponta ícone desconhecido em campos que só aceitam ícone", () => {
    const input = sample();
    input.sections.howItWorks.steps[0].tagIcon = "⏰";
    expect(issuesOf(input)).toEqual([
      expect.stringMatching(/^sections\.howItWorks\.steps\[0\]\.tagIcon: ícone desconhecido/),
    ]);
  });

  it("valida o alvo do botão secundário do hero", () => {
    const input = sample();
    input.sections.hero.secondaryCta.target = "precos";
    expect(issuesOf(input)).toEqual([
      expect.stringMatching(/^sections\.hero\.secondaryCta\.target: /),
    ]);
  });

  it("valida a nota (0 a 5) e os horários no formato schema.org", () => {
    const input = sample();
    input.sections.testimonials.rating.value = 9;
    input.business.hours[0].schema = "seg-sex 6h-21h";
    expect(issuesOf(input)).toEqual([
      "sections.testimonials.rating.value: a nota vai de 0 a 5",
      expect.stringMatching(/^business\.hours\[0\]\.schema: use o formato "Mo-Fr 06:00-21:00"/),
    ]);
  });

  it("valida e-mail, rede social e URL do mapa do negócio", () => {
    const input = sample();
    input.business.email = "ola@";
    input.business.socials[0].network = "orkut";
    input.business.address.mapsUrl = "maps.google.com";
    const issues = issuesOf(input);
    expect(issues).toHaveLength(3);
    expect(issues).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/^business\.email: e-mail inválido/),
        expect.stringMatching(/^business\.socials\[0\]\.network: /),
        expect.stringMatching(/^business\.address\.mapsUrl: use a URL completa/),
      ]),
    );
  });

  it("aceita fotos em src/assets (~/assets/...) e rejeita caminhos relativos", () => {
    const input = sample();
    input.sections.hero.image = { src: "~/assets/hero.jpg", alt: "Aula de pilates" };
    expect(() => parseSiteConfig(input)).not.toThrow();

    input.sections.hero.image.src = "hero.jpg";
    expect(issuesOf(input)).toEqual([
      expect.stringMatching(/^sections\.hero\.image\.src: use "~\/assets\/foto\.jpg"/),
    ]);
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

  it("recusa esquemas perigosos (javascript:, data:, ftp:) nas URLs da config", () => {
    for (const bad of [
      "javascript:alert(1)",
      "JavaScript:alert(document.cookie)",
      "data:text/html,<script>alert(1)</script>",
      "ftp://example.com/perfil",
    ]) {
      const input = sample();
      input.business.socials[0].url = bad;
      input.business.address.mapsUrl = bad;
      input.seo.siteUrl = bad;
      const issues = issuesOf(input);
      expect(issues, bad).toHaveLength(3);
      expect(issues, bad).toEqual(
        expect.arrayContaining([
          expect.stringMatching(/^seo\.siteUrl: use a URL completa com https:\/\/.*javascript:/),
          expect.stringMatching(/^business\.address\.mapsUrl: use a URL completa com https:\/\//),
          expect.stringMatching(/^business\.socials\[0\]\.url: use a URL completa com https:\/\//),
        ]),
      );
    }
  });

  it("aceita URLs http: e https: nas URLs da config", () => {
    const input = sample();
    input.business.socials[0].url = "http://instagram.com/aurora";
    input.business.address.mapsUrl = "https://maps.google.com/?q=aurora";
    expect(() => parseSiteConfig(input)).not.toThrow();
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
    input.sections.hero.image = { src: "~/assets/hero.jpg", alt: "" };
    input.sections.testimonials.items[0].avatar = "https://cdn.example.com/a.jpg";
    input.sections.logos.items[0].image = "/parceiros/vitalis.svg";
    expect(localAssetPaths(parseSiteConfig(input))).toEqual([
      "/logo.svg",
      "/favicon.svg",
      "/logo-dark.svg",
      "~/assets/hero.jpg",
      "/parceiros/vitalis.svg",
    ]);
  });

  it("assetFilePath aponta para public/ ou src/", () => {
    expect(assetFilePath("/logo.svg")).toBe("public/logo.svg");
    expect(assetFilePath("~/assets/hero.jpg")).toBe("src/assets/hero.jpg");
  });
});
