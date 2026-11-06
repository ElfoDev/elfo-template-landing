/**
 * Microinterações da landing (progressivas: sem JS a página funciona e
 * mostra tudo):
 * 1. borda no header depois de rolar;
 * 2. botão flutuante de WhatsApp (regras em `src/lib/floating.ts`);
 * 3. entrada das seções ao rolar, armada só no 1º scroll;
 * 4. "digitando…" no cartão de conversa do hero.
 * Com `prefers-reduced-motion`, 3 e 4 ficam desligados.
 */
import {
  type FloatingState,
  initialFloatingState,
  isFloatingVisible,
  onFloatingScroll,
} from "../lib/floating";

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const hasObserver = "IntersectionObserver" in window;

// 1. Header
const header = document.querySelector<HTMLElement>("[data-site-header]");
function updateHeader() {
  if (header) header.dataset.scrolled = String(window.scrollY > 8);
}

// 2. Botão flutuante
const floating = document.querySelector<HTMLElement>("[data-floating-cta]");
const heroCta = document.querySelector("[data-hero-cta]");
const finalCta = document.querySelector("[data-final-cta]");
let state: FloatingState = {
  ...initialFloatingState(window.scrollY),
  // Sem hero (ou sem IntersectionObserver), o botão já pode aparecer.
  heroCtaVisible: Boolean(heroCta && hasObserver),
};

function renderFloating() {
  if (floating) floating.dataset.visible = String(isFloatingVisible(state));
}

if (floating && hasObserver) {
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.target === heroCta) state = { ...state, heroCtaVisible: entry.isIntersecting };
      if (entry.target === finalCta) state = { ...state, finalCtaVisible: entry.isIntersecting };
    }
    renderFloating();
  });
  if (heroCta) observer.observe(heroCta);
  if (finalCta) observer.observe(finalCta);
}

// 3. Entrada das seções: só o que ainda está abaixo da dobra no 1º scroll.
function armReveal() {
  window.removeEventListener("scroll", armReveal);
  if (reduceMotion || !hasObserver) return;
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        (entry.target as HTMLElement).dataset.reveal = "";
        observer.unobserve(entry.target);
      }
    },
    { rootMargin: "0px 0px -8% 0px" },
  );
  for (const element of document.querySelectorAll<HTMLElement>("[data-reveal]")) {
    if (element.getBoundingClientRect().top > window.innerHeight) {
      element.dataset.reveal = "pending";
      observer.observe(element);
    }
  }
}
window.addEventListener("scroll", armReveal, { passive: true });

window.addEventListener(
  "scroll",
  () => {
    updateHeader();
    state = onFloatingScroll(state, window.scrollY, window.innerWidth);
    renderFloating();
  },
  { passive: true },
);
updateHeader();
renderFloating();

// 4. "digitando…"
const reply = document.querySelector<HTMLElement>("[data-typing]");
if (reply && !reduceMotion) {
  reply.dataset.typing = "on";
  window.setTimeout(() => {
    reply.dataset.typing = "";
  }, 1600);
}
