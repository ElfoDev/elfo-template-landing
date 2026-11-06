/**
 * Roda no browser em todos os CTAs `a[data-whatsapp-cta]`:
 * 1. anexa à mensagem as UTMs com que o visitante chegou (?utm_source=...);
 * 2. dispara os eventos de conversão do GA4/Meta Pixel, se estiverem ativos.
 */
import { formatUtm, utmFromSearch, whatsappLink } from "../lib/whatsapp";

const utm = utmFromSearch(window.location.search);
const hasUtm = formatUtm(utm) !== "";

for (const link of document.querySelectorAll<HTMLAnchorElement>("a[data-whatsapp-cta]")) {
  if (hasUtm) {
    const url = new URL(link.href);
    link.href = whatsappLink({
      number: url.pathname.slice(1),
      message: url.searchParams.get("text") ?? "",
      utm,
    });
  }

  link.addEventListener("click", () => {
    const { whatsappCta: cta, plan } = link.dataset;
    window.gtag?.("event", "generate_lead", { method: "whatsapp", cta, plan });
    window.fbq?.("track", "Contact", { cta, plan });
  });
}
