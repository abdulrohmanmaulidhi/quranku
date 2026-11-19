import { describe, expect, it } from "vitest";
import type { SearchEntry } from "@/lib/search/index";
import { findHighlightRanges } from "@/lib/search/normalize";
import { searchAyahs } from "@/features/quran/search";

const entries: SearchEntry[] = [
  [2, 177, "sesungguhnya allah maha kuasa atas segala sesuatu"],
  [3, 7, "dan orang orang yang beriman kepada allah"],
  [4, 1, "dialah yang menciptakan kamu dari jiwa yang satu"],
];

describe("pencarian terjemahan dengan penyederhanaan imbuhan", () => {
  it("menemukan bentuk dasar dari kueri berimbuhan", () => {
    expect(searchAyahs(entries, "kekuasaan")).toEqual([]);

    const results = searchAyahs(entries, "kekuasaan", 10, { stem: true });
    expect(results.map((result) => result.ayah)).toEqual([177]);
  });

  it("tetap mewajibkan semua kata kueri muncul", () => {
    const results = searchAyahs(entries, "kekuasaan allah", 10, { stem: true });
    expect(results.map((result) => result.ayah)).toEqual([177]);
    expect(searchAyahs(entries, "kekuasaan beriman", 10, { stem: true })).toEqual([]);
  });

  it("tidak mengubah pencarian Arab tanpa opsi stem", () => {
    const arabic: SearchEntry[] = [[1, 1, "بسم الله الرحمن الرحيم"]];
    expect(searchAyahs(arabic, "الرحمن")).toHaveLength(1);
    expect(searchAyahs(arabic, "الرحمن", 10, { stem: true })).toHaveLength(1);
  });

  it("menyorot bentuk dasar yang cocok tanpa mengubah teks", () => {
    const ranges = findHighlightRanges("Allah Maha Kuasa", "kekuasaan", ["kuasa"]);
    expect(ranges).toHaveLength(1);
    expect(ranges[0]).toEqual({ start: 11, end: 16 });
  });
});
