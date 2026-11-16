import { DATASET_VERSION } from "@/lib/data/version";
import { dataUrl } from "@/lib/data/url";

export const DATA_CACHE_NAME = `quranku-data-v${DATASET_VERSION}`;
export const SURAH_COUNT = 114;

const pad = (value: number) => String(value).padStart(3, "0");

/**
 * Daftar berkas yang dibutuhkan untuk membaca seluruh Al-Qur'an tanpa jaringan.
 * Berkas ar disimpan verbatim; skrip build yang membuatnya.
 */
export const OFFLINE_DATA_PATHS: readonly string[] = [
  "manifest.json",
  "surahs.json",
  "juz.json",
  "COPYRIGHT.txt",
  "search/arabic.json",
  ...Array.from({ length: SURAH_COUNT }, (_, index) => `ar/${pad(index + 1)}.json`),
];

export type OfflineErrorKind = "quota" | "network" | "unknown";

export class OfflineDownloadError extends Error {
  readonly kind: OfflineErrorKind;

  constructor(kind: OfflineErrorKind, message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "OfflineDownloadError";
    this.kind = kind;
  }
}

export interface OfflineProgress {
  completed: number;
  total: number;
}

export function isCacheSupported(): boolean {
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

function toOfflineError(error: unknown): OfflineDownloadError {
  if (error instanceof OfflineDownloadError) return error;
  if (isQuotaError(error)) {
    return new OfflineDownloadError(
      "quota",
      "Ruang penyimpanan perangkat tidak cukup untuk menyimpan data offline.",
      { cause: error },
    );
  }
  return new OfflineDownloadError("network", "Data offline tidak dapat diunduh.", {
    cause: error,
  });
}

export async function getCachedOfflineStatus(): Promise<OfflineProgress> {
  const total = OFFLINE_DATA_PATHS.length;
  if (!isCacheSupported()) return { completed: 0, total };

  try {
    const cache = await caches.open(DATA_CACHE_NAME);
    const matches = await Promise.all(OFFLINE_DATA_PATHS.map((path) => cache.match(dataUrl(path))));
    return { completed: matches.filter(Boolean).length, total };
  } catch {
    return { completed: 0, total };
  }
}

export interface DownloadOptions {
  onProgress?: (progress: OfflineProgress) => void;
  concurrency?: number;
  signal?: AbortSignal;
}

/**
 * Mengunduh berkas yang belum ada di cache. Penulisan dilakukan langsung ke
 * Cache API agar progres dan kegagalan kuota dapat dilaporkan ke halaman.
 */
export async function downloadMissingData({
  onProgress,
  concurrency = 3,
  signal,
}: DownloadOptions = {}): Promise<OfflineProgress> {
  if (!isCacheSupported()) {
    throw new OfflineDownloadError("unknown", "Penyimpanan offline tidak didukung.");
  }

  const cache = await caches.open(DATA_CACHE_NAME);
  const total = OFFLINE_DATA_PATHS.length;

  const missing: string[] = [];
  for (const path of OFFLINE_DATA_PATHS) {
    if (signal?.aborted) break;
    const url = dataUrl(path);
    if (!(await cache.match(url))) missing.push(url);
  }

  let completed = total - missing.length;
  onProgress?.({ completed, total });

  let cursor = 0;
  const worker = async () => {
    while (cursor < missing.length) {
      if (signal?.aborted) {
        throw new DOMException("Unduhan dibatalkan.", "AbortError");
      }
      const url = missing[cursor];
      cursor += 1;
      if (!url) return;

      let response: Response;
      try {
        response = await fetch(url, { cache: "no-store", signal });
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") throw error;
        throw toOfflineError(error);
      }

      if (!response.ok) {
        throw new OfflineDownloadError(
          "network",
          `Berkas data tidak dapat diunduh (${response.status}).`,
        );
      }

      try {
        await cache.put(url, response);
      } catch (error) {
        throw toOfflineError(error);
      }

      completed += 1;
      onProgress?.({ completed, total });
    }
  };

  const workers = Array.from(
    { length: Math.max(1, Math.min(concurrency, missing.length || 1)) },
    () => worker(),
  );
  await Promise.all(workers);

  return { completed, total };
}

export async function clearOfflineData(): Promise<void> {
  if (!isCacheSupported()) return;
  await caches.delete(DATA_CACHE_NAME);
}

/**
 * Cache data memakai nama berversi. Saat dataset naik versi, cache lama
 * dihapus agar tidak memakan ruang dan tidak menyajikan data usang.
 */
export async function clearOldDataCaches(): Promise<void> {
  if (!isCacheSupported()) return;
  const keys = await caches.keys();
  await Promise.all(
    keys
      .filter((key) => key.startsWith("quranku-data-") && key !== DATA_CACHE_NAME)
      .map((key) => caches.delete(key)),
  );
}
