import { createContext, useContext } from "react";
import type { OfflineErrorKind, OfflineProgress } from "./cache";

export type OfflineStatus = "checking" | "idle" | "downloading" | "ready" | "error";

export interface OfflineContextValue extends OfflineProgress {
  status: OfflineStatus;
  error: OfflineErrorKind | null;
  online: boolean;
  start: () => void;
  retry: () => void;
  remove: () => Promise<void>;
}

export const OfflineContext = createContext<OfflineContextValue | null>(null);

export function useOfflineData(): OfflineContextValue {
  const value = useContext(OfflineContext);
  if (!value) {
    throw new Error("useOfflineData harus dipakai di dalam OfflineProvider.");
  }
  return value;
}
