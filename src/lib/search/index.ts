import { DataError } from "@/lib/data/parse";
import { dataUrl } from "@/lib/data/url";

export type SearchEntry = [surah: number, ayah: number, normalized: string];

export interface SearchIndex {
  schemaVersion: number;
  datasetVersion: string;
  entries: SearchEntry[];
}

const EXPECTED_AYAHS = 6236;
const ARABIC_INDEX = "search/arabic.json";
const TRANSLATION_INDEX = "search/translation.json";
const pending = new Map<string, Promise<SearchIndex>>();

function isEntry(value: unknown): value is SearchEntry {
  return (
    Array.isArray(value) &&
    value.length === 3 &&
    Number.isInteger(value[0]) &&
    value[0] >= 1 &&
    value[0] <= 114 &&
    Number.isInteger(value[1]) &&
    value[1] >= 1 &&
    typeof value[2] === "string"
  );
}

export function parseSearchIndex(value: unknown): SearchIndex {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new DataError("Indeks pencarian tidak valid.");
  }

  const record = value as Record<string, unknown>;
  if (record.schemaVersion !== 1 || typeof record.datasetVersion !== "string") {
    throw new DataError("Versi indeks pencarian tidak dikenal.");
  }
  if (!Array.isArray(record.entries) || record.entries.length !== EXPECTED_AYAHS) {
    throw new DataError("Jumlah entri indeks pencarian tidak sesuai.");
  }

  const entries: SearchEntry[] = [];
  for (const entry of record.entries) {
    if (!isEntry(entry)) throw new DataError("Entri indeks pencarian tidak valid.");
    entries.push(entry);
  }

  return {
    schemaVersion: 1,
    datasetVersion: record.datasetVersion,
    entries,
  };
}

/** Indeks terjemahan memakai skema dan bentuk entri yang sama dengan indeks Arab. */
export const parseTranslationSearchIndex = parseSearchIndex;

function loadIndex(path: string): Promise<SearchIndex> {
  const cached = pending.get(path);
  if (cached) return cached;

  const request = (async () => {
    let response: Response;
    try {
      response = await fetch(dataUrl(path), {
        headers: { Accept: "application/json" },
      });
    } catch {
      throw new DataError("Indeks pencarian tidak dapat dimuat.");
    }

    if (!response.ok) {
      throw new DataError(`Indeks pencarian tidak dapat dimuat (${response.status}).`);
    }

    let value: unknown;
    try {
      value = await response.json();
    } catch {
      throw new DataError("Indeks pencarian tidak valid.");
    }

    return parseSearchIndex(value);
  })();

  pending.set(path, request);
  request.catch(() => {
    pending.delete(path);
  });
  return request;
}

/**
 * Indeks dimuat hanya saat mode pencariannya dipakai. Indeks Arab sekitar
 * 775 KB dan indeks terjemahan sekitar 1,1 MB, jadi keduanya tidak boleh masuk
 * muatan awal.
 */
export function loadSearchIndex(): Promise<SearchIndex> {
  return loadIndex(ARABIC_INDEX);
}

export function loadTranslationSearchIndex(): Promise<SearchIndex> {
  return loadIndex(TRANSLATION_INDEX);
}

export function clearSearchIndexCache(): void {
  pending.clear();
}
