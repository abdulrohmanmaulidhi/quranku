import { expect, test } from "@playwright/test";
import { readSurahText } from "./helpers";

const fatihah = readSurahText(1);

test("lompat ke surah dan ayat lewat dialog", async ({ page }) => {
  await page.goto("/surah/18/10");
  await expect(page.getByText("Ayat dituju")).toBeVisible();

  await page.getByRole("button", { name: "Lompat ke" }).click();
  const dialog = page.getByRole("dialog", { name: "Lompat ke" });
  await expect(dialog).toBeVisible();

  await dialog.getByRole("combobox", { name: "Surah" }).selectOption("1");
  await dialog.getByRole("spinbutton", { name: "Nomor ayat" }).fill("2");
  await dialog.getByRole("button", { name: "Buka ayat" }).click();

  await expect(page).toHaveURL(/\/surah\/1\/2$/);
  await expect(page.getByText("Ayat dituju")).toBeVisible();
  await expect(page.locator("#ayah-2 [dir='rtl']")).toHaveText(fatihah.ayahs[1]!.text);
});

test("nomor ayat di luar rentang memberi pesan inline", async ({ page }) => {
  await page.goto("/surah/18/10");
  await page.getByRole("button", { name: "Lompat ke" }).click();

  const dialog = page.getByRole("dialog", { name: "Lompat ke" });
  await dialog.getByRole("combobox", { name: "Surah" }).selectOption("1");
  await dialog.getByRole("spinbutton", { name: "Nomor ayat" }).fill("99");
  await dialog.getByRole("button", { name: "Buka ayat" }).click();

  await expect(dialog.getByRole("alert")).toHaveText("Surah ini memiliki 7 ayat.");
  await expect(dialog).toBeVisible();
  await expect(page).toHaveURL(/\/surah\/18\/10$/);
});

test("lompat ke awal juz lewat tab Juz", async ({ page }) => {
  await page.goto("/surah/18/10");
  await page.getByRole("button", { name: "Lompat ke" }).click();

  const dialog = page.getByRole("dialog", { name: "Lompat ke" });
  await dialog.getByRole("tab", { name: "Juz" }).click();
  await dialog.getByRole("combobox", { name: "Juz" }).selectOption("30");

  await expect(dialog.getByText("Mulai QS. An-Naba' 78:1.")).toBeVisible();
  await dialog.getByRole("button", { name: "Buka juz" }).click();

  await expect(page).toHaveURL(/\/surah\/78\/1$/);
  await expect(page.getByText("Ayat dituju")).toBeVisible();
});

test("dialog lompat ke dapat ditutup tanpa berpindah", async ({ page }) => {
  await page.goto("/surah/18/10");
  await page.getByRole("button", { name: "Lompat ke" }).click();

  const dialog = page.getByRole("dialog", { name: "Lompat ke" });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Tutup" }).click();
  await expect(dialog).toBeHidden();
  await expect(page).toHaveURL(/\/surah\/18\/10$/);
});
