import {
  DataError,
  parseJuz,
  parseManifest,
  parseSurahText,
  parseSurahs,
} from "./parse";
import type { Juz, Manifest, Surah, SurahText } from "./types";
import { dataUrl } from "./url";

const cache = new Map<string, Promise<unknown>>();

function fetchJson(path: string): Promise<unknown> {
  const cached = cache.get(path);
  if (cached) return cached;

  const request = (async () => {
    let response: Response;
    try {
      response = await fetch(dataUrl(path), {
        headers: { Accept: "application/json" },
      });
    } catch {
      throw new DataError("Data tidak dapat dimuat.");
    }

    if (!response.ok) {
      throw new DataError(`Data tidak dapat dimuat (${response.status}).`);
    }

    try {
      return await response.json();
    } catch {
      throw new DataError("Data tidak valid.");
    }
  })();

  cache.set(path, request);
  request.catch(() => cache.delete(path));
  return request;
}

export async function loadManifest(): Promise<Manifest> {
  return parseManifest(await fetchJson("manifest.json"));
}

export async function loadSurahs(): Promise<Surah[]> {
  return parseSurahs(await fetchJson("surahs.json"));
}

export async function loadJuz(surahs: Surah[]): Promise<Juz[]> {
  return parseJuz(await fetchJson("juz.json"), surahs);
}

export async function loadSurahText(surah: number, ayahCount: number): Promise<SurahText> {
  if (!Number.isInteger(surah) || surah < 1 || surah > 114) {
    throw new DataError("Nomor surah tidak valid.");
  }
  const file = `${String(surah).padStart(3, "0")}.json`;
  const value = await fetchJson(`ar/${file}`);
  return parseSurahText(value, surah, ayahCount);
}

export function clearDataCache(): void {
  cache.clear();
}
