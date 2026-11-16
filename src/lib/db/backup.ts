import { db } from "./db";
import type { ReadingPositionRecord } from "./db";

export const BACKUP_APP = "quran-pwa";
export const BACKUP_SCHEMA_VERSION = 1;

export interface BackupBookmark {
  surah: number;
  ayah: number;
  createdAt: string;
}

export interface BackupFile {
  app: typeof BACKUP_APP;
  schemaVersion: typeof BACKUP_SCHEMA_VERSION;
  exportedAt: string;
  bookmarks: BackupBookmark[];
  position: { surah: number; ayah: number } | null;
  settings: Record<string, unknown>;
}

export interface ImportResult {
  imported: number;
  skipped: number;
  restoredPosition: boolean;
  restoredSettings: string[];
}

const VALID_THEMES = new Set(["light", "dark", "system"]);
const VALID_ARABIC_SIZES = new Set(["s", "m", "l", "xl", "xxl"]);

function isValidSetting(key: string, value: unknown): boolean {
  if (key === "theme") return typeof value === "string" && VALID_THEMES.has(value);
  if (key === "reader.arabicSize") {
    return typeof value === "string" && VALID_ARABIC_SIZES.has(value);
  }
  return false;
}

export class BackupValidationError extends Error {
  constructor(message = "Berkas tidak dapat dibaca.") {
    super(message);
    this.name = "BackupValidationError";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isValidAyah(surah: unknown, ayah: unknown): boolean {
  return (
    typeof surah === "number" &&
    Number.isInteger(surah) &&
    surah >= 1 &&
    surah <= 114 &&
    typeof ayah === "number" &&
    Number.isInteger(ayah) &&
    ayah >= 1 &&
    ayah <= 286
  );
}

function isIsoDate(value: unknown): value is string {
  return typeof value === "string" && !Number.isNaN(Date.parse(value));
}

export function parseBackup(input: unknown): BackupFile {
  if (!isRecord(input) || input.app !== BACKUP_APP) {
    throw new BackupValidationError();
  }
  if (input.schemaVersion !== BACKUP_SCHEMA_VERSION) {
    throw new BackupValidationError("Versi berkas tidak didukung.");
  }
  if (!Array.isArray(input.bookmarks)) {
    throw new BackupValidationError();
  }

  const bookmarks: BackupBookmark[] = input.bookmarks.map((entry) => {
    if (!isRecord(entry) || !isValidAyah(entry.surah, entry.ayah)) {
      throw new BackupValidationError();
    }
    if (!isIsoDate(entry.createdAt)) {
      throw new BackupValidationError();
    }
    return {
      surah: entry.surah as number,
      ayah: entry.ayah as number,
      createdAt: entry.createdAt,
    };
  });

  let position: BackupFile["position"] = null;
  if (isRecord(input.position)) {
    if (!isValidAyah(input.position.surah, input.position.ayah)) {
      throw new BackupValidationError();
    }
    position = {
      surah: input.position.surah as number,
      ayah: input.position.ayah as number,
    };
  }

  const settings: Record<string, unknown> = {};
  if (isRecord(input.settings)) {
    for (const [key, value] of Object.entries(input.settings)) {
      settings[key] = value;
    }
  }

  return {
    app: BACKUP_APP,
    schemaVersion: BACKUP_SCHEMA_VERSION,
    exportedAt: isIsoDate(input.exportedAt) ? input.exportedAt : new Date().toISOString(),
    bookmarks,
    position,
    settings,
  };
}

export async function buildBackup(): Promise<BackupFile> {
  const [bookmarks, position, settings] = await Promise.all([
    db.bookmarks.toArray(),
    db.position.get("last"),
    db.settings.toArray(),
  ]);

  return {
    app: BACKUP_APP,
    schemaVersion: BACKUP_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    bookmarks: bookmarks.map(({ surah, ayah, createdAt }) => ({ surah, ayah, createdAt })),
    position: position ? { surah: position.surah, ayah: position.ayah } : null,
    settings: Object.fromEntries(settings.map((row) => [row.key, row.value])),
  };
}

/**
 * Impor bersifat aditif: penanda yang sudah ada tidak ditimpa dan tidak dihapus.
 * Posisi baca hanya dipulihkan bila perangkat belum memiliki posisi tersimpan.
 */
export async function importBackup(input: unknown): Promise<ImportResult> {
  const backup = parseBackup(input);

  return db.transaction("rw", db.bookmarks, db.position, db.settings, async () => {
    const existing = new Set(
      (await db.bookmarks.toArray()).map((row) => `${row.surah}:${row.ayah}`),
    );
    const toAdd: BackupBookmark[] = [];
    let skipped = 0;

    for (const entry of backup.bookmarks) {
      const key = `${entry.surah}:${entry.ayah}`;
      if (existing.has(key)) {
        skipped += 1;
        continue;
      }
      existing.add(key);
      toAdd.push(entry);
    }

    if (toAdd.length > 0) {
      await db.bookmarks.bulkPut(toAdd);
    }

    let restoredPosition = false;
    const current = await db.position.get("last");
    if (!current && backup.position) {
      const record: ReadingPositionRecord = {
        id: "last",
        surah: backup.position.surah,
        ayah: backup.position.ayah,
        updatedAt: new Date().toISOString(),
      };
      await db.position.put(record);
      restoredPosition = true;
    }

    const restoredSettings: string[] = [];
    for (const [key, value] of Object.entries(backup.settings)) {
      if (!isValidSetting(key, value) || (await db.settings.get(key))) continue;
      await db.settings.put({ key, value });
      restoredSettings.push(key);
    }

    return { imported: toAdd.length, skipped, restoredPosition, restoredSettings };
  });
}
