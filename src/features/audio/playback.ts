export interface AudioTrack {
  surah: number;
  surahName: string;
  ayah: number;
  ayahCount: number;
}

export const AUDIO_RATES = [0.75, 1, 1.25, 1.5] as const;
export type AudioRate = (typeof AUDIO_RATES)[number];

export const REPEAT_MODES = ["off", "surah", "one"] as const;
export type RepeatMode = (typeof REPEAT_MODES)[number];

export function isAudioRate(value: unknown): value is AudioRate {
  return typeof value === "number" && (AUDIO_RATES as readonly number[]).includes(value);
}

export function isRepeatMode(value: unknown): value is RepeatMode {
  return typeof value === "string" && (REPEAT_MODES as readonly string[]).includes(value);
}

export function cycleRate(rate: AudioRate): AudioRate {
  const index = AUDIO_RATES.indexOf(rate);
  return AUDIO_RATES[(index + 1) % AUDIO_RATES.length] ?? 1;
}

export function cycleRepeat(mode: RepeatMode): RepeatMode {
  const index = REPEAT_MODES.indexOf(mode);
  return REPEAT_MODES[(index + 1) % REPEAT_MODES.length] ?? "off";
}

/** Ayat berikutnya di dalam surah; kembali ke ayat 1 setelah ayat terakhir. */
export function nextAyah(track: AudioTrack): AudioTrack {
  const ayah = track.ayah >= track.ayahCount ? 1 : track.ayah + 1;
  return { ...track, ayah };
}

/** Ayat sebelumnya; berhenti di ayat 1. */
export function previousAyah(track: AudioTrack): AudioTrack {
  return { ...track, ayah: Math.max(1, track.ayah - 1) };
}

/** true jika urutan di akhir surah. */
export function isEndOfSurah(track: AudioTrack): boolean {
  return track.ayah >= track.ayahCount;
}

/** Menormalisasi nilai volume ke [0, 1]. Non-angka/negatif/di atas 1 → bawaan. */
export function normalizeVolume(value: number): number {
  if (!Number.isFinite(value)) return 1;
  return Math.min(1, Math.max(0, value));
}

/** Ayat berikut dalam surah yang sama; wrap ke ayat 1 setelah terakhir. */
export function nextInSurah(track: AudioTrack): AudioTrack {
  if (track.ayah >= track.ayahCount) return { ...track, ayah: 1 };
  return { ...track, ayah: track.ayah + 1 };
}

export function repeatLabel(mode: RepeatMode): string {
  if (mode === "one") return "ulangi ayat";
  if (mode === "surah") return "ulangi surah";
  return "tanpa ulangan";
}
