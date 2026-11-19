import { useSyncExternalStore } from "react";

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export interface InstallState {
  /** Prompt bawaan peramban tersedia (Chromium). */
  canInstall: boolean;
  /** Aplikasi sudah berjalan sebagai PWA terpasang. */
  installed: boolean;
  /** Peramban iOS: tidak ada prompt, hanya instruksi manual. */
  ios: boolean;
  /** Pengguna memilih "Nanti" dan masih dalam masa tunggu. */
  dismissed: boolean;
}

const DISMISS_KEY = "quranku.install.dismissedUntil";
const DISMISS_MS = 14 * 24 * 60 * 60 * 1000;

let deferred: InstallPromptEvent | null = null;
let installed = false;
let started = false;
let cached: InstallState | null = null;
const listeners = new Set<() => void>();

function isStandalone(): boolean {
  const displayMode = window.matchMedia?.("(display-mode: standalone)").matches === true;
  const appleStandalone = (navigator as Navigator & { standalone?: boolean }).standalone === true;
  return displayMode || appleStandalone;
}

function isIos(): boolean {
  return (
    /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

function dismissedUntil(): number {
  try {
    const value = Number(window.localStorage.getItem(DISMISS_KEY));
    return Number.isFinite(value) ? value : 0;
  } catch {
    return 0;
  }
}

function snapshot(): InstallState {
  cached ??= {
    canInstall: deferred !== null,
    installed: installed || isStandalone(),
    ios: isIos(),
    dismissed: dismissedUntil() > Date.now(),
  };
  return cached;
}

function emit() {
  cached = null;
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Pasang pendengar sekali; dipanggil dari `main.tsx` sebelum React me-render. */
export function initInstall() {
  if (started) return;
  started = true;

  window.addEventListener("beforeinstallprompt", (event) => {
    // Tunda prompt bawaan agar ajakan tidak muncul saat halaman baru dibuka.
    event.preventDefault();
    deferred = event as InstallPromptEvent;
    emit();
  });

  window.addEventListener("appinstalled", () => {
    installed = true;
    deferred = null;
    emit();
  });
}

export function useInstallState(): InstallState {
  return useSyncExternalStore(subscribe, snapshot, snapshot);
}

export async function promptInstall(): Promise<"accepted" | "dismissed" | "unavailable"> {
  if (!deferred) return "unavailable";

  const event = deferred;
  deferred = null;
  try {
    await event.prompt();
    const { outcome } = await event.userChoice;
    return outcome;
  } catch {
    return "dismissed";
  } finally {
    emit();
  }
}

export function dismissInstall() {
  try {
    window.localStorage.setItem(DISMISS_KEY, String(Date.now() + DISMISS_MS));
  } catch {
    // Tanpa localStorage, ajakan hanya ditutup sampai muat ulang.
  }
  emit();
}

/** Hanya untuk pengujian: kembalikan modul ke keadaan awal. */
export function resetInstall() {
  deferred = null;
  installed = false;
  started = false;
  cached = null;
  listeners.clear();
  try {
    window.localStorage.removeItem(DISMISS_KEY);
  } catch {
    // abaikan
  }
}
