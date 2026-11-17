/**
 * Mengambil terjemahan Indonesia dari QuranEnc sekali jalan (dev-only).
 * Tidak dijalankan oleh `pnpm build`; keluarannya di-vendor ke data/source
 * agar build tetap hermetis dan dapat diverifikasi lewat checksum.
 *
 * Pemakaian: node scripts/fetch-translation.mjs
 * Dasar lisensi: docs/design/DESIGN-DECISIONS.md D-003.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { SOURCE_DIR, loadSource, sha256 } from "./lib/source.mjs";

const KEY = "indonesian_affairs";
const API = "https://quranenc.com/api/v1";
const TERMS = [
  "No modification, addition, or deletion of the content.",
  "Clearly referring to the publisher and the source (QuranEnc.com).",
  "Mentioning the version number when re-publishing the translation.",
  "Keeping the transcript information inside the document.",
  "Notifying the source (QuranEnc.com) of any note on the translation.",
  "Updating the translation according to the latest version issued from the source (QuranEnc.com).",
  "Inappropriate advertisements must not be included when displaying translations of the meanings of the Noble Quran.",
];

const list = await fetchJson(`${API}/translations/list/id/`);
const info = list.translations.find((item) => item.key === KEY);
if (!info) throw new Error(`Terjemahan ${KEY} tidak ditemukan di QuranEnc`);

// Berkas terjemahan belum tentu ada saat pengambilan pertama.
const { surahs } = loadSource({ verifyChecksums: false, requireTranslation: false });
const entries = [];

for (const surah of surahs) {
  const response = await fetchJson(`${API}/translation/sura/${KEY}/${surah.n}`);
  const rows = response.result;
  if (rows.length !== surah.ayahCount) {
    throw new Error(`Surah ${surah.n}: ${rows.length} ayat ≠ ${surah.ayahCount}`);
  }

  rows.forEach((row, index) => {
    if (Number(row.sura) !== surah.n || Number(row.aya) !== index + 1) {
      throw new Error(`Surah ${surah.n}: urutan ayat tidak cocok pada posisi ${index + 1}`);
    }
    if (typeof row.translation !== "string" || row.translation.trim().length === 0) {
      throw new Error(`Surah ${surah.n} ayat ${row.aya}: terjemahan kosong`);
    }
    entries.push({
      surah: surah.n,
      ayah: index + 1,
      text: row.translation,
      footnotes: typeof row.footnotes === "string" ? row.footnotes : "",
    });
  });
}

if (entries.length !== 6236) throw new Error(`Jumlah terjemahan ${entries.length} ≠ 6236`);

const retrievedAt = new Date().toISOString().slice(0, 10);
const document = {
  key: KEY,
  title: info.title,
  publisher: "Kementerian Agama Republik Indonesia",
  version: info.version,
  lastUpdate: new Date(info.last_update * 1000).toISOString().slice(0, 10),
  license: "QuranEnc Terms and Policies",
  licenseUrl: "https://quranenc.com/en/home",
  sourceUrl: `${API}/translation/sura/${KEY}/{surah}`,
  retrievedAt,
  terms: TERMS,
  entries,
};

const json = `${JSON.stringify(document, null, 2)}\n`;
const dir = join(SOURCE_DIR, "tr");
mkdirSync(dir, { recursive: true });
writeFileSync(join(dir, `${KEY}.json`), json, "utf8");

const hash = sha256(json);
const checksumPath = join(SOURCE_DIR, "CHECKSUMS.txt");
const recorded = readFileSync(checksumPath, "utf8")
  .split("\n")
  .filter((line) => line.trim() && !line.endsWith(`  tr/${KEY}.json`));
recorded.push(`${hash}  tr/${KEY}.json`);
writeFileSync(checksumPath, `${recorded.join("\n")}\n`, "utf8");

const md = `# Terjemahan Indonesia — ${document.title}

| Field | Nilai |
| --- | --- |
| Berkas | \`tr/${KEY}.json\` |
| Nama | ${document.title} |
| Penerbit | ${document.publisher} |
| Versi | ${document.version} |
| Pembaruan sumber | ${document.lastUpdate} |
| Diambil | ${retrievedAt} |
| Sumber | ${document.sourceUrl} |
| Lisensi | ${document.license} — ${document.licenseUrl} |
| SHA-256 | \`${hash}\` |

## Syarat pemakaian (disalin dari QuranEnc, diakses ${retrievedAt})

> Contents of the translations can be downloaded and re-published, with the following terms and conditions:

${TERMS.map((term, index) => `${index + 1}. ${term}`).join("\n")}

## Kepatuhan di Quranku

- Teks dan catatan kaki disimpan verbatim; penanda \`[n]\` tidak dihapus.
- Penerbit, QuranEnc.com, dan nomor versi tampil di layar Sumber & Atribusi.
- Versi diperiksa setiap kenaikan \`DATASET_VERSION\`; bila \`last_update\` berubah, jalankan ulang skrip ini.
- Tidak ada iklan di aplikasi.
- Catatan tentang terjemahan dilaporkan ke QuranEnc, bukan diperbaiki sendiri.
`;
writeFileSync(join(dir, "SOURCE.md"), md, "utf8");

console.log(`fetch-translation: ${entries.length} ayat dari ${KEY} v${document.version}`);
console.log(`  ${join("data/source/tr", `${KEY}.json`)} (${Buffer.byteLength(json)} byte)`);
console.log(`  sha256 ${hash}`);

async function fetchJson(url) {
  const response = await fetch(url, { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  return response.json();
}
