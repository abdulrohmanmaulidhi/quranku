import { beforeEach, describe, expect, it } from "vitest";
import {
  BACKUP_APP,
  BACKUP_SCHEMA_VERSION,
  BackupValidationError,
  buildBackup,
  importBackup,
  parseBackup,
} from "@/lib/db/backup";
import { addBookmark, clearUserData, db, saveReadingPosition } from "@/lib/db/db";

function validBackup(overrides: Record<string, unknown> = {}) {
  return {
    app: BACKUP_APP,
    schemaVersion: BACKUP_SCHEMA_VERSION,
    exportedAt: "2026-11-15T08:00:00.000Z",
    bookmarks: [{ surah: 18, ayah: 10, createdAt: "2026-11-14T08:00:00.000Z" }],
    position: { surah: 18, ayah: 10 },
    settings: { "reader.arabicSize": "l" },
    ...overrides,
  };
}

beforeEach(async () => {
  await clearUserData();
});

describe("ekspor penanda", () => {
  it("menyusun berkas sesuai format dan urutan tersimpan", async () => {
    await addBookmark(18, 10, "2026-11-14T08:00:00.000Z");
    await addBookmark(2, 255, "2026-11-15T08:00:00.000Z");
    await saveReadingPosition(18, 10);
    await db.settings.put({ key: "reader.arabicSize", value: "l" });

    const backup = await buildBackup();

    expect(backup.app).toBe(BACKUP_APP);
    expect(backup.schemaVersion).toBe(BACKUP_SCHEMA_VERSION);
    expect(backup.bookmarks).toHaveLength(2);
    expect(backup.position).toEqual({ surah: 18, ayah: 10 });
    expect(backup.settings["reader.arabicSize"]).toBe("l");
  });

  it("mengosongkan posisi dan pengaturan bila belum ada", async () => {
    const backup = await buildBackup();

    expect(backup.bookmarks).toEqual([]);
    expect(backup.position).toBeNull();
    expect(backup.settings).toEqual({});
  });
});

describe("impor penanda", () => {
  it("menggabungkan penanda baru dan melewati yang sudah ada", async () => {
    await addBookmark(18, 10, "2026-11-13T08:00:00.000Z");

    const result = await importBackup(
      validBackup({
        bookmarks: [
          { surah: 18, ayah: 10, createdAt: "2026-11-14T08:00:00.000Z" },
          { surah: 2, ayah: 255, createdAt: "2026-11-14T09:00:00.000Z" },
        ],
      }),
    );

    expect(result).toEqual({
      imported: 1,
      skipped: 1,
      restoredPosition: true,
      restoredSettings: ["reader.arabicSize"],
    });
    expect(await db.bookmarks.count()).toBe(2);
    expect(await db.bookmarks.get([18, 10])).toMatchObject({
      createdAt: "2026-11-13T08:00:00.000Z",
    });
    expect(await db.position.get("last")).toMatchObject({ surah: 18, ayah: 10 });
  });

  it("tidak menimpa posisi baca yang sudah tersimpan", async () => {
    await saveReadingPosition(1, 1);

    const result = await importBackup(validBackup());

    expect(result.restoredPosition).toBe(false);
    expect(await db.position.get("last")).toMatchObject({ surah: 1, ayah: 1 });
  });

  it("memulihkan pengaturan yang belum ada dan mengabaikan nilai tidak dikenal", async () => {
    await db.settings.put({ key: "theme", value: "dark" });

    const result = await importBackup(
      validBackup({ settings: { theme: "light", "reader.arabicSize": "xl", lain: 1 } }),
    );

    expect(result.restoredSettings).toEqual(["reader.arabicSize"]);
    expect(await db.settings.get("theme")).toMatchObject({ value: "dark" });
    expect(await db.settings.get("reader.arabicSize")).toMatchObject({ value: "xl" });
    expect(await db.settings.get("lain")).toBeUndefined();
  });

  it("menolak berkas dengan bentuk atau rentang tidak valid", () => {
    expect(() => parseBackup({ app: "lain" })).toThrow(BackupValidationError);
    expect(() => parseBackup(validBackup({ schemaVersion: 99 }))).toThrow(BackupValidationError);
    expect(() =>
      parseBackup(validBackup({ bookmarks: [{ surah: 115, ayah: 1, createdAt: "x" }] })),
    ).toThrow(BackupValidationError);
    expect(() => parseBackup(validBackup({ position: { surah: 18, ayah: 0 } }))).toThrow(
      BackupValidationError,
    );
  });
});
