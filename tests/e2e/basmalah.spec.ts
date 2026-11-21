import { expect, test } from "@playwright/test";
import { readDataJson, readSurahText, renderedFirstAyah } from "./helpers";

const fatihah = readSurahText(1);
const baqarah = readSurahText(2);
const atTaubah = readSurahText(9);
const basmalahText = readDataJson<{ text: string }>("basmalah.json").text;

test("basmalah tampil sebagai baris tersendiri sebelum ayat pertama", async ({ page }) => {
  await page.goto("/surah/2");

  const basmalah = page.locator("[data-basmalah]");

  await expect(basmalah).toBeVisible();
  await expect(basmalah).toHaveAttribute("lang", "ar");
  await expect(basmalah).toHaveAttribute("dir", "rtl");
  await expect(basmalah).toHaveText(basmalahText);
  await expect(page.locator("#ayah-1 [dir='rtl']")).toHaveText(baqarah.ayahs[0]!.text);

  const placement = await page.evaluate(() => {
    const hint = [...document.querySelectorAll("p")].find(
      (element) => element.textContent?.trim() === "Ketuk ayat untuk membuka aksi.",
    );
    const row = document.querySelector("[data-basmalah]");
    const ayah = document.querySelector("#ayah-1");
    return {
      afterHint: hint?.nextElementSibling === row,
      beforeAyah: Boolean(
        row && ayah && (row.compareDocumentPosition(ayah) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0,
      ),
    };
  });
  expect(placement).toEqual({ afterHint: true, beforeAyah: true });

  // Ayat 1 tetap utuh: basmalah tidak dipotong dari teksnya.
  expect(await renderedFirstAyah(page)).toBe(baqarah.ayahs[0]!.text);
});

test("deep link ke ayat 1 tetap memperlihatkan basmalah", async ({ page }) => {
  await page.goto("/surah/2/1");

  await expect(page.locator("[data-basmalah]")).toBeInViewport();
  await expect(page.getByRole("heading", { level: 1, name: "Al-Baqarah" })).toBeVisible();
});

test("surah 1 tidak menampilkan basmalah sebagai header", async ({ page }) => {
  await page.goto("/surah/1");

  await expect(page.locator("[data-basmalah]")).toHaveCount(0);
  await expect(page.locator("#ayah-1 [dir='rtl']")).toHaveText(fatihah.ayahs[0]!.text);
});

test("surah 9 tidak menampilkan basmalah", async ({ page }) => {
  await page.goto("/surah/9");

  await expect(page.locator("[data-basmalah]")).toHaveCount(0);
  await expect(page.locator("#ayah-1 [dir='rtl']")).toHaveText(atTaubah.ayahs[0]!.text);
});
