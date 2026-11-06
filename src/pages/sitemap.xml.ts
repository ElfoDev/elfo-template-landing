import type { APIRoute } from "astro";
import { siteConfig } from "../lib/config";
import { absoluteUrl, sitemapXml } from "../lib/seo";

/** Uma página só (a landing); acrescente aqui se o site ganhar outras. */
export const GET: APIRoute = () =>
  new Response(sitemapXml([absoluteUrl("/", siteConfig.seo.siteUrl)]), {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
