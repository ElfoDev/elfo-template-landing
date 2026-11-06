import { describe, expect, it } from "vitest";
import { initialFloatingState, isFloatingVisible, onFloatingScroll } from "./floating";

const MOBILE = 360;
const DESKTOP = 1280;

describe("botão flutuante", () => {
  it("fica escondido enquanto o CTA do hero está na tela", () => {
    expect(isFloatingVisible(initialFloatingState())).toBe(false);
  });

  it("aparece quando o CTA do hero sai da tela e some no CTA final", () => {
    const afterHero = { ...initialFloatingState(), heroCtaVisible: false };
    expect(isFloatingVisible(afterHero)).toBe(true);
    expect(isFloatingVisible({ ...afterHero, finalCtaVisible: true })).toBe(false);
  });

  it("no mobile some ao rolar para baixo e volta ao rolar para cima", () => {
    let state = { ...initialFloatingState(0), heroCtaVisible: false };
    state = onFloatingScroll(state, 400, MOBILE);
    expect(isFloatingVisible(state)).toBe(false);
    state = onFloatingScroll(state, 300, MOBILE);
    expect(isFloatingVisible(state)).toBe(true);
  });

  it("ignora rolagens pequenas (tolerância)", () => {
    const state = { ...initialFloatingState(100), heroCtaVisible: false };
    expect(onFloatingScroll(state, 104, MOBILE)).toBe(state);
  });

  it("no desktop não esconde ao rolar", () => {
    let state = { ...initialFloatingState(0), heroCtaVisible: false };
    state = onFloatingScroll(state, 800, DESKTOP);
    expect(isFloatingVisible(state)).toBe(true);
    expect(state.lastY).toBe(800);
  });
});
