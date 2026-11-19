import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/Skeleton";
import type { AyahSearchResult } from "@/features/quran/search";
import { useSurahTranslation } from "@/features/quran/useQuranData";
import type { Surah } from "@/lib/data/types";
import { formatReference } from "@/lib/format/reference";
import { toHighlightSegments } from "@/lib/search/highlight";
import { expandQueryVariants } from "@/lib/search/affixes";
import { findHighlightRanges, normalizeForSearch } from "@/lib/search/normalize";
import styles from "./SearchResultRow.module.css";

export interface TranslationResultRowProps {
  result: AyahSearchResult;
  surah: Surah;
  query: string;
}

/**
 * Baris hasil pencarian terjemahan. Teks diambil dari berkas terjemahan apa
 * adanya; sorotan hanya membungkus, tidak mengubah teks.
 */
export function TranslationResultRow({ result, surah, query }: TranslationResultRowProps) {
  const translationState = useSurahTranslation(result.surah, surah.ayahCount);
  const text =
    translationState.status === "success"
      ? (translationState.data.ayahs.find((ayah) => ayah.n === result.ayah)?.text ?? null)
      : null;
  const segments = text
    ? toHighlightSegments(
        text,
        findHighlightRanges(text, query, expandQueryVariants(normalizeForSearch(query))),
      )
    : null;

  return (
    <li className={styles.item}>
      <Link
        to={`/surah/${result.surah}/${result.ayah}`}
        state={{ showTranslation: true }}
        className={styles.link}
      >
        <span className={styles.reference}>
          {formatReference(surah.nameLatin, result.surah, result.ayah)}
        </span>
        {segments ? (
          <p lang="id" className={styles.translationText}>
            {segments.map((segment, index) =>
              segment.highlighted ? <mark key={index}>{segment.text}</mark> : segment.text,
            )}
          </p>
        ) : null}
        {translationState.status === "loading" ? (
          <Skeleton width="100%" height="2.5rem" radius="sm" />
        ) : null}
        {translationState.status === "error" ||
        (segments === null && translationState.status === "success") ? (
          <span className={styles.loading}>Terjemahan ayat belum dapat dimuat.</span>
        ) : null}
      </Link>
    </li>
  );
}
