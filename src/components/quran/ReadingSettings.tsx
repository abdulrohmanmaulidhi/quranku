import { useEffect, useId, useRef } from "react";
import { Minus, Plus } from "lucide-react";
import { ARABIC_SIZES } from "@/features/library/useArabicSize";
import { TRANSLATION_SIZES, type TranslationSize } from "@/features/library/useTranslationSize";
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

const TRANSLATION_LABELS: Record<TranslationSize, string> = {
  s: "Kecil",
  m: "Sedang",
  l: "Besar",
  xl: "Sangat besar",
};

export interface ReadingSettingsProps {
  open: boolean;
  sampleText: string;
  size: ArabicSize;
  translationSize: TranslationSize;
  failed: boolean;
  showTranslation: boolean;
  onChangeSize: (size: ArabicSize) => void;
  onChangeTranslationSize: (size: TranslationSize) => void;
  onChangeShowTranslation: (visible: boolean) => void;
  onReset: () => void;
  onClose: () => void;
}

export function ReadingSettings({
  open,
  sampleText,
  size,
  translationSize,
  failed,
  showTranslation,
  onChangeSize,
  onChangeTranslationSize,
  onChangeShowTranslation,
  onReset,
  onClose,
}: ReadingSettingsProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const arabicLabelId = useId();
  const translationLabelId = useId();
  const index = ARABIC_SIZES.indexOf(size);
  const canDecrease = index > 0;
  const canIncrease = index < ARABIC_SIZES.length - 1;
  const translationIndex = TRANSLATION_SIZES.indexOf(translationSize);
  const canDecreaseTranslation = translationIndex > 0;
  const canIncreaseTranslation = translationIndex < TRANSLATION_SIZES.length - 1;

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

        <div className={styles.control} role="group" aria-labelledby={arabicLabelId}>
          <span id={arabicLabelId} className={styles.label}>
            Ukuran teks Arab
          </span>
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

        <label className={styles.toggle}>
          <input
            type="checkbox"
            checked={showTranslation}
            onChange={(event) => onChangeShowTranslation(event.target.checked)}
          />
          <span>Tampilkan terjemahan</span>
        </label>

        {showTranslation ? (
          <div className={styles.control} role="group" aria-labelledby={translationLabelId}>
            <span id={translationLabelId} className={styles.label}>
              Ukuran teks terjemahan
            </span>
            <div className={styles.stepper}>
              <IconButton
                icon={Minus}
                label="Perkecil teks terjemahan"
                disabled={!canDecreaseTranslation}
                onClick={() => {
                  const next = TRANSLATION_SIZES[translationIndex - 1];
                  if (next) onChangeTranslationSize(next);
                }}
              />
              <span className={styles.value} aria-live="polite">
                {TRANSLATION_LABELS[translationSize]}
              </span>
              <IconButton
                icon={Plus}
                label="Perbesar teks terjemahan"
                disabled={!canIncreaseTranslation}
                onClick={() => {
                  const next = TRANSLATION_SIZES[translationIndex + 1];
                  if (next) onChangeTranslationSize(next);
                }}
              />
            </div>
          </div>
        ) : null}

        {failed ? (
          <p className={styles.warning} role="status">
            Perubahan berlaku di sesi ini, tetapi belum dapat disimpan di perangkat.
          </p>
        ) : null}

        <p className={styles.note}>
          Perubahan berlaku langsung dan disimpan hanya di perangkat ini. Terjemahan Indonesia dari
          Kementerian Agama RI via QuranEnc.com.
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
