import { describe, expect, it } from "vitest";
import { searchAyahs } from "@/features/quran/search";
import { findHighlightRanges, normalizeForSearch } from "@/lib/search/normalize";
import { readSurahTranslation, readTranslationSearchIndex, readTranslationSource } from "./helpers";

const index = readTranslationSearchIndex();
const source = readTranslationSource();

describe("indeks pencarian terjemahan", () => {
  it("memuat 6.236 entri dengan versi dataset yang sama", () => {
    expect(index.entries).toHaveLength(6236);
    expect(index.schemaVersion).toBe(1);
    expect(index.datasetVersion).toMatch(/^\d+$/);
  });

  it("berisi normalisasi teks terjemahan, bukan catatan kaki", () => {
    for (const [surah, ayah] of [
      [1, 1],
      [1, 4],
      [2, 255],
      [114, 6],
    ] as const) {
      const entry = index.entries.find((row) => row[0] === surah && row[1] === ayah);
      const original = source.entries.find((row) => row.surah === surah && row.ayah === ayah)!;
      expect(entry?.[2]).toBe(normalizeForSearch(original.text));
      if (original.footnotes)
        expect(entry?.[2]).not.toContain(normalizeForSearch(original.footnotes));
    }
  });

  it("menemukan ayat dari kata Indonesia tanpa membedakan huruf besar", () => {
    const results = searchAyahs(index.entries, "pengasih");
    expect(results.length).toBeGreaterThan(0);
    expect(results).toContainEqual(expect.objectContaining({ surah: 1, ayah: 1 }));
  });

  it("mewajibkan semua kata kueri muncul", () => {
    const results = searchAyahs(index.entries, "maha pengasih");
    expect(results.length).toBeGreaterThan(0);
    for (const result of results) {
      const entry = index.entries.find((row) => row[0] === result.surah && row[1] === result.ayah)!;
      expect(entry[2]).toContain("maha");
      expect(entry[2]).toContain("pengasih");
    }
  });

  it("memetakan sorotan ke teks terjemahan asli", () => {
    const ayah = readSurahTranslation(1).ayahs[0]!;
    const [range] = findHighlightRanges(ayah.text, "pengasih");
    expect(range).toBeDefined();
    expect(ayah.text.slice(range!.start, range!.end).toLowerCase()).toBe("pengasih");
  });
});
