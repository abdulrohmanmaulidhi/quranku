import type { SearchEntry } from "@/lib/search/index";
import { variantsForToken } from "@/lib/search/affixes";
import { normalizeForSearch } from "@/lib/search/normalize";

export const MAX_SEARCH_QUERY_LENGTH = 100;
export const MIN_SEARCH_QUERY_LENGTH = 2;
export const MIN_TRANSLATION_QUERY_LENGTH = 3;
export const SEARCH_RESULT_LIMIT = 20;
/** Batas hasil yang dapat ditampilkan; sisanya dipersempit lewat kata kunci. */
export const MAX_SEARCH_RESULTS = 100;

export interface AyahSearchResult {
  surah: number;
  ayah: number;
  score: number;
}

export interface SearchOptions {
  /**
   * Terapkan penyederhanaan imbuhan Indonesia. Hanya untuk indeks terjemahan;
   * pencarian Arab memakai pencocokan apa adanya.
   */
  readonly stem?: boolean;
}

function occurrenceCount(text: string, token: string): number {
  if (!token) return 0;
  let count = 0;
  let from = 0;
  while (from <= text.length - token.length) {
    const found = text.indexOf(token, from);
    if (found === -1) break;
    count += 1;
    from = found + token.length;
  }
  return count;
}

/**
 * Pencarian sederhana yang dapat diuji: semua kata kueri harus muncul.
 * Frasa persis dan kemunculan berulang diberi skor lebih tinggi.
 *
 * Dengan `stem`, tiap kata kueri juga dicocokkan lewat bentuk dasarnya
 * (mis. `kekuasaan` → `kuasa`), khusus untuk teks terjemahan Indonesia.
 */
export function searchAyahs(
  entries: readonly SearchEntry[],
  query: string,
  limit = Number.POSITIVE_INFINITY,
  options: SearchOptions = {},
): AyahSearchResult[] {
  const needle = normalizeForSearch(query.slice(0, MAX_SEARCH_QUERY_LENGTH));
  if (needle.length < MIN_SEARCH_QUERY_LENGTH) return [];

  const tokens = needle.split(" ").filter(Boolean);
  if (tokens.length === 0) return [];

  const tokenVariants = tokens.map((token) => (options.stem ? variantsForToken(token) : [token]));

  const results: AyahSearchResult[] = [];

  for (const [surah, ayah, text] of entries) {
    if (!tokenVariants.every((variants) => variants.some((variant) => text.includes(variant)))) {
      continue;
    }

    let score = 1;
    if (text === needle) score += 1000;
    else if (text.startsWith(needle)) score += 300;
    else if (text.includes(needle)) score += 150;

    for (const variants of tokenVariants) {
      let best = 0;
      for (const variant of variants) {
        best = Math.max(best, occurrenceCount(text, variant));
      }
      score += best * 5;
    }

    results.push({ surah, ayah, score });
  }

  results.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (a.surah !== b.surah) return a.surah - b.surah;
    return a.ayah - b.ayah;
  });

  return results.slice(0, limit);
}
