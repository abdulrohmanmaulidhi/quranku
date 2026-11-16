import { describe, expect, it } from "vitest";
import { formatDate } from "@/lib/format/date";
import { formatAyahCount, formatNumber, formatSurahPosition } from "@/lib/format/number";
import { formatReference } from "@/lib/format/reference";

describe("formatNumber", () => {
  it("memakai pemisah ribuan Indonesia", () => {
    expect(formatNumber(6236)).toBe("6.236");
    expect(formatNumber(7)).toBe("7");
  });

  it("memformat jumlah ayat", () => {
    expect(formatAyahCount(7)).toBe("7 ayat");
    expect(formatAyahCount(286)).toBe("286 ayat");
  });

  it("memformat posisi surah", () => {
    expect(formatSurahPosition(5)).toBe("Surah ke-5");
  });
});

describe("formatReference", () => {
  it("memakai format QS. Nama Surah Nomor:Ayat", () => {
    expect(formatReference("Al-Kahf", 18, 10)).toBe("QS. Al-Kahf 18:10");
    expect(formatReference("Al-Faatiha", 1, 1)).toBe("QS. Al-Faatiha 1:1");
  });
});

describe("formatDate", () => {
  it("memakai nama bulan Indonesia", () => {
    expect(formatDate(new Date("2026-11-15T12:00:00Z"))).toBe("15 November 2026");
  });
});
