import { expect, test } from "@playwright/test";
import { readSurahs, readSurahText } from "./helpers";

const surahs = readSurahs();
const kahf = readSurahText(18);
const fatihah = readSurahText(1);

test("teks Arab memakai atribut RTL dan font Arab tanpa spasi huruf", async ({ page }) => {
  await page.goto("/surah/1");

  const ayah = page.locator("#ayah-1 [dir='rtl']");
  await expect(ayah).toHaveAttribute("lang", "ar");
  await expect(ayah).toHaveText(fatihah.ayahs[0]!.text);

  const styles = await ayah.evaluate((element) => {
    const computed = getComputedStyle(element);
    return {
      fontFamily: computed.fontFamily,
      fontWeight: computed.fontWeight,
      fontStyle: computed.fontStyle,
      letterSpacing: computed.letterSpacing,
      direction: computed.direction,
    };
  });

  expect(styles.fontFamily).toContain("Noto Naskh Arabic");
  expect(styles.fontWeight).toBe("400");
  expect(styles.fontStyle).toBe("normal");
  expect(styles.letterSpacing).toBe("normal");
  expect(styles.direction).toBe("rtl");
});

test("nama surah Arab pada indeks juga RTL dan tidak dipotong", async ({ page }) => {
  await page.goto("/surah");

  const row = page.getByRole("link", { name: /Al-Kahf/ }).first();
  const arabicName = row.locator("[lang='ar']");
  await expect(arabicName).toHaveText(surahs[17]!.name);
  await expect(arabicName).toHaveAttribute("dir", "rtl");

  const clipped = await arabicName.evaluate(
    (element) => element.scrollWidth > element.clientWidth + 1,
  );
  expect(clipped).toBe(false);
});

test("setiap ayat surah 18 dirender persis seperti data", async ({ page }) => {
  await page.goto("/surah/18");

  const first = page.locator("#ayah-1 [dir='rtl']");
  const last = page.locator("#ayah-110 [dir='rtl']");
  await expect(first).toHaveText(kahf.ayahs[0]!.text);
  await last.scrollIntoViewIfNeeded();
  await expect(last).toHaveText(kahf.ayahs[109]!.text);
});
