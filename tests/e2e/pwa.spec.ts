import { expect, test } from "@playwright/test";

test("manifest PWA berisi nama, ikon, dan mode standalone", async ({ page, request }) => {
  await page.goto("/");

  const href = await page.locator('link[rel="manifest"]').getAttribute("href");
  expect(href).toBeTruthy();

  const response = await request.get(new URL(href!, page.url()).toString());
  expect(response.ok()).toBeTruthy();

  const manifest = await response.json();
  expect(manifest.name).toContain("Quranku");
  expect(manifest.short_name).toBe("Quranku");
  expect(manifest.start_url).toBe("/");
  expect(manifest.scope).toBe("/");
  expect(manifest.display).toBe("standalone");
  expect(manifest.theme_color).toBe("#1F6F5C");
  expect(manifest.icons).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ sizes: "192x192", purpose: "any" }),
      expect.objectContaining({ sizes: "512x512", purpose: "any" }),
      expect.objectContaining({ sizes: "512x512", purpose: "maskable" }),
    ]),
  );
});

test("service worker aktif dan mengendalikan halaman setelah muat ulang", async ({ page }) => {
  await page.goto("/");

  const hasActiveWorker = await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.ready;
    return Boolean(registration.active);
  });
  expect(hasActiveWorker).toBe(true);

  await page.reload();
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
});

test("aset app shell tersedia di cache precache", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));

  await expect
    .poll(
      () =>
        page.evaluate(async () => {
          const keys = await caches.keys();
          return keys.some((key) => key.startsWith("workbox-precache"));
        }),
      { timeout: 10_000 },
    )
    .toBe(true);

  const precacheKeys = await page.evaluate(async () => {
    const keys = await caches.keys();
    const precache = keys.find((key) => key.startsWith("workbox-precache"));
    if (!precache) return [] as string[];
    const cache = await caches.open(precache);
    return (await cache.keys()).map((request) => new URL(request.url).pathname);
  });

  expect(precacheKeys).toEqual(expect.arrayContaining(["/index.html"]));
  expect(precacheKeys.some((path) => path.endsWith("/manifest.webmanifest"))).toBe(true);
});
