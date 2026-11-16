import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Juz, Manifest, Surah, SurahText } from "@/lib/data/types";

const DATA_DIR = join(process.cwd(), "public", "data", "v1");

export function readDataJson<T>(path: string): T {
  return JSON.parse(readFileSync(join(DATA_DIR, path), "utf8")) as T;
}

export function readManifest(): Manifest {
  return readDataJson<Manifest>("manifest.json");
}

export function readSurahs(): Surah[] {
  return readDataJson<Surah[]>("surahs.json");
}

export function readJuz(): Juz[] {
  return readDataJson<Juz[]>("juz.json");
}

export function readSurahText(surah: number): SurahText {
  return readDataJson<SurahText>(`ar/${String(surah).padStart(3, "0")}.json`);
}

export interface SearchIndexFile {
  schemaVersion: number;
  datasetVersion: string;
  entries: Array<[surah: number, ayah: number, normalized: string]>;
}

export function readSearchIndex(): SearchIndexFile {
  return readDataJson<SearchIndexFile>("search/arabic.json");
}

export function jsonResponse(value: unknown): Response {
  return {
    ok: true,
    status: 200,
    statusText: "OK",
    json: async () => value,
  } as Response;
}
