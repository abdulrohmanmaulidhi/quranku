import { useEffect, useRef } from "react";
import { Minus, Plus } from "lucide-react";
import { ARABIC_SIZES } from "@/features/library/useArabicSize";
import type { ArabicSize } from "./ArabicText";
import { ArabicText } from "./ArabicText";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import styles from "./ReadingSettings.module.css";

const SIZE_LABELS: Record<ArabicSize, string> = {
  s: "Kecil",
  m: "Sedang",
  l: "Besar",
  xl: "Sangat besar",
  xxl: "Terbesar",
};

export interface ReadingSettingsProps {
  open: boolean;
  sampleText: string;
  size: ArabicSize;
  failed: boolean;
  onChangeSize: (size: ArabicSize) => void;
  onReset: () => void;
  onClose: () => void;
}

export function ReadingSettings({
  open,
  sampleText,
  size,
  failed,
  onChangeSize,
  onReset,
  onClose,
}: ReadingSettingsProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const index = ARABIC_SIZES.indexOf(size);
  const canDecrease = index > 0;
  const canIncrease = index < ARABIC_SIZES.length - 1;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby="reading-settings-title"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose();
      }}
    >
      <div className={styles.sheet}>
        <h2 id="reading-settings-title" className={styles.title}>
          Pengaturan baca
        </h2>

        <div className={styles.control}>
          <span className={styles.label}>Ukuran teks Arab</span>
          <div className={styles.stepper}>
            <IconButton
              icon={Minus}
              label="Perkecil teks Arab"
              disabled={!canDecrease}
              onClick={() => {
                const next = ARABIC_SIZES[index - 1];
                if (next) onChangeSize(next);
              }}
            />
            <span className={styles.value} aria-live="polite">
              {SIZE_LABELS[size]}
            </span>
            <IconButton
              icon={Plus}
              label="Perbesar teks Arab"
              disabled={!canIncrease}
              onClick={() => {
                const next = ARABIC_SIZES[index + 1];
                if (next) onChangeSize(next);
              }}
            />
          </div>
        </div>

        <div className={styles.preview}>
          <ArabicText text={sampleText} size={size} />
        </div>

        {failed ? (
          <p className={styles.warning} role="status">
            Ukuran berlaku di sesi ini, tetapi belum dapat disimpan di perangkat.
          </p>
        ) : null}

        <p className={styles.note}>
          Perubahan berlaku langsung dan disimpan hanya di perangkat ini. Terjemahan belum tersedia
          (D-003).
        </p>

        <div className={styles.actions}>
          <Button variant="secondary" onClick={onReset}>
            Atur ulang ke bawaan
          </Button>
          <Button onClick={onClose}>Selesai</Button>
        </div>
      </div>
    </dialog>
  );
}
