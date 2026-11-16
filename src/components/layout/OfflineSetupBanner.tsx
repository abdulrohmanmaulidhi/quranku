import { useState } from "react";
import { CircleAlert, CloudDownload, X } from "lucide-react";
import { Icon } from "@/components/ui/Icon";
import { useOfflineData } from "@/features/offline/OfflineContext";
import styles from "./OfflineSetupBanner.module.css";

export function OfflineSetupBanner() {
  const offline = useOfflineData();
  const [dismissed, setDismissed] = useState(false);

  if (offline.status === "ready" || offline.status === "checking") return null;
  if (offline.status === "idle") return null;
  if (offline.status === "error" && dismissed) return null;

  if (offline.status === "downloading") {
    const percent = offline.total === 0 ? 0 : Math.round((offline.completed / offline.total) * 100);

    return (
      <div className={styles.banner} role="status" aria-live="polite">
        <Icon icon={CloudDownload} size={16} />
        <div className={styles.body}>
          <p className={styles.text}>Menyiapkan Al-Qur&apos;an untuk dibaca offline… {percent}%</p>
          <div
            className={styles.track}
            role="progressbar"
            aria-label="Kemajuan penyiapan offline"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
          >
            <div className={styles.fill} style={{ transform: `scaleX(${percent / 100})` }} />
          </div>
        </div>
      </div>
    );
  }

  const description =
    offline.error === "quota"
      ? "Ruang penyimpanan perangkat tidak cukup. Bebaskan ruang, lalu coba lagi."
      : offline.error === "network"
        ? "Tidak dapat menyiapkan mode offline. Coba lagi saat terhubung."
        : "Mode offline belum dapat disiapkan. Coba lagi.";

  return (
    <div className={`${styles.banner} ${styles.error}`} role="alert">
      <Icon icon={CircleAlert} size={16} />
      <div className={styles.body}>
        <p className={styles.text}>{description}</p>
      </div>
      <button
        type="button"
        className={styles.action}
        onClick={() => {
          setDismissed(false);
          offline.retry();
        }}
      >
        Coba lagi
      </button>
      <button
        type="button"
        className={styles.close}
        aria-label="Tutup pemberitahuan offline"
        onClick={() => setDismissed(true)}
      >
        <Icon icon={X} size={16} />
      </button>
    </div>
  );
}
