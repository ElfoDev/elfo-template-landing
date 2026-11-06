/**
 * SEO a partir da config: dados estruturados (JSON-LD), `robots.txt` e
 * `sitemap.xml`. Funções puras, testadas.
 */
import type { SiteConfig } from "./config-schema";
import { telHref } from "./format";

/** URL absoluta de um caminho do site (`/og.png` → `https://site.com/og.png`). */
export function absoluteUrl(path: string, siteUrl: string): string {
  return new URL(path, siteUrl).href;
}

/** JSON-LD do negócio (schema.org `LocalBusiness` ou o tipo em `business.type`). */
export function structuredData(config: SiteConfig): Record<string, unknown> {
  const { brand, business, seo, whatsapp } = config;
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": business.type,
    name: brand.name,
    description: business.description ?? seo.description,
    url: absoluteUrl("/", seo.siteUrl),
    logo: absoluteUrl(brand.logo.src, seo.siteUrl),
    image: absoluteUrl(seo.ogImage, seo.siteUrl),
    telephone: business.phone ? telHref(business.phone).slice(4) : `+${whatsapp.number}`,
  };
  if (business.email) data.email = business.email;
  if (business.address) {
    const { street, district, city, region, postalCode, country } = business.address;
    data.address = {
      "@type": "PostalAddress",
      streetAddress: district ? `${street}, ${district}` : street,
      addressLocality: city,
      addressRegion: region,
      ...(postalCode ? { postalCode } : {}),
      addressCountry: country,
    };
    if (business.address.mapsUrl) data.hasMap = business.address.mapsUrl;
  }
  const openingHours = business.hours.flatMap((item) => (item.schema ? [item.schema] : []));
  if (openingHours.length > 0) data.openingHours = openingHours;
  if (business.socials.length > 0) data.sameAs = business.socials.map((social) => social.url);
  return data;
}

/** `<script type="application/ld+json">` seguro: `<` escapado para não fechar a tag. */
export function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function robotsTxt(siteUrl: string): string {
  return `User-agent: *\nAllow: /\n\nSitemap: ${absoluteUrl("/sitemap.xml", siteUrl)}\n`;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function sitemapXml(urls: readonly string[]): string {
  const entries = urls.map((url) => `  <url><loc>${escapeXml(url)}</loc></url>`).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`;
}
