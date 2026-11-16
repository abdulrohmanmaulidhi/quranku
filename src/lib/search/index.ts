import { DataError } from "@/lib/data/parse";
import { dataUrl } from "@/lib/data/url";

export type SearchEntry = [surah: number, ayah: number, normalized: string];

export interface SearchIndex {
  schemaVersion: number;
  datasetVersion: string;
  entries: SearchEntry[];
}

const EXPECTED_AYAHS = 6236;
let indexPromise: Promise<SearchIndex> | null = null;

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

/**
 * Indeks dimuat hanya saat pencarian Arab dipakai. Ukurannya sekitar 775 KB
 * sehingga tidak boleh masuk muatan awal.
 */
export function loadSearchIndex(): Promise<SearchIndex> {
  if (indexPromise) return indexPromise;

  const request = (async () => {
    let response: Response;
    try {
      response = await fetch(dataUrl("search/arabic.json"), {
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

  indexPromise = request;
  request.catch(() => {
    indexPromise = null;
  });
  return request;
}

export function clearSearchIndexCache(): void {
  indexPromise = null;
}
