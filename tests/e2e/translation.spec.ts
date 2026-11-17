import { expect, test } from "@playwright/test";
import { readSurahTranslation } from "./helpers";

const fatihah = readSurahTranslation(1);
const verse = fatihah.ayahs.find((row) => row.n === 4)!;

test("terjemahan tampil secara bawaan, catatan kaki dapat dibuka, dan pilihan tersimpan", async ({
  page,
}) => {
  await page.goto("/surah/1");

  await expect(page.getByRole("heading", { level: 1, name: "Al-Faatiha" })).toBeVisible();
  await expect(page.getByText(/Kementerian Agama RI — QuranEnc\.com/)).toBeVisible();
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
