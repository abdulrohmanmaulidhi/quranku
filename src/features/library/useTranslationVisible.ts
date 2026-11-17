import { useCallback, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db/db";

const SETTING_KEY = "reader.showTranslation";
const DEFAULT_VISIBLE = true;

export function isShowTranslation(value: unknown): value is boolean {
  return typeof value === "boolean";
}

export function useTranslationVisible(): {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  reset: () => void;
  failed: boolean;
} {
  const [optimistic, setOptimistic] = useState<boolean | null>(null);
  const [failed, setFailed] = useState(false);

  const row = useLiveQuery(async () => {
    try {
      return { ok: true as const, value: await db.settings.get(SETTING_KEY) };
    } catch {
      return { ok: false as const, value: undefined };
    }
  }, []);

  const stored = row?.ok && isShowTranslation(row.value?.value) ? row.value.value : DEFAULT_VISIBLE;
  const visible = optimistic ?? stored;

  const write = useCallback((next: boolean) => {
    setOptimistic(next);
    setFailed(false);
    void db.settings
      .put({ key: SETTING_KEY, value: next })
      .then(() => setOptimistic(null))
      .catch(() => setFailed(true));
  }, []);

  const setVisible = useCallback(
    (next: boolean) => {
      if (isShowTranslation(next)) write(next);
    },
    [write],
  );

  const reset = useCallback(() => write(DEFAULT_VISIBLE), [write]);

  return {
    visible,
    setVisible,
    reset,
    failed: failed || row?.ok === false,
  };
}

export { DEFAULT_VISIBLE as DEFAULT_SHOW_TRANSLATION };
