import { expect, test } from "@playwright/test";
import { siteConfig } from "../src/lib/config";
import { scrollThrough } from "./helpers";

const { sections, labels } = siteConfig;

test.describe("botão flutuante", () => {
  test.skip(!sections.floating.enabled, "botão flutuante desligado na config");

  test("escondido no hero, aparece depois e some no CTA final", async ({ page }) => {
    await page.goto("/");
    const floating = page.locator('a[data-whatsapp-cta="floating"]');
    await expect(floating).toBeHidden();

    // Passa do hero e rola um pouco para cima (no mobile ele some enquanto se rola para baixo).
    await page.locator("#como-funciona").scrollIntoViewIfNeeded();
    await page.mouse.wheel(0, -300);
    await expect(floating).toBeVisible();

    if (sections.finalCta.enabled) {
      await page.locator("[data-final-cta]").scrollIntoViewIfNeeded();
      await expect(floating).toBeHidden();
    }
  });

  test("não cobre o fim da página (o rodapé tem espaço para ele)", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await page.mouse.wheel(0, -10);
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    const floating = page.locator('a[data-whatsapp-cta="floating"]');
    const box = await floating.boundingBox();
    const lastText = page.locator("footer > div > div").last();
    const textBox = await lastText.boundingBox();
    if (!box || !textBox) return; // escondido: nada cobre nada
    const overlaps =
      box.x < textBox.x + textBox.width &&
      box.x + box.width > textBox.x &&
      box.y < textBox.y + textBox.height &&
      box.y + box.height > textBox.y;
    expect(overlaps).toBe(false);
  });
});

test("teclado: o 1º Tab vai para o 'pular para o conteúdo'", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: labels.skipToContent });
  await expect(skip).toBeFocused();
  await expect(skip).toBeInViewport();
  await page.keyboard.press("Enter");
  await expect(page.locator("main")).toBeFocused();
});

test("teclado: os CTAs recebem foco visível", async ({ page }) => {
  await page.goto("/");
  const cta = page.locator('a[data-whatsapp-cta="header"]');
  await cta.focus();
  await expect(cta).toBeFocused();
  const outline = await cta.evaluate((el) => getComputedStyle(el).outlineStyle);
  expect(outline).not.toBe("none");
});

test("com prefers-reduced-motion nada fica escondido esperando animação", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await scrollThrough(page);
  await expect(page.locator('[data-reveal="pending"]')).toHaveCount(0);
  const animation = await page
    .locator("[data-typing]")
    .evaluateAll((els) => els.map((el) => el.getAttribute("data-typing")));
  expect(animation.every((value) => value !== "on")).toBe(true);
});

test("sem reduced-motion, as seções entram ao rolar e terminam visíveis", async ({ page }) => {
  await page.goto("/");
  await scrollThrough(page);
  await page.waitForTimeout(900);
  await expect(page.locator('[data-reveal="pending"]')).toHaveCount(0);
});
