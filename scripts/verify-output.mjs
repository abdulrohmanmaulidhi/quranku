import { readFileSync } from "node:fs";
import { join } from "node:path";
import { normalizeForSearch } from "../src/lib/search/normalize.mjs";
import {
  DATASET_DIR,
  DATASET_VERSION,
  METADATA_FILE,
  SOURCE_INFO,
  TEXT_FILE,
  TRANSLATION_DIR,
  TRANSLATION_FILE,
  ayahsBySurah,
  listFiles,
  loadSource,
  readJson,
  translationNotice,
  translationSourceInfo,
  validateDataset,
} from "./lib/source.mjs";

const source = loadSource();
const errors = validateDataset(source);

if (errors.length) {
  console.error("verify-output: sumber tidak valid\n");
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}

const failures = [];
const check = (label, actual, expected) => {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) failures.push(`${label}: isi berbeda`);
};

const surahs = source.surahs.map(({ startIndex, ...surah }) => surah);
const grouped = ayahsBySurah(source.ayahs);
const pad = (n) => String(n).padStart(3, "0");

const expectedManifest = {
  schemaVersion: 1,
  datasetVersion: DATASET_VERSION,
  counts: { surahs: surahs.length, ayahs: source.ayahs.length, juz: source.juz.length },
  source: {
    text: { ...SOURCE_INFO.text, sha256: source.hashes[TEXT_FILE] },
    metadata: { ...SOURCE_INFO.metadata, sha256: source.hashes[METADATA_FILE] },
    translation: { ...translationSourceInfo(source), sha256: source.hashes[TRANSLATION_FILE] },
  },
  copyrightNotice: "COPYRIGHT.txt",
  textPolicy: "Teks Arab disalin verbatim dari data/source; tidak ada normalisasi atau pemotongan.",
};

const noticeStart = source.textRaw.indexOf("# PLEASE DO NOT REMOVE");
const expectedNotice = noticeStart === -1 ? "" : `${source.textRaw.slice(noticeStart).trimEnd()}\n`;

const expectedSearchIndex = {
  schemaVersion: 1,
  datasetVersion: DATASET_VERSION,
  entries: source.ayahs.map((row) => [row.surah, row.ayah, normalizeForSearch(row.text)]),
};

const expectedTranslationSearchIndex = {
  schemaVersion: 1,
  datasetVersion: DATASET_VERSION,
  entries: source.translation.entries.map((row) => [
    row.surah,
    row.ayah,
    normalizeForSearch(row.text),
  ]),
};

const expectedFiles = new Set([
  "manifest.json",
  "surahs.json",
  "juz.json",
  "COPYRIGHT.txt",
  "search/arabic.json",
  "search/translation.json",
]);
for (const surah of surahs) expectedFiles.add(`ar/${pad(surah.n)}.json`);
for (const surah of surahs) expectedFiles.add(`${TRANSLATION_DIR}/${pad(surah.n)}.json`);
expectedFiles.add(`${TRANSLATION_DIR}/SOURCE.txt`);

let actualFiles;
try {
  actualFiles = listFiles(DATASET_DIR);
} catch {
  console.error(`verify-output: ${DATASET_DIR} tidak ditemukan; jalankan build:data`);
  process.exit(1);
}

for (const file of actualFiles) {
  if (!expectedFiles.has(file)) failures.push(`berkas tak terduga: ${file}`);
}
for (const file of expectedFiles) {
  if (!actualFiles.includes(file)) failures.push(`berkas hilang: ${file}`);
}

check("manifest.json", readJson(join(DATASET_DIR, "manifest.json")), expectedManifest);
check("surahs.json", readJson(join(DATASET_DIR, "surahs.json")), surahs);
check("juz.json", readJson(join(DATASET_DIR, "juz.json")), source.juz);
check(
  "search/arabic.json",
  readJson(join(DATASET_DIR, "search", "arabic.json")),
  expectedSearchIndex,
);
check(
  "search/translation.json",
  readJson(join(DATASET_DIR, "search", "translation.json")),
  expectedTranslationSearchIndex,
);
check("COPYRIGHT.txt", readFileSync(join(DATASET_DIR, "COPYRIGHT.txt"), "utf8"), expectedNotice);

let verifiedAyahs = 0;
for (const surah of surahs) {
  const path = join(DATASET_DIR, "ar", `${pad(surah.n)}.json`);
  const expected = {
    surah: surah.n,
    ayahs: (grouped.get(surah.n) ?? []).map((row) => ({ n: row.ayah, text: row.text })),
  };
  const actual = readJson(path);
  check(`ar/${pad(surah.n)}.json`, actual, expected);
  verifiedAyahs += actual.ayahs?.length ?? 0;

  for (let i = 0; i < (actual.ayahs?.length ?? 0); i += 1) {
    if (actual.ayahs[i]?.text !== expected.ayahs[i]?.text) {
      failures.push(`teks berbeda: surah ${surah.n} ayat ${i + 1}`);
      break;
    }
  }
}

const translated = ayahsBySurah(source.translation.entries);
let verifiedTranslations = 0;
for (const surah of surahs) {
  const expected = {
    surah: surah.n,
    ayahs: (translated.get(surah.n) ?? []).map((row) => ({
      n: row.ayah,
      text: row.text,
      footnotes: row.footnotes,
    })),
  };
  const actual = readJson(join(DATASET_DIR, TRANSLATION_DIR, `${pad(surah.n)}.json`));
  check(`${TRANSLATION_DIR}/${pad(surah.n)}.json`, actual, expected);
  verifiedTranslations += actual.ayahs?.length ?? 0;
}
check(
  `${TRANSLATION_DIR}/SOURCE.txt`,
  readFileSync(join(DATASET_DIR, TRANSLATION_DIR, "SOURCE.txt"), "utf8"),
  translationNotice(source),
);

if (failures.length) {
  console.error(`verify-output: ${failures.length} masalah ditemukan\n`);
  for (const failure of failures.slice(0, 20)) console.error(`  - ${failure}`);
  if (failures.length > 20) console.error(`  … dan ${failures.length - 20} lainnya`);
  process.exit(1);
}

console.log(`verify-output: OK (public/data/v${DATASET_VERSION}, ${actualFiles.length} berkas)`);
console.log(`  ${surahs.length} surah, ${verifiedAyahs} ayat cocok dengan sumber`);
console.log(`  ${verifiedTranslations} terjemahan cocok dengan sumber`);
console.log("  teks Arab identik; manifest dan checksum cocok");
