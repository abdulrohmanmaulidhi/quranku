import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { splitBasmalah } from "@/features/quran/basmalah";
import { normalizeForSearch } from "@/lib/search/normalize";

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
      return { surah: Number(surah), ayah: Number(ayah), text: text.join("|") };
    });
}

const source = readSource();
const firstAyahs = new Map(
  source.filter((ayah) => ayah.ayah === 1).map((ayah) => [ayah.surah, ayah.text]),
);
const fatihah = firstAyahs.get(1);
if (!fatihah) throw new Error("Data 1:1 tidak ditemukan.");

describe("pemisahan basmalah untuk tampilan", () => {
  it("membagi 112 surah tanpa mengubah satu karakter pun", () => {
    for (const [surah, text] of firstAyahs) {
      if (surah === 1 || surah === 9) continue;

      const split = splitBasmalah(surah, 1, text);
      expect(split, `surah ${surah}`).not.toBeNull();

      const { basmalah, rest } = split as { basmalah: string; rest: string };
      expect(basmalah.split(" "), `surah ${surah}`).toHaveLength(4);
      expect(`${basmalah} ${rest}`, `surah ${surah}`).toBe(text);
      expect(normalizeForSearch(basmalah), `surah ${surah}`).toBe(normalizeForSearch(fatihah));
    }
  });

  it("tidak memisah surah 1 karena basmalah adalah ayat 1", () => {
    expect(splitBasmalah(1, 1, fatihah)).toBeNull();
  });

  it("tidak memisah surah 9 yang tidak memiliki basmalah", () => {
    const atTaubah = firstAyahs.get(9);
    expect(atTaubah).toBeDefined();
    expect(splitBasmalah(9, 1, atTaubah as string)).toBeNull();
  });

  it("tidak menyentuh basmalah di tengah ayat", () => {
    const anNaml = source.find((ayah) => ayah.surah === 27 && ayah.ayah === 30);
    expect(anNaml).toBeDefined();
    expect(splitBasmalah(27, 30, (anNaml as SourceAyah).text)).toBeNull();
  });

  it("menolak ayat pertama yang hanya berisi empat kata", () => {
    expect(splitBasmalah(2, 1, fatihah)).toBeNull();
  });
});
