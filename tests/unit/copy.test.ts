import { describe, expect, it } from "vitest";
import { buildAyahCopy, buildReferenceCopy } from "@/features/quran/copy";
import { parseSurahText } from "@/lib/data/parse";
import { readSurahs, readSurahText } from "./helpers";

const surah = readSurahs()[17]!;
const ayahText = parseSurahText(readSurahText(18), 18, surah.ayahCount).ayahs[9]!;

describe("salin referensi", () => {
  it("berisi referensi tanpa mengubah teks Arab", () => {
    expect(buildReferenceCopy(surah, ayahText)).toBe("QS. Al-Kahf 18:10");
  });
});

describe("salin ayat", () => {
  it("menyalin teks Arab persis seperti data sumber", () => {
    const copied = buildAyahCopy(surah, ayahText);
    expect(copied.startsWith(`${ayahText.text}\n\n`)).toBe(true);
    expect(copied).toContain("QS. Al-Kahf 18:10");
    expect(copied).toContain("Sumber: Tanzil (teks Arab)");
    expect(copied).not.toContain("\u0640");
  });
});
