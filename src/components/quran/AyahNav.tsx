import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { Surah } from "@/lib/data/types";
import { Icon } from "@/components/ui/Icon";
import styles from "./AyahNav.module.css";

export interface AyahNavProps {
  previous: Surah | null;
  next: Surah | null;
  from: string;
}

export function AyahNav({ previous, next, from }: AyahNavProps) {
  return (
    <nav className={styles.nav} aria-label="Navigasi surah">
      {previous ? (
        <Link to={`/surah/${previous.n}`} state={{ from }} className={styles.link}>
          <span className={styles.direction}>
            <Icon icon={ArrowLeft} size={18} />
            Surah sebelumnya
          </span>
          <span className={styles.name}>{previous.nameLatin}</span>
          <span className={styles.meta}>Surah {previous.n}</span>
        </Link>
      ) : (
        <span className={styles.disabled} aria-disabled="true">
          <span className={styles.direction}>
            <Icon icon={ArrowLeft} size={18} />
            Surah sebelumnya
          </span>
          <span className={styles.name}>Tidak ada</span>
        </span>
      )}

      {next ? (
        <Link
          to={`/surah/${next.n}`}
          state={{ from }}
          className={[styles.link, styles.next].join(" ")}
        >
          <span className={styles.direction}>
            Surah berikutnya
            <Icon icon={ArrowRight} size={18} />
          </span>
          <span className={styles.name}>{next.nameLatin}</span>
          <span className={styles.meta}>Surah {next.n}</span>
        </Link>
      ) : (
        <span className={[styles.disabled, styles.next].join(" ")} aria-disabled="true">
          <span className={styles.direction}>
            Surah berikutnya
            <Icon icon={ArrowRight} size={18} />
          </span>
          <span className={styles.name}>Tidak ada</span>
        </span>
      )}
    </nav>
  );
}
