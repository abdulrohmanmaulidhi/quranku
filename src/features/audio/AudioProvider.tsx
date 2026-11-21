import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AudioContext, type AudioContextValue, type AudioStatus } from "./AudioContext";
import { AUDIO_CACHE_NAME, matchCachedAudio } from "./audioCache";
import { isEndOfSurah, nextAyah, nextInSurah, previousAyah, type AudioTrack } from "./playback";
import type { Surah } from "@/lib/data/types";
import { audioUrl, getReciter } from "./reciters";
import { useAudioSettings } from "./useAudioSettings";
import { PlayerBar } from "@/components/audio/PlayerBar";

interface NetworkInformation {
  saveData?: boolean;
  effectiveType?: string;
}

function mediaErrorMessage(error: MediaError | null): string {
  switch (error?.code) {
    case MediaError.MEDIA_ERR_NETWORK:
      return "Audio tidak dapat diunduh. Periksa koneksi Anda.";
    case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
      return "Audio untuk ayat ini tidak tersedia.";
    case MediaError.MEDIA_ERR_DECODE:
      return "Berkas audio tidak dapat dibaca.";
    default:
      return "Audio tidak dapat diputar.";
  }
}

function connectionInfo(): NetworkInformation | undefined {
  return (navigator as Navigator & { connection?: NetworkInformation }).connection;
}

export function AudioProvider({ children }: { children: ReactNode }) {
  const { reciterId, rate, setRate, repeat, setRepeat } = useAudioSettings();
  const reciter = useMemo(() => getReciter(reciterId), [reciterId]);

  const [track, setTrack] = useState<AudioTrack | null>(null);
  const [status, setStatus] = useState<AudioStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [surahMode, setSurahMode] = useState<number | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const trackRef = useRef<AudioTrack | null>(null);
  const statusRef = useRef<AudioStatus>("idle");
  const repeatRef = useRef(repeat);
  const rateRef = useRef(rate);
  const tokenRef = useRef(0);
  const objectUrlRef = useRef<string | null>(null);
  const prefetchRef = useRef<AbortController | null>(null);
  const previousReciterRef = useRef(reciterId);
  const surahModeRef = useRef<number | null>(null);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    surahModeRef.current = surahMode;
  }, [surahMode]);

  useEffect(() => {
    repeatRef.current = repeat;
  }, [repeat]);

  useEffect(() => {
    rateRef.current = rate;
    const audio = audioRef.current;
    if (audio) audio.playbackRate = rate;
  }, [rate]);

  const releaseObjectUrl = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, []);

  const start = useCallback(
    async (next: AudioTrack, fromQueue = false) => {
      if (!fromQueue) setSurahMode(null);
      const audio = audioRef.current;
      if (!audio) return;

      const token = tokenRef.current + 1;
      tokenRef.current = token;
      trackRef.current = next;
      setTrack(next);
      setStatus("loading");
      setError(null);

      const url = audioUrl(reciterId, next.surah, next.ayah);
      let source = url;
      try {
        const cached = await matchCachedAudio(url);
        if (cached) {
          source = URL.createObjectURL(await cached.blob());
        }
      } catch {
        source = url;
      }

      if (token !== tokenRef.current) {
        if (source.startsWith("blob:")) URL.revokeObjectURL(source);
        return;
      }

      releaseObjectUrl();
      if (source.startsWith("blob:")) objectUrlRef.current = source;

      audio.src = source;
      audio.playbackRate = rateRef.current;

      try {
        await audio.play();
      } catch (playError) {
        if (token !== tokenRef.current) return;
        setStatus("paused");
        setError(
          playError instanceof DOMException && playError.name === "NotAllowedError"
            ? "Ketuk putar untuk memulai audio."
            : "Audio tidak dapat diputar.",
        );
      }
    },
    [reciterId, releaseObjectUrl],
  );

  const toggleTrack = useCallback(
    (next: AudioTrack) => {
      const current = trackRef.current;
      const audio = audioRef.current;
      if (current && audio && current.surah === next.surah && current.ayah === next.ayah) {
        if (audio.paused) {
          void audio.play().catch(() => setError("Audio tidak dapat diputar."));
        } else {
          audio.pause();
        }
        return;
      }
      void start(next);
    },
    [start],
  );

  const isCurrent = useCallback(
    (surah: number, ayah: number) => track?.surah === surah && track?.ayah === ayah,
    [track],
  );

  const isSurahPlaying = useCallback((surah: Surah) => {
    return (
      surahModeRef.current === surah.n &&
      trackRef.current?.surah === surah.n &&
      (statusRef.current === "playing" || statusRef.current === "loading")
    );
  }, []);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !trackRef.current) return;
    if (audio.paused) {
      void audio.play().catch(() => setError("Audio tidak dapat diputar."));
    } else {
      audio.pause();
    }
  }, []);

  const next = useCallback(() => {
    const current = trackRef.current;
    if (!current) return;
    if (surahModeRef.current === current.surah) {
      void start(nextInSurah(current), true);
      return;
    }
    void start(nextAyah(current));
  }, [start]);

  const previous = useCallback(() => {
    const current = trackRef.current;
    if (!current) return;
    if (surahModeRef.current === current.surah) {
      void start(previousAyah(current), true);
      return;
    }
    void start(previousAyah(current));
  }, [start]);

  const stop = useCallback(() => {
    tokenRef.current += 1;
    prefetchRef.current?.abort();
    prefetchRef.current = null;
    trackRef.current = null;
    setSurahMode(null);
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    }
    releaseObjectUrl();
    setTrack(null);
    setStatus("idle");
    setError(null);
  }, [releaseObjectUrl]);

  const toggleSurahPlay = useCallback(
    (surah: Surah) => {
      const current = trackRef.current;
      const audio = audioRef.current;
      if (
        surahModeRef.current === surah.n &&
        current?.surah === surah.n &&
        statusRef.current === "playing" &&
        audio?.paused === false
      ) {
        void stop();
        return;
      }
      setSurahMode(surah.n);
      void start(
        {
          surah: surah.n,
          surahName: surah.nameLatin,
          ayah: 1,
          ayahCount: surah.ayahCount,
        },
        true,
      );
    },
    [start, stop],
  );

  const handleEnded = useCallback(() => {
    const current = trackRef.current;
    if (!current) return;

    if (surahModeRef.current === current.surah) {
      if (isEndOfSurah(current)) {
        setStatus("paused");
        return;
      }
      void start(nextInSurah(current), true);
      return;
    }

    if (repeatRef.current === "one") {
      void start(current);
      return;
    }
    if (current.ayah < current.ayahCount) {
      void start({ ...current, ayah: current.ayah + 1 });
      return;
    }
    if (repeatRef.current === "surah") {
      void start({ ...current, ayah: 1 });
      return;
    }
    setStatus("paused");
  }, [start]);

  // Ganti qari saat audio aktif: muat ulang ayat yang sama dengan suara baru.
  useEffect(() => {
    if (previousReciterRef.current === reciterId) return;
    previousReciterRef.current = reciterId;
    const current = trackRef.current;
    if (!current) return;
    if (statusRef.current === "playing" || statusRef.current === "loading") {
      void start(current);
    }
  }, [reciterId, start]);

  // Duga ayat berikutnya agar jeda antar-ayat pendek, kecuali pada koneksi
  // hemat data.
  useEffect(() => {
    if (status !== "playing" || !track || track.ayah >= track.ayahCount) return;
    const connection = connectionInfo();
    if (connection?.saveData) return;
    if (connection?.effectiveType && connection.effectiveType.includes("2g")) return;

    const controller = new AbortController();
    prefetchRef.current = controller;
    const url = audioUrl(reciterId, track.surah, track.ayah + 1);

    void (async () => {
      try {
        if (typeof caches !== "undefined") {
          const cache = await caches.open(AUDIO_CACHE_NAME);
          if (await cache.match(url)) return;
        }
        await fetch(url, { signal: controller.signal });
      } catch {
        // Pratinjau bersifat oportunistik; kegagalan tidak memengaruhi pemutaran.
      }
    })();

    return () => controller.abort();
  }, [status, track, reciterId]);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--player-offset",
      track ? "var(--player-height)" : "0px",
    );
    return () => {
      document.documentElement.style.removeProperty("--player-offset");
    };
  }, [track]);

  useEffect(() => {
    const audio = audioRef.current;
    return () => {
      audio?.pause();
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    if (!track) {
      navigator.mediaSession.metadata = null;
      return;
    }
    navigator.mediaSession.metadata = new MediaMetadata({
      title: `${track.surahName} · Ayat ${track.ayah}`,
      artist: reciter.name,
      album: "Al-Qur'an",
      artwork: [
        { src: "/icons/pwa-192x192.png", sizes: "192x192", type: "image/png" },
        { src: "/icons/pwa-512x512.png", sizes: "512x512", type: "image/png" },
      ],
    });
  }, [track, reciter]);

  // Sinkronkan posisi Media Session ke elemen audio (durasi, posisi, kecepatan).
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!("mediaSession" in navigator)) return;
    const sync = () => {
      navigator.mediaSession.setPositionState({
        duration: Number.isFinite(audio.duration) ? audio.duration : 0,
        playbackRate: audio.playbackRate,
        position: Number.isFinite(audio.currentTime) ? audio.currentTime : 0,
      });
    };
    audio.addEventListener("timeupdate", sync);
    audio.addEventListener("durationchange", sync);
    audio.addEventListener("loadedmetadata", sync);
    audio.addEventListener("play", sync);
    audio.addEventListener("pause", sync);
    return () => {
      audio.removeEventListener("timeupdate", sync);
      audio.removeEventListener("durationchange", sync);
      audio.removeEventListener("loadedmetadata", sync);
      audio.removeEventListener("play", sync);
      audio.removeEventListener("pause", sync);
    };
  }, []);

  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    const session = navigator.mediaSession;

    const handlers: Array<[MediaSessionAction, MediaSessionActionHandler | null]> = [
      ["play", () => void audioRef.current?.play()],
      ["pause", () => audioRef.current?.pause()],
      ["previoustrack", previous],
      ["nexttrack", next],
      ["stop", stop],
      [
        "seekto",
        (details) => {
          const audio = audioRef.current;
          if (!audio) return;
          if (typeof details.seekTime === "number" && Number.isFinite(details.seekTime)) {
            const duration = Number.isFinite(audio.duration)
              ? audio.duration
              : Number.POSITIVE_INFINITY;
            audio.currentTime = Math.min(Math.max(details.seekTime, 0), duration);
            return;
          }
          if (typeof details.seekOffset === "number" && Number.isFinite(details.seekOffset)) {
            const duration = Number.isFinite(audio.duration)
              ? audio.duration
              : Number.POSITIVE_INFINITY;
            audio.currentTime = Math.min(
              Math.max(audio.currentTime + details.seekOffset, 0),
              duration,
            );
          }
        },
      ],
    ];

    for (const [action, handler] of handlers) {
      try {
        session.setActionHandler(action, handler);
      } catch {
        // Sebagian peramban tidak mendukung semua aksi.
      }
    }

    return () => {
      for (const [action] of handlers) {
        try {
          session.setActionHandler(action, null);
        } catch {
          // abaikan
        }
      }
    };
  }, [next, previous, stop]);

  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    navigator.mediaSession.playbackState =
      status === "playing" ? "playing" : status === "paused" ? "paused" : "none";
  }, [status]);

  const value = useMemo<AudioContextValue>(
    () => ({
      track,
      status,
      error,
      rate,
      repeat,
      reciter,
      surahMode,
      isCurrent,
      isSurahPlaying,
      toggleTrack,
      toggleSurahPlay,
      toggle,
      next,
      previous,
      stop,
      setRate,
      setRepeat,
      getElement: () => audioRef.current,
    }),
    [
      track,
      status,
      error,
      rate,
      repeat,
      reciter,
      surahMode,
      isCurrent,
      isSurahPlaying,
      toggleTrack,
      toggleSurahPlay,
      toggle,
      next,
      previous,
      stop,
      setRate,
      setRepeat,
    ],
  );

  return (
    <AudioContext.Provider value={value}>
      {children}
      <audio
        ref={audioRef}
        preload="auto"
        hidden
        aria-label={track ? `Audio: ${track.surahName} · Ayat ${track.ayah}` : "Pemutar audio"}
        onPlay={() => {
          setStatus("playing");
          setError(null);
        }}
        onPause={() => {
          if (!trackRef.current) return;
          setStatus((current) => (current === "playing" ? "paused" : current));
        }}
        onEnded={handleEnded}
        onError={() => {
          const audio = audioRef.current;
          setStatus("error");
          setError(mediaErrorMessage(audio?.error ?? null));
        }}
      />
      <PlayerBar />
    </AudioContext.Provider>
  );
}
