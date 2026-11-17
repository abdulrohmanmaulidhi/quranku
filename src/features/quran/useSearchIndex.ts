import { useCallback, useEffect, useState } from "react";
import { loadSearchIndex, loadTranslationSearchIndex } from "@/lib/search/index";
import type { SearchIndex } from "@/lib/search/index";

export type SearchIndexState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: SearchIndex }
  | { status: "error"; error: Error };

interface IndexResult {
  key: string;
  state: SearchIndexState;
}

/**
 * Status diturunkan dari kunci permintaan seperti `useQuranData`, sehingga
 * memuat indeks tidak memicu render berantai lewat setState di dalam efek.
 */
function useIndex(
  load: () => Promise<SearchIndex>,
  enabled: boolean,
): SearchIndexState & { retry: () => void } {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<IndexResult | null>(null);
  const key = `${enabled ? "on" : "off"}#${attempt}`;

  const retry = useCallback(() => setAttempt((value) => value + 1), []);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    load().then(
      (data) => {
        if (!cancelled) setResult({ key, state: { status: "success", data } });
      },
      (error: unknown) => {
        if (cancelled) return;
        setResult({
          key,
          state: {
            status: "error",
            error:
              error instanceof Error ? error : new Error("Indeks pencarian tidak dapat dimuat."),
          },
        });
      },
    );

    return () => {
      cancelled = true;
    };
  }, [enabled, key, load]);

  const state: SearchIndexState = !enabled
    ? { status: "idle" }
    : result?.key === key
      ? result.state
      : { status: "loading" };

  return { ...state, retry };
}

export function useSearchIndex(enabled: boolean): SearchIndexState & { retry: () => void } {
  return useIndex(loadSearchIndex, enabled);
}

export function useTranslationSearchIndex(
  enabled: boolean,
): SearchIndexState & { retry: () => void } {
  return useIndex(loadTranslationSearchIndex, enabled);
}
