import { expect, test } from "@playwright/test";
import { ctaMessage, siteConfig } from "../src/lib/config";

const { whatsapp, seo, sections } = siteConfig;

/** Lê o número e a mensagem (decodificada) de um link wa.me. */
function parseWhatsAppHref(href: string | null) {
  expect(href).not.toBeNull();
  const url = new URL(href ?? "");
  return { host: url.host, number: url.pathname.slice(1), text: url.searchParams.get("text") };
}

test("a página carrega com o título e o conteúdo da config", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.ok()).toBe(true);
  await expect(page).toHaveTitle(seo.title);
  await expect(page.locator("html")).toHaveAttribute("lang", seo.locale);
  if (sections.hero.enabled) {
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(sections.hero.title);
  }
});

test("todos os CTAs apontam para wa.me com a mensagem certa", async ({ page }) => {
  await page.goto("/");
  const ctas = page.locator("a[data-whatsapp-cta]");
  await expect(ctas.first()).toBeVisible();

  for (const cta of await ctas.all()) {
    const id = await cta.getAttribute("data-whatsapp-cta");
    const link = parseWhatsAppHref(await cta.getAttribute("href"));
    expect(link.host).toBe("wa.me");
    expect(link.number).toBe(whatsapp.number);
    expect(link.text).toBe(ctaMessage(id as Parameters<typeof ctaMessage>[0]));
    await expect(cta).toHaveAttribute("target", "_blank");
  }
});

test("o CTA do hero usa a mensagem do hero", async ({ page }) => {
  test.skip(!sections.hero.enabled, "hero desligado na config");
  await page.goto("/");
  const link = parseWhatsAppHref(
    await page.locator('a[data-whatsapp-cta="hero"]').getAttribute("href"),
  );
  expect(link.text).toBe(ctaMessage("hero"));
});

test("as UTMs da visita são anexadas à mensagem", async ({ page }) => {
  await page.goto("/?utm_source=instagram&utm_campaign=promo");
  const cta = page.locator('a[data-whatsapp-cta="header"]');
  await expect(cta).toHaveAttribute("href", /utm_source%3Dinstagram/);
  const link = parseWhatsAppHref(await cta.getAttribute("href"));
  expect(link.text).toBe(`${ctaMessage("header")}\n\nref: utm_source=instagram&utm_campaign=promo`);
});

test.describe("em 360px de largura", () => {
  test.use({ viewport: { width: 360, height: 740 } });

  test("não há scroll horizontal", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const { scrollWidth, clientWidth } = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
  });
});
