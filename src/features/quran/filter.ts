import type { Juz, Surah } from "@/lib/data/types";
import { normalizeForSearch } from "@/lib/search/normalize";

function surahSearchTerms(surah: Surah): string[] {
  return [
    normalizeForSearch(surah.nameLatin),
    normalizeForSearch(surah.name),
    String(surah.n),
    String(surah.n).padStart(3, "0"),
  ];
}

export function filterSurahs(surahs: readonly Surah[], query: string): Surah[] {
  const needle = normalizeForSearch(query);
  if (!needle) return [...surahs];

  return surahs.filter((surah) => surahSearchTerms(surah).some((term) => term.includes(needle)));
}

export function filterJuz(juz: readonly Juz[], surahs: readonly Surah[], query: string): Juz[] {
  const needle = normalizeForSearch(query);
  if (!needle) return [...juz];

  return juz.filter((entry) => {
    const start = surahs[entry.start.surah - 1];
    const terms = [
      String(entry.juz),
      normalizeForSearch(`juz ${entry.juz}`),
      start ? normalizeForSearch(start.nameLatin) : "",
      start ? normalizeForSearch(start.name) : "",
    ];
    return terms.some((term) => term.includes(needle));
  });
}
