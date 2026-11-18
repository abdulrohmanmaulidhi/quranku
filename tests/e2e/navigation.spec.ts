import { expect, test } from "@playwright/test";
import { readSurahText } from "./helpers";

const kahf = readSurahText(18);

test("beranda → indeks surah → reader", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1, name: "Quranku" })).toBeVisible();
  await page.getByRole("link", { name: "Mulai membaca" }).click();

  await expect(page).toHaveURL(/\/surah$/);
  await expect(page.getByRole("heading", { level: 1, name: "Quran" })).toBeVisible();

  await page
    .getByRole("link", { name: /Al-Kahf/ })
    .first()
    .click();

  await expect(page).toHaveURL(/\/surah\/18$/);
  await expect(page.getByRole("heading", { level: 1, name: "Al-Kahf" })).toBeVisible();

  const firstAyah = page.locator("#ayah-1 [dir='rtl']");
  await expect(firstAyah).toHaveText(kahf.ayahs[0]!.text);

  // Tombol kembali harus tampil sama dengan tautan kembali, tanpa gaya bawaan
  // <button> (latar abu-abu dan border outset).
  const back = page.getByRole("button", { name: "Kembali" });
  await expect(back).toHaveCSS("border-top-width", "0px");
  await expect(back).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");

  await back.click();
  await expect(page).toHaveURL(/\/surah$/);
});

test("deep link membuka dan menandai ayat yang dituju", async ({ page }) => {
  await page.goto("/surah/18/10");

  await expect(page.getByText("Ayat dituju")).toBeVisible();
  await expect(page.locator("#ayah-10 [dir='rtl']")).toHaveText(kahf.ayahs[9]!.text);
  await expect(page.locator("#ayah-10")).toBeInViewport();
});

test("deep link dengan ?ayah= tetap didukung", async ({ page }) => {
  await page.goto("/surah/18?ayah=10");

  await expect(page.getByText("Ayat dituju")).toBeVisible();
  await expect(page.locator("#ayah-10")).toBeInViewport();
});

test("ayat di luar rentang menampilkan pemberitahuan yang bisa ditutup", async ({ page }) => {
  await page.goto("/surah/18/999");

  const notice = page
    .getByText("Ayat 999 tidak ditemukan. Surah ini memiliki 110 ayat.")
    .locator("..");

  await expect(notice).toBeVisible();

  await notice.getByRole("button", { name: "Tutup" }).click();
  await expect(notice).toBeHidden();
});

test("ikon navigasi selalu garis dan tab aktif tetap terbaca tanpa warna", async ({ page }) => {
  await page.goto("/surah");

  const nav = page.getByRole("navigation", { name: "Navigasi utama" }).first();
  const active = nav.locator("[aria-current='page']");

  await expect(active).toHaveText(/Baca Quran|Quran/);
  await expect(active.locator("svg")).toHaveAttribute("fill", "none");
  await expect(active).toHaveCSS("font-weight", "600");
});

test("rute lama dialihkan ke rute kanonis", async ({ page }) => {
  await page.goto("/quran");
  await expect(page).toHaveURL(/\/surah$/);

  await page.goto("/quran/18?ayah=10");
  await expect(page).toHaveURL(/\/surah\/18\?ayah=10$/);

  await page.goto("/sumber");
  await expect(page).toHaveURL(/\/pengaturan\/sumber$/);
});
