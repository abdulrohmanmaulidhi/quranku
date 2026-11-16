import { useCallback, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db/db";
import type { ArabicSize } from "@/components/quran/ArabicText";

const SETTING_KEY = "reader.arabicSize";
const DEFAULT_SIZE: ArabicSize = "m";
const SIZES: readonly ArabicSize[] = ["s", "m", "l", "xl", "xxl"];

export function isArabicSize(value: unknown): value is ArabicSize {
  return typeof value === "string" && (SIZES as readonly string[]).includes(value);
}

export function useArabicSize(): {
  size: ArabicSize;
  setSize: (size: ArabicSize) => void;
  resetSize: () => void;
  failed: boolean;
} {
  const [optimistic, setOptimistic] = useState<ArabicSize | null>(null);
  const [failed, setFailed] = useState(false);

  const row = useLiveQuery(async () => {
    try {
      return { ok: true as const, value: await db.settings.get(SETTING_KEY) };
    } catch {
      return { ok: false as const, value: undefined };
    }
  }, []);

  const stored = row?.ok && isArabicSize(row.value?.value) ? row.value.value : DEFAULT_SIZE;
  const size = optimistic ?? stored;

  const write = useCallback((next: ArabicSize) => {
    setOptimistic(next);
    setFailed(false);
    void db.settings
      .put({ key: SETTING_KEY, value: next })
      .then(() => setOptimistic(null))
      .catch(() => setFailed(true));
  }, []);

  const setSize = useCallback(
    (next: ArabicSize) => {
      if (isArabicSize(next)) write(next);
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

export { DEFAULT_SIZE as DEFAULT_ARABIC_SIZE, SIZES as ARABIC_SIZES };
