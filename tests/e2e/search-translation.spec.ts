import { expect, test } from "@playwright/test";
import { readSurahTranslation } from "./helpers";

const fatihah = readSurahTranslation(1);
const first = fatihah.ayahs[0]!;

test("pencarian terjemahan menyorot kata dan membuka Reader dengan terjemahan tampil", async ({
  page,
}) => {
  // Sembunyikan terjemahan lebih dulu agar hasil pencarian benar-benar
  // memaksa tampil untuk satu kunjungan, bukan sekadar mengandalkan bawaan.
  await page.goto("/surah/1");
  await page.getByRole("button", { name: "Pengaturan baca" }).click();
  const toggle = page.getByRole("checkbox", { name: "Tampilkan terjemahan" });
  await expect(toggle).toBeChecked();
  await toggle.click();
  await expect(page.locator("#ayah-1").getByText(first.text)).toHaveCount(0);
  await page.getByRole("button", { name: "Selesai" }).click();

  await page.goto(`/cari?mode=terjemahan&q=${encodeURIComponent("pengasih")}`);

  const result = page.getByRole("link", { name: /Al-Faatiha 1:1/ });
  await expect(result).toBeVisible();

  const translation = result.locator("[lang='id']");
  await expect(translation).toHaveText(first.text);
  await expect(translation.locator("mark")).not.toBeEmpty();

  await result.click();

  await expect(page).toHaveURL(/\/surah\/1\/1$/);
  await expect(page.locator("#ayah-1").getByText(first.text)).toBeVisible();
});

test("pencarian terjemahan meminta kueri minimal tiga huruf", async ({ page }) => {
  await page.goto("/cari?mode=terjemahan&q=ma");

  await expect(page.getByText("Ketik minimal tiga huruf untuk mulai mencari ayat.")).toBeVisible();
});

test("pencarian terjemahan menampilkan keadaan kosong untuk kata yang tidak ada", async ({
  page,
}) => {
  await page.goto(`/cari?mode=terjemahan&q=${encodeURIComponent("zzzqqq")}`);

  await expect(page.getByText(/Tidak ada hasil untuk/)).toBeVisible();
});
