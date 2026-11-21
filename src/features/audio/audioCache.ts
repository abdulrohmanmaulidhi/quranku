import { AUDIO_HOST, audioUrl, getReciter } from "./reciters";

export const AUDIO_CACHE_NAME = "quranku-audio-v1";

const DOWNLOAD_CONCURRENCY = 3;
const MAX_ATTEMPTS = 3;

export type AudioCacheErrorKind = "quota" | "network" | "unsupported" | "aborted";

export class AudioCacheError extends Error {
  readonly kind: AudioCacheErrorKind;

  constructor(kind: AudioCacheErrorKind, message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "AudioCacheError";
    this.kind = kind;
  }
}

export interface SurahAudioStatus {
  cached: number;
  total: number;
  complete: boolean;
}

export interface DownloadProgress {
  completed: number;
  total: number;
  bytes: number;
}

export interface DownloadResult {
  downloaded: number;
  bytes: number;
  failed: number[];
}

export function isAudioCacheSupported(): boolean {
  return typeof caches !== "undefined";
}

function isQuotaError(error: unknown): boolean {
  if (!(error instanceof DOMException)) return false;
  return (
    error.name === "QuotaExceededError" ||
    error.name === "NS_ERROR_DOM_QUOTA_REACHED" ||
    error.code === 22
  );
}

function surahPrefix(reciterId: string, surah: number): string {
  const reciter = getReciter(reciterId);
  return `${AUDIO_HOST}/data/${reciter.folder}/${String(surah).padStart(3, "0")}`;
}

const sleep = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function runPool<T>(
  items: readonly T[],
  limit: number,
  worker: (item: T) => Promise<void>,
): Promise<void> {
  let cursor = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const item = items[cursor];
      cursor += 1;
      if (item === undefined) return;
      await worker(item);
    }
  });
  await Promise.all(workers);
}

/** Mencari berkas audio di Cache Storage; `undefined` bila belum diunduh. */
export async function matchCachedAudio(url: string): Promise<Response | undefined> {
  if (!isAudioCacheSupported()) return undefined;
  const cache = await caches.open(AUDIO_CACHE_NAME);
  return cache.match(url);
}

export async function getSurahAudioStatus(
  reciterId: string,
  surah: number,
  ayahCount: number,
): Promise<SurahAudioStatus> {
  if (!isAudioCacheSupported()) {
    return { cached: 0, total: ayahCount, complete: false };
  }
  try {
    const cache = await caches.open(AUDIO_CACHE_NAME);
    const prefix = surahPrefix(reciterId, surah);
    const keys = await cache.keys();
    const cached = keys.filter((request) => request.url.startsWith(prefix)).length;
    return { cached, total: ayahCount, complete: cached >= ayahCount };
  } catch {
    return { cached: 0, total: ayahCount, complete: false };
  }
}

export interface DownloadSurahOptions {
  reciterId: string;
  surah: number;
  ayahCount: number;
  signal?: AbortSignal;
  onProgress?: (progress: DownloadProgress) => void;
}

/**
 * Mengunduh audio satu surah ke Cache Storage.
 *
 * Konkurensi dibatasi tiga permintaan: EveryAyah menolak atau menunda
 * permintaan serentak dalam jumlah besar. Ayat yang gagal setelah tiga
 * percobaan dikembalikan di `failed`, bukan disembunyikan.
 */
export async function downloadSurahAudio({
  reciterId,
  surah,
  ayahCount,
  signal,
  onProgress,
}: DownloadSurahOptions): Promise<DownloadResult> {
  if (!isAudioCacheSupported()) {
    throw new AudioCacheError("unsupported", "Peramban ini tidak mendukung penyimpanan audio.");
  }

  const cache = await caches.open(AUDIO_CACHE_NAME);
  const ayahs = Array.from({ length: ayahCount }, (_, index) => index + 1);
  const failed: number[] = [];
  let completed = 0;
  let bytes = 0;
  let aborted = false;

  const worker = async (ayah: number) => {
    if (aborted) return;
    if (signal?.aborted) {
      aborted = true;
      return;
    }

    const url = audioUrl(reciterId, surah, ayah);
    const existing = await cache.match(url);
    if (existing) {
      completed += 1;
      onProgress?.({ completed, total: ayahCount, bytes });
      return;
    }

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
      try {
        const response = await fetch(url, { signal });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const buffer = await response.arrayBuffer();
        const contentType = response.headers.get("content-type") ?? "audio/mpeg";
        await cache.put(url, new Response(buffer, { headers: { "content-type": contentType } }));
        bytes += buffer.byteLength;
        completed += 1;
        onProgress?.({ completed, total: ayahCount, bytes });
        return;
      } catch (error) {
        if (signal?.aborted) {
          aborted = true;
          return;
        }
        if (isQuotaError(error)) {
          throw new AudioCacheError(
            "quota",
            "Ruang penyimpanan perangkat tidak cukup untuk audio ini.",
            { cause: error },
          );
        }
        if (attempt === MAX_ATTEMPTS) {
          failed.push(ayah);
          return;
        }
        await sleep(250 * attempt);
      }
    }
  };

  await runPool(ayahs, DOWNLOAD_CONCURRENCY, worker);

  if (aborted) {
    throw new AudioCacheError("aborted", "Unduhan audio dibatalkan.");
  }

  return { downloaded: completed, bytes, failed: failed.sort((a, b) => a - b) };
}

export async function deleteSurahAudio(reciterId: string, surah: number): Promise<void> {
  if (!isAudioCacheSupported()) return;
  const cache = await caches.open(AUDIO_CACHE_NAME);
  const prefix = surahPrefix(reciterId, surah);
  const keys = await cache.keys();
  await Promise.all(
    keys
      .filter((request) => request.url.startsWith(prefix))
      .map((request) => cache.delete(request)),
  );
}

export async function clearAudioCache(): Promise<number> {
  if (!isAudioCacheSupported()) return 0;
  const cache = await caches.open(AUDIO_CACHE_NAME);
  const keys = await cache.keys();
  await Promise.all(keys.map((request) => cache.delete(request)));
  return keys.length;
}

export async function getAudioCacheCount(): Promise<number> {
  if (!isAudioCacheSupported()) return 0;
  try {
    const cache = await caches.open(AUDIO_CACHE_NAME);
    return (await cache.keys()).length;
  } catch {
    return 0;
  }
}
