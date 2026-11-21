import { readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "@playwright/test";

const FIXTURE = join(process.cwd(), "tests", "fixtures", "audio", "001001.mp3");
const FIXTURE_2 = join(process.cwd(), "tests", "fixtures", "audio", "001002.mp3");
const AUDIO_URL = "https://everyayah.com/data/Alafasy_64kbps/001001.mp3";
const AUDIO_URL_2 = "https://everyayah.com/data/Alafasy_64kbps/001002.mp3";

test("memutar audio ayat pertama dari EveryAyah yang dialirkan", async ({ page }) => {
  const requested: string[] = [];
  await page.route("**/everyayah.com/data/**/*.mp3", async (route) => {
    requested.push(route.request().url());
    await route.fulfill({
      status: 200,
      contentType: "audio/mpeg",
      body: readFileSync(FIXTURE),
    });
  });

  await page.goto("/surah/1");

  const playButton = page.locator("#ayah-1").getByRole("button", { name: "Putar audio ayat 1" });
  await expect(playButton).toBeVisible();
  await playButton.click();

  const region = page.getByRole("region", { name: "Pemutar audio" });
  await expect(region).toBeVisible();
  await expect(region).toContainText("Mishary Rashid Alafasy");

  await expect.poll(() => requested.some((url) => url === AUDIO_URL)).toBe(true);

  // Ayat aktif menunjukkan status sedang diputar.
  await expect(page.locator("#ayah-1")).toHaveAttribute("data-playing", "true");
});

test("kontrol pemutar: skip, putar/jeda, ulangi, kecepatan, tutup", async ({ page }) => {
  await page.goto("/surah/1");
  await page.locator("#ayah-1").getByRole("button", { name: "Putar audio ayat 1" }).click();

  const region = page.getByRole("region", { name: "Pemutar audio" });
  await expect(region).toBeVisible();

  await expect(region.getByRole("button", { name: "Ayat sebelumnya" })).toBeDisabled();
  await expect(region.getByRole("button", { name: "Jeda" })).toBeVisible();
  await expect(region.getByRole("button", { name: "Ayat berikutnya" })).toBeEnabled();
  await expect(
    region.getByRole("button", { name: /Ulangan: tanpa ulangan\. Ketuk untuk mengubah\./ }),
  ).toBeVisible();
  await expect(
    region.getByRole("button", { name: /Kecepatan 1 kali\. Ketuk untuk mengubah\./ }),
  ).toBeVisible();
  await expect(region.getByRole("button", { name: "Tutup pemutar" })).toBeVisible();
});

test("Putar Surah: otomatis maju ke ayat berikutnya (queue surah)", async ({ page }) => {
  const requested: string[] = [];
  await page.route("**/everyayah.com/data/**/*.mp3", async (route) => {
    requested.push(route.request().url());
    const body = route.request().url().endsWith("/001002.mp3")
      ? readFileSync(FIXTURE_2)
      : readFileSync(FIXTURE);
    await route.fulfill({ status: 200, contentType: "audio/mpeg", body });
  });

  await page.goto("/surah/1");

  await page.getByRole("button", { name: "Putar Surah" }).click();

  const region = page.getByRole("region", { name: "Pemutar audio" });
  await expect(region).toBeVisible();
  // Mode queue: tombol "Berhenti Surah" muncul saat pemutar sedang aktif.
  await expect(page.getByRole("button", { name: "Berhenti Surah" })).toBeVisible();

  // Auto-advance: setelah ayat 1 berakhir, permintaan ke ayat 2 muncul.
  await expect.poll(() => requested.includes(AUDIO_URL_2), { timeout: 8000 }).toBe(true);
  await expect(page.locator("#ayah-2")).toHaveAttribute("data-playing", "true");

  // Berhenti Surah: pemutar tertutup (track di-stop).
  await page.getByRole("button", { name: "Berhenti Surah" }).click();
  await expect(region).toBeHidden();
});

test("Pengaturan Audio: daftar enam Qari dengan Alafasy sebagai default", async ({ page }) => {
  await page.goto("/pengaturan");

  const picker = page.locator("fieldset", { hasText: "Qari" });
  await expect(picker).toBeVisible();

  const radios = picker.getByRole("radio");
  await expect(radios).toHaveCount(6);
  await expect(picker.locator("label")).toHaveCount(6);

  const states = await radios.evaluateAll((inputs) =>
    inputs.map((input) => ({ value: input.value, checked: input.checked })),
  );
  expect(states.map((state) => state.value)).toEqual([
    "alafasy",
    "abdulbasit",
    "husary",
    "sudais",
    "maher",
    "shuraym",
  ]);
  expect(states.filter((state) => state.checked)).toHaveLength(1);
  expect(states[0].checked).toBe(true);

  await expect(page.getByRole("radio", { name: /Mishary Rashid Alafasy/ })).toBeVisible();
  await expect(page.getByRole("radio", { name: /Saud Ash-Shuraym/ })).toBeVisible();
});
