import { useEffect, useState } from "react";
import {
  Loader2,
  Pause,
  Play,
  Repeat,
  Repeat1,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { useMatch } from "react-router-dom";
import { IconButton } from "@/components/ui/IconButton";
import { Icon } from "@/components/ui/Icon";
import { useAudio } from "@/features/audio/AudioContext";
import { cycleRate, cycleRepeat, repeatLabel } from "@/features/audio/playback";
import { formatDuration } from "@/features/audio/format";
import styles from "./PlayerBar.module.css";

export function PlayerBar() {
  const {
    track,
    status,
    error,
    rate,
    repeat,
    reciter,
    toggle,
    next,
    previous,
    stop,
    setRate,
    setRepeat,
    muted,
    toggleMute,
    getElement,
  } = useAudio();
  const isReader = useMatch("/surah/:surah/*") !== null;
  const [position, setPosition] = useState<{
    key: string;
    current: number;
    duration: number;
  }>({ key: "", current: 0, duration: 0 });

  const trackKey = track ? `${track.surah}:${track.ayah}` : "";
  const active = Boolean(track) && position.key === trackKey;
  const current = active ? position.current : 0;
  const duration = active ? position.duration : 0;

  useEffect(() => {
    const audio = getElement();
    if (!audio || !track) return;

    const update = () => {
      setPosition({
        key: trackKey,
        current: Number.isFinite(audio.currentTime) ? audio.currentTime : 0,
        duration: Number.isFinite(audio.duration) ? audio.duration : 0,
      });
    };

    audio.addEventListener("timeupdate", update);
    audio.addEventListener("durationchange", update);
    audio.addEventListener("loadedmetadata", update);
    return () => {
      audio.removeEventListener("timeupdate", update);
      audio.removeEventListener("durationchange", update);
      audio.removeEventListener("loadedmetadata", update);
    };
  }, [getElement, track, trackKey]);

  if (!track) return null;

  const percent = duration > 0 ? Math.min(100, Math.max(0, (current / duration) * 100)) : 0;
  const playing = status === "playing";
  const loading = status === "loading";
  const announcement = `${loading ? "Memuat audio" : "Memutar"} ${track.surahName}, ayat ${track.ayah}.`;

  const statusText =
    error ?? `${reciter.name} · ${formatDuration(current)} / ${formatDuration(duration)}`;

  return (
    <div className={styles.bar} data-reader={isReader} role="region" aria-label="Pemutar audio">
      <div
        className={styles.progress}
        role="progressbar"
        aria-label="Kemajuan ayat"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(percent)}
        aria-valuetext={`${formatDuration(current)} dari ${formatDuration(duration)}`}
      >
        <span className={styles.progressFill} style={{ width: `${percent}%` }} />
      </div>

      <div className={styles.inner}>
        <div className={styles.head}>
          <div className={styles.meta}>
            <p className={styles.title}>
              {track.surahName} · Ayat {track.ayah}
            </p>
            <p className={[styles.subtitle, error ? styles.error : ""].filter(Boolean).join(" ")}>
              {loading ? "Memuat audio…" : statusText}
            </p>
          </div>
          <IconButton icon={X} label="Tutup pemutar" onClick={stop} iconSize={18} />
        </div>

        <div className={styles.controls}>
          <button
            type="button"
            className={[styles.option, repeat !== "off" ? styles.optionActive : ""]
              .filter(Boolean)
              .join(" ")}
            aria-label={`Ulangan: ${repeatLabel(repeat)}. Ketuk untuk mengubah.`}
            onClick={() => setRepeat(cycleRepeat(repeat))}
          >
            <Icon icon={repeat === "one" ? Repeat1 : Repeat} size={20} />
          </button>
          <IconButton
            icon={SkipBack}
            label="Ayat sebelumnya"
            onClick={previous}
            disabled={track.ayah <= 1}
          />
          <button
            type="button"
            className={styles.play}
            aria-label={loading ? "Memuat audio…" : playing ? "Jeda" : "Putar"}
            onClick={toggle}
          >
            {loading ? (
              <span className={styles.spin}>
                <Icon icon={Loader2} size={24} />
              </span>
            ) : (
              <Icon icon={playing ? Pause : Play} size={24} filled={playing} />
            )}
          </button>
          <IconButton
            icon={SkipForward}
            label="Ayat berikutnya"
            onClick={next}
            disabled={track.ayah >= track.ayahCount}
          />
          <button
            type="button"
            className={styles.option}
            aria-label={`Kecepatan ${rate} kali. Ketuk untuk mengubah.`}
            onClick={() => setRate(cycleRate(rate))}
          >
            <span className={styles.rate}>{rate}×</span>
          </button>
          <button
            type="button"
            className={styles.option}
            aria-label={muted ? "Suara dimatikan" : "Matikan suara"}
            aria-pressed={muted}
            onClick={toggleMute}
          >
            <Icon icon={muted ? VolumeX : Volume2} size={20} filled={muted} />
          </button>
        </div>
      </div>

      <span className="sr-only" aria-live="polite">
        {announcement}
      </span>
    </div>
  );
}
