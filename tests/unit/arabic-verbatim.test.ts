import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseSurahText } from "@/lib/data/parse";
import { readSurahs, readSurahText } from "./helpers";

const SOURCE_FILE = join(process.cwd(), "data", "source", "quran-uthmani.txt");

interface SourceAyah {
  surah: number;
  ayah: number;
  text: string;
}

function readSource(): SourceAyah[] {
  return readFileSync(SOURCE_FILE, "utf8")
    .split("\n")
    .map((line) => line.trimEnd())
    .filter((line) => line.length > 0 && !line.startsWith("#"))
    .map((line) => {
      const [surah, ayah, ...text] = line.split("|");
      return {
        surah: Number(surah),
        ayah: Number(ayah),
        text: text.join("|"),
      };
    });
}

const source = readSource();
const surahs = readSurahs();

describe("teks Arab verbatim", () => {
  it("berisi 6.236 ayat pada sumber", () => {
    expect(source).toHaveLength(6236);
  });

  it("setiap ayat pada public/data identik dengan sumber Tanzil", () => {
    const sourceByKey = new Map(source.map((ayah) => [`${ayah.surah}:${ayah.ayah}`, ayah.text]));
    let checked = 0;

    for (const surah of surahs) {
      const parsed = parseSurahText(readSurahText(surah.n), surah.n, surah.ayahCount);

      for (const ayah of parsed.ayahs) {
        const expected = sourceByKey.get(`${surah.n}:${ayah.n}`);
        expect(ayah.text, `Surah ${surah.n} ayat ${ayah.n}`).toBe(expected);
        checked += 1;
      }
    }

    expect(checked).toBe(6236);
  });

  it("tidak menormalkan basmalah pada awal surah", () => {
    const fatihah = parseSurahText(readSurahText(1), 1, 7);
    const baqarah = parseSurahText(readSurahText(2), 2, 286);

    expect(fatihah.ayahs[0]?.text).toBe("بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ");
    expect(baqarah.ayahs[0]?.text.startsWith("بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ الٓمٓ")).toBe(true);
  });
});
