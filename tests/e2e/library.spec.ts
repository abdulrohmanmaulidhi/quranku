import { expect, test, type Page } from "@playwright/test";

async function readSetting(page: Page, key: string): Promise<unknown> {
  return readStoreValue(page, "settings", key);
}

async function readPosition(page: Page): Promise<unknown> {
  return readStoreValue(page, "position", "last");
}

async function readStoreValue(page: Page, store: string, key: string): Promise<unknown> {
  return page.evaluate(
    async ({ storeName, storeKey }) => {
      const database = await new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open("quranku");
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      try {
        return await new Promise((resolve, reject) => {
          const request = database
            .transaction(storeName, "readonly")
            .objectStore(storeName)
            .get(storeKey);
          request.onsuccess = () =>
            resolve(
              storeName === "settings"
                ? (request.result as { value?: unknown } | undefined)?.value
                : request.result,
            );
          request.onerror = () => reject(request.error);
        });
      } finally {
        database.close();
      }
    },
    { storeName: store, storeKey: key },
  );
}

test("penanda tersimpan setelah muat ulang, lalu dapat dihapus dan diurungkan", async ({
  page,
}) => {
  await page.goto("/surah/1");
  await expect(page.getByRole("heading", { level: 1, name: "Al-Faatiha" })).toBeVisible();

  await page.getByRole("button", { name: "Pilih ayat 1", exact: true }).click();
  await page.getByRole("button", { name: "Aksi ayat 1", exact: true }).click();
  await page.getByRole("button", { name: "Beri penanda" }).click();

  await expect(page.getByText("Penanda ditambahkan.")).toBeVisible();
  await expect(page.locator("#ayah-1").getByText("Ditandai")).toBeAttached();

  await page.goto("/penanda");
  await expect(page.getByText("QS. Al-Faatiha 1:1")).toBeVisible();

  await page.reload();
  await expect(page.getByText("QS. Al-Faatiha 1:1")).toBeVisible();

  await page.getByRole("button", { name: "Hapus penanda QS. Al-Faatiha 1:1" }).click();
  await expect(page.getByText("Belum ada penanda")).toBeVisible();

  await page.getByRole("button", { name: "Urungkan" }).click();
  await expect(page.getByText("QS. Al-Faatiha 1:1")).toBeVisible();
});

test("beranda menawarkan lanjutkan membaca dari posisi terakhir", async ({ page }) => {
  await page.goto("/surah/18/10");
  await expect(page.getByText("Ayat dituju")).toBeVisible();
  await expect.poll(() => readPosition(page)).toMatchObject({ surah: 18, ayah: 10 });

  await page.goto("/");
  const resume = page.getByRole("link", { name: /Lanjutkan membaca/ });
  await expect(resume).toBeVisible();
  await expect(resume).toContainText("Al-Kahf");
  await expect(resume).toContainText("Ayat 10 dari 110");

  await resume.click();
  await expect(page).toHaveURL(/\/surah\/18\/10$/);
  await expect(page.getByText("Ayat dituju")).toBeVisible();
});

test("ukuran teks Arab tersimpan setelah muat ulang", async ({ page }) => {
  await page.goto("/surah/18");
  await expect(page.getByRole("heading", { level: 1, name: "Al-Kahf" })).toBeVisible();

  await page.getByRole("button", { name: "Pengaturan baca" }).click();
  let dialog = page.getByRole("dialog", { name: "Pengaturan baca" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText("Sedang", { exact: true })).toBeVisible();

  await dialog.getByRole("button", { name: "Perbesar teks Arab" }).click();
  await expect(dialog.getByText("Besar", { exact: true })).toBeVisible();
  await expect.poll(() => readSetting(page, "reader.arabicSize")).toBe("l");

  await dialog.getByRole("button", { name: "Selesai" }).click();
  await expect(dialog).toBeHidden();

  const sizeBefore = await page
    .locator("#ayah-1 [dir='rtl']")
    .evaluate((element) => getComputedStyle(element).fontSize);

  await page.reload();
  await expect(page.getByRole("heading", { level: 1, name: "Al-Kahf" })).toBeVisible();

  await page.getByRole("button", { name: "Pengaturan baca" }).click();
  dialog = page.getByRole("dialog", { name: "Pengaturan baca" });
  await expect(dialog.getByText("Besar", { exact: true })).toBeVisible();

  const sizeAfter = await page
    .locator("#ayah-1 [dir='rtl']")
    .evaluate((element) => getComputedStyle(element).fontSize);
  expect(sizeAfter).toBe(sizeBefore);
});
