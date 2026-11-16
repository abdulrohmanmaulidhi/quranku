import { RefreshCw, X } from "lucide-react";
import { useRegisterSW } from "virtual:pwa-register/react";
import { Icon } from "@/components/ui/Icon";
import { Snackbar } from "@/components/ui/Snackbar";
import styles from "./PwaUpdatePrompt.module.css";

/**
 * Menampilkan pemberitahuan pembaruan tanpa memuat ulang paksa.
 * Posisi baca tetap tersimpan karena Reader menyimpan posisinya saat bergulir.
 */
export function PwaUpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_swUrl, registration) {
      if (!registration) return;
      window.setInterval(
        () => {
          void registration.update();
        },
        60 * 60 * 1000,
      );
    },
  });

  return (
    <>
      {needRefresh ? (
        <div className={styles.bar} role="status" aria-live="polite">
          <Icon icon={RefreshCw} size={18} />
          <p className={styles.message}>Versi baru tersedia.</p>
          <button
            type="button"
            className={styles.action}
            onClick={() => {
              setNeedRefresh(false);
              void updateServiceWorker(true);
            }}
          >
            Muat ulang
          </button>
          <button
            type="button"
            className={styles.close}
            aria-label="Tutup pemberitahuan pembaruan"
            onClick={() => setNeedRefresh(false)}
          >
            <Icon icon={X} size={18} />
          </button>
        </div>
      ) : null}

      {offlineReady ? (
        <Snackbar
          message="Aplikasi siap dibuka tanpa jaringan."
          onDismiss={() => setOfflineReady(false)}
        />
      ) : null}
    </>
  );
}
