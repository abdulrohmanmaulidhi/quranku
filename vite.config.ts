import { fileURLToPath, URL } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import { DATASET_VERSION } from "./src/lib/data/version.ts";

// Harus sama dengan DATA_CACHE_NAME di src/features/offline/cache.ts agar
// service worker dan unduhan offline memakai cache yang sama.
const DATA_CACHE_NAME = `quranku-data-v${DATASET_VERSION}`;

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "prompt",
      injectRegister: null,
      includeAssets: [
        "icons/icon.svg",
        "icons/apple-touch-icon-180x180.png",
        "icons/favicon.ico",
        "fonts/licenses/*",
        `data/v${DATASET_VERSION}/manifest.json`,
        `data/v${DATASET_VERSION}/surahs.json`,
        `data/v${DATASET_VERSION}/juz.json`,
        `data/v${DATASET_VERSION}/COPYRIGHT.txt`,
      ],
      manifest: {
        id: "/",
        name: "Quranku — Al-Qur'an",
        short_name: "Quranku",
        description: "Baca Al-Qur'an tanpa gangguan, kapan saja, langsung di perangkat Anda.",
        lang: "id",
        dir: "ltr",
        start_url: "/",
        scope: "/",
        display: "standalone",
        background_color: "#FAF8F3",
        theme_color: "#1F6F5C",
        categories: ["books", "education"],
        icons: [
          {
            src: "/icons/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icons/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icons/maskable-icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
        shortcuts: [
          { name: "Baca Quran", url: "/surah" },
          { name: "Cari", url: "/cari" },
          { name: "Penanda", url: "/penanda" },
        ],
      },
      workbox: {
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/data\//, /^\/api\//],
        cleanupOutdatedCaches: true,
        globPatterns: ["**/*.{js,css,html,svg,png,ico,woff2}"],
        runtimeCaching: [
          {
            // Satu cache untuk semua data berversi. Beberapa route dengan
            // `maxEntries` berbeda pada cache yang sama dapat saling menghapus.
            urlPattern: /\/data\/v\d+\/(?:ar|tr|search)\/.*\.(?:json|txt)$/,
            handler: "CacheFirst",
            options: {
              cacheName: DATA_CACHE_NAME,
              cacheableResponse: { statuses: [0, 200] },
              expiration: {
                maxEntries: 260,
                maxAgeSeconds: 60 * 60 * 24 * 365,
                purgeOnQuotaError: true,
              },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    target: "es2022",
  },
});
