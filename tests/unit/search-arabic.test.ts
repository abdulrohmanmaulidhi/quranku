import { describe, expect, it } from "vitest";
import { MAX_SEARCH_QUERY_LENGTH, searchAyahs } from "@/features/quran/search";
import { findHighlightRanges, normalizeForSearch } from "@/lib/search/normalize";
import { DATASET_VERSION } from "@/lib/data/version";
import { readSearchIndex } from "./helpers";

const index = readSearchIndex();
const entries = index.entries;
const byReference = new Map(entries.map((entry) => [`${entry[0]}:${entry[1]}`, entry[2]]));

describe("indeks pencarian Arab", () => {
  it("memuat seluruh 6.236 ayat tanpa menyimpan teks asli", () => {
    expect(index.entries).toHaveLength(6236);
    expect(index.datasetVersion).toBe(DATASET_VERSION);
    expect(index.entries[0]).toEqual([1, 1, "بسم الله الرحمن الرحيم"]);
    expect(index.entries[0]).toHaveLength(3);
  });

  it("menormalisasi harakat pada kueri tanpa mengubah data", () => {
    expect(normalizeForSearch("ٱلرَّحْمَـٰنِ")).toBe("الرحمن");
    expect(normalizeForSearch("الرحمن")).toBe("الرحمن");
  });

  it("menemukan ayat dari kata tanpa harakat", () => {
    const results = searchAyahs(entries, "الرحمن", 10);

    expect(results.length).toBeGreaterThan(0);
    expect(results[0]).toMatchObject({ surah: 55, ayah: 1 });
    expect(results.some((result) => result.surah === 1 && result.ayah === 3)).toBe(true);
    for (const result of results) {
      expect(byReference.get(`${result.surah}:${result.ayah}`)).toContain("الرحمن");
    }
  });

  it("memberi hasil sama untuk kueri berharakat dan tanpa harakat", () => {
    expect(searchAyahs(entries, "ٱلرَّحْمَـٰنِ", 10)).toEqual(searchAyahs(entries, "الرحمن", 10));
  });

  it("mewajibkan semua kata kueri muncul", () => {
    const results = searchAyahs(entries, "الرحمن الرحيم", 20);

    expect(results.length).toBeGreaterThan(0);
    for (const result of results) {
      const text = byReference.get(`${result.surah}:${result.ayah}`) ?? "";
      expect(text).toContain("الرحمن");
      expect(text).toContain("الرحيم");
    }
  });

  it("mengabaikan kueri terlalu pendek atau kosong", () => {
    expect(searchAyahs(entries, "ا")).toEqual([]);
    expect(searchAyahs(entries, "   ")).toEqual([]);
  });

  it("membatasi jumlah hasil dan memotong kueri yang terlalu panjang", () => {
    expect(searchAyahs(entries, "الله", 5)).toHaveLength(5);
    expect(searchAyahs(entries, "ا".repeat(MAX_SEARCH_QUERY_LENGTH + 20))).toEqual([]);
  });
});

describe("findHighlightRanges", () => {
  it("memetakan sorotan kembali ke teks asli berharakat", () => {
    const text = "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ";
    const ranges = findHighlightRanges(text, "الرحمن");

    expect(ranges).toHaveLength(1);
    const range = ranges[0]!;
    expect(normalizeForSearch(text.slice(range.start, range.end))).toBe("الرحمن");
  });

  it("menyorot setiap kemunculan", () => {
    const ranges = findHighlightRanges("الرحمن الرحيم الرحمن", "الرحمن");
    expect(ranges).toHaveLength(2);
  });

  it("menyorot tiap kata bila frasa tidak muncul persis", () => {
    const text = "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ";
    const ranges = findHighlightRanges(text, "الرحيم الله");

    expect(ranges.length).toBeGreaterThanOrEqual(2);
    const normalized = ranges.map((range) =>
      normalizeForSearch(text.slice(range.start, range.end)),
    );
    expect(normalized).toContain("الله");
    expect(normalized).toContain("الرحيم");
  });

  it("mengembalikan daftar kosong bila tidak ada yang cocok", () => {
    expect(findHighlightRanges("الرحمن الرحيم", "الكهف")).toEqual([]);
    expect(findHighlightRanges("الرحمن الرحيم", "")).toEqual([]);
  });
});
