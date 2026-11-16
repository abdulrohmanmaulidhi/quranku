import { Link } from "react-router-dom";
import { ArabicText } from "@/components/quran/ArabicText";
import { Skeleton } from "@/components/ui/Skeleton";
import type { AyahSearchResult } from "@/features/quran/search";
import { useSurahText } from "@/features/quran/useQuranData";
import type { Surah } from "@/lib/data/types";
import { formatReference } from "@/lib/format/reference";
import { findHighlightRanges } from "@/lib/search/normalize";
import styles from "./SearchResultRow.module.css";

export interface SearchResultRowProps {
  result: AyahSearchResult;
  surah: Surah;
  query: string;
}

export function SearchResultRow({ result, surah, query }: SearchResultRowProps) {
  const textState = useSurahText(result.surah, surah.ayahCount);
  const text =
    textState.status === "success"
      ? (textState.data.ayahs.find((ayah) => ayah.n === result.ayah)?.text ?? null)
      : null;
  const ranges = text ? findHighlightRanges(text, query) : [];

  return (
    <li className={styles.item}>
      <Link to={`/surah/${result.surah}/${result.ayah}`} className={styles.link}>
        <span className={styles.reference}>
          {formatReference(surah.nameLatin, result.surah, result.ayah)}
        </span>
        {text ? (
          <ArabicText
            text={text}
            size="m"
            className={styles.text}
            style={{ textAlign: "right" }}
            highlightRanges={ranges}
          />
        ) : null}
        {textState.status === "loading" ? (
          <Skeleton width="100%" height="3.5rem" radius="sm" />
        ) : null}
        {textState.status === "error" || (textState.status === "success" && text === null) ? (
          <span className={styles.loading}>Teks ayat belum dapat dimuat.</span>
        ) : null}
      </Link>
    </li>
  );
}
