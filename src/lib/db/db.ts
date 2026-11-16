import Dexie, { type Table } from "dexie";

export interface BookmarkRecord {
  surah: number;
  ayah: number;
  createdAt: string;
}

export interface ReadingPositionRecord {
  id: "last";
  surah: number;
  ayah: number;
  updatedAt: string;
}

export interface SettingRecord {
  key: string;
  value: unknown;
}

export interface MetaRecord {
  key: string;
  value: string;
}

/**
 * Basis data lokal Release 1. Tidak ada data yang dikirim ke server.
 * Kunci penanda gabungan `[surah+ayah]` menjamin satu penanda per ayat.
 */
class QurankuDatabase extends Dexie {
  bookmarks!: Table<BookmarkRecord, [number, number]>;
  position!: Table<ReadingPositionRecord, string>;
  settings!: Table<SettingRecord, string>;
  meta!: Table<MetaRecord, string>;

  constructor() {
    super("quranku");
    this.version(1).stores({
      bookmarks: "[surah+ayah], surah, createdAt",
      position: "id",
      settings: "key",
      meta: "key",
    });
  }
}

export const db = new QurankuDatabase();

export async function addBookmark(
  surah: number,
  ayah: number,
  createdAt = new Date().toISOString(),
): Promise<void> {
  await db.bookmarks.put({ surah, ayah, createdAt });
}

export async function removeBookmark(surah: number, ayah: number): Promise<void> {
  await db.bookmarks.delete([surah, ayah]);
}

export async function setBookmark(surah: number, ayah: number, bookmarked: boolean): Promise<void> {
  if (bookmarked) {
    await addBookmark(surah, ayah);
  } else {
    await removeBookmark(surah, ayah);
  }
}

export async function saveReadingPosition(surah: number, ayah: number): Promise<void> {
  await db.position.put({
    id: "last",
    surah,
    ayah,
    updatedAt: new Date().toISOString(),
  });
}

export async function clearUserData(): Promise<void> {
  await Promise.all([
    db.bookmarks.clear(),
    db.position.clear(),
    db.settings.clear(),
    db.meta.clear(),
  ]);
}
