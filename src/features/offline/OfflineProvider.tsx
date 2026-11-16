import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useOnlineStatus } from "@/lib/useOnlineStatus";
import {
  OFFLINE_DATA_PATHS,
  clearOfflineData,
  clearOldDataCaches,
  downloadMissingData,
  getCachedOfflineStatus,
} from "./cache";
import type { OfflineErrorKind } from "./cache";
import { OfflineContext } from "./OfflineContext";
import type { OfflineStatus } from "./OfflineContext";

interface OfflineState {
  status: OfflineStatus;
  completed: number;
  total: number;
  error: OfflineErrorKind | null;
}

const TOTAL = OFFLINE_DATA_PATHS.length;

function prefersReducedData(): boolean {
  const connection = (
    navigator as Navigator & {
      connection?: { saveData?: boolean };
    }
  ).connection;
  return connection?.saveData === true;
}

function scheduleIdle(callback: () => void): () => void {
  if (typeof window.requestIdleCallback === "function") {
    const id = window.requestIdleCallback(callback, { timeout: 2500 });
    return () => window.cancelIdleCallback(id);
  }
  const id = window.setTimeout(callback, 800);
  return () => window.clearTimeout(id);
}

export function OfflineProvider({ children }: { children: ReactNode }) {
  const online = useOnlineStatus();
  const [state, setState] = useState<OfflineState>({
    status: "checking",
    completed: 0,
    total: TOTAL,
    error: null,
  });
  const controllerRef = useRef<AbortController | null>(null);
  const runningRef = useRef(false);
  const autoStartedRef = useRef(false);

  const start = useCallback(() => {
    if (runningRef.current) return;
    if (!online) {
      setState((current) => ({
        ...current,
        status: "idle",
        error: "network",
      }));
      return;
    }

    runningRef.current = true;
    const controller = new AbortController();
    controllerRef.current = controller;

    setState((current) => ({
      ...current,
      status: "downloading",
      error: null,
    }));

    void downloadMissingData({
      signal: controller.signal,
      onProgress: ({ completed, total }) => {
        setState((current) => ({ ...current, completed, total }));
      },
    })
      .then(({ completed, total }) => {
        if (controller.signal.aborted) return;
        setState({ status: "ready", completed, total, error: null });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        if (error instanceof DOMException && error.name === "AbortError") return;
        const kind: OfflineErrorKind =
          error instanceof Error && "kind" in error
            ? ((error as { kind?: OfflineErrorKind }).kind ?? "unknown")
            : "unknown";
        setState((current) => ({
          ...current,
          status: "error",
          error: kind,
        }));
      })
      .finally(() => {
        runningRef.current = false;
        if (controllerRef.current === controller) controllerRef.current = null;
      });
  }, [online]);

  const retry = useCallback(() => {
    start();
  }, [start]);

  const remove = useCallback(async () => {
    controllerRef.current?.abort();
    controllerRef.current = null;
    runningRef.current = false;
    await clearOfflineData();
    setState({ status: "idle", completed: 0, total: TOTAL, error: null });
    // Jangan langsung mengunduh ulang setelah pengguna menghapus salinan offline.
    autoStartedRef.current = true;
  }, []);

  useEffect(() => {
    let cancelled = false;

    void clearOldDataCaches()
      .then(getCachedOfflineStatus)
      .then(({ completed, total }) => {
        if (cancelled) return;
        setState((current) => ({
          ...current,
          completed,
          total,
          status: completed >= total ? "ready" : "idle",
        }));
      })
      .catch(() => {
        if (!cancelled) setState((current) => ({ ...current, status: "idle" }));
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!online) return;
    if (autoStartedRef.current) return;
    if (prefersReducedData()) return;
    if (state.status !== "idle" || state.completed >= state.total) return;

    const cancel = scheduleIdle(() => {
      if (autoStartedRef.current) return;
      autoStartedRef.current = true;
      start();
    });

    return cancel;
  }, [online, start, state.completed, state.status, state.total]);

  const value = useMemo(
    () => ({
      ...state,
      online,
      start,
      retry,
      remove,
    }),
    [online, remove, retry, start, state],
  );

  return <OfflineContext.Provider value={value}>{children}</OfflineContext.Provider>;
}
