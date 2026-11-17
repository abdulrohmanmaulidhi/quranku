import { readFileSync } from "node:fs";
import { join } from "node:path";
import { DATASET_VERSION } from "@/lib/data/version";
import type { Juz, Manifest, Surah, SurahText } from "@/lib/data/types";

const DATA_DIR = join(process.cwd(), "public", "data", `v${DATASET_VERSION}`);
const DATA_URL_PREFIX = `/data/v${DATASET_VERSION}/`;

export function readDataJson<T>(path: string): T {
  return JSON.parse(readFileSync(join(DATA_DIR, path), "utf8")) as T;
}

/** Membaca berkas data yang diminta lewat URL, untuk mock `fetch` di unit test. */
export function readDataFileForUrl(input: RequestInfo | URL): string {
  const url = new URL(String(input), "http://localhost");
  const index = url.pathname.indexOf(DATA_URL_PREFIX);
  if (index === -1) throw new Error(`Alamat data tidak dikenal: ${url.pathname}`);
  return readFileSync(join(DATA_DIR, url.pathname.slice(index + DATA_URL_PREFIX.length)), "utf8");
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

export interface SurahTranslation {
  surah: number;
  ayahs: Array<{ n: number; text: string; footnotes: string }>;
}

export function readSurahTranslation(surah: number): SurahTranslation {
  return readDataJson<SurahTranslation>(
    `tr/indonesian_affairs/${String(surah).padStart(3, "0")}.json`,
  );
}

export function readTranslationSource(): {
  version: string;
  entries: Array<{ surah: number; ayah: number; text: string; footnotes: string }>;
} {
  return JSON.parse(
    readFileSync(join(process.cwd(), "data", "source", "tr", "indonesian_affairs.json"), "utf8"),
  ) as {
    version: string;
    entries: Array<{ surah: number; ayah: number; text: string; footnotes: string }>;
  };
}

export interface SearchIndexFile {
  schemaVersion: number;
  datasetVersion: string;
  entries: Array<[surah: number, ayah: number, normalized: string]>;
}

export function readSearchIndex(): SearchIndexFile {
  return readDataJson<SearchIndexFile>("search/arabic.json");
}

export function readTranslationSearchIndex(): SearchIndexFile {
  return readDataJson<SearchIndexFile>("search/translation.json");
}

export function jsonResponse(value: unknown): Response {
  return {
    ok: true,
    status: 200,
    statusText: "OK",
    json: async () => value,
  } as Response;
}
