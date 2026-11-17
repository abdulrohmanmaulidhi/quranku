import { readFileSync } from "node:fs";
import { join } from "node:path";
import { DATASET_VERSION } from "../../src/lib/data/version";

const DATA_DIR = join(process.cwd(), "public", "data", `v${DATASET_VERSION}`);

export function readDataJson<T>(path: string): T {
  return JSON.parse(readFileSync(join(DATA_DIR, path), "utf8")) as T;
}

export interface SurahSummary {
  n: number;
  name: string;
  nameLatin: string;
  ayahCount: number;
}

export interface SurahText {
  surah: number;
  ayahs: Array<{ n: number; text: string }>;
}

export function readSurahs(): SurahSummary[] {
  return readDataJson<SurahSummary[]>("surahs.json");
}

export function readSurahText(surah: number): SurahText {
  return readDataJson<SurahText>(`ar/${String(surah).padStart(3, "0")}.json`);
}

export interface SurahTranslation {
  surah: number;
  ayahs: Array<{ n: number; text: string; footnotes: string }>;
}

export function readSurahTranslation(surah: number): SurahTranslation {
  return readDataJson<SurahTranslation>(
    `tr/indonesian_affairs/${String(surah).padStart(3, "0")}.json`,
  );
}
