import { TRANSLATION_FILE, loadSource, validateDataset, SOURCE_INFO } from "./lib/source.mjs";

const data = loadSource();
const errors = validateDataset(data);

if (errors.length) {
  console.error(`validate-data: ${errors.length} masalah ditemukan\n`);
  for (const error of errors) console.error(`  - ${error}`);
  process.exitCode = 1;
} else {
  console.log("validate-data: OK");
  console.log(`  ${SOURCE_INFO.text.file}: Tanzil Uthmani v${SOURCE_INFO.text.version}`);
  console.log(`  ${SOURCE_INFO.metadata.file}: metadata v${SOURCE_INFO.metadata.version}`);
  console.log(`  ${TRANSLATION_FILE}: ${data.translation.title} v${data.translation.version}`);
  console.log(`  ${data.surahs.length} surah, ${data.ayahs.length} ayat, ${data.juz.length} juz`);
  console.log("  checksum SHA-256 cocok; urutan dan jumlah per surah cocok");
  console.log(`  ${data.translation.entries.length} terjemahan selaras dengan ayat Arab`);
}
