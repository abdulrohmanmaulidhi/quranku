import { describe, expect, it } from "vitest";
import { db } from "@/lib/db/db";

/**
 * Penjaga skema: perubahan tabel tanpa menaikkan versi Dexie akan gagal di sini.
 * Bila perubahan memang disengaja, naikkan `db.version(n)` di `src/lib/db/db.ts`,
 * tambahkan langkah upgrade, lalu perbarui ekspektasi tes ini.
 */
describe("skema penyimpanan lokal", () => {
  it("sesuai versi dan tabel yang teruji", async () => {
    await db.open();

    const schema = Object.fromEntries(
      db.tables.map((table) => [
        table.name,
        {
          keyPath: table.schema.primKey.keyPath ?? null,
          indexes: table.schema.indexes.map((index) => index.keyPath),
        },
      ]),
    );

    expect(db.verno).toBe(1);
    expect(schema).toEqual({
      bookmarks: { keyPath: ["surah", "ayah"], indexes: ["surah", "createdAt"] },
      position: { keyPath: "id", indexes: [] },
      settings: { keyPath: "key", indexes: [] },
      meta: { keyPath: "key", indexes: [] },
    });
  });
});
