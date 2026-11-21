import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { normalizeForSearch } from "../src/lib/search/normalize.mjs";
import {
  DATASET_DIR,
  DATASET_VERSION,
  METADATA_FILE,
  NAMES_FILE,
  OUTPUT_ROOT,
  SOURCE_INFO,
  TEXT_FILE,
  TRANSLATION_DIR,
  TRANSLATION_FILE,
  ayahsBySurah,
  basmalahText,
  copyrightNotice,
  listFiles,
  loadSource,
  translationNotice,
  translationSourceInfo,
  validateDataset,
} from "./lib/source.mjs";

const data = loadSource();
const errors = validateDataset(data);

if (errors.length) {
  console.error("build-data: sumber tidak valid, build dibatalkan\n");
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}

const json = (value) => `${JSON.stringify(value, null, 2)}\n`;
const pad = (n) => String(n).padStart(3, "0");

const surahs = data.surahs.map(({ startIndex, ...surah }) => surah);
const grouped = ayahsBySurah(data.ayahs);

const files = new Map();
files.set("COPYRIGHT.txt", copyrightNotice());
files.set(
  "manifest.json",
  json({
    schemaVersion: 1,
    datasetVersion: DATASET_VERSION,
    counts: { surahs: surahs.length, ayahs: data.ayahs.length, juz: data.juz.length },
    source: {
      text: { ...SOURCE_INFO.text, sha256: data.hashes[TEXT_FILE] },
      metadata: { ...SOURCE_INFO.metadata, sha256: data.hashes[METADATA_FILE] },
      names: { ...SOURCE_INFO.names, sha256: data.hashes[NAMES_FILE] },
      translation: { ...translationSourceInfo(data), sha256: data.hashes[TRANSLATION_FILE] },
    },
    copyrightNotice: "COPYRIGHT.txt",
    textPolicy:
      "Teks Arab disalin verbatim dari data/source; tidak ada normalisasi atau pemotongan.",
  }),
);
files.set("surahs.json", json(surahs));
files.set("juz.json", json(data.juz));
// Basmalah bukan bagian ayat 1 pada surah 2–114, jadi disimpan sekali dari 1:1.
files.set("basmalah.json", json({ text: basmalahText(data.ayahs) }));

for (const surah of surahs) {
  const ayahs = (grouped.get(surah.n) ?? []).map((row) => ({ n: row.ayah, text: row.text }));
  files.set(`ar/${pad(surah.n)}.json`, json({ surah: surah.n, ayahs }));
}

// Terjemahan disimpan per surah terpisah dari teks Arab agar dapat diganti
// atau ditarik tanpa menyentuh data Arab. Teks dan catatan kaki verbatim.
const translated = ayahsBySurah(data.translation.entries);
let translationBytes = 0;
for (const surah of surahs) {
  const ayahs = (translated.get(surah.n) ?? []).map((row) => ({
    n: row.ayah,
    text: row.text,
    footnotes: row.footnotes,
  }));
  const content = json({ surah: surah.n, ayahs });
  translationBytes += Buffer.byteLength(content);
  files.set(`${TRANSLATION_DIR}/${pad(surah.n)}.json`, content);
}
const noticeContent = translationNotice(data);
translationBytes += Buffer.byteLength(noticeContent);
files.set(`${TRANSLATION_DIR}/SOURCE.txt`, noticeContent);

const TRANSLATION_BUDGET = 3_000_000;
if (translationBytes > TRANSLATION_BUDGET) {
  console.error(
    `build-data: terjemahan ${translationBytes} byte melewati anggaran ${TRANSLATION_BUDGET} byte`,
  );
  process.exit(1);
}

// Indeks pencarian hanya berisi referensi ayat dan teks ternormalisasi.
// Teks asli tetap dibaca dari ar/*.json saat hasil ditampilkan, sehingga
// tidak ada salinan kedua teks Al-Qur'an di berkas pencarian.
const searchEntries = data.ayahs.map((row) => [row.surah, row.ayah, normalizeForSearch(row.text)]);
const searchJson = `${JSON.stringify({
  schemaVersion: 1,
  datasetVersion: DATASET_VERSION,
  entries: searchEntries,
})}\n`;
const searchBytes = Buffer.byteLength(searchJson);

if (searchBytes > 1_200_000) {
  console.error(`build-data: indeks pencarian terlalu besar (${searchBytes} byte, batas 1,2 MB)`);
  process.exit(1);
}
if (searchBytes > 1_000_000) {
  console.warn(`build-data: peringatan, indeks pencarian ${searchBytes} byte`);
}
files.set("search/arabic.json", searchJson);

// Indeks terjemahan memakai normalisasi yang sama. Catatan kaki tidak diindeks:
// isinya komentar, bukan terjemahan, dan akan mengaburkan hasil.
const translationSearchEntries = data.translation.entries.map((row) => [
  row.surah,
  row.ayah,
  normalizeForSearch(row.text),
]);
const translationSearchJson = `${JSON.stringify({
  schemaVersion: 1,
  datasetVersion: DATASET_VERSION,
  entries: translationSearchEntries,
})}\n`;
const translationSearchBytes = Buffer.byteLength(translationSearchJson);

if (translationSearchBytes > 1_600_000) {
  console.error(
    `build-data: indeks terjemahan terlalu besar (${translationSearchBytes} byte, batas 1,6 MB)`,
  );
  process.exit(1);
}
if (translationSearchBytes > 1_400_000) {
  console.warn(`build-data: peringatan, indeks terjemahan ${translationSearchBytes} byte`);
}
files.set("search/translation.json", translationSearchJson);

const tempDir = join(OUTPUT_ROOT, `.tmp-v${DATASET_VERSION}`);
rmSync(tempDir, { recursive: true, force: true });
mkdirSync(join(tempDir, "ar"), { recursive: true });
mkdirSync(join(tempDir, "search"), { recursive: true });
mkdirSync(join(tempDir, TRANSLATION_DIR), { recursive: true });

for (const [path, content] of files) {
  writeFileSync(join(tempDir, path), content, "utf8");
}

if (existsSync(DATASET_DIR)) {
  const existing = listFiles(DATASET_DIR);
  const generated = listFiles(tempDir);
  const sameList =
    existing.length === generated.length && existing.every((file, i) => file === generated[i]);
  const different = sameList
    ? existing.filter(
        (file) => !readFileSync(join(DATASET_DIR, file)).equals(readFileSync(join(tempDir, file))),
      )
    : null;

  if (different && different.length === 0) {
    rmSync(tempDir, { recursive: true, force: true });
    console.log(`build-data: public/data/v${DATASET_VERSION} sudah sesuai (${files.size} berkas)`);
    process.exit(0);
  }

  rmSync(tempDir, { recursive: true, force: true });
  console.error(`build-data: public/data/v${DATASET_VERSION} sudah ada dan berbeda.`);
  if (different && different.length) {
    console.error(`  Berkas berbeda: ${different.slice(0, 5).join(", ")}`);
  } else {
    console.error("  Daftar berkas berbeda.");
  }
  console.error("  Naikkan DATASET_VERSION untuk koreksi konten; jangan menimpa versi lama.");
  process.exit(1);
}

renameSync(tempDir, DATASET_DIR);
console.log(`build-data: public/data/v${DATASET_VERSION} dibuat (${files.size} berkas)`);
console.log(`  ${surahs.length} surah, ${data.ayahs.length} ayat, ${data.juz.length} juz`);
