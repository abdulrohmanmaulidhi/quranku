import { createHash } from "node:crypto";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
export const SOURCE_DIR = join(ROOT, "data", "source");
export const OUTPUT_ROOT = join(ROOT, "public", "data");

export const TEXT_FILE = "quran-hafs.csv";
export const METADATA_FILE = "quran-data.js";
export const NAMES_FILE = "surah-names-id.json";
export const CHECKSUMS_FILE = "CHECKSUMS.txt";

// Harus sama dengan src/lib/data/version.ts.
export const DATASET_VERSION = "3";
export const DATASET_DIR = join(OUTPUT_ROOT, `v${DATASET_VERSION}`);

export const TRANSLATION_KEY = "indonesian_affairs";
export const TRANSLATION_FILE = `tr/${TRANSLATION_KEY}.json`;
export const TRANSLATION_DIR = `tr/${TRANSLATION_KEY}`;

export const SOURCE_INFO = {
  text: {
    file: TEXT_FILE,
    name: "QuranEnc — Uthmani Hafs Text (KFGQPC Hafs 20)",
    version: "20",
    license: "KFGQPC Font License",
    url: "https://quranenc.com/downloads/assets/Hafs_20.zip",
    retrievedAt: "2026-11-21",
  },
  metadata: {
    file: METADATA_FILE,
    name: "Tanzil Quran Metadata",
    version: "1.0",
    license: "Creative Commons Attribution 3.0",
    url: "https://tanzil.net/res/text/metadata/quran-data.js",
    retrievedAt: "2026-11-15",
  },
  names: {
    file: NAMES_FILE,
    name: "QuranEnc Indonesian Surah Names",
    version: "1.0",
    license: "QuranEnc Terms and Policies",
    url: "https://quranenc.com/api/v1/translations/sowar_names?iso_code=id",
    retrievedAt: "2026-11-21",
  },
};

/**
 * Nama surah Latin ditampilkan tanpa diakritik. Backtick pada data QuranEnc
 * (`An-Nisā`) dipetakan ke apostrof. Normalisasi ini hanya untuk tampilan;
 * nama asli tetap tersimpan di `data/source/surah-names-id.json`.
 */
export function normalizeSurahName(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/`/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Entri manifest untuk sumber terjemahan. Diturunkan dari berkas mentah agar
 * build dan verifikasi tidak dapat menyimpang satu sama lain.
 */
export function translationSourceInfo(data) {
  const doc = data.translation ?? {};
  return {
    file: TRANSLATION_FILE,
    name: `${doc.title} — ${doc.publisher} (QuranEnc.com)`,
    version: doc.version,
    license: doc.license,
    url: doc.licenseUrl,
    retrievedAt: doc.retrievedAt,
    sha256: data.hashes?.[TRANSLATION_FILE],
  };
}

/** Keterangan sumber yang ikut dikirim bersama berkas terjemahan. */
export function translationNotice(data) {
  const doc = data.translation ?? {};
  const terms = Array.isArray(doc.terms) ? doc.terms : [];
  return [
    "# --------------------------------------------------------------------",
    "#",
    "#  Quran Translation",
    `#  Name: ${doc.title}`,
    `#  Publisher: ${doc.publisher}`,
    `#  Version: ${doc.version}`,
    `#  Last Update: ${doc.lastUpdate}`,
    `#  Source: QuranEnc.com (${doc.licenseUrl})`,
    `#  Retrieved: ${doc.retrievedAt}`,
    "#",
    "#  Terms and Policies:",
    ...terms.map((term, index) => `#  ${index + 1}. ${term}`),
    "#",
    "# --------------------------------------------------------------------",
    "",
  ].join("\n");
}

/**
 * Blok atribusi yang dikirim bersama dataset. Menggantikan blok hak cipta
 * Tanzil karena teks Arab kini berasal dari paket Hafs 20.
 */
export function copyrightNotice() {
  return [
    "# --------------------------------------------------------------------",
    "#",
    "#  Quran Text",
    `#  Name: ${SOURCE_INFO.text.name}`,
    `#  Version: ${SOURCE_INFO.text.version}`,
    `#  Font: KFGQPC Uthmanic Hafs v${SOURCE_INFO.text.version} (see public/fonts/licenses/KFGQPC-Hafs.txt)`,
    `#  Source: QuranEnc.com (${SOURCE_INFO.text.url})`,
    `#  Retrieved: ${SOURCE_INFO.text.retrievedAt}`,
    "#",
    "#  Surah names",
    `#  Name: ${SOURCE_INFO.names.name}`,
    `#  Source: QuranEnc.com (${SOURCE_INFO.names.url})`,
    "#",
    "#  Metadata",
    `#  Name: ${SOURCE_INFO.metadata.name} v${SOURCE_INFO.metadata.version}`,
    `#  License: ${SOURCE_INFO.metadata.license}`,
    "#",
    "#  Teks Arab ditampilkan verbatim; tidak ada karakter yang diubah,",
    "#  dipotong, atau diketik ulang.",
    "#",
    "# --------------------------------------------------------------------",
    "",
  ].join("\n");
}

export function sha256(input) {
  return createHash("sha256").update(input).digest("hex");
}

/** Basmalah diambil dari ayat 1 surah 1, bukan dipotong dari ayat lain. */
export function basmalahText(ayahs) {
  const first = ayahs.find((row) => row.surah === 1 && row.ayah === 1);
  return first ? first.text : "";
}

export function readChecksums() {
  const raw = readFileSync(join(SOURCE_DIR, CHECKSUMS_FILE), "utf8");
  const entries = new Map();
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const match = /^([a-f0-9]{64})\s{2}(.+)$/.exec(trimmed);
    if (!match) throw new Error(`Baris CHECKSUMS.txt tidak valid: ${trimmed}`);
    entries.set(match[2], match[1]);
  }
  return entries;
}

function parseCsvLine(line) {
  const fields = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (quoted) {
      if (char === '"' && line[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      fields.push(field);
      field = "";
    } else {
      field += char;
    }
  }

  fields.push(field);
  return fields;
}

const CSV_HEADER = '"id","sura","aya","uthmani"';

function parseAyahs(rawText) {
  const ayahs = [];
  const errors = [];
  const lines = rawText.split("\n");

  if ((lines[0] ?? "").trim() !== CSV_HEADER) {
    errors.push(`Header CSV harus ${CSV_HEADER}`);
  }

  lines.forEach((line, index) => {
    if (index === 0 || line === "") return;
    const fields = parseCsvLine(line);
    if (fields.length !== 4) {
      errors.push(`Baris ${index + 1}: ${fields.length} kolom, harus 4`);
      return;
    }
    const [id, surah, ayah, text] = fields;
    if (!/^\d+$/.test(id) || !/^\d+$/.test(surah) || !/^\d+$/.test(ayah)) {
      errors.push(`Baris ${index + 1}: id/surah/ayah bukan angka`);
      return;
    }
    ayahs.push({
      id: Number(id),
      surah: Number(surah),
      ayah: Number(ayah),
      text,
      line: index + 1,
    });
  });

  return { ayahs, errors };
}

function parseSurahNames(rawNames) {
  const errors = [];
  let doc;
  try {
    doc = JSON.parse(rawNames);
  } catch {
    errors.push(`${NAMES_FILE}: JSON tidak valid`);
    return { names: null, errors };
  }
  if (!doc || typeof doc !== "object" || Array.isArray(doc)) {
    errors.push(`${NAMES_FILE}: struktur tidak valid`);
    return { names: null, errors };
  }

  const names = [];
  for (let n = 1; n <= 114; n += 1) {
    const value = doc[String(n)];
    if (typeof value !== "string" || !value.trim()) {
      errors.push(`${NAMES_FILE}: nama surah ${n} kosong`);
      names.push("");
      continue;
    }
    names.push(normalizeSurahName(value));
  }

  if (Object.keys(doc).length !== 114) {
    errors.push(`${NAMES_FILE}: ${Object.keys(doc).length} entri ≠ 114`);
  }

  return { names, errors };
}

function parseQuranData(rawMeta) {
  const context = vm.createContext(Object.create(null));
  vm.runInContext(rawMeta, context, { timeout: 1000 });
  const data = context.QuranData;
  if (!data) throw new Error("quran-data.js tidak mendefinisikan QuranData");
  if (!Array.isArray(data.Sura) || !Array.isArray(data.Juz)) {
    throw new Error("quran-data.js tidak memuat Sura dan Juz");
  }
  const version = /ver\s+([\d.]+)/i.exec(rawMeta.slice(0, 200));
  const license = /License:\s*([^\n]+)/i.exec(rawMeta.slice(0, 200));
  return {
    surahsRaw: data.Sura,
    juzRaw: data.Juz,
    version: version ? version[1] : null,
    license: license ? license[1].trim() : null,
  };
}

export function buildSurahs(surahsRaw, names = []) {
  const rows = surahsRaw.slice(1).filter((row) => Array.isArray(row) && row.length >= 8);
  return rows.map((row, index) => {
    const [start, ayahCount, order, rukus, name, nameLatin, nameEnglish, revelation] = row;
    // Nama tampilan dari QuranEnc; nama Tanzil tetap tersedia sebagai alias
    // pencarian agar ejaan lama ("Al-Baqara") tetap menemukan surah.
    const display = names[index] || nameLatin;
    const aliases = [nameLatin].filter((alias) => alias && alias !== display);
    return {
      n: index + 1,
      name,
      nameLatin: display,
      nameAliases: aliases,
      nameEnglish,
      revelation,
      revelationId: revelation === "Meccan" ? "Makkiyah" : "Madaniyah",
      ayahCount,
      order,
      rukus,
      startIndex: start,
    };
  });
}

export function buildJuz(juzRaw, surahs) {
  const starts = juzRaw
    .slice(1)
    .map((row) => [row[0], row[1]])
    .filter(([surah]) => surah <= 114);
  const sentinel = [115, 1];

  return starts.map(([surah, ayah], index) => {
    const next = index + 1 < starts.length ? starts[index + 1] : sentinel;
    const end =
      next[1] === 1
        ? { surah: next[0] - 1, ayah: surahs[next[0] - 2].ayahCount }
        : { surah: next[0], ayah: next[1] - 1 };
    return { juz: index + 1, start: { surah, ayah }, end };
  });
}

function parseTranslation(raw) {
  const errors = [];
  let doc = null;
  try {
    doc = JSON.parse(raw);
  } catch {
    errors.push(`${TRANSLATION_FILE}: JSON tidak valid`);
    return { doc, errors };
  }

  if (!doc || typeof doc !== "object") {
    errors.push(`${TRANSLATION_FILE}: struktur tidak valid`);
    return { doc: null, errors };
  }
  if (doc.key !== TRANSLATION_KEY)
    errors.push(`${TRANSLATION_FILE}: key ${doc.key} ≠ ${TRANSLATION_KEY}`);
  for (const field of ["title", "publisher", "version", "license", "licenseUrl", "retrievedAt"]) {
    if (typeof doc[field] !== "string" || !doc[field]) {
      errors.push(`${TRANSLATION_FILE}: field ${field} kosong`);
    }
  }
  if (!Array.isArray(doc.entries)) errors.push(`${TRANSLATION_FILE}: entries bukan larik`);
  if (!Array.isArray(doc.terms) || doc.terms.length === 0) {
    errors.push(`${TRANSLATION_FILE}: syarat pemakaian tidak tercatat`);
  }

  return { doc, errors };
}

export function loadSource({ verifyChecksums = true, requireTranslation = true } = {}) {
  const textRaw = readFileSync(join(SOURCE_DIR, TEXT_FILE), "utf8");
  const metaRaw = readFileSync(join(SOURCE_DIR, METADATA_FILE), "utf8");
  const namesRaw = readFileSync(join(SOURCE_DIR, NAMES_FILE), "utf8");
  const hashes = {
    [TEXT_FILE]: sha256(textRaw),
    [METADATA_FILE]: sha256(metaRaw),
    [NAMES_FILE]: sha256(namesRaw),
  };

  // Pengambilan terjemahan pertama kali tidak boleh bergantung pada berkas
  // terjemahan yang belum ada.
  let translationRaw = null;
  try {
    translationRaw = readFileSync(join(SOURCE_DIR, TRANSLATION_FILE), "utf8");
  } catch (error) {
    if (requireTranslation) throw error;
  }
  if (translationRaw !== null) hashes[TRANSLATION_FILE] = sha256(translationRaw);

  const { ayahs, errors: lineErrors } = parseAyahs(textRaw);
  const meta = parseQuranData(metaRaw);
  const { names, errors: nameErrors } = parseSurahNames(namesRaw);
  const surahs = buildSurahs(meta.surahsRaw, names ?? []);
  const juz = buildJuz(meta.juzRaw, surahs);
  const translation =
    translationRaw === null ? { doc: null, errors: [] } : parseTranslation(translationRaw);

  const checksumErrors = [];
  if (verifyChecksums) {
    let recorded;
    try {
      recorded = readChecksums();
    } catch (error) {
      checksumErrors.push(error.message);
      recorded = new Map();
    }
    for (const [file, expected] of Object.entries(hashes)) {
      const actual = recorded.get(file);
      if (!actual) checksumErrors.push(`${file} tidak tercatat di ${CHECKSUMS_FILE}`);
      else if (actual !== expected) {
        checksumErrors.push(`${file}: checksum tidak cocok (${actual} ≠ ${expected})`);
      }
    }
    for (const file of recorded.keys()) {
      if (!(file in hashes)) checksumErrors.push(`${file} tercatat tetapi tidak dipakai`);
    }
  }

  return {
    textRaw,
    metaRaw,
    namesRaw,
    translationRaw,
    hashes,
    ayahs,
    surahs,
    juz,
    translation: translation.doc,
    translationErrors: translation.errors,
    lineErrors,
    nameErrors,
    checksumErrors,
    metaInfo: { version: meta.version, license: meta.license },
  };
}

export function ayahsBySurah(ayahs) {
  const map = new Map();
  for (const ayah of ayahs) {
    if (!map.has(ayah.surah)) map.set(ayah.surah, []);
    map.get(ayah.surah).push(ayah);
  }
  return map;
}

export function validateDataset(data) {
  const errors = [...data.lineErrors, ...data.nameErrors, ...data.checksumErrors];

  if (data.textRaw.includes("\r")) errors.push("Teks sumber memakai CRLF; harus LF");
  if (data.metaInfo.version !== "1.0") {
    errors.push(`Versi metadata ${data.metaInfo.version ?? "tidak diketahui"} ≠ 1.0`);
  }

  data.ayahs.forEach((ayah, index) => {
    if (ayah.id !== index + 1) {
      errors.push(`Baris ${ayah.line}: id ${ayah.id} ≠ ${index + 1}`);
    }
  });

  const names = data.surahs.map((surah) => surah.nameLatin);
  if (new Set(names).size !== names.length) errors.push("Nama surah tampilan tidak unik");
  for (const surah of data.surahs) {
    if (!/^[A-Za-z' -]+$/.test(surah.nameLatin)) {
      errors.push(`Surah ${surah.n}: nama tampilan mengandung karakter tak dikenal`);
    }
  }

  if (data.surahs.length !== 114) {
    errors.push(`Jumlah surah ${data.surahs.length} ≠ 114`);
  }

  const totalFromMeta = data.surahs.reduce((sum, surah) => sum + surah.ayahCount, 0);
  if (totalFromMeta !== 6236) errors.push(`Jumlah ayat metadata ${totalFromMeta} ≠ 6236`);
  if (data.ayahs.length !== 6236) errors.push(`Jumlah baris ayat ${data.ayahs.length} ≠ 6236`);

  let start = 0;
  for (const surah of data.surahs) {
    if (surah.startIndex !== start) {
      errors.push(`Surah ${surah.n}: startIndex ${surah.startIndex} ≠ ${start}`);
    }
    start += surah.ayahCount;
    if (!surah.name || !surah.nameLatin) errors.push(`Surah ${surah.n}: nama kosong`);
    if (!["Meccan", "Medinan"].includes(surah.revelation)) {
      errors.push(`Surah ${surah.n}: jenis wahyu tidak dikenal (${surah.revelation})`);
    }
  }

  const grouped = ayahsBySurah(data.ayahs);
  const seen = new Set();
  for (const ayah of data.ayahs) {
    const key = `${ayah.surah}:${ayah.ayah}`;
    if (seen.has(key)) errors.push(`Ayat duplikat ${key} (baris ${ayah.line})`);
    seen.add(key);
    if (!ayah.text.length) errors.push(`Ayat ${key} kosong (baris ${ayah.line})`);
    if (ayah.text !== ayah.text.trim()) {
      errors.push(`Ayat ${key} memiliki spasi di awal/akhir (baris ${ayah.line})`);
    }
  }

  for (const surah of data.surahs) {
    const rows = grouped.get(surah.n) ?? [];
    if (rows.length !== surah.ayahCount) {
      errors.push(`Surah ${surah.n}: ${rows.length} ayat ≠ ${surah.ayahCount}`);
    }
    rows.forEach((row, index) => {
      if (row.ayah !== index + 1) {
        errors.push(`Surah ${surah.n}: urutan ayat ${row.ayah} pada posisi ${index + 1}`);
      }
    });
  }

  for (const key of grouped.keys()) {
    if (!data.surahs.some((surah) => surah.n === key)) {
      errors.push(`Surah ${key} tidak ada di metadata`);
    }
  }

  errors.push(...data.translationErrors);

  const translations = Array.isArray(data.translation?.entries) ? data.translation.entries : [];
  if (translations.length !== 6236) {
    errors.push(`Jumlah terjemahan ${translations.length} ≠ 6236`);
  }
  translations.forEach((row, index) => {
    if (
      !row ||
      !Number.isInteger(row.surah) ||
      !Number.isInteger(row.ayah) ||
      typeof row.text !== "string" ||
      typeof row.footnotes !== "string"
    ) {
      errors.push(`Terjemahan posisi ${index + 1}: struktur tidak valid`);
      return;
    }
    if (!row.text.length) errors.push(`Terjemahan ${row.surah}:${row.ayah} kosong`);
    if (row.text !== row.text.trim()) {
      errors.push(`Terjemahan ${row.surah}:${row.ayah} memiliki spasi di awal/akhir`);
    }
    if (row.footnotes && row.footnotes !== row.footnotes.trim()) {
      errors.push(`Catatan kaki ${row.surah}:${row.ayah} memiliki spasi di awal/akhir`);
    }
    const arabic = data.ayahs[index];
    if (!arabic || arabic.surah !== row.surah || arabic.ayah !== row.ayah) {
      errors.push(`Terjemahan posisi ${index + 1} tidak selaras dengan urutan ayat Arab`);
    }
  });

  if (data.juz.length !== 30) errors.push(`Jumlah juz ${data.juz.length} ≠ 30`);
  const first = data.juz[0];
  if (!first || first.start.surah !== 1 || first.start.ayah !== 1) {
    errors.push("Juz 1 harus mulai dari 1:1");
  }
  const ayahIndex = (position) => {
    const surah = data.surahs[position.surah - 1];
    if (!surah || position.ayah < 1 || position.ayah > surah.ayahCount) return null;
    return surah.startIndex + position.ayah - 1;
  };

  for (let index = 1; index < data.juz.length; index += 1) {
    const prev = data.juz[index - 1];
    const current = data.juz[index];
    const prevEnd = ayahIndex(prev.end);
    const currentStart = ayahIndex(current.start);
    if (prevEnd === null || currentStart === null || currentStart !== prevEnd + 1) {
      errors.push(`Juz ${current.juz} tidak berurutan setelah juz ${prev.juz}`);
    }
  }

  return errors;
}

export function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

export function listFiles(dir) {
  const out = [];
  const walk = (current) => {
    for (const entry of readdirSync(current).sort()) {
      const full = join(current, entry);
      if (statSync(full).isDirectory()) walk(full);
      else out.push(relative(dir, full));
    }
  };
  walk(dir);
  return out;
}
