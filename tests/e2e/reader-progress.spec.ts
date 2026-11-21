import { expect, test } from "@playwright/test";

test("progres baca mengikuti gulir dan tombol kembali ke atas bekerja", async ({ page }) => {
  await page.goto("/surah/2");
  await expect(page.getByRole("heading", { level: 1, name: "Al-Baqarah" })).toBeVisible();

  const bar = page.getByRole("progressbar", { name: "Progres baca" });
  await expect(bar).toHaveAttribute("aria-valuenow", "0");

  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight / 2));
  await expect
    .poll(async () => Number(await bar.getAttribute("aria-valuenow")))
    .toBeGreaterThan(40);

  const backToTop = page.getByRole("button", { name: "Kembali ke atas" });
  await expect(backToTop).toBeVisible();
  await backToTop.click();

  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(5);
  await expect.poll(async () => Number(await bar.getAttribute("aria-valuenow"))).toBeLessThan(2);
});

test("tombol kembali ke atas melompat tanpa animasi bila gerak dikurangi", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/surah/2");
  await expect(page.getByRole("heading", { level: 1, name: "Al-Baqarah" })).toBeVisible();

  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  const backToTop = page.getByRole("button", { name: "Kembali ke atas" });
  await expect(backToTop).toBeVisible();
  await backToTop.click();

  expect(await page.evaluate(() => window.scrollY)).toBeLessThan(5);
});
