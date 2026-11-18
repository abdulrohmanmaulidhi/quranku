import { expect, test } from "@playwright/test";

const pages = [
  { path: "/", label: "beranda" },
  { path: "/surah", label: "indeks surah" },
  { path: "/surah/18/10", label: "reader" },
  { path: "/cari", label: "cari" },
  { path: "/cari?mode=arab&q=%D8%A7%D9%84%D8%B1%D8%AD%D9%85%D9%86", label: "hasil cari Arab" },
  { path: "/cari?mode=terjemahan&q=pengasih", label: "hasil cari terjemahan" },
  { path: "/penanda", label: "penanda" },
  { path: "/pengaturan", label: "pengaturan" },
];

for (const { path, label } of pages) {
  test(`${label} tidak meluber horizontal pada 320 px`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto(path);
    await expect(page.locator("main")).toBeVisible();

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
  });
}

test("target sentuh utama minimal 44 px", async ({ page }) => {
  await page.goto("/surah/18");
  const back = page.getByRole("link", { name: "Kembali" });
  const box = await back.boundingBox();
  expect(box?.width ?? 0).toBeGreaterThanOrEqual(44);
  expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
});

test("tema gelap dan terang sama-sama dapat dibaca", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("quranku.theme", "dark"));
  await page.goto("/surah/18");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  const background = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(background).not.toBe("rgb(250, 248, 243)");

  await page.goto("/pengaturan");
  await page.getByText("Terang", { exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
});
