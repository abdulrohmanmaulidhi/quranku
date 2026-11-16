import { expect, test } from "@playwright/test";
import { readSurahText } from "./helpers";

const kahf = readSurahText(18);

test("bagikan ayat lewat Web Share API dengan teks verbatim", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: async (data: ShareData) => {
        (window as unknown as { __shared?: ShareData }).__shared = data;
      },
    });
  });

  await page.goto("/surah/18/10");
  await page.getByRole("button", { name: "Pilih ayat 10", exact: true }).click();
  await page.getByRole("button", { name: "Aksi ayat 10", exact: true }).click();
  await page.getByRole("button", { name: "Bagikan ayat" }).click();

  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (
            window as unknown as {
              __shared?: { title?: string; text?: string; url?: string };
            }
          ).__shared,
      ),
    )
    .toBeTruthy();

  const shared = await page.evaluate(
    () =>
      (window as unknown as { __shared?: { title?: string; text?: string; url?: string } })
        .__shared,
  );

  expect(shared?.title).toBe("QS. Al-Kahf 18:10");
  expect(shared?.text).toContain(kahf.ayahs[9]!.text);
  expect(shared?.text).toContain("QS. Al-Kahf 18:10");
  expect(shared?.text).toContain("Sumber: Tanzil (teks Arab)");
  expect(shared?.url).toMatch(/\/surah\/18\/10$/);
});

test("aksi bagikan disembunyikan bila Web Share API tidak tersedia", async ({ page }) => {
  await page.goto("/surah/18/10");
  await page.getByRole("button", { name: "Pilih ayat 10", exact: true }).click();
  await page.getByRole("button", { name: "Aksi ayat 10", exact: true }).click();

  await expect(page.getByRole("button", { name: "Salin ayat" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Bagikan ayat" })).toHaveCount(0);
});
