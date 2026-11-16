import type { SearchEntry } from "@/lib/search/index";
import { normalizeForSearch } from "@/lib/search/normalize";

export const MAX_SEARCH_QUERY_LENGTH = 100;
export const MIN_SEARCH_QUERY_LENGTH = 2;
export const SEARCH_RESULT_LIMIT = 20;

export interface AyahSearchResult {
  surah: number;
  ayah: number;
  score: number;
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
 */
export function searchAyahs(
  entries: readonly SearchEntry[],
  query: string,
  limit = SEARCH_RESULT_LIMIT,
): AyahSearchResult[] {
  const needle = normalizeForSearch(query.slice(0, MAX_SEARCH_QUERY_LENGTH));
  if (needle.length < MIN_SEARCH_QUERY_LENGTH) return [];

  const tokens = needle.split(" ").filter(Boolean);
  if (tokens.length === 0) return [];

  const results: AyahSearchResult[] = [];

  for (const [surah, ayah, text] of entries) {
    if (!tokens.every((token) => text.includes(token))) continue;

    let score = 1;
    if (text === needle) score += 1000;
    else if (text.startsWith(needle)) score += 300;
    else if (text.includes(needle)) score += 150;

    for (const token of tokens) {
      score += occurrenceCount(text, token) * 5;
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
