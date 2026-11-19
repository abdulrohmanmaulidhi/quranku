import { Download, X } from "lucide-react";
import { Icon } from "@/components/ui/Icon";
import { dismissInstall, promptInstall, useInstallState } from "@/features/pwa/install";
import styles from "./InstallPrompt.module.css";

/**
 * Ajakan pasang non-modal di Reader. Hanya muncul bila peramban menyediakan
 * prompt bawaan, pengguna sudah membaca beberapa ayat, dan belum menolak.
 */
export function InstallPrompt({ show }: { show: boolean }) {
  const install = useInstallState();

  if (!show || !install.canInstall || install.installed || install.dismissed) return null;

  return (
    <aside className={styles.prompt} aria-label="Pasang aplikasi">
      <span className={styles.icon} aria-hidden="true">
        <Icon icon={Download} size={20} />
      </span>
      <p className={styles.text}>Pasang Quranku di layar utama.</p>
      <button type="button" className={styles.install} onClick={() => void promptInstall()}>
        Pasang
      </button>
      <button
        type="button"
        className={styles.close}
        aria-label="Tutup ajakan pasang"
        onClick={dismissInstall}
      >
        <Icon icon={X} size={18} />
      </button>
    </aside>
  );
}
