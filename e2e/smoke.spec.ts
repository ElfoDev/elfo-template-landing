import { expect, test } from "@playwright/test";
import { ctaMessage, siteConfig } from "../src/lib/config";
import { stripHighlight } from "../src/lib/format";
import { expectedMessage, parseWhatsAppHref, scrollThrough } from "./helpers";

const { whatsapp, seo, sections } = siteConfig;

test("a página carrega com o título e o conteúdo da config", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.ok()).toBe(true);
  await expect(page).toHaveTitle(seo.title);
  await expect(page.locator("html")).toHaveAttribute("lang", seo.locale);
  if (sections.hero.enabled) {
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      stripHighlight(sections.hero.title),
    );
  }
});

test("todos os CTAs apontam para wa.me com a mensagem certa", async ({ page }) => {
  await page.goto("/");
  const ctas = page.locator("a[data-whatsapp-cta]");
  await expect(ctas.first()).toBeVisible();
  expect(await ctas.count()).toBeGreaterThan(1);

  for (const cta of await ctas.all()) {
    const id = (await cta.getAttribute("data-whatsapp-cta")) ?? "";
    const plan = await cta.getAttribute("data-plan");
    const link = parseWhatsAppHref(await cta.getAttribute("href"));
    expect(link.host).toBe("wa.me");
    expect(link.number).toBe(whatsapp.number);
    expect(link.text, `mensagem do CTA "${id}"`).toBe(expectedMessage(id, plan));
    await expect(cta).toHaveAttribute("target", "_blank");
    await expect(cta).toHaveAttribute("rel", /noopener/);
  }
});

test("cada seção ligada tem seu CTA", async ({ page }) => {
  await page.goto("/");
  const expected: [string, boolean][] = [
    ["header", true],
    ["hero", sections.hero.enabled],
    ["howItWorks", sections.howItWorks.enabled && Boolean(sections.howItWorks.ctaLabel)],
    ["pricing", sections.pricing.enabled],
    ["faq", sections.faq.enabled && Boolean(sections.faq.help)],
    ["finalCta", sections.finalCta.enabled],
    ["footer", sections.footer.enabled],
    ["floating", sections.floating.enabled],
  ];
  for (const [id, enabled] of expected) {
    await expect(page.locator(`a[data-whatsapp-cta="${id}"]`).first()).toHaveCount(enabled ? 1 : 0);
  }
  if (sections.pricing.enabled) {
    await expect(page.locator('a[data-whatsapp-cta="pricing"]')).toHaveCount(
      sections.pricing.plans.length,
    );
  }
});

test("as UTMs da visita são anexadas à mensagem de todos os CTAs", async ({ page }) => {
  await page.goto("/?utm_source=instagram&utm_campaign=promo");
  const header = page.locator('a[data-whatsapp-cta="header"]');
  await expect(header).toHaveAttribute("href", /utm_source%3Dinstagram/);
  expect(parseWhatsAppHref(await header.getAttribute("href")).text).toBe(
    `${ctaMessage("header")}\n\nref: utm_source=instagram&utm_campaign=promo`,
  );

  for (const cta of await page.locator("a[data-whatsapp-cta]").all()) {
    const id = (await cta.getAttribute("data-whatsapp-cta")) ?? "";
    const plan = await cta.getAttribute("data-plan");
    expect(parseWhatsAppHref(await cta.getAttribute("href")).text).toBe(
      `${expectedMessage(id, plan)}\n\nref: utm_source=instagram&utm_campaign=promo`,
    );
  }
});

test("clicar num CTA dispara os eventos de conversão (GA4 e Meta Pixel)", async ({
  page,
  context,
}) => {
  await context.route("https://wa.me/**", (route) => route.fulfill({ body: "ok" }));
  await page.addInitScript(() => {
    const calls: unknown[][] = [];
    Object.assign(window, {
      __calls: calls,
      gtag: (...args: unknown[]) => calls.push(["gtag", ...args]),
      fbq: (...args: unknown[]) => calls.push(["fbq", ...args]),
    });
  });
  await page.goto("/");
  const popup = context.waitForEvent("page");
  await page.locator('a[data-whatsapp-cta="header"]').click();
  await (await popup).close();

  const calls = await page.evaluate(() => (window as unknown as { __calls: unknown[][] }).__calls);
  expect(calls).toContainEqual([
    "gtag",
    "event",
    "generate_lead",
    { method: "whatsapp", cta: "header" },
  ]);
  expect(calls).toContainEqual(["fbq", "track", "Contact", { cta: "header" }]);
});

test("não há scroll horizontal", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await scrollThrough(page);
  const { scrollWidth, clientWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
});

test("o CTA do hero aparece acima da dobra", async ({ page }) => {
  test.skip(!sections.hero.enabled, "hero desligado na config");
  await page.goto("/");
  await expect(page.locator('a[data-whatsapp-cta="hero"]')).toBeInViewport();
});

test("FAQ: accordion com <details>, a primeira aberta", async ({ page }) => {
  test.skip(!sections.faq.enabled, "FAQ desligado na config");
  await page.goto("/");
  const items = page.locator("#duvidas details");
  await expect(items).toHaveCount(sections.faq.enabled ? sections.faq.items.length : 0);
  if (sections.faq.enabled && sections.faq.openFirst) {
    await expect(items.first()).toHaveAttribute("open", "");
  }
  const second = items.nth(1);
  await second.locator("summary").click();
  await expect(second).toHaveAttribute("open", "");
});
