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

  const result = page.getByRole("link", { name: /Al-Fatihah 1:1/ });
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

test("pencarian terjemahan mengabaikan imbuhan umum", async ({ page }) => {
  // "diketahui" punya 11 kecocokan literal; dengan bentuk dasar ("tahu")
  // hasilnya melampaui batas 20 sehingga ayat 2:235 ikut muncul.
  await page.goto(`/cari?mode=terjemahan&q=${encodeURIComponent("diketahui")}`);

  await expect(
    page.getByRole("status").getByText(/^Menampilkan 20 dari \d+ hasil\.$/),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: /Al-Baqarah 2:235/ })).toBeVisible();

  await expect(
    page.getByText(/mengabaikan huruf besar\/kecil, diakritik, dan imbuhan/),
  ).toBeVisible();
});

test("hasil pencarian bertambah 20 per klik hingga batas 100", async ({ page }) => {
  await page.goto(`/cari?mode=arab&q=${encodeURIComponent("الله")}`);

  const status = page.getByRole("status").filter({ hasText: "hasil" });
  const rows = page.locator("ol a");

  await expect(status).toHaveText(/Menampilkan 20 dari \d+ hasil\./);
  await expect(rows).toHaveCount(20);

  const more = page.getByRole("button", { name: "Tampilkan 20 hasil lagi" });
  await more.click();
  await expect(status).toHaveText(/Menampilkan 40 dari \d+ hasil\./);
  await expect(rows).toHaveCount(40);

  for (let click = 0; click < 3; click += 1) {
    await more.click();
  }

  await expect(rows).toHaveCount(100);
  await expect(more).toHaveCount(0);
  await expect(status).toHaveText(
    /Menampilkan 100 dari \d+ hasil\. Persempit kata kunci untuk hasil lain\./,
  );
});

test("pencarian terjemahan menampilkan keadaan kosong untuk kata yang tidak ada", async ({
  page,
}) => {
  await page.goto(`/cari?mode=terjemahan&q=${encodeURIComponent("zzzqqq")}`);

  await expect(page.getByText(/Tidak ada hasil untuk/)).toBeVisible();
});
