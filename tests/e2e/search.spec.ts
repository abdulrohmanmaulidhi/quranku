import { expect, test } from "@playwright/test";
import { readSurahText } from "./helpers";

const fatihah = readSurahText(1);

test("beranda meneruskan pencarian surah ke layar Cari", async ({ page }) => {
  await page.goto("/");

  const search = page.getByRole("searchbox");
  await search.fill("kahf");
  await search.press("Enter");

  await expect(page).toHaveURL(/\/cari\?mode=surah&q=kahf$/);
  await expect(page.getByRole("link", { name: /Al-Kahf/ }).first()).toBeVisible();
});

test("pencarian Arab menemukan ayat, menyorot kata, dan membuka Reader tepat di ayat", async ({
  page,
}) => {
  await page.goto(`/cari?mode=arab&q=${encodeURIComponent("الرحمن")}`);

  const result = page.getByRole("link", { name: /Al-Faatiha 1:3/ });
  await expect(result).toBeVisible();

  const arabic = result.locator("[dir='rtl']");
  await expect(arabic).toHaveText(fatihah.ayahs[2]!.text);
  await expect(arabic.locator("mark")).not.toBeEmpty();

  await result.click();

  await expect(page).toHaveURL(/\/surah\/1\/3$/);
  await expect(page.getByText("Ayat dituju")).toBeVisible();
  await expect(page.locator("#ayah-3 [dir='rtl']")).toHaveText(fatihah.ayahs[2]!.text);
});

test("pencarian Arab mengabaikan harakat", async ({ page }) => {
  await page.goto(`/cari?mode=arab&q=${encodeURIComponent("ٱلرَّحْمَـٰنِ")}`);

  await expect(page.getByRole("link", { name: /Al-Faatiha 1:3/ })).toBeVisible();
});

test("pencarian Arab memakai teks ayat verbatim dari data surah", async ({ page }) => {
  await page.goto(`/cari?mode=arab&q=${encodeURIComponent("الرحمن")}`);

  const result = page.getByRole("link", { name: /Al-Faatiha 1:3/ });
  await expect(result.locator("[dir='rtl']")).toHaveText(fatihah.ayahs[2]!.text);
});

test("pencarian surah dan juz tetap bekerja di indeks", async ({ page }) => {
  await page.goto("/surah");
  await page.getByRole("searchbox").fill("al-kahf");

  await expect(page.getByRole("link", { name: /Al-Kahf/ }).first()).toBeVisible();

  await page.getByRole("tab", { name: "Juz" }).click();
  await expect(page.getByRole("link", { name: /Juz 16/ })).toBeVisible();
});
