/**
 * Ícones SVG (traço 24×24, a maioria do Lucide, licença ISC). Use o nome em
 * `site.config.ts` (ex.: `icon: "users"`) e o componente `Icon.astro` desenha.
 *
 * Os ícones "fill" são preenchidos (marca, estrela, logos); os demais usam
 * traço (`stroke="currentColor"`). Para adicionar um ícone, coloque aqui o
 * conteúdo do `<svg>` com viewBox 0 0 24 24.
 */

export interface IconDef {
  /** Conteúdo do `<svg viewBox="0 0 24 24">`. */
  body: string;
  /** Preenchido (`fill="currentColor"`) em vez de traço. */
  fill?: boolean;
}

export const ICONS = {
  whatsapp: {
    fill: true,
    body: '<path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91A9.85 9.85 0 0 0 12.04 2Zm5.8 14.03c-.24.68-1.42 1.32-1.95 1.36-.5.05-.97.23-3.27-.68-2.77-1.09-4.52-3.92-4.66-4.1-.13-.18-1.1-1.47-1.1-2.8 0-1.33.7-1.99.95-2.26.24-.27.53-.34.71-.34l.51.01c.16.01.38-.06.6.46.23.54.77 1.87.84 2 .07.14.11.3.02.48-.09.18-.14.29-.27.45l-.41.47c-.14.13-.27.28-.12.55.16.27.7 1.15 1.5 1.86 1.03.92 1.9 1.2 2.17 1.34.27.14.43.11.59-.07.16-.18.68-.79.86-1.07.18-.27.36-.22.61-.13.25.09 1.58.75 1.85.88.27.14.45.2.52.32.07.11.07.66-.17 1.33Z"/>',
  },
  star: {
    fill: true,
    body: '<path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/>',
  },
  clock: { body: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>' },
  users: {
    body: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  },
  award: {
    body: '<circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>',
  },
  heart: {
    body: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27"/>',
  },
  unlock: {
    body: '<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/>',
  },
  train: {
    body: '<rect width="16" height="16" x="4" y="3" rx="2"/><path d="M4 11h16"/><path d="M12 3v8"/><path d="m8 19-2 3"/><path d="m18 22-2-3"/><path d="M8 15h.01"/><path d="M16 15h.01"/>',
  },
  check: { body: '<path d="M20 6 9 17l-5-5"/>' },
  "check-double": { body: '<path d="M18 6 7 17l-5-5"/><path d="m22 10-7.5 7.5L13 16"/>' },
  plus: { body: '<path d="M5 12h14"/><path d="M12 5v14"/>' },
  "arrow-down": { body: '<path d="M12 5v14"/><path d="m19 12-7 7-7-7"/>' },
  "arrow-right": { body: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>' },
  mail: {
    body: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
  },
  phone: {
    body: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
  },
  pin: {
    body: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
  },
  chat: { body: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>' },
  calendar: {
    body: '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>',
  },
  sparkles: {
    body: '<path d="M12 3 13.9 8.8 20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2Z"/><path d="M19 3v4"/><path d="M21 5h-4"/>',
  },
  shield: {
    body: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
  },
  leaf: {
    body: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>',
  },
  smile: {
    body: '<circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><path d="M9 9h.01"/><path d="M15 9h.01"/>',
  },
  zap: {
    body: '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',
  },
  target: {
    body: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
  },
  home: {
    body: '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  },
  activity: {
    body: '<path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"/>',
  },
  globe: {
    body: '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
  },
  instagram: {
    body: '<rect width="20" height="20" x="2" y="2" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><path d="M17.5 6.5h.01"/>',
  },
  facebook: {
    body: '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>',
  },
  youtube: {
    body: '<path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/>',
  },
  linkedin: {
    body: '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/>',
  },
  tiktok: {
    body: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
  },
  // Formas preenchidas, boas para "logos" de parceiros fictícios.
  "logo-cross": {
    fill: true,
    body: '<path fill-rule="evenodd" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm-1 5h2v4h4v2h-4v4h-2v-4H7v-2h4Z"/>',
  },
  "logo-bars": {
    fill: true,
    body: '<rect x="3" y="11" width="4" height="10" rx="2"/><rect x="10" y="7" width="4" height="14" rx="2"/><rect x="17" y="3" width="4" height="18" rx="2"/>',
  },
  "logo-person": {
    fill: true,
    body: '<circle cx="12" cy="7" r="4"/><path d="M3 21a9 6 0 0 1 18 0Z"/>',
  },
  "logo-drop": { fill: true, body: '<path d="M12 2c4 4 6 7 6 11a6 6 0 0 1-12 0c0-4 2-7 6-11Z"/>' },
  "logo-house": { fill: true, body: '<path d="M12 3 2 12h3v9h5v-6h4v6h5v-9h3Z"/>' },
} as const satisfies Record<string, IconDef>;

export type IconName = keyof typeof ICONS;

export const ICON_NAMES = Object.keys(ICONS) as [IconName, ...IconName[]];

export function isIconName(value: string): value is IconName {
  return Object.hasOwn(ICONS, value);
}

/** Parece um nome de ícone (minúsculas e hífens), e não um emoji ou caractere solto. */
export function looksLikeIconName(value: string): boolean {
  return /^[a-z][a-z0-9-]+$/.test(value);
}
