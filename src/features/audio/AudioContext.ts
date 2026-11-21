import { createContext, useContext } from "react";
import type { AudioRate, AudioTrack, RepeatMode } from "./playback";
import type { Surah } from "@/lib/data/types";
import { DEFAULT_RECITER_ID, getReciter, type Reciter } from "./reciters";

export type AudioStatus = "idle" | "loading" | "playing" | "paused" | "error";

export interface AudioContextValue {
  track: AudioTrack | null;
  status: AudioStatus;
  error: string | null;
  rate: AudioRate;
  repeat: RepeatMode;
  reciter: Reciter;
  /** Nomor surah yang sedang dimainkan dengan "Putar Surah"; null kalau tidak. */
  surahMode: number | null;
  volume: number;
  muted: boolean;
  isCurrent: (surah: number, ayah: number) => boolean;
  isSurahPlaying: (surah: Surah) => boolean;
  toggleTrack: (track: AudioTrack) => void;
  toggleSurahPlay: (surah: Surah) => void;
  toggle: () => void;
  next: () => void;
  previous: () => void;
  stop: () => void;
  setRate: (rate: AudioRate) => void;
  setRepeat: (repeat: RepeatMode) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  getElement: () => HTMLAudioElement | null;
}

const noop = () => undefined;

/**
 * Nilai bawaan membuat komponen yang memakai `useAudio` tetap dapat dirender
 * tanpa provider (mis. unit test halaman). Pemutar sungguhan hanya ada saat
 * `AudioProvider` terpasang di RootLayout.
 */
const defaultValue: AudioContextValue = {
  track: null,
  status: "idle",
  error: null,
  rate: 1,
  repeat: "off",
  surahMode: null,
  volume: 1,
  muted: false,
  reciter: getReciter(DEFAULT_RECITER_ID),
  isCurrent: () => false,
  isSurahPlaying: () => false,
  toggleTrack: noop,
  toggleSurahPlay: noop,
  toggle: noop,
  next: noop,
  previous: noop,
  stop: noop,
  setRate: noop,
  setRepeat: noop,
  setVolume: noop,
  toggleMute: noop,
  getElement: () => null,
};

export const AudioContext = createContext<AudioContextValue>(defaultValue);

export function useAudio(): AudioContextValue {
  return useContext(AudioContext);
}
