import { expect, test, type Page } from "@playwright/test";

async function offerInstall(page: Page, outcome: "accepted" | "dismissed" = "accepted") {
  await page.evaluate((choice) => {
    const event = new Event("beforeinstallprompt", { cancelable: true }) as Event & {
      prompt: () => Promise<void>;
      userChoice: Promise<{ outcome: string }>;
    };
    (window as unknown as { installPrompted: boolean }).installPrompted = false;
    event.prompt = async () => {
      (window as unknown as { installPrompted: boolean }).installPrompted = true;
    };
    event.userChoice = Promise.resolve({ outcome: choice });
    window.dispatchEvent(event);
  }, outcome);
}

async function readPastFiveAyahs(page: Page) {
  await page.locator("#ayah-6").waitFor();
  await page.evaluate(() => {
    window.dispatchEvent(new Event("wheel"));
    const card = document.getElementById("ayah-6");
    window.scrollTo(0, (card?.getBoundingClientRect().top ?? 0) + window.scrollY - 80);
  });
}

test("ajakan pasang muncul setelah melewati beberapa ayat dan memanggil prompt", async ({
  page,
}) => {
  await page.goto("/surah/2");
  await offerInstall(page);

  await expect(page.getByRole("button", { name: "Pasang", exact: true })).toHaveCount(0);

  await readPastFiveAyahs(page);
  const install = page.getByRole("button", { name: "Pasang", exact: true });
  await expect(install).toBeVisible();

  await install.click();
  await expect
    .poll(() =>
      page.evaluate(() => (window as unknown as { installPrompted: boolean }).installPrompted),
    )
    .toBe(true);
  await expect(install).toHaveCount(0);
});

test("pilihan Nanti diingat setelah muat ulang", async ({ page }) => {
  await page.goto("/surah/2");
  await offerInstall(page);
  await readPastFiveAyahs(page);

  await expect(page.getByRole("button", { name: "Pasang", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Tutup ajakan pasang" }).click();
  await expect(page.getByRole("button", { name: "Pasang", exact: true })).toHaveCount(0);

  await page.reload();
  await offerInstall(page);
  await readPastFiveAyahs(page);

  await expect(page.getByRole("button", { name: "Pasang", exact: true })).toHaveCount(0);
});

test("Pengaturan menyediakan jalan pasang untuk peramban yang mendukung", async ({ page }) => {
  await page.goto("/pengaturan");
  await offerInstall(page);

  const button = page.getByRole("button", { name: /Pasang aplikasi/ });
  await expect(button).toBeVisible();
  await button.click();

  await expect
    .poll(() =>
      page.evaluate(() => (window as unknown as { installPrompted: boolean }).installPrompted),
    )
    .toBe(true);
});
