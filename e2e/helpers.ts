import { expect, type Page } from "@playwright/test";
import { type CtaId, ctaMessage, planMessage, siteConfig } from "../src/lib/config";

/** Lê o número e a mensagem (decodificada) de um link wa.me. */
export function parseWhatsAppHref(href: string | null) {
  expect(href).not.toBeNull();
  const url = new URL(href ?? "");
  return { host: url.host, number: url.pathname.slice(1), text: url.searchParams.get("text") };
}

/** Mensagem que um CTA deveria ter (a do plano, nos botões de planos). */
export function expectedMessage(cta: string, plan: string | null): string {
  const { pricing } = siteConfig.sections;
  if (cta === "pricing" && plan && pricing.enabled) {
    const found = pricing.plans.find((item) => item.name === plan);
    expect(found, `plano "${plan}" existe na config`).toBeDefined();
    return planMessage(found ?? {});
  }
  return ctaMessage(cta as CtaId);
}

/** Rola até o fim da página aos poucos (dispara observers e o "reveal"). */
export async function scrollThrough(page: Page) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.documentElement.scrollHeight; y += 400) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 30));
    }
  });
}
