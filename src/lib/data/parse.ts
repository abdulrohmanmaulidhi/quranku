import type {
  Ayah,
  AyahRef,
  Basmalah,
  Juz,
  Manifest,
  Revelation,
  Surah,
  SurahText,
  SurahTranslation,
  TranslationAyah,
} from "./types";

export class DataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DataError";
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isInteger = (value: unknown, min = 0): value is number =>
  typeof value === "number" && Number.isInteger(value) && value >= min;

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.length > 0;

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new DataError(message);
}

const requireString = (value: unknown, field: string): string => {
  assert(isNonEmptyString(value), `Field ${field} harus berupa teks.`);
  return value;
};

const requireInteger = (value: unknown, field: string, min = 0): number => {
  assert(isInteger(value, min), `Field ${field} harus berupa bilangan bulat.`);
  return value;
};

const parseAyahRef = (value: unknown, field: string): AyahRef => {
  assert(isRecord(value), `Field ${field} tidak valid.`);
  return {
    surah: requireInteger(value.surah, `${field}.surah`, 1),
    ayah: requireInteger(value.ayah, `${field}.ayah`, 1),
  };
};

export function parseManifest(value: unknown): Manifest {
  assert(isRecord(value), "Manifest tidak valid.");
  assert(isRecord(value.counts), "Manifest.counts tidak valid.");
  assert(isRecord(value.source), "Manifest.source tidak valid.");
  assert(isRecord(value.source.text), "Manifest.source.text tidak valid.");
  assert(isRecord(value.source.metadata), "Manifest.source.metadata tidak valid.");
  assert(isRecord(value.source.names), "Manifest.source.names tidak valid.");
  assert(isRecord(value.source.translation), "Manifest.source.translation tidak valid.");

  const sourceInfo = (source: Record<string, unknown>) => ({
    file: requireString(source.file, "source.file"),
    name: requireString(source.name, "source.name"),
    version: requireString(source.version, "source.version"),
    license: requireString(source.license, "source.license"),
    url: requireString(source.url, "source.url"),
    retrievedAt: requireString(source.retrievedAt, "source.retrievedAt"),
    sha256: requireString(source.sha256, "source.sha256"),
  });

  const manifest: Manifest = {
    schemaVersion: requireInteger(value.schemaVersion, "schemaVersion", 1),
    datasetVersion: requireString(value.datasetVersion, "datasetVersion"),
    counts: {
      surahs: requireInteger(value.counts.surahs, "counts.surahs", 1),
      ayahs: requireInteger(value.counts.ayahs, "counts.ayahs", 1),
      juz: requireInteger(value.counts.juz, "counts.juz", 1),
    },
    source: {
      text: sourceInfo(value.source.text),
      metadata: sourceInfo(value.source.metadata),
      names: sourceInfo(value.source.names),
      translation: sourceInfo(value.source.translation),
    },
    copyrightNotice: requireString(value.copyrightNotice, "copyrightNotice"),
    textPolicy: requireString(value.textPolicy, "textPolicy"),
  };

  assert(manifest.counts.surahs === 114, "Jumlah surah pada manifest harus 114.");
  assert(manifest.counts.ayahs === 6236, "Jumlah ayat pada manifest harus 6236.");
  assert(manifest.counts.juz === 30, "Jumlah juz pada manifest harus 30.");

  return manifest;
}

const parseRevelation = (value: unknown): Revelation => {
  assert(value === "Meccan" || value === "Medinan", "Jenis wahyu tidak valid.");
  return value;
};

const parseAliases = (value: unknown, index: number): string[] => {
  assert(Array.isArray(value), `surah[${index}].nameAliases harus berupa larik.`);
  return value.map((alias, position) =>
    requireString(alias, `surah[${index}].nameAliases[${position}]`),
  );
};

export function parseSurahs(value: unknown): Surah[] {
  assert(Array.isArray(value), "Daftar surah tidak valid.");
  assert(value.length === 114, "Daftar surah harus berisi 114 entri.");

  const surahs = value.map((entry, index) => {
    assert(isRecord(entry), `Surah ke-${index + 1} tidak valid.`);
    const n = requireInteger(entry.n, `surah[${index}].n`, 1);
    assert(n === index + 1, "Nomor surah harus berurutan 1 sampai 114.");
    const revelation = parseRevelation(entry.revelation);
    const revelationId = entry.revelationId;
    assert(
      revelationId === "Makkiyah" || revelationId === "Madaniyah",
      `Label wahyu surah ${n} tidak valid.`,
    );

    return {
      n,
      name: requireString(entry.name, `surah[${index}].name`),
      nameLatin: requireString(entry.nameLatin, `surah[${index}].nameLatin`),
      nameAliases: parseAliases(entry.nameAliases, index),
      nameEnglish: requireString(entry.nameEnglish, `surah[${index}].nameEnglish`),
      revelation,
      revelationId,
      ayahCount: requireInteger(entry.ayahCount, `surah[${index}].ayahCount`, 1),
      order: requireInteger(entry.order, `surah[${index}].order`, 1),
      rukus: requireInteger(entry.rukus, `surah[${index}].rukus`, 1),
    } satisfies Surah;
  });

  const total = surahs.reduce((sum, surah) => sum + surah.ayahCount, 0);
  assert(total === 6236, "Jumlah ayat seluruh surah harus 6236.");

  return surahs;
}

export function parseJuz(value: unknown, surahs: Surah[]): Juz[] {
  assert(Array.isArray(value), "Daftar juz tidak valid.");
  assert(value.length === 30, "Daftar juz harus berisi 30 entri.");

  const juz = value.map((entry, index) => {
    assert(isRecord(entry), `Juz ke-${index + 1} tidak valid.`);
    const number = requireInteger(entry.juz, `juz[${index}].juz`, 1);
    assert(number === index + 1, "Nomor juz harus berurutan 1 sampai 30.");
    const start = parseAyahRef(entry.start, `juz[${index}].start`);
    const end = parseAyahRef(entry.end, `juz[${index}].end`);
    assert(start.surah <= 114, `Juz ${number} memiliki surah awal yang tidak valid.`);
    assert(end.surah <= 114, `Juz ${number} memiliki surah akhir yang tidak valid.`);
    const startSurah = surahs[start.surah - 1];
    const endSurah = surahs[end.surah - 1];
    assert(
      startSurah !== undefined && start.ayah <= startSurah.ayahCount,
      `Juz ${number} memiliki ayat awal di luar rentang surah.`,
    );
    assert(
      endSurah !== undefined && end.ayah <= endSurah.ayahCount,
      `Juz ${number} memiliki ayat akhir di luar rentang surah.`,
    );
    return { juz: number, start, end } satisfies Juz;
  });

  const first = juz[0];
  assert(first !== undefined && first.start.surah === 1 && first.start.ayah === 1, "Juz 1 harus mulai dari 1:1.");

  return juz;
}

export function parseSurahText(
  value: unknown,
  expectedSurah: number,
  expectedAyahCount: number,
): SurahText {
  assert(isRecord(value), "Data surah tidak valid.");
  assert(value.surah === expectedSurah, "Nomor surah pada data tidak cocok.");
  assert(Array.isArray(value.ayahs), "Daftar ayat tidak valid.");
  assert(
    value.ayahs.length === expectedAyahCount,
    `Surah ${expectedSurah} harus berisi ${expectedAyahCount} ayat.`,
  );

  const ayahs = value.ayahs.map((entry, index) => {
    assert(isRecord(entry), `Ayat ke-${index + 1} tidak valid.`);
    assert(entry.n === index + 1, `Nomor ayat ke-${index + 1} tidak berurutan.`);
    assert(isNonEmptyString(entry.text), `Teks ayat ${expectedSurah}:${index + 1} kosong.`);
    return { n: entry.n, text: entry.text } satisfies Ayah;
  });

  return { surah: expectedSurah, ayahs };
}

/**
 * Terjemahan dan catatan kaki diperlakukan sebagai teks verbatim: tidak
 * dipangkas, dinormalisasi, atau diubah. Penanda `[n]` dipertahankan.
 */
export function parseSurahTranslation(
  value: unknown,
  expectedSurah: number,
  expectedAyahCount: number,
): SurahTranslation {
  assert(isRecord(value), "Data terjemahan tidak valid.");
  assert(value.surah === expectedSurah, "Nomor surah pada terjemahan tidak cocok.");
  assert(Array.isArray(value.ayahs), "Daftar terjemahan tidak valid.");
  assert(
    value.ayahs.length === expectedAyahCount,
    `Terjemahan surah ${expectedSurah} harus berisi ${expectedAyahCount} ayat.`,
  );

  const ayahs = value.ayahs.map((entry, index) => {
    assert(isRecord(entry), `Terjemahan ayat ke-${index + 1} tidak valid.`);
    assert(entry.n === index + 1, `Nomor terjemahan ke-${index + 1} tidak berurutan.`);
    assert(isNonEmptyString(entry.text), `Terjemahan ${expectedSurah}:${index + 1} kosong.`);
    assert(
      typeof entry.footnotes === "string",
      `Catatan kaki ${expectedSurah}:${index + 1} tidak valid.`,
    );
    return {
      n: entry.n,
      text: entry.text,
      footnotes: entry.footnotes,
    } satisfies TranslationAyah;
  });

  return { surah: expectedSurah, ayahs };
}

export function parseBasmalah(value: unknown): Basmalah {
  assert(isRecord(value), "Data basmalah tidak valid.");
  return { text: requireString(value.text, "basmalah.text") };
}
