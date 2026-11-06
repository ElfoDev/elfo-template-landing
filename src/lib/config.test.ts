import { describe, expect, it } from "vitest";
import rawConfig from "../site.config";
import {
  applyBuildOverrides,
  ctaHref,
  ctaMessage,
  navItems,
  planMessage,
  sectionHref,
} from "./config";
import { parseSiteConfig } from "./config-schema";

// biome-ignore lint/suspicious/noExplicitAny: os testes mexem livremente na config de exemplo.
function sample(): Record<string, any> {
  return structuredClone(rawConfig);
}

describe("helpers de CTA", () => {
  const config = parseSiteConfig(rawConfig);

  it("ctaMessage usa a mensagem do CTA ou a padrão", () => {
    expect(ctaMessage("hero", config)).toBe(config.whatsapp.ctaMessages.hero);
    expect(ctaMessage("floating", config)).toBe(config.whatsapp.defaultMessage);
  });

  it("ctaHref aceita uma mensagem própria", () => {
    const href = ctaHref("pricing", config, "Quero o plano X");
    expect(new URL(href).searchParams.get("text")).toBe("Quero o plano X");
  });

  it("planMessage usa a mensagem do plano ou a do CTA pricing", () => {
    expect(planMessage({ message: "Plano A" }, config)).toBe("Plano A");
    expect(planMessage({}, config)).toBe(ctaMessage("pricing", config));
  });
});

describe("navegação", () => {
  it("navItems lista as seções ligadas com navLabel, na ordem da página", () => {
    expect(navItems(parseSiteConfig(rawConfig))).toEqual([
      { label: "Benefícios", href: "#beneficios" },
      { label: "Como funciona", href: "#como-funciona" },
      { label: "Depoimentos", href: "#depoimentos" },
      { label: "Planos", href: "#planos" },
      { label: "Dúvidas", href: "#duvidas" },
    ]);
  });

  it("seções desligadas saem do menu e do botão secundário", () => {
    const input = sample();
    input.sections.pricing = { enabled: false };
    const config = parseSiteConfig(input);
    expect(navItems(config).map((item) => item.href)).not.toContain("#planos");
    expect(sectionHref("pricing", config)).toBeUndefined();
    expect(sectionHref("faq", config)).toBe("#duvidas");
  });
});

describe("applyBuildOverrides", () => {
  const withAnalytics = () => {
    const config = parseSiteConfig(rawConfig);
    return { ...config, analytics: { ga4Id: "G-ABCD1234", metaPixelId: "12345678" } };
  };

  it("mantém os analytics da config por padrão", () => {
    const config = withAnalytics();
    expect(applyBuildOverrides(config, {}).analytics).toEqual(config.analytics);
    expect(applyBuildOverrides(config, { SITE_ANALYTICS: "on" }).analytics).toEqual(
      config.analytics,
    );
  });

  it("SITE_ANALYTICS=off desliga GA4 e Meta Pixel", () => {
    expect(applyBuildOverrides(withAnalytics(), { SITE_ANALYTICS: "off" }).analytics).toEqual({});
    expect(applyBuildOverrides(withAnalytics(), { SITE_ANALYTICS: "OFF" }).analytics).toEqual({});
  });
});
