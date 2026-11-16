import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { X } from "lucide-react";
import type { Surah } from "@/lib/data/types";
import { formatReference } from "@/lib/format/reference";
import { useJuz } from "@/features/quran/useQuranData";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { Skeleton } from "@/components/ui/Skeleton";
import { Tabs } from "@/components/ui/Tabs";
import styles from "./JumpToDialog.module.css";

type JumpTab = "surah" | "juz";

const TABS = [
  { value: "surah", label: "Surah & Ayat" },
  { value: "juz", label: "Juz" },
] as const;

export interface JumpToDialogProps {
  surahs: Surah[];
  initialSurah: number;
  onNavigate: (surah: number, ayah?: number) => void;
  onClose: () => void;
}

export function JumpToDialog({ surahs, initialSurah, onNavigate, onClose }: JumpToDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const juz = useJuz(surahs);
  const [tab, setTab] = useState<JumpTab>("surah");
  const [surahNumber, setSurahNumber] = useState(initialSurah);
  const [ayah, setAyah] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [juzNumber, setJuzNumber] = useState(1);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  const surah = surahs[surahNumber - 1];
  const ayahInputId = "jump-to-ayah";
  const hintId = "jump-to-ayah-hint";
  const errorId = "jump-to-ayah-error";

  const handleSurahSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!surah) return;

    const value = ayah.trim();
    if (value.length === 0) {
      onNavigate(surah.n);
      return;
    }

    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > surah.ayahCount) {
      setError(`Surah ini memiliki ${surah.ayahCount} ayat.`);
      return;
    }

    onNavigate(surah.n, parsed);
  };

  const juzEntries = juz.status === "success" ? juz.data : [];
  const selectedJuz = juzEntries.find((entry) => entry.juz === juzNumber);

  const handleJuzSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (selectedJuz) {
      onNavigate(selectedJuz.start.surah, selectedJuz.start.ayah);
    }
  };

  const handleTabChange = (value: string) => {
    setTab(value === "juz" ? "juz" : "surah");
  };

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby="jump-to-title"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose();
      }}
    >
      <div className={styles.sheet}>
        <div className={styles.header}>
          <h2 id="jump-to-title" className={styles.title}>
            Lompat ke
          </h2>
          <IconButton icon={X} label="Tutup" onClick={onClose} />
        </div>

        <Tabs
          items={TABS}
          value={tab}
          onChange={handleTabChange}
          label="Tujuan lompat"
          id="jump-to"
        />

        {tab === "surah" ? (
          <div
            id="jump-to-panel-surah"
            role="tabpanel"
            aria-labelledby="jump-to-tab-surah"
            className={styles.panel}
          >
            <form className={styles.form} onSubmit={handleSurahSubmit} noValidate>
              <label className={styles.field} htmlFor="jump-to-surah">
                <span className={styles.label}>Surah</span>
                <select
                  id="jump-to-surah"
                  className={styles.control}
                  value={surahNumber}
                  onChange={(event) => {
                    setSurahNumber(Number(event.target.value));
                    setError(null);
                  }}
                >
                  {surahs.map((entry) => (
                    <option key={entry.n} value={entry.n}>
                      {entry.n}. {entry.nameLatin}
                    </option>
                  ))}
                </select>
              </label>

              <label className={styles.field} htmlFor={ayahInputId}>
                <span className={styles.label}>Nomor ayat</span>
                <input
                  id={ayahInputId}
                  className={styles.control}
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={surah?.ayahCount}
                  value={ayah}
                  placeholder={surah ? `1–${surah.ayahCount}` : undefined}
                  aria-invalid={error !== null}
                  aria-describedby={error ? `${hintId} ${errorId}` : hintId}
                  onChange={(event) => {
                    setAyah(event.target.value);
                    setError(null);
                  }}
                />
              </label>

              <p id={hintId} className={styles.hint}>
                Kosongkan nomor ayat untuk membuka awal surah.
              </p>

              {error ? (
                <p id={errorId} className={styles.error} role="alert">
                  {error}
                </p>
              ) : null}

              <div className={styles.actions}>
                <Button variant="secondary" onClick={onClose}>
                  Batal
                </Button>
                <Button type="submit">Buka ayat</Button>
              </div>
            </form>
          </div>
        ) : (
          <div
            id="jump-to-panel-juz"
            role="tabpanel"
            aria-labelledby="jump-to-tab-juz"
            className={styles.panel}
          >
            {juz.status === "loading" ? (
              <div className={styles.loading} aria-hidden="true">
                <Skeleton width="100%" height="3rem" radius="md" />
                <Skeleton width="70%" height="0.85rem" />
              </div>
            ) : null}

            {juz.status === "error" ? (
              <div className={styles.juzError}>
                <p className={styles.error} role="alert">
                  Daftar juz belum dapat dimuat.
                </p>
                <Button variant="secondary" onClick={juz.retry}>
                  Coba lagi
                </Button>
              </div>
            ) : null}

            {juz.status === "success" ? (
              <form className={styles.form} onSubmit={handleJuzSubmit} noValidate>
                <label className={styles.field} htmlFor="jump-to-juz">
                  <span className={styles.label}>Juz</span>
                  <select
                    id="jump-to-juz"
                    className={styles.control}
                    value={juzNumber}
                    onChange={(event) => setJuzNumber(Number(event.target.value))}
                  >
                    {juzEntries.map((entry) => (
                      <option key={entry.juz} value={entry.juz}>
                        Juz {entry.juz} — {entry.start.surah}:{entry.start.ayah}
                      </option>
                    ))}
                  </select>
                </label>

                {selectedJuz ? (
                  <p className={styles.hint}>
                    Mulai{" "}
                    {formatReference(
                      surahs[selectedJuz.start.surah - 1]?.nameLatin ??
                        `Surah ${selectedJuz.start.surah}`,
                      selectedJuz.start.surah,
                      selectedJuz.start.ayah,
                    )}
                    .
                  </p>
                ) : null}

                <div className={styles.actions}>
                  <Button variant="secondary" onClick={onClose}>
                    Batal
                  </Button>
                  <Button type="submit" disabled={!selectedJuz}>
                    Buka juz
                  </Button>
                </div>
              </form>
            ) : null}
          </div>
        )}
      </div>
    </dialog>
  );
}
