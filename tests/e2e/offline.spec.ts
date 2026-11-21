import { expect, test } from "@playwright/test";
import { DATASET_VERSION } from "../../src/lib/data/version";
import { readSurahText, readSurahTranslation, renderedFirstAyah } from "./helpers";

const fatihah = readSurahText(1);
const baqarah = readSurahText(2);
const baqarahTranslation = readSurahTranslation(2);

test("data tersimpan dapat dipakai untuk membaca dan mencari tanpa jaringan", async ({
  page,
  context,
}) => {
  test.setTimeout(90_000);
  await page.goto("/pengaturan");

  const cacheName = `quranku-data-v${DATASET_VERSION}`;
  // Status di UI menjadi penanda unduhan selesai. `waitForFunction` dengan
  // fungsi async tidak menunggu promise, jadi jumlah cache diperiksa terpisah.
  await expect(page.getByText(/^Siap offline · /)).toBeVisible({ timeout: 60_000 });
  const cached = await page.evaluate(async (name) => {
    const cache = await caches.open(name);
    return (await cache.keys()).length;
  }, cacheName);
  expect(cached).toBeGreaterThanOrEqual(236);

  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));

  await context.setOffline(true);
  await page.goto(`/cari?mode=arab&q=${encodeURIComponent("الرحمن")}`, {
    waitUntil: "domcontentloaded",
  });

  const result = page.getByRole("link", { name: /Al-Fatihah 1:3/ });
  await expect(result).toBeVisible();
  await expect(result.locator("[dir='rtl']")).toHaveText(fatihah.ayahs[2]!.text);

  await page.goto(`/cari?mode=terjemahan&q=${encodeURIComponent("pengasih")}`, {
    waitUntil: "domcontentloaded",
  });

  const translationResult = page.getByRole("link", { name: /Al-Fatihah 1:1/ });
  await expect(translationResult).toBeVisible();
  await expect(translationResult.locator("[lang='id']")).toContainText("Pengasih");

  await page.goto("/surah/2", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { level: 1, name: "Al-Baqarah" })).toBeVisible();
  expect(await renderedFirstAyah(page)).toBe(baqarah.ayahs[0]!.text);
  await expect(page.locator("#ayah-1").getByText(baqarahTranslation.ayahs[0]!.text)).toBeVisible();
});
