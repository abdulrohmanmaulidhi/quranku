import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { normalizeForSearch } from "../src/lib/search/normalize.mjs";
import {
  DATASET_DIR,
  DATASET_VERSION,
  METADATA_FILE,
  OUTPUT_ROOT,
  SOURCE_INFO,
  TEXT_FILE,
  ayahsBySurah,
  listFiles,
  loadSource,
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
const noticeStart = data.textRaw.indexOf("# PLEASE DO NOT REMOVE");
if (noticeStart === -1) {
  console.error("build-data: blok hak cipta Tanzil tidak ditemukan");
  process.exit(1);
}
files.set("COPYRIGHT.txt", `${data.textRaw.slice(noticeStart).trimEnd()}\n`);
files.set(
  "manifest.json",
  json({
    schemaVersion: 1,
    datasetVersion: DATASET_VERSION,
    counts: { surahs: surahs.length, ayahs: data.ayahs.length, juz: data.juz.length },
    source: {
      text: { ...SOURCE_INFO.text, sha256: data.hashes[TEXT_FILE] },
      metadata: { ...SOURCE_INFO.metadata, sha256: data.hashes[METADATA_FILE] },
    },
    copyrightNotice: "COPYRIGHT.txt",
    textPolicy:
      "Teks Arab disalin verbatim dari data/source; tidak ada normalisasi atau pemotongan.",
  }),
);
files.set("surahs.json", json(surahs));
files.set("juz.json", json(data.juz));

for (const surah of surahs) {
  const ayahs = (grouped.get(surah.n) ?? []).map((row) => ({ n: row.ayah, text: row.text }));
  files.set(`ar/${pad(surah.n)}.json`, json({ surah: surah.n, ayahs }));
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

const tempDir = join(OUTPUT_ROOT, `.tmp-v${DATASET_VERSION}`);
rmSync(tempDir, { recursive: true, force: true });
mkdirSync(join(tempDir, "ar"), { recursive: true });
mkdirSync(join(tempDir, "search"), { recursive: true });

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
