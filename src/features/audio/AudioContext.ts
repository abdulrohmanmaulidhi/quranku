import { createContext, useContext } from "react";
import type { AudioRate, AudioTrack, RepeatMode } from "./playback";
import { DEFAULT_RECITER_ID, getReciter, type Reciter } from "./reciters";

export type AudioStatus = "idle" | "loading" | "playing" | "paused" | "error";

export interface AudioContextValue {
  track: AudioTrack | null;
  status: AudioStatus;
  error: string | null;
  rate: AudioRate;
  repeat: RepeatMode;
  reciter: Reciter;
  isCurrent: (surah: number, ayah: number) => boolean;
  toggleTrack: (track: AudioTrack) => void;
  toggle: () => void;
  next: () => void;
  previous: () => void;
  stop: () => void;
  setRate: (rate: AudioRate) => void;
  setRepeat: (repeat: RepeatMode) => void;
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
  reciter: getReciter(DEFAULT_RECITER_ID),
  isCurrent: () => false,
  toggleTrack: noop,
  toggle: noop,
  next: noop,
  previous: noop,
  stop: noop,
  setRate: noop,
  setRepeat: noop,
  getElement: () => null,
};

export const AudioContext = createContext<AudioContextValue>(defaultValue);

export function useAudio(): AudioContextValue {
  return useContext(AudioContext);
}
