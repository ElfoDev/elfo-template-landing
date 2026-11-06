import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, fontProviders } from "astro/config";
import {
  assetFilePath,
  localAssetPaths,
  parseSiteConfig,
  SiteConfigError,
} from "./src/lib/config-schema";
import { contrastWarnings } from "./src/lib/theme";
import rawConfig from "./src/site.config";

// Valida src/site.config.ts antes de qualquer coisa: dev e build param aqui
// com a lista dos campos a corrigir.
const config = parseSiteConfig(rawConfig);

const rootDir = fileURLToPath(new URL("./", import.meta.url));
const missing = localAssetPaths(config).filter(
  (path) => !existsSync(rootDir + assetFilePath(path)),
);
if (missing.length > 0) {
  throw new SiteConfigError(
    missing.map((path) => `arquivo não encontrado: ${path} (esperado em ${assetFilePath(path)})`),
  );
}

// Contraste fraco não impede o build, mas avisa (acessibilidade, WCAG AA).
const { colors, darkColors, colorScheme } = config.brand;
const warnings = [
  ...(colorScheme === "dark" ? [] : contrastWarnings(colors)),
  ...(darkColors && colorScheme !== "light"
    ? contrastWarnings(darkColors, "brand.darkColors")
    : []),
];
for (const warning of warnings) console.warn(`⚠ src/site.config.ts: ${warning}`);

const fontWeights: [number, ...number[]] = [400, 500, 600, 700, 800];

// https://astro.build/config
export default defineConfig({
  site: config.seo.siteUrl,
  output: "static",
  trailingSlash: "ignore",
  // Fontes do Fontsource, baixadas no build e servidas pelo próprio site.
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: config.brand.fonts.heading,
      cssVariable: "--font-brand-heading",
      weights: fontWeights,
      subsets: ["latin"],
      fallbacks: ["sans-serif"],
    },
    {
      provider: fontProviders.fontsource(),
      name: config.brand.fonts.body,
      cssVariable: "--font-brand-body",
      weights: fontWeights,
      subsets: ["latin"],
      fallbacks: ["sans-serif"],
    },
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
