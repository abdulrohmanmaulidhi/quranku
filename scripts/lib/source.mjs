import { createHash } from "node:crypto";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
export const SOURCE_DIR = join(ROOT, "data", "source");
export const OUTPUT_ROOT = join(ROOT, "public", "data");

export const TEXT_FILE = "quran-uthmani.txt";
export const METADATA_FILE = "quran-data.js";
export const CHECKSUMS_FILE = "CHECKSUMS.txt";

// Harus sama dengan src/lib/data/version.ts.
export const DATASET_VERSION = "1";
export const DATASET_DIR = join(OUTPUT_ROOT, `v${DATASET_VERSION}`);

export const SOURCE_INFO = {
  text: {
    file: TEXT_FILE,
    name: "Tanzil Quran Text (Uthmani)",
    version: "1.1",
    license: "Creative Commons Attribution 3.0",
    url: "https://tanzil.net/download/",
    retrievedAt: "2026-11-15",
  },
  metadata: {
    file: METADATA_FILE,
    name: "Tanzil Quran Metadata",
    version: "1.0",
    license: "Creative Commons Attribution 3.0",
    url: "https://tanzil.net/res/text/metadata/quran-data.js",
    retrievedAt: "2026-11-15",
  },
};

export function sha256(input) {
  return createHash("sha256").update(input).digest("hex");
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

function parseAyahs(rawText) {
  const ayahs = [];
  const errors = [];
  const lines = rawText.split("\n");

  lines.forEach((line, index) => {
    if (line === "" || line.startsWith("#")) return;
    const match = /^(\d+)\|(\d+)\|(.+)$/.exec(line);
    if (!match) {
      errors.push(`Baris ${index + 1}: format bukan surah|ayat|teks`);
      return;
    }
    ayahs.push({
      surah: Number(match[1]),
      ayah: Number(match[2]),
      text: match[3],
      line: index + 1,
    });
  });

  return { ayahs, errors };
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

export function buildSurahs(surahsRaw) {
  const rows = surahsRaw.slice(1).filter((row) => Array.isArray(row) && row.length >= 8);
  return rows.map((row, index) => {
    const [start, ayahCount, order, rukus, name, nameLatin, nameEnglish, revelation] = row;
    return {
      n: index + 1,
      name,
      nameLatin,
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

export function loadSource({ verifyChecksums = true } = {}) {
  const textRaw = readFileSync(join(SOURCE_DIR, TEXT_FILE), "utf8");
  const metaRaw = readFileSync(join(SOURCE_DIR, METADATA_FILE), "utf8");
  const hashes = {
    [TEXT_FILE]: sha256(textRaw),
    [METADATA_FILE]: sha256(metaRaw),
  };

  const { ayahs, errors: lineErrors } = parseAyahs(textRaw);
  const meta = parseQuranData(metaRaw);
  const surahs = buildSurahs(meta.surahsRaw);
  const juz = buildJuz(meta.juzRaw, surahs);

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
    hashes,
    ayahs,
    surahs,
    juz,
    lineErrors,
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
  const errors = [...data.lineErrors, ...data.checksumErrors];

  if (data.textRaw.includes("\r")) errors.push("Teks sumber memakai CRLF; harus LF");
  if (!data.textRaw.includes("Tanzil Quran Text (Uthmani, Version 1.1)")) {
    errors.push("Blok hak cipta/versi Tanzil Uthmani 1.1 tidak ditemukan");
  }
  if (!data.textRaw.includes("# PLEASE DO NOT REMOVE OR CHANGE THIS COPYRIGHT BLOCK")) {
    errors.push("Blok hak cipta Tanzil tidak ditemukan");
  }
  if (!data.textRaw.includes("Creative Commons Attribution 3.0")) {
    errors.push("Pernyataan lisensi CC BY 3.0 tidak ditemukan di teks sumber");
  }
  if (data.metaInfo.version !== "1.0") {
    errors.push(`Versi metadata ${data.metaInfo.version ?? "tidak diketahui"} ≠ 1.0`);
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
