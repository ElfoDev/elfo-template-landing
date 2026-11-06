/**
 * Quando mostrar o botão flutuante de WhatsApp (lógica pura; o DOM fica em
 * `src/scripts/landing.ts`):
 * - só depois que o CTA do hero sai da tela;
 * - some quando o CTA final está visível (já há um botão grande ali);
 * - no mobile, some enquanto a pessoa rola para baixo (lendo) e volta ao rolar para cima.
 */

export interface FloatingState {
  heroCtaVisible: boolean;
  finalCtaVisible: boolean;
  hiddenByScroll: boolean;
  lastY: number;
}

/** Largura abaixo da qual vale o "esconde ao rolar para baixo". */
export const MOBILE_MAX_WIDTH = 640;
/** Pixels de rolagem ignorados (evita piscar com o "quique" do scroll). */
export const SCROLL_TOLERANCE = 6;

export function initialFloatingState(y = 0): FloatingState {
  return { heroCtaVisible: true, finalCtaVisible: false, hiddenByScroll: false, lastY: y };
}

/** Novo estado depois de uma rolagem até `y` numa tela de largura `width`. */
export function onFloatingScroll(state: FloatingState, y: number, width: number): FloatingState {
  if (width >= MOBILE_MAX_WIDTH) return { ...state, hiddenByScroll: false, lastY: y };
  if (y > state.lastY + SCROLL_TOLERANCE) return { ...state, hiddenByScroll: true, lastY: y };
  if (y < state.lastY - SCROLL_TOLERANCE) return { ...state, hiddenByScroll: false, lastY: y };
  return state;
}

export function isFloatingVisible(state: FloatingState): boolean {
  return !state.heroCtaVisible && !state.finalCtaVisible && !state.hiddenByScroll;
}
