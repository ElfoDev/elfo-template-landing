import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { siteConfig } from "../src/lib/config";
import { scrollThrough } from "./helpers";

const { seo, brand } = siteConfig;
const schemes = brand.colorScheme === "auto" ? (["light", "dark"] as const) : (["light"] as const);

for (const colorScheme of schemes) {
  test(`acessibilidade (axe): sem violações serious/critical, tema ${colorScheme}`, async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
    await page.goto("/");
    await scrollThrough(page);
    // Abre todas as perguntas do FAQ para checar o conteúdo delas também.
    await page.evaluate(() => {
      for (const details of document.querySelectorAll("details")) details.open = true;
    });
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"])
      .analyze();
    const serious = results.violations.filter(
      (violation) => violation.impact === "serious" || violation.impact === "critical",
    );
    expect(
      serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`),
    ).toEqual([]);
  });
}

test("SEO: meta tags e Open Graph", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    "content",
    seo.description,
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    new URL("/", seo.siteUrl).href,
  );
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", seo.title);
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    "content",
    new URL(seo.ogImage, seo.siteUrl).href,
  );
});

test("SEO: JSON-LD do negócio é válido", async ({ page }) => {
  await page.goto("/");
  const raw = await page.locator('script[type="application/ld+json"]').textContent();
  const data = JSON.parse(raw ?? "{}");
  expect(data["@context"]).toBe("https://schema.org");
  expect(data["@type"]).toBe(siteConfig.business.type);
  expect(data.name).toBe(brand.name);
  expect(data.url).toBe(new URL("/", seo.siteUrl).href);
});

test("SEO: robots.txt e sitemap.xml", async ({ request }) => {
  const robots = await request.get("/robots.txt");
  expect(robots.ok()).toBe(true);
  expect(await robots.text()).toContain(`Sitemap: ${new URL("/sitemap.xml", seo.siteUrl).href}`);

  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.ok()).toBe(true);
  expect(await sitemap.text()).toContain(`<loc>${new URL("/", seo.siteUrl).href}</loc>`);
});
