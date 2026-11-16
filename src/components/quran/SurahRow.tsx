import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import type { Surah } from "@/lib/data/types";
import { formatAyahCount } from "@/lib/format/number";
import styles from "./ListRow.module.css";

export function SurahRow({ surah }: { surah: Surah }) {
  const location = useLocation();
  const from = `${location.pathname}${location.search}`;

  return (
    <li className={styles.item}>
      <Link to={`/surah/${surah.n}`} state={{ from }} className={styles.row}>
        <span className={styles.number}>{surah.n}</span>
        <span className={styles.body}>
          <span className={styles.title}>{surah.nameLatin}</span>
          <span className={styles.meta}>
            {surah.revelationId} · {formatAyahCount(surah.ayahCount)}
          </span>
        </span>
        <span className={styles.arabic} dir="rtl" lang="ar">
          {surah.name}
        </span>
      </Link>
    </li>
  );
}
