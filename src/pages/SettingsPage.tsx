import { useRef, useState } from "react";
import {
  BookMarked,
  ChevronRight,
  Download,
  Monitor,
  Moon,
  ShieldCheck,
  Smartphone,
  Sun,
  Trash2,
  Upload,
} from "lucide-react";
import { Link } from "react-router-dom";
import { PageContainer } from "@/components/layout/PageContainer";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Icon } from "@/components/ui/Icon";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Snackbar } from "@/components/ui/Snackbar";
import { useThemePreference } from "@/app/ThemeContext";
import { useOfflineData } from "@/features/offline/OfflineContext";
import { promptInstall, useInstallState } from "@/features/pwa/install";
import { buildBackup, importBackup, parseBackup } from "@/lib/db/backup";
import { clearUserData } from "@/lib/db/db";
import type { ThemePreference } from "@/lib/theme";
import { useDocumentTitle } from "@/lib/useDocumentTitle";
import styles from "./SettingsPage.module.css";

const THEME_OPTIONS = [
  { value: "light", label: "Terang", icon: Sun },
  { value: "dark", label: "Gelap", icon: Moon },
  { value: "system", label: "Sistem", icon: Monitor },
] as const;

interface Toast {
  message: string;
  tone: "success" | "error";
}

export function SettingsPage() {
  useDocumentTitle("Pengaturan");
  const { preference, setPreference } = useThemePreference();
  const offline = useOfflineData();
  const install = useInstallState();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [toast, setToast] = useState<Toast | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleThemeChange = (value: string) => {
    const next: ThemePreference =
      value === "light" || value === "dark" || value === "system" ? value : "system";
    setPreference(next);
  };

  const handleExport = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const backup = await buildBackup();
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `quranku-penanda-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      setToast({ message: `${backup.bookmarks.length} penanda diekspor.`, tone: "success" });
    } catch {
      setToast({ message: "Penanda belum dapat diekspor.", tone: "error" });
    } finally {
      setBusy(false);
    }
  };

  const handleImport = async (file: File) => {
    if (busy) return;
    setBusy(true);
    try {
      const parsed = parseBackup(JSON.parse(await file.text()) as unknown);
      const result = await importBackup(parsed);
      const theme = parsed.settings.theme;
      if (
        result.restoredSettings.includes("theme") &&
        (theme === "light" || theme === "dark" || theme === "system")
      ) {
        setPreference(theme);
      }
      setToast({
        message: `${result.imported} penanda diimpor. ${result.skipped} sudah ada dan dilewati.`,
        tone: "success",
      });
    } catch {
      setToast({
        message: "Berkas tidak dapat dibaca. Pastikan berkas ekspor dari aplikasi ini.",
        tone: "error",
      });
    } finally {
      setBusy(false);
    }
  };

  const handleClear = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await clearUserData();
      localStorage.removeItem("quranku.theme");
      setPreference("system");
      setConfirmClear(false);
      setToast({ message: "Data lokal dihapus.", tone: "success" });
    } catch {
      setToast({ message: "Data lokal belum dapat dihapus.", tone: "error" });
    } finally {
      setBusy(false);
    }
  };

  const handleRemoveOffline = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await offline.remove();
      setToast({ message: "Salinan offline dihapus.", tone: "success" });
    } catch {
      setToast({ message: "Salinan offline belum dapat dihapus.", tone: "error" });
    } finally {
      setBusy(false);
    }
  };

  const offlineDescription =
    offline.status === "ready"
      ? `Siap offline · ${offline.completed} dari ${offline.total} berkas tersimpan`
      : offline.status === "downloading"
        ? `Menyiapkan… ${offline.total === 0 ? 0 : Math.round((offline.completed / offline.total) * 100)}%`
        : offline.status === "error"
          ? offline.error === "quota"
            ? "Ruang penyimpanan tidak cukup. Bebaskan ruang, lalu coba lagi."
            : "Belum siap. Sambungkan internet lalu coba lagi."
          : "Simpan seluruh surah agar dapat dibaca tanpa jaringan";

  const installDescription = install.installed
    ? "Quranku sudah berjalan sebagai aplikasi di perangkat ini."
    : install.ios
      ? "Di Safari, ketuk Bagikan, lalu pilih Tambah ke Layar Utama."
      : install.canInstall
        ? "Buka dari layar utama tanpa peramban."
        : "Gunakan menu peramban untuk memasang Quranku sebagai aplikasi.";

  return (
    <>
      <PageContainer>
        <header className={styles.header}>
          <h1 className={styles.title}>Pengaturan</h1>
        </header>

        <section className={styles.section} aria-labelledby="theme-heading">
          <h2 id="theme-heading" className={styles.sectionTitle}>
            Tampilan
          </h2>
          <div className={styles.card}>
            <div className={styles.setting}>
              <div className={styles.settingText}>
                <span className={styles.settingLabel}>Tema</span>
                <span className={styles.settingDescription}>
                  Pilih tampilan terang, gelap, atau mengikuti perangkat.
                </span>
              </div>
              <SegmentedControl
                label="Tema"
                value={preference}
                options={THEME_OPTIONS}
                onChange={handleThemeChange}
              />
            </div>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="data-heading">
          <h2 id="data-heading" className={styles.sectionTitle}>
            Data saya
          </h2>
          <div className={styles.card}>
            <button
              type="button"
              className={styles.actionRow}
              onClick={() => {
                void handleExport();
              }}
              disabled={busy}
            >
              <span className={styles.linkIcon}>
                <Icon icon={Download} size={20} />
              </span>
              <span className={styles.linkBody}>
                <span className={styles.settingLabel}>Ekspor penanda</span>
                <span className={styles.settingDescription}>
                  Simpan penanda, posisi, dan pengaturan ke berkas JSON
                </span>
              </span>
            </button>

            <button
              type="button"
              className={styles.actionRow}
              onClick={() => fileInputRef.current?.click()}
              disabled={busy}
            >
              <span className={styles.linkIcon}>
                <Icon icon={Upload} size={20} />
              </span>
              <span className={styles.linkBody}>
                <span className={styles.settingLabel}>Impor penanda</span>
                <span className={styles.settingDescription}>
                  Gabungkan berkas ekspor tanpa menghapus data yang ada
                </span>
              </span>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              className="sr-only"
              tabIndex={-1}
              aria-hidden="true"
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                if (file) {
                  void handleImport(file);
                }
              }}
            />

            <button
              type="button"
              className={styles.actionRow}
              onClick={offline.status === "error" ? offline.retry : offline.start}
              disabled={busy || offline.status === "downloading" || !offline.online}
            >
              <span className={styles.linkIcon}>
                <Icon icon={Download} size={20} />
              </span>
              <span className={styles.linkBody}>
                <span className={styles.settingLabel}>
                  {offline.status === "ready" ? "Data offline siap" : "Unduh data offline"}
                </span>
                <span className={styles.settingDescription}>{offlineDescription}</span>
              </span>
            </button>

            {offline.completed > 0 ? (
              <button
                type="button"
                className={styles.actionRow}
                onClick={() => {
                  void handleRemoveOffline();
                }}
                disabled={busy || offline.status === "downloading"}
              >
                <span className={styles.linkIcon}>
                  <Icon icon={Trash2} size={20} />
                </span>
                <span className={styles.linkBody}>
                  <span className={styles.settingLabel}>Hapus salinan offline</span>
                  <span className={styles.settingDescription}>
                    Bebaskan ruang tanpa menghapus penanda dan pengaturan
                  </span>
                </span>
              </button>
            ) : null}

            <button
              type="button"
              className={`${styles.actionRow} ${styles.actionDanger}`}
              onClick={() => setConfirmClear(true)}
              disabled={busy}
            >
              <span className={styles.linkIcon}>
                <Icon icon={Trash2} size={20} />
              </span>
              <span className={styles.linkBody}>
                <span className={styles.settingLabel}>Hapus data lokal</span>
                <span className={styles.settingDescription}>
                  Penanda, posisi terakhir, dan pengaturan di perangkat ini
                </span>
              </span>
            </button>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="app-heading">
          <h2 id="app-heading" className={styles.sectionTitle}>
            Aplikasi
          </h2>
          <div className={styles.card}>
            {install.canInstall && !install.installed ? (
              <button
                type="button"
                className={styles.actionRow}
                onClick={() => {
                  void promptInstall();
                }}
              >
                <span className={styles.linkIcon}>
                  <Icon icon={Smartphone} size={20} />
                </span>
                <span className={styles.linkBody}>
                  <span className={styles.settingLabel}>Pasang aplikasi</span>
                  <span className={styles.settingDescription}>{installDescription}</span>
                </span>
              </button>
            ) : (
              <div className={styles.infoRow}>
                <span className={styles.linkIcon}>
                  <Icon icon={Smartphone} size={20} />
                </span>
                <span className={styles.linkBody}>
                  <span className={styles.settingLabel}>
                    {install.installed ? "Aplikasi terpasang" : "Pasang aplikasi"}
                  </span>
                  <span className={styles.settingDescription}>{installDescription}</span>
                </span>
              </div>
            )}
          </div>
        </section>

        <section className={styles.section} aria-labelledby="about-heading">
          <h2 id="about-heading" className={styles.sectionTitle}>
            Tentang
          </h2>
          <div className={styles.card}>
            <Link to="/pengaturan/sumber" className={styles.linkRow}>
              <span className={styles.linkIcon}>
                <Icon icon={BookMarked} size={20} />
              </span>
              <span className={styles.linkBody}>
                <span className={styles.settingLabel}>Sumber &amp; Atribusi</span>
                <span className={styles.settingDescription}>
                  Tanzil, terjemahan QuranEnc, lisensi, dan versi data
                </span>
              </span>
              <span className={styles.chevron}>
                <Icon icon={ChevronRight} size={18} />
              </span>
            </Link>

            <div className={styles.infoRow}>
              <span className={styles.linkIcon}>
                <Icon icon={ShieldCheck} size={20} />
              </span>
              <span className={styles.linkBody}>
                <span className={styles.settingLabel}>Data di perangkat</span>
                <span className={styles.settingDescription}>
                  Penanda, posisi terakhir, dan pengaturan disimpan hanya di perangkat ini.
                </span>
              </span>
            </div>
          </div>
        </section>

        <div className={styles.about}>
          <p className={styles.aboutName}>Quranku</p>
          <p className={styles.aboutMeta}>Release 1 · tanpa akun, tanpa iklan</p>
        </div>
      </PageContainer>

      {toast ? (
        <Snackbar message={toast.message} tone={toast.tone} onDismiss={() => setToast(null)} />
      ) : null}

      <ConfirmDialog
        open={confirmClear}
        title="Hapus data lokal?"
        description={
          <>
            <p>
              Penanda, posisi terakhir dibaca, dan pengaturan akan dihapus dari perangkat ini.
              Tindakan ini tidak dapat dibatalkan.
            </p>
            <p>Data Quran yang tersimpan tetap tersedia.</p>
          </>
        }
        confirmLabel="Hapus semua"
        destructive
        onConfirm={() => {
          void handleClear();
        }}
        onClose={() => setConfirmClear(false)}
      />
    </>
  );
}
