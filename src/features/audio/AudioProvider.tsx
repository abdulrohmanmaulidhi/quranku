import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AudioContext, type AudioContextValue, type AudioStatus } from "./AudioContext";
import { AUDIO_CACHE_NAME, matchCachedAudio } from "./audioCache";
import { nextAyah, previousAyah, type AudioTrack } from "./playback";
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

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const trackRef = useRef<AudioTrack | null>(null);
  const statusRef = useRef<AudioStatus>("idle");
  const repeatRef = useRef(repeat);
  const rateRef = useRef(rate);
  const tokenRef = useRef(0);
  const objectUrlRef = useRef<string | null>(null);
  const prefetchRef = useRef<AbortController | null>(null);
  const previousReciterRef = useRef(reciterId);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

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
    async (next: AudioTrack) => {
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
    if (current) void start(nextAyah(current));
  }, [start]);

  const previous = useCallback(() => {
    const current = trackRef.current;
    if (current) void start(previousAyah(current));
  }, [start]);

  const stop = useCallback(() => {
    tokenRef.current += 1;
    prefetchRef.current?.abort();
    prefetchRef.current = null;
    trackRef.current = null;
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

  const handleEnded = useCallback(() => {
    const current = trackRef.current;
    if (!current) return;

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

  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    const session = navigator.mediaSession;

    const handlers: Array<[MediaSessionAction, MediaSessionActionHandler | null]> = [
      ["play", () => void audioRef.current?.play()],
      ["pause", () => audioRef.current?.pause()],
      ["previoustrack", previous],
      ["nexttrack", next],
      ["stop", stop],
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
      isCurrent: (surah, ayah) => track?.surah === surah && track?.ayah === ayah,
      toggleTrack,
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
      toggleTrack,
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
