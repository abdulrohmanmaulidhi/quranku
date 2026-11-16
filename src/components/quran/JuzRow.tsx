import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import type { Juz, Surah } from "@/lib/data/types";
import { formatReference } from "@/lib/format/reference";
import { Icon } from "@/components/ui/Icon";
import styles from "./ListRow.module.css";

export function JuzRow({ juz, surahs }: { juz: Juz; surahs: readonly Surah[] }) {
  const location = useLocation();
  const from = `${location.pathname}${location.search}`;
  const start = surahs[juz.start.surah - 1];
  const startName = start?.nameLatin ?? `Surah ${juz.start.surah}`;

  return (
    <li className={styles.item}>
      <Link
        to={`/surah/${juz.start.surah}?ayah=${juz.start.ayah}`}
        state={{ from }}
        className={styles.row}
      >
        <span className={styles.number}>{juz.juz}</span>
        <span className={styles.body}>
          <span className={styles.title}>Juz {juz.juz}</span>
          <span className={styles.meta}>
            Mulai {formatReference(startName, juz.start.surah, juz.start.ayah)}
          </span>
        </span>
        <span className={styles.chevron}>
          <Icon icon={ChevronRight} size={18} />
        </span>
      </Link>
    </li>
  );
}
