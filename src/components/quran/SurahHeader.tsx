import { StopCircle, PlayCircle } from "lucide-react";
import type { Surah } from "@/lib/data/types";
import { formatAyahCount } from "@/lib/format/number";
import { AudioDownloadControl } from "@/components/audio/AudioDownloadControl";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { useAudio } from "@/features/audio/AudioContext";
import styles from "./SurahHeader.module.css";

export function SurahHeader({ surah }: { surah: Surah }) {
  const { isSurahPlaying, toggleSurahPlay } = useAudio();
  const playing = isSurahPlaying(surah);

  return (
    <header className={styles.header}>
      <p className={styles.arabicName} dir="rtl" lang="ar">
        {surah.name}
      </p>
      <h1 className={styles.nameLatin}>{surah.nameLatin}</h1>
      <p className={styles.meta}>
        {surah.revelationId} · {formatAyahCount(surah.ayahCount)}
      </p>
      <Button
        variant="secondary"
        className={styles.surahPlay}
        onClick={() => toggleSurahPlay(surah)}
        aria-pressed={playing}
      >
        <Icon icon={playing ? StopCircle : PlayCircle} size={16} />
        <span>{playing ? "Berhenti Surah" : "Putar Surah"}</span>
      </Button>
      <AudioDownloadControl surah={surah} />
    </header>
  );
}
