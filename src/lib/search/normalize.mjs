const ARABIC_DIACRITICS = /[\u0610-\u061a\u064b-\u065f\u0670\u06d6-\u06ed]/g;
const LATIN_DIACRITICS = /[\u0300-\u036f]/g;
const ARABIC_DIACRITIC_CHAR = /[\u0610-\u061a\u064b-\u065f\u0670\u06d6-\u06ed]/;
const LATIN_DIACRITIC_CHAR = /[\u0300-\u036f]/;

/**
 * Normalisasi hanya untuk pencarian. Tidak pernah dipakai untuk menampilkan
 * teks Al-Qur'an atau teks Arab apa pun.
 *
 * Modul ini sengaja berupa JavaScript agar skrip build data dan aplikasi
 * memakai satu implementasi yang sama.
 */
export function normalizeForSearch(value) {
  return value
    .normalize("NFD")
    .replace(LATIN_DIACRITICS, "")
    .replace(ARABIC_DIACRITICS, "")
    .replace(/\u0640/g, "")
    .replace(/[\u0623\u0625\u0622\u0671]/g, "\u0627")
    .replace(/\u0649/g, "\u064a")
    .replace(/\u0629/g, "\u0647")
    .toLowerCase()
    .replace(/[’'`-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Petakan posisi karakter pada teks ternormalisasi kembali ke teks asli.
 * Dipakai untuk menyorot hasil pencarian tanpa mengubah teks tampilan.
 *
 * @param {string} text
 * @returns {{ normalized: string; sourceIndexes: number[] }}
 */
export function normalizeWithMap(text) {
  let normalized = "";
  const sourceIndexes = [];

  for (let index = 0; index < text.length; index += 1) {
    const code = text.charCodeAt(index);
    const width = code >= 0xd800 && code <= 0xdbff ? 2 : 1;
    const character = text.slice(index, index + width);
    index += width - 1;

    for (const decomposed of character.normalize("NFD")) {
      if (LATIN_DIACRITIC_CHAR.test(decomposed) || ARABIC_DIACRITIC_CHAR.test(decomposed)) {
        continue;
      }
      if (decomposed === "\u0640") continue;
      normalized += decomposed;
      sourceIndexes.push(index);
    }
  }

  const replaced = normalized
    .replace(/[\u0623\u0625\u0622\u0671]/g, "\u0627")
    .replace(/\u0649/g, "\u064a")
    .replace(/\u0629/g, "\u0647")
    .replace(/[’'`-]/g, " ")
    .toLowerCase();

  let trimmedStart = 0;
  while (trimmedStart < replaced.length && /\s/.test(replaced[trimmedStart])) {
    trimmedStart += 1;
  }
  let trimmedEnd = replaced.length;
  while (trimmedEnd > trimmedStart && /\s/.test(replaced[trimmedEnd - 1])) {
    trimmedEnd -= 1;
  }

  let result = "";
  const resultIndexes = [];
  for (let index = trimmedStart; index < trimmedEnd; index += 1) {
    const character = replaced[index];
    if (/\s/.test(character)) {
      if (result.endsWith(" ")) continue;
      result += " ";
    } else {
      result += character;
    }
    resultIndexes.push(sourceIndexes[index] ?? 0);
  }

  return { normalized: result.trim(), sourceIndexes: resultIndexes };
}

/**
 * @param {string} text
 * @param {string} query
 * @returns {Array<{ start: number; end: number }>}
 */
export function findHighlightRanges(text, query) {
  const needle = normalizeForSearch(query);
  if (!needle) return [];

  const { normalized, sourceIndexes } = normalizeWithMap(text);
  const needles = normalized.includes(needle) ? [needle] : needle.split(" ").filter(Boolean);
  const ranges = [];

  for (const current of needles) {
    let from = 0;

    while (from <= normalized.length - current.length) {
      const found = normalized.indexOf(current, from);
      if (found === -1) break;
      const start = sourceIndexes[found];
      const endSource = sourceIndexes[found + current.length - 1];
      if (start !== undefined && endSource !== undefined) {
        ranges.push({ start, end: endSource + 1 });
      }
      from = found + Math.max(1, current.length);
    }
  }

  return ranges.sort((a, b) => a.start - b.start);
}
