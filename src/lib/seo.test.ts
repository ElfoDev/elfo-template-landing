import { describe, expect, it } from "vitest";
import rawConfig from "../site.config";
import { parseSiteConfig } from "./config-schema";
import { absoluteUrl, jsonLd, robotsTxt, sitemapXml, structuredData } from "./seo";

const config = parseSiteConfig(rawConfig);

describe("SEO", () => {
  it("absoluteUrl junta caminho e URL do site", () => {
    expect(absoluteUrl("/og.png", "https://example.com")).toBe("https://example.com/og.png");
    expect(absoluteUrl("/", "https://example.com/")).toBe("https://example.com/");
  });

  it("structuredData monta o LocalBusiness a partir da config", () => {
    const data = structuredData(config);
    expect(data).toMatchObject({
      "@context": "https://schema.org",
      "@type": "HealthClub",
      name: "Aurora Studio",
      url: "https://example.com/",
      image: "https://example.com/og.png",
      logo: "https://example.com/logo.svg",
      telephone: "+551134567890",
      email: "ola@aurorastudio.com.br",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Rua Harmonia, 412, Vila Madalena",
        addressLocality: "São Paulo",
        addressRegion: "SP",
        postalCode: "05435-000",
        addressCountry: "BR",
      },
      openingHours: ["Mo-Fr 06:00-21:00", "Sa 08:00-13:00"],
      sameAs: [
        "https://instagram.com/aurorastudio",
        "https://facebook.com/aurorastudio",
        "https://youtube.com/@aurorastudio",
      ],
    });
  });

  it("structuredData funciona só com o mínimo (sem business)", () => {
    const input = structuredClone(rawConfig) as Record<string, unknown>;
    delete input.business;
    const data = structuredData(parseSiteConfig(input));
    expect(data["@type"]).toBe("LocalBusiness");
    expect(data.telephone).toBe("+5511987654321");
    expect(data).not.toHaveProperty("address");
    expect(data).not.toHaveProperty("sameAs");
  });

  it("jsonLd não deixa fechar a tag <script>", () => {
    expect(jsonLd({ name: "</script><script>alert(1)</script>" })).not.toContain("</script>");
    expect(JSON.parse(jsonLd({ a: "<b>" }))).toEqual({ a: "<b>" });
  });

  it("robots.txt libera tudo e aponta o sitemap", () => {
    expect(robotsTxt("https://example.com")).toBe(
      "User-agent: *\nAllow: /\n\nSitemap: https://example.com/sitemap.xml\n",
    );
  });

  it("sitemap.xml lista as URLs (escapadas)", () => {
    const xml = sitemapXml(["https://example.com/", "https://example.com/?a=1&b=2"]);
    expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
    expect(xml).toContain("<loc>https://example.com/</loc>");
    expect(xml).toContain("<loc>https://example.com/?a=1&amp;b=2</loc>");
  });
});
