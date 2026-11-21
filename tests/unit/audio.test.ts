import { describe, expect, it } from "vitest";
import {
  AUDIO_HOST,
  DEFAULT_RECITER_ID,
  RECITERS,
  audioUrl,
  estimateSurahBytes,
  getReciter,
  isReciterId,
} from "@/features/audio/reciters";
import {
  REPEAT_MODES,
  cycleRate,
  cycleRepeat,
  isEndOfSurah,
  nextAyah,
  nextInSurah,
  previousAyah,
  repeatLabel,
} from "@/features/audio/playback";
import type { AudioTrack } from "@/features/audio/playback";
import { formatBytes, formatDuration } from "@/features/audio/format";

const PAD3 = (value: number) => String(value).padStart(3, "0");

describe("reciters", () => {
  it("memiliki enam qari di 64 kbps", () => {
    expect(RECITERS).toHaveLength(6);
    for (const reciter of RECITERS) {
      expect(reciter.bitrate).toBe(64);
    }
  });

  it("default adalah Alafasy", () => {
    expect(DEFAULT_RECITER_ID).toBe("alafasy");
    expect(RECITERS.find((reciter) => reciter.id === DEFAULT_RECITER_ID)).toBeTruthy();
  });

  it("isReciterId menolak nilai di luar daftar", () => {
    expect(isReciterId("alafasy")).toBe(true);
    expect(isReciterId("quranenc")).toBe(false);
    expect(isReciterId(undefined)).toBe(false);
    expect(isReciterId(123)).toBe(false);
  });

  it("getReciter mesti id valid dan tidak nol", () => {
    for (const reciter of RECITERS) {
      expect(getReciter(reciter.id).id).toBe(reciter.id);
    }
  });

  it("audioUrl membangun path EveryAyah: {folder}/{surah:3}{ayah:3}.mp3", () => {
    expect(audioUrl("alafasy", 1, 1)).toBe(
      `${AUDIO_HOST}/data/Alafasy_64kbps/${PAD3(1)}${PAD3(1)}.mp3`,
    );
    expect(audioUrl("alafasy", 114, 286)).toBe(
      `${AUDIO_HOST}/data/Alafasy_64kbps/${PAD3(114)}${PAD3(286)}.mp3`,
    );
    expect(audioUrl("shuraym", 2, 255)).toBe(
      `${AUDIO_HOST}/data/Saood_ash-Shuraym_64kbps/${PAD3(2)}${PAD3(255)}.mp3`,
    );
  });

  it("audioUrl menolak surah atau ayah di luar kunci (surah, ayah)", () => {
    expect(() => audioUrl("alafasy", 0, 1)).toThrow(RangeError);
    expect(() => audioUrl("alafasy", 115, 1)).toThrow(RangeError);
    expect(() => audioUrl("alafasy", 1, 0)).toThrow(RangeError);
    expect(() => audioUrl("alafasy", 1.5, 1)).toThrow(RangeError);
    expect(() => audioUrl("alafasy", 1, -1)).toThrow(RangeError);
  });

  it("audioUrl memakai alafasy saat id tidak dikenal", () => {
    expect(audioUrl("terjemahan-only", 1, 1)).toBe(audioUrl(DEFAULT_RECITER_ID, 1, 1));
  });

  it("estimateSurahBytes mengalikan rata-rata KB dengan jumlah ayat", () => {
    const reciter = getReciter("alafasy");
    expect(estimateSurahBytes(reciter, 7)).toBe(reciter.averageAyahKB * 1024 * 7);
    expect(estimateSurahBytes(reciter, 0)).toBe(0);
  });
});

describe("playback", () => {
  const track = (surah: number, ayah: number, ayahCount = 5): AudioTrack => ({
    surah,
    surahName: "Al-Baqarah",
    ayah,
    ayahCount,
  });

  it("nextAyah maju satu dan wrap ke ayat 1 setelah ayat terakhir", () => {
    expect(nextAyah(track(2, 1, 5)).ayah).toBe(2);
    expect(nextAyah(track(2, 5, 5)).ayah).toBe(1);
    expect(nextAyah(track(2, 286, 286)).ayah).toBe(1);
    expect(nextAyah(track(2, 286, 286)).surah).toBe(2);
  });

  it("previousAyah turun dan berhenti di ayat 1", () => {
    expect(previousAyah(track(2, 1, 5)).ayah).toBe(1);
    expect(previousAyah(track(2, 5, 5)).ayah).toBe(4);
  });

  it("isEndOfSurah true saat di ayat terakhir", () => {
    expect(isEndOfSurah(track(2, 1, 5))).toBe(false);
    expect(isEndOfSurah(track(2, 5, 5))).toBe(true);
  });

  it("nextInSurah maju satu dan wrap ke ayat 1", () => {
    expect(nextInSurah(track(2, 1, 5)).ayah).toBe(2);
    expect(nextInSurah(track(2, 5, 5)).ayah).toBe(1);
    expect(nextInSurah(track(2, 5, 5)).surah).toBe(2);
  });

  it("cycleRate mengitari rates dengan terisi 1", () => {
    expect(cycleRate(0.75)).toBe(1);
    expect(cycleRate(1)).toBe(1.25);
    expect(cycleRate(1.25)).toBe(1.5);
    expect(cycleRate(1.5)).toBe(0.75);
  });

  it("cycleRepeat mengitari off -> surah -> one -> off", () => {
    expect(cycleRepeat("off")).toBe("surah");
    expect(cycleRepeat("surah")).toBe("one");
    expect(cycleRepeat("one")).toBe("off");
  });

  it("REPEAT_MODES tetap off/surah/one", () => {
    expect([...REPEAT_MODES]).toEqual(["off", "surah", "one"]);
  });

  it("repeatLabel berbentuk bacaan", () => {
    expect(repeatLabel("one")).toBe("ulangi ayat");
    expect(repeatLabel("surah")).toBe("ulangi surah");
    expect(repeatLabel("off")).toBe("tanpa ulangan");
  });
});

describe("format", () => {
  it("formatBytes membulatkan KB dan MB di >1 KB (lokal Indonesia: koma)", () => {
    expect(formatBytes(0)).toBe("0 KB");
    expect(formatBytes(1024)).toBe("1 KB");
    expect(formatBytes(2048)).toBe("2 KB");
    expect(formatBytes(2.5 * 1024 * 1024)).toBe("2,5 MB");
    expect(formatBytes(1024 * 1024)).toBe("1 MB");
  });

  it("formatDuration memakai format m:ss", () => {
    expect(formatDuration(0)).toBe("0:00");
    expect(formatDuration(65)).toBe("1:05");
    expect(formatDuration(599)).toBe("9:59");
    expect(formatDuration(3600 + 5 * 60 + 2)).toBe("65:02");
  });
});
