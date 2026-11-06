import type { APIRoute } from "astro";
import { siteConfig } from "../lib/config";
import { robotsTxt } from "../lib/seo";

export const GET: APIRoute = () =>
  new Response(robotsTxt(siteConfig.seo.siteUrl), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
