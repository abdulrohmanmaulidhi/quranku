import { expect, test } from "@playwright/test";
import { readSurahTranslation } from "./helpers";

const fatihah = readSurahTranslation(1);
const first = fatihah.ayahs[0]!;
const verse = fatihah.ayahs.find((row) => row.n === 4)!;

test("terjemahan tampil secara bawaan, catatan kaki dapat dibuka, dan pilihan tersimpan", async ({
  page,
}) => {
  await page.goto("/surah/1");

  await expect(page.getByRole("heading", { level: 1, name: "Al-Faatiha" })).toBeVisible();
  await expect(page.getByRole("link", { name: "detail sumber" })).toHaveCount(0);
  await expect(page.locator("#ayah-4").getByText(verse.text)).toBeVisible();
  await expect(page.locator("#ayah-4 details p")).toHaveText(verse.footnotes);

  await page.locator("#ayah-4 details summary").click();
  await expect(page.locator("#ayah-4 details")).toHaveAttribute("open", "");

  await page.getByRole("button", { name: "Pengaturan baca" }).click();
  const toggle = page.getByRole("checkbox", { name: "Tampilkan terjemahan" });
  await expect(toggle).toBeChecked();
  await toggle.click();
  await expect(page.locator("#ayah-4").getByText(verse.text)).toHaveCount(0);

  await page.reload();
  await expect(page.getByRole("heading", { level: 1, name: "Al-Faatiha" })).toBeVisible();
  await expect(page.locator("#ayah-4").getByText(verse.text)).toHaveCount(0);
});

test("S10 menampilkan atribusi dan versi terjemahan QuranEnc", async ({ page }) => {
  await page.goto("/pengaturan/sumber");

  await expect(page.getByText(/Ministry of Religious Affairs/)).toBeVisible();
  await expect(page.getByText("1.0.1", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: /QuranEnc\.com/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /Syarat pemakaian/ })).toBeVisible();
});

test("ukuran teks terjemahan tersimpan setelah muat ulang", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/surah/1");
  await expect(page.getByText(first.text)).toBeVisible();

  const sizeBefore = await page
    .locator("#ayah-1 [data-size]")
    .evaluate((element) => parseFloat(getComputedStyle(element).fontSize));

  await page.getByRole("button", { name: "Pengaturan baca" }).click();
  let dialog = page.getByRole("dialog", { name: "Pengaturan baca" });
  const translationSizeGroup = dialog.getByRole("group", { name: "Ukuran teks terjemahan" });
  await expect(translationSizeGroup.getByText("Sedang", { exact: true })).toBeVisible();

  await dialog.getByRole("button", { name: "Perbesar teks terjemahan" }).click();
  await expect(translationSizeGroup.getByText("Besar", { exact: true })).toBeVisible();
  await dialog.getByRole("button", { name: "Selesai" }).click();

  await expect
    .poll(() =>
      page
        .locator("#ayah-1 [data-size]")
        .evaluate((element) => parseFloat(getComputedStyle(element).fontSize)),
    )
    .toBeGreaterThan(sizeBefore);

  await page.reload();
  await expect(page.getByRole("heading", { level: 1, name: "Al-Faatiha" })).toBeVisible();
  await page.getByRole("button", { name: "Pengaturan baca" }).click();
  dialog = page.getByRole("dialog", { name: "Pengaturan baca" });
  await expect(
    dialog
      .getByRole("group", { name: "Ukuran teks terjemahan" })
      .getByText("Besar", { exact: true }),
  ).toBeVisible();

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
});
