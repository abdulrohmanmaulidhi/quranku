import { useCallback, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db/db";

export type TranslationSize = "s" | "m" | "l" | "xl";

const SETTING_KEY = "reader.translationSize";
const DEFAULT_SIZE: TranslationSize = "m";
const SIZES: readonly TranslationSize[] = ["s", "m", "l", "xl"];

export function isTranslationSize(value: unknown): value is TranslationSize {
  return typeof value === "string" && (SIZES as readonly string[]).includes(value);
}

export function useTranslationSize(): {
  size: TranslationSize;
  setSize: (size: TranslationSize) => void;
  resetSize: () => void;
  failed: boolean;
} {
  const [optimistic, setOptimistic] = useState<TranslationSize | null>(null);
  const [failed, setFailed] = useState(false);

  const row = useLiveQuery(async () => {
    try {
      return { ok: true as const, value: await db.settings.get(SETTING_KEY) };
    } catch {
      return { ok: false as const, value: undefined };
    }
  }, []);

  const stored = row?.ok && isTranslationSize(row.value?.value) ? row.value.value : DEFAULT_SIZE;
  const size = optimistic ?? stored;

  const write = useCallback((next: TranslationSize) => {
    setOptimistic(next);
    setFailed(false);
    void db.settings
      .put({ key: SETTING_KEY, value: next })
      .then(() => setOptimistic(null))
      .catch(() => setFailed(true));
  }, []);

  const setSize = useCallback(
    (next: TranslationSize) => {
      if (isTranslationSize(next)) write(next);
    },
    [write],
  );

  const resetSize = useCallback(() => write(DEFAULT_SIZE), [write]);

  return {
    size,
    setSize,
    resetSize,
    failed: failed || row?.ok === false,
  };
}

export { DEFAULT_SIZE as DEFAULT_TRANSLATION_SIZE, SIZES as TRANSLATION_SIZES };
