import { describe, expect, it } from "vitest";
import { DataError, parseJuz, parseManifest, parseSurahs, parseSurahText } from "@/lib/data/parse";
import { readJuz, readManifest, readSurahs, readSurahText } from "./helpers";

const surahs = readSurahs();

describe("parseManifest", () => {
  it("menerima manifest dataset v3", () => {
    const manifest = parseManifest(readManifest());
    expect(manifest.counts).toEqual({ surahs: 114, ayahs: 6236, juz: 30 });
    expect(manifest.source.text.license).toBe("KFGQPC Font License");
    expect(manifest.source.names.name).toContain("QuranEnc");
    expect(manifest.source.translation.name).toContain("QuranEnc.com");
  });

  it("menolak jumlah ayat yang salah", () => {
    const manifest = readManifest();
    const broken = {
      ...manifest,
      counts: { ...manifest.counts, ayahs: 6235 },
    };
    expect(() => parseManifest(broken)).toThrow(DataError);
  });

  it("menolak sumber tanpa checksum", () => {
    const manifest = readManifest();
    const broken = {
      ...manifest,
      source: {
        ...manifest.source,
        text: { ...manifest.source.text, sha256: "" },
      },
    };
    expect(() => parseManifest(broken)).toThrow(DataError);
  });
});

describe("parseSurahs", () => {
  it("menerima 114 surah dan total 6.236 ayat", () => {
    const parsed = parseSurahs(surahs);
    expect(parsed).toHaveLength(114);
    expect(parsed.reduce((sum, surah) => sum + surah.ayahCount, 0)).toBe(6236);
    expect(parsed[0]?.nameLatin).toBe("Al-Fatihah");
    expect(parsed[0]?.nameAliases).toContain("Al-Faatiha");
    expect(parsed[17]?.nameLatin).toBe("Al-Kahf");
  });

  it("menolak nomor surah yang tidak berurutan", () => {
    const broken = surahs.map((surah) => ({ ...surah }));
    if (broken[1]) broken[1].n = 3;
    expect(() => parseSurahs(broken)).toThrow(DataError);
  });

  it("menolak label wahyu yang tidak dikenal", () => {
    const broken = surahs.map((surah) => ({ ...surah }));
    if (broken[0]) broken[0].revelation = "Unknown";
    expect(() => parseSurahs(broken)).toThrow(DataError);
  });
});

describe("parseJuz", () => {
  it("menerima 30 juz dengan batas yang cocok", () => {
    const parsed = parseJuz(readJuz(), surahs);
    expect(parsed).toHaveLength(30);
    expect(parsed[0]).toEqual({
      juz: 1,
      start: { surah: 1, ayah: 1 },
      end: { surah: 2, ayah: 141 },
    });
    expect(parsed[29]?.end).toEqual({ surah: 114, ayah: 6 });
  });

  it("menolak ayat awal di luar rentang surah", () => {
    const broken = readJuz().map((entry) => ({ ...entry }));
    if (broken[0]) broken[0].start = { surah: 1, ayah: 8 };
    expect(() => parseJuz(broken, surahs)).toThrow(DataError);
  });

  it("menolak jumlah entri selain 30", () => {
    expect(() => parseJuz(readJuz().slice(0, 29), surahs)).toThrow(DataError);
  });
});

describe("parseSurahText", () => {
  it("menerima data surah 18 dan mempertahankan teks apa adanya", () => {
    const raw = readSurahText(18);
    const parsed = parseSurahText(raw, 18, 110);
    expect(parsed.ayahs).toHaveLength(110);
    expect(parsed.ayahs[0]?.text).toBe(raw.ayahs[0]?.text);
    expect(parsed.ayahs[109]?.text).toBe(raw.ayahs[109]?.text);
  });

  it("menolak surah dengan jumlah ayat berbeda", () => {
    expect(() => parseSurahText(readSurahText(18), 18, 109)).toThrow(DataError);
  });

  it("menolak ayat kosong", () => {
    const raw = readSurahText(1);
    const broken = {
      surah: 1,
      ayahs: raw.ayahs.map((ayah, index) => (index === 0 ? { n: 1, text: "" } : ayah)),
    };
    expect(() => parseSurahText(broken, 1, 7)).toThrow(DataError);
  });

  it("menolak nomor ayat yang tidak berurutan", () => {
    const raw = readSurahText(1);
    const broken = {
      surah: 1,
      ayahs: raw.ayahs.map((ayah, index) => (index === 1 ? { ...ayah, n: 1 } : ayah)),
    };
    expect(() => parseSurahText(broken, 1, 7)).toThrow(DataError);
  });
});
