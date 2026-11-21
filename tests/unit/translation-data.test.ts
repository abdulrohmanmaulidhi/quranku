import { describe, expect, it } from "vitest";
import { OFFLINE_DATA_PATHS } from "@/features/offline/cache";
import { parseManifest } from "@/lib/data/parse";
import { readManifest, readSurahTranslation, readTranslationSource } from "./helpers";

const source = readTranslationSource();

function sourceAyah(surah: number, ayah: number) {
  return source.entries.find((row) => row.surah === surah && row.ayah === ayah);
}

describe("manifest terjemahan", () => {
  it("mencatat penerbit, versi, dan checksum QuranEnc", () => {
    const manifest = parseManifest(readManifest());
    const translation = manifest.source.translation;

    expect(translation.name).toContain("Ministry of Religious Affairs");
    expect(translation.name).toContain("QuranEnc.com");
    expect(translation.version).toBe(source.version);
    expect(translation.license).toBe("QuranEnc Terms and Policies");
    expect(translation.url).toBe("https://quranenc.com/en/home");
    expect(translation.sha256).toMatch(/^[a-f0-9]{64}$/);
  });

  it("menolak manifest tanpa sumber terjemahan", () => {
    const manifest = readManifest();
    const source = { ...manifest.source };
    delete (source as { translation?: unknown }).translation;
    expect(() => parseManifest({ ...manifest, source })).toThrow();
  });
});

describe("berkas terjemahan per surah", () => {
  it("menyalin teks dan catatan kaki apa adanya", () => {
    for (const surah of [1, 18, 114]) {
      const file = readSurahTranslation(surah);
      expect(file.surah).toBe(surah);

      for (const ayah of file.ayahs) {
        const expected = sourceAyah(surah, ayah.n);
        expect(ayah.text).toBe(expected?.text);
        expect(ayah.footnotes).toBe(expected?.footnotes);
      }
    }
  });

  it("mempertahankan penanda catatan kaki di dalam teks", () => {
    const ayah = readSurahTranslation(1).ayahs.find((row) => row.n === 4);
    expect(ayah?.text).toContain("[1]");
    expect(ayah?.footnotes?.startsWith("[1]")).toBe(true);
  });
});

describe("unduhan offline", () => {
  it("menyertakan berkas terjemahan, indeks pencarian, dan sumbernya", () => {
    expect(OFFLINE_DATA_PATHS).toHaveLength(236);
    expect(OFFLINE_DATA_PATHS).toContain("basmalah.json");
    expect(OFFLINE_DATA_PATHS).toContain("search/translation.json");
    expect(OFFLINE_DATA_PATHS).toContain("tr/indonesian_affairs/001.json");
    expect(OFFLINE_DATA_PATHS).toContain("tr/indonesian_affairs/114.json");
    expect(OFFLINE_DATA_PATHS).toContain("tr/indonesian_affairs/SOURCE.txt");
  });
});
