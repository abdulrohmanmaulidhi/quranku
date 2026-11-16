import { useId } from "react";
import type { LucideIcon } from "lucide-react";
import { Check } from "lucide-react";
import { Icon } from "./Icon";
import styles from "./SegmentedControl.module.css";

export interface SegmentedOption {
  value: string;
  label: string;
  icon?: LucideIcon;
}

export interface SegmentedControlProps {
  label: string;
  value: string;
  options: readonly SegmentedOption[];
  onChange: (value: string) => void;
}

export function SegmentedControl({ label, value, options, onChange }: SegmentedControlProps) {
  const name = useId();

  return (
    <fieldset className={styles.group}>
      <legend className="sr-only">{label}</legend>
      {options.map((option) => (
        <label key={option.value} className={styles.option}>
          <input
            className={styles.radio}
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
          />
          <span className={styles.content}>
            {option.icon ? <Icon icon={option.icon} size={18} /> : null}
            <span>{option.label}</span>
            {value === option.value ? <Icon icon={Check} size={16} /> : null}
          </span>
        </label>
      ))}
    </fieldset>
  );
}
