import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Download } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import {
  AudioCacheError,
  deleteSurahAudio,
  downloadSurahAudio,
  getSurahAudioStatus,
  type SurahAudioStatus,
} from "@/features/audio/audioCache";
import { formatBytes } from "@/features/audio/format";
import { estimateSurahBytes, getReciter } from "@/features/audio/reciters";
import { useAudioSettings } from "@/features/audio/useAudioSettings";
import { useOnlineStatus } from "@/lib/useOnlineStatus";
import type { Surah } from "@/lib/data/types";
import styles from "./AudioDownloadControl.module.css";

type Mode = "checking" | "idle" | "ready" | "error" | "downloading";

export function AudioDownloadControl({ surah }: { surah: Surah }) {
  const { reciterId } = useAudioSettings();
  const reciter = getReciter(reciterId);
  const online = useOnlineStatus();
  const abortRef = useRef<AbortController | null>(null);

  const currentKey = `${reciter.id}:${surah.n}:${surah.ayahCount}`;
  const [value, setValue] = useState<SurahAudioStatus | null>(null);
  const [checkedKey, setCheckedKey] = useState<string | null>(null);
  const [download, setDownload] = useState<{ completed: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mode: Mode = download
    ? "downloading"
    : error
      ? "error"
      : checkedKey === currentKey && value
        ? value.complete
          ? "ready"
          : "idle"
        : "checking";

  const setChecked = useCallback(
    (status: SurahAudioStatus) => {
      setValue(status);
      setCheckedKey(currentKey);
    },
    [currentKey],
  );

  useEffect(() => {
    let cancelled = false;
    void getSurahAudioStatus(reciter.id, surah.n, surah.ayahCount).then((status) => {
      if (cancelled) return;
      setChecked(status);
    });
    return () => {
      cancelled = true;
      abortRef.current?.abort();
    };
  }, [currentKey, reciter.id, surah.ayahCount, surah.n, setChecked]);

  const start = async () => {
    const controller = new AbortController();
    abortRef.current = controller;
    setDownload({ completed: 0, total: surah.ayahCount });
    setError(null);

    try {
      const result = await downloadSurahAudio({
        reciterId: reciter.id,
        surah: surah.n,
        ayahCount: surah.ayahCount,
        signal: controller.signal,
        onProgress: ({ completed, total }) => {
          setDownload({ completed, total });
        },
      });

      if (result.failed.length > 0) {
        setError(`${result.failed.length} ayat gagal diunduh. Coba lagi.`);
        return;
      }
      setChecked({ cached: result.downloaded, total: result.downloaded, complete: true });
    } catch (error) {
      if (error instanceof AudioCacheError && error.kind === "aborted") {
        return;
      }
      setError(error instanceof AudioCacheError ? error.message : "Audio tidak dapat diunduh.");
    } finally {
      abortRef.current = null;
      setDownload(null);
    }
  };

  const remove = async () => {
    setError(null);
    setValue(null);
    setCheckedKey(null);
    try {
      await deleteSurahAudio(reciter.id, surah.n);
      void getSurahAudioStatus(reciter.id, surah.n, surah.ayahCount).then((status) => {
        setChecked(status);
      });
    } catch {
      setError("Audio tersimpan tidak dapat dihapus.");
    }
  };

  const estimate = formatBytes(estimateSurahBytes(reciter, surah.ayahCount));

  if (mode === "downloading") {
    const percent =
      (download?.total ?? 0) === 0
        ? 0
        : Math.round(((download?.completed ?? 0) / (download?.total ?? 0)) * 100);
    return (
      <div className={styles.control}>
        <span className={styles.status} role="status">
          Mengunduh audio… {download?.completed ?? 0} dari {download?.total ?? 0} ayat ({percent}%)
        </span>
        <Button variant="ghost" onClick={() => abortRef.current?.abort()}>
          Batal
        </Button>
      </div>
    );
  }

  if (mode === "ready") {
    return (
      <div className={styles.control}>
        <span className={styles.status}>
          <Icon icon={Check} size={16} />
          Audio tersimpan · {value?.cached ?? 0} ayat
        </span>
        <Button variant="ghost" onClick={() => void remove()}>
          Hapus
        </Button>
      </div>
    );
  }

  if (mode === "error") {
    return (
      <div className={styles.control}>
        <span className={[styles.status, styles.error].filter(Boolean).join(" ")} role="status">
          {error}
        </span>
        <Button variant="ghost" onClick={() => void start()} disabled={!online}>
          Coba lagi
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.control}>
      <Button
        variant="secondary"
        onClick={() => void start()}
        disabled={!online || mode === "checking"}
      >
        <Icon icon={Download} size={18} />
        <span>
          {mode === "checking"
            ? "Memeriksa audio…"
            : online
              ? `Unduh audio · ±${estimate}`
              : "Butuh internet untuk mengunduh audio"}
        </span>
      </Button>
    </div>
  );
}
