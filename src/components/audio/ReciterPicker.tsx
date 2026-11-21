import { useId } from "react";
import { Check } from "lucide-react";
import { Icon } from "@/components/ui/Icon";
import { RECITERS } from "@/features/audio/reciters";
import { useAudioSettings } from "@/features/audio/useAudioSettings";
import styles from "./ReciterPicker.module.css";

export function ReciterPicker() {
  const { reciterId, setReciterId } = useAudioSettings();
  const name = useId();

  return (
    <fieldset className={styles.group}>
      <legend className="sr-only">Qari</legend>
      {RECITERS.map((reciter) => (
        <label key={reciter.id} className={styles.option}>
          <input
            className={styles.radio}
            type="radio"
            name={name}
            value={reciter.id}
            checked={reciterId === reciter.id}
            onChange={() => setReciterId(reciter.id)}
          />
          <span className={styles.body}>
            <span className={styles.name}>{reciter.name}</span>
            <span className={styles.meta}>
              <span lang="ar" dir="rtl" className={styles.arabicName}>
                {reciter.arabicName}
              </span>
              <span aria-hidden="true">·</span>
              <span>
                {reciter.style} · {reciter.bitrate} kbps
              </span>
            </span>
          </span>
          <span className={styles.check} aria-hidden={reciterId !== reciter.id}>
            {reciterId === reciter.id ? <Icon icon={Check} size={18} /> : null}
          </span>
        </label>
      ))}
    </fieldset>
  );
}
