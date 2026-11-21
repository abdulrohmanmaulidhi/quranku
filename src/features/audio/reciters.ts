/**
 * Daftar qari untuk pemutar audio.
 *
 * Berkas audio dialirkan langsung dari EveryAyah.com, tidak dihosting ulang.
 * `averageAyahKB` hanya dipakai untuk perkiraan ukuran unduhan; nilainya
 * diukur dari sampel delapan ayat per qari (2026-11-21).
 */
export interface Reciter {
  id: string;
  folder: string;
  name: string;
  arabicName: string;
  style: string;
  bitrate: number;
  averageAyahKB: number;
}

export const AUDIO_HOST = "https://everyayah.com";
export const DEFAULT_RECITER_ID = "alafasy";

const RECITER_LIST = [
  {
    id: "alafasy",
    folder: "Alafasy_64kbps",
    name: "Mishary Rashid Alafasy",
    arabicName: "مشاري راشد العفاسي",
    style: "Murattal",
    bitrate: 64,
    averageAyahKB: 106,
  },
  {
    id: "abdulbasit",
    folder: "Abdul_Basit_Murattal_64kbps",
    name: "Abdul Basit Abdul Samad",
    arabicName: "عبد الباسط عبد الصمد",
    style: "Murattal",
    bitrate: 64,
    averageAyahKB: 100,
  },
  {
    id: "husary",
    folder: "Husary_64kbps",
    name: "Mahmoud Khalil Al-Husary",
    arabicName: "محمود خليل الحصري",
    style: "Murattal",
    bitrate: 64,
    averageAyahKB: 120,
  },
  {
    id: "sudais",
    folder: "Abdurrahmaan_As-Sudais_64kbps",
    name: "Abdur-Rahman As-Sudais",
    arabicName: "عبد الرحمن السديس",
    style: "Murattal",
    bitrate: 64,
    averageAyahKB: 73,
  },
  {
    id: "maher",
    folder: "Maher_AlMuaiqly_64kbps",
    name: "Maher Al-Muaiqly",
    arabicName: "ماهر المعيقلي",
    style: "Murattal",
    bitrate: 64,
    averageAyahKB: 80,
  },
  {
    id: "shuraym",
    folder: "Saood_ash-Shuraym_64kbps",
    name: "Saud Ash-Shuraym",
    arabicName: "سعود الشريم",
    style: "Murattal",
    bitrate: 64,
    averageAyahKB: 70,
  },
] as const satisfies readonly Reciter[];

export type ReciterId = (typeof RECITER_LIST)[number]["id"];

export const RECITERS: readonly Reciter[] = RECITER_LIST;

const pad3 = (value: number): string => String(value).padStart(3, "0");

export function isReciterId(value: unknown): value is ReciterId {
  return typeof value === "string" && RECITER_LIST.some((reciter) => reciter.id === value);
}

export function getReciter(id: unknown): Reciter {
  return RECITER_LIST.find((reciter) => reciter.id === id) ?? RECITER_LIST[0];
}

/** Alamat berkas audio per ayat. Offset mengikuti kunci (surah, ayat), bukan teks. */
export function audioUrl(reciterId: string, surah: number, ayah: number): string {
  if (!Number.isInteger(surah) || surah < 1 || surah > 114) {
    throw new RangeError(`Nomor surah tidak valid: ${surah}`);
  }
  if (!Number.isInteger(ayah) || ayah < 1) {
    throw new RangeError(`Nomor ayat tidak valid: ${ayah}`);
  }
  const reciter = getReciter(reciterId);
  return `${AUDIO_HOST}/data/${reciter.folder}/${pad3(surah)}${pad3(ayah)}.mp3`;
}

/** Perkiraan ukuran satu surah, dipakai hanya sebagai label "±". */
export function estimateSurahBytes(reciter: Reciter, ayahCount: number): number {
  return reciter.averageAyahKB * 1024 * Math.max(0, ayahCount);
}
