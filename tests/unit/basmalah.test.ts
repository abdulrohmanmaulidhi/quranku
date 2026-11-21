import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseBasmalah } from "@/lib/data/parse";
import { readDataJson, readSurahText } from "./helpers";

const CSV_FILE = join(process.cwd(), "data", "source", "quran-hafs.csv");

interface SourceAyah {
  surah: number;
  ayah: number;
  text: string;
}

function readSource(): SourceAyah[] {
  return readFileSync(CSV_FILE, "utf8")
    .split("\n")
    .slice(1)
    .filter((line) => line.length > 0)
    .map((line) => {
      const [, surah, ayah, text] = line.split('","');
      return { surah: Number(surah), ayah: Number(ayah), text: text.replace(/"$/, "") };
    });
}

const source = readSource();
const sourceAyah = (surah: number, ayah: number) =>
  source.find((row) => row.surah === surah && row.ayah === ayah);

describe("basmalah", () => {
  it("berisi 6.236 ayat pada sumber", () => {
    expect(source).toHaveLength(6236);
  });

  it("diambil verbatim dari 1:1", () => {
    const basmalah = parseBasmalah(readDataJson("basmalah.json"));
    expect(basmalah.text).toBe(sourceAyah(1, 1)?.text);
    expect(basmalah.text.split(" ")).toHaveLength(4);
  });

  it("tidak dipotong dari ayat 1 surah lain", () => {
    const baqarah = readSurahText(2);
    expect(baqarah.ayahs[0]?.text).toBe(sourceAyah(2, 1)?.text);
    expect(baqarah.ayahs[0]?.text).not.toContain(sourceAyah(1, 1)?.text as string);
    expect(baqarah.ayahs[0]?.text).toBe("الٓمٓ");
  });

  it("tidak menyentuh basmalah di tengah ayat", () => {
    const anNaml = readSurahText(27);
    expect(anNaml.ayahs[29]?.text).toBe(sourceAyah(27, 30)?.text);
    expect(anNaml.ayahs[29]?.text).toContain(sourceAyah(1, 1)?.text as string);
  });

  it("surah 9 tidak memiliki basmalah di awal ayat", () => {
    const atTaubah = readSurahText(9);
    expect(atTaubah.ayahs[0]?.text).not.toContain(sourceAyah(1, 1)?.text as string);
  });
});
