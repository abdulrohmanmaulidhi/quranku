import { expect, test } from "@playwright/test";
import { readSurahText } from "./helpers";

const fatihah = readSurahText(1);
const baqarah = readSurahText(2);

test("data tersimpan dapat dipakai untuk membaca dan mencari tanpa jaringan", async ({
  page,
  context,
}) => {
  test.setTimeout(90_000);
  await page.goto("/pengaturan");

  await page.waitForFunction(
    async () => {
      if (!("caches" in window)) return false;
      const keys = await caches.keys();
      if (!keys.includes("quranku-data-v1")) return false;
      const cache = await caches.open("quranku-data-v1");
      const entries = await cache.keys();
      return entries.length >= 119;
    },
    undefined,
    { timeout: 60_000 },
  );

  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));

  await context.setOffline(true);
  await page.goto(`/cari?mode=arab&q=${encodeURIComponent("الرحمن")}`, {
    waitUntil: "domcontentloaded",
  });

  const result = page.getByRole("link", { name: /Al-Faatiha 1:3/ });
  await expect(result).toBeVisible();
  await expect(result.locator("[dir='rtl']")).toHaveText(fatihah.ayahs[2]!.text);

  await page.goto("/surah/2", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { level: 1, name: "Al-Baqara" })).toBeVisible();
  await expect(page.locator("#ayah-1 [dir='rtl']")).toHaveText(baqarah.ayahs[0]!.text);
});
