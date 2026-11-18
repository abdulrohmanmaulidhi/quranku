import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const pages = [
  { path: "/", label: "beranda" },
  { path: "/surah", label: "indeks surah" },
  { path: "/surah/1", label: "reader" },
  { path: "/cari", label: "cari" },
  { path: "/penanda", label: "penanda" },
  { path: "/pengaturan", label: "pengaturan" },
  { path: "/pengaturan/sumber", label: "sumber" },
];

for (const { path, label } of pages) {
  test(`${label} tidak memiliki pelanggaran aksesibilitas serius`, async ({ page }) => {
    await page.goto(path);
    await page.evaluate(() => document.fonts.ready);

    const results = await new AxeBuilder({ page }).analyze();
    const serious = results.violations.filter(
      (violation) => violation.impact === "serious" || violation.impact === "critical",
    );

    expect(
      serious.map((violation) => ({
        id: violation.id,
        impact: violation.impact,
        nodes: violation.nodes.map((node) => node.target.join(" ")),
      })),
    ).toEqual([]);
  });
}

const dialogs = [
  {
    path: "/surah/1",
    open: "Lompat ke",
    dialog: "Lompat ke",
    label: "dialog lompat ke",
  },
  {
    path: "/surah/1",
    open: "Pengaturan baca",
    dialog: "Pengaturan baca",
    label: "dialog pengaturan baca",
  },
  {
    path: "/pengaturan",
    open: "Hapus data lokal",
    dialog: "Hapus data lokal?",
    label: "dialog hapus data lokal",
  },
];

for (const { path, open, dialog, label } of dialogs) {
  test(`${label} tidak memiliki pelanggaran aksesibilitas serius`, async ({ page }) => {
    await page.goto(path);
    await page.getByRole("button", { name: open }).click();
    await page.getByRole("dialog", { name: dialog }).waitFor();
    await page.evaluate(() => document.fonts.ready);

    const results = await new AxeBuilder({ page }).analyze();
    const serious = results.violations.filter(
      (violation) => violation.impact === "serious" || violation.impact === "critical",
    );

    expect(
      serious.map((violation) => ({
        id: violation.id,
        impact: violation.impact,
        nodes: violation.nodes.map((node) => node.target.join(" ")),
      })),
    ).toEqual([]);
  });
}
