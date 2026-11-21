import type { Surah } from "@/lib/data/types";
import { formatAyahCount } from "@/lib/format/number";
import { AudioDownloadControl } from "@/components/audio/AudioDownloadControl";
import styles from "./SurahHeader.module.css";

export function SurahHeader({ surah }: { surah: Surah }) {
  return (
    <header className={styles.header}>
      <p className={styles.arabicName} dir="rtl" lang="ar">
        {surah.name}
      </p>
      <h1 className={styles.nameLatin}>{surah.nameLatin}</h1>
      <p className={styles.meta}>
        {surah.revelationId} · {formatAyahCount(surah.ayahCount)}
      </p>
      <AudioDownloadControl surah={surah} />
    </header>
  );
}
