import { describe, expect, it } from "vitest";
import { filterJuz, filterSurahs } from "@/features/quran/filter";
import { normalizeForSearch } from "@/lib/search/normalize";
import { readJuz, readSurahs } from "./helpers";

const surahs = readSurahs();
const juz = readJuz();

describe("normalizeForSearch", () => {
  it("menghapus diakritik Latin dan Arab untuk pencarian", () => {
    expect(normalizeForSearch("Al-Fātiḥah")).toBe("al fatihah");
    expect(normalizeForSearch("الفاتحة")).toBe("الفاتحه");
    expect(normalizeForSearch("  'Asr  ")).toBe("asr");
  });

  it("tidak mengubah huruf Arab tanpa diakritik", () => {
    expect(normalizeForSearch("الكهف")).toBe("الكهف");
  });
});

describe("filterSurahs", () => {
  it("mengembalikan semua surah tanpa kata kunci", () => {
    expect(filterSurahs(surahs, "")).toHaveLength(114);
    expect(filterSurahs(surahs, "   ")).toHaveLength(114);
  });

  it("mencari berdasarkan nama Latin tanpa peka huruf besar", () => {
    const results = filterSurahs(surahs, "al-kahf");
    expect(results.map((surah) => surah.nameLatin)).toContain("Al-Kahf");
    expect(results.map((surah) => surah.nameLatin)).not.toContain("Al-Faatiha");
  });

  it("mencari berdasarkan nomor surah", () => {
    const results = filterSurahs(surahs, "18");
    expect(results[0]?.n).toBe(18);
  });

  it("mencari dengan nama Arab tanpa diakritik", () => {
    const results = filterSurahs(surahs, "الكهف");
    expect(results.map((surah) => surah.n)).toContain(18);
  });

  it("menghasilkan daftar kosong bila tidak ada yang cocok", () => {
    expect(filterSurahs(surahs, "tidak-ada-surah-ini")).toEqual([]);
  });
});

describe("filterJuz", () => {
  it("mengembalikan semua juz tanpa kata kunci", () => {
    expect(filterJuz(juz, surahs, "")).toHaveLength(30);
  });

  it("mencari berdasarkan nomor juz", () => {
    const results = filterJuz(juz, surahs, "30");
    expect(results.map((entry) => entry.juz)).toEqual([30]);
  });

  it("mencari berdasarkan nama surah awal", () => {
    const results = filterJuz(juz, surahs, "Al-Kahf");
    expect(results.map((entry) => entry.juz)).toContain(16);
  });

  it("menghasilkan daftar kosong bila tidak ada yang cocok", () => {
    expect(filterJuz(juz, surahs, "juz-999")).toEqual([]);
  });
});
