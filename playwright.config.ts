import { defineConfig, devices } from "@playwright/test";

const PORT = 4321;
const baseURL = `http://127.0.0.1:${PORT}`;

/**
 * Smoke tests contra o build estático (`dist/`). No CI o build já roda antes,
 * então só sobe o `astro preview`; localmente `pnpm e2e` builda antes.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    // `--ignore-lock` mantém o preview em primeiro plano: o Astro manda o
    // preview para segundo plano quando detecta um agent (Claude Code etc.), e
    // aí o Playwright acha que o servidor morreu.
    command: `${process.env.CI ? "" : "pnpm build && "}pnpm preview --ignore-lock --host 127.0.0.1 --port ${PORT}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
