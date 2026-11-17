import { useCallback, useEffect, useState } from "react";
import {
  loadJuz,
  loadManifest,
  loadSurahs,
  loadSurahText,
  loadSurahTranslation,
} from "@/lib/data/client";
import type { Juz, Manifest, Surah, SurahText, SurahTranslation } from "@/lib/data/types";

export type AsyncState<T> =
  { status: "loading" } | { status: "success"; data: T } | { status: "error"; error: Error };

export type AsyncResource<T> = AsyncState<T> & { retry: () => void };

function toError(value: unknown): Error {
  return value instanceof Error ? value : new Error("Terjadi kesalahan yang tidak dikenal.");
}

function useRetry(): [number, () => void] {
  const [attempt, setAttempt] = useState(0);
  const retry = useCallback(() => setAttempt((value) => value + 1), []);
  return [attempt, retry];
}

interface AsyncResult<T> {
  key: string;
  state: AsyncState<T>;
}

/**
 * Status diturunkan dari kunci permintaan, bukan di-set "loading" di dalam efek.
 * Dengan begitu percobaan ulang dan perubahan parameter otomatis kembali ke
 * state memuat tanpa render berantai.
 */
function useAsyncResource<T>(
  load: () => Promise<T>,
  requestKey: string,
  enabled = true,
): AsyncResource<T> {
  const [attempt, retry] = useRetry();
  const key = `${requestKey}#${attempt}`;
  const [result, setResult] = useState<AsyncResult<T> | null>(null);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    load().then(
      (data) => {
        if (!cancelled) setResult({ key, state: { status: "success", data } });
      },
      (error: unknown) => {
        if (!cancelled) setResult({ key, state: { status: "error", error: toError(error) } });
      },
    );

    return () => {
      cancelled = true;
    };
  }, [enabled, key, load]);

  const state: AsyncState<T> = result?.key === key ? result.state : { status: "loading" };
  return { ...state, retry };
}

export function useSurahs(): AsyncResource<Surah[]> {
  return useAsyncResource(loadSurahs, "surahs");
}

export function useManifest(): AsyncResource<Manifest> {
  return useAsyncResource(loadManifest, "manifest");
}

export function useJuz(surahs: Surah[] | null, enabled = true): AsyncResource<Juz[]> {
  const load = useCallback(() => loadJuz(surahs ?? []), [surahs]);
  return useAsyncResource(load, "juz", surahs !== null && enabled);
}

export function useSurahText(
  surah: number,
  ayahCount: number,
  enabled = true,
): AsyncResource<SurahText> {
  const load = useCallback(() => loadSurahText(surah, ayahCount), [surah, ayahCount]);
  return useAsyncResource(load, `surah:${surah}:${ayahCount}`, enabled);
}

export function useSurahTranslation(
  surah: number,
  ayahCount: number,
  enabled = true,
): AsyncResource<SurahTranslation> {
  // ponytail: terjemahan dimuat penuh per surah dan tidak di-prefetch; bila
  // ukuran jadi masalah, pecah per rentang ayat.
  const load = useCallback(() => loadSurahTranslation(surah, ayahCount), [surah, ayahCount]);
  return useAsyncResource(load, `translation:${surah}:${ayahCount}`, enabled);
}
