import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";

async function countBookmarks(page: import("@playwright/test").Page): Promise<number> {
  return page.evaluate(async () => {
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open("quranku");
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    try {
      return await new Promise<number>((resolve, reject) => {
        const request = database
          .transaction("bookmarks", "readonly")
          .objectStore("bookmarks")
          .count();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    } finally {
      database.close();
    }
  });
}

test("ekspor, impor, dan hapus data lokal", async ({ page }) => {
  await page.goto("/surah/18/10");
  await expect(page.getByText("Ayat dituju")).toBeVisible();

  await page.getByRole("button", { name: "Pilih ayat 10", exact: true }).click();
  await page.getByRole("button", { name: "Aksi ayat 10", exact: true }).click();
  await page.getByRole("button", { name: "Beri penanda" }).click();
  await expect(page.getByText("Penanda ditambahkan.")).toBeVisible();

  await page.goto("/pengaturan");
  await page.getByRole("radio", { name: "Gelap" }).check();
  await expect.poll(() => page.evaluate(() => localStorage.getItem("quranku.theme"))).toBe("dark");

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Ekspor penanda" }).click();
  const download = await downloadPromise;
  const filePath = await download.path();
  expect(filePath).toBeTruthy();
  const exported = JSON.parse(readFileSync(filePath!, "utf8")) as {
    app: string;
    bookmarks: Array<{ surah: number; ayah: number }>;
    position: { surah: number; ayah: number } | null;
  };
  expect(exported.app).toBe("quran-pwa");
  expect(exported.bookmarks).toEqual([expect.objectContaining({ surah: 18, ayah: 10 })]);
  expect(exported.position).toEqual({ surah: 18, ayah: 10 });

  await page.getByRole("button", { name: "Hapus data lokal" }).click();
  const confirm = page.getByRole("dialog", { name: "Hapus data lokal?" });
  await expect(confirm).toBeVisible();
  await confirm.getByRole("button", { name: "Hapus semua" }).click();
  await expect(page.getByText("Data lokal dihapus.")).toBeVisible();
  await expect.poll(() => countBookmarks(page)).toBe(0);
  expect(await page.evaluate(() => localStorage.getItem("quranku.theme"))).toBeNull();

  await page.goto("/penanda");
  await expect(page.getByText("Belum ada penanda")).toBeVisible();

  await page.goto("/pengaturan");
  const input = page.locator('input[type="file"]');
  await input.setInputFiles({
    name: "quranku-penanda.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(exported), "utf8"),
  });
  await expect(page.getByText("1 penanda diimpor. 0 sudah ada dan dilewati.")).toBeVisible();
  await expect.poll(() => countBookmarks(page)).toBe(1);

  await input.setInputFiles({
    name: "quranku-penanda.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(exported), "utf8"),
  });
  await expect(page.getByText("0 penanda diimpor. 1 sudah ada dan dilewati.")).toBeVisible();

  await page.goto("/penanda");
  await expect(page.getByText("QS. Al-Kahf 18:10")).toBeVisible();
});

test("berkas impor tidak valid menampilkan pesan galat", async ({ page }) => {
  await page.goto("/pengaturan");
  await page.locator('input[type="file"]').setInputFiles({
    name: "salah.json",
    mimeType: "application/json",
    buffer: Buffer.from("{ bukan json", "utf8"),
  });

  await expect(
    page.getByText("Berkas tidak dapat dibaca. Pastikan berkas ekspor dari aplikasi ini."),
  ).toBeVisible();
  await expect(page.getByText("Data lokal dihapus.")).toBeHidden();
});
