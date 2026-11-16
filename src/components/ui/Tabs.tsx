import { useRef } from "react";
import type { KeyboardEvent } from "react";
import styles from "./Tabs.module.css";

export interface TabItem {
  value: string;
  label: string;
}

export interface TabsProps {
  items: readonly TabItem[];
  value: string;
  onChange: (value: string) => void;
  label: string;
  id: string;
}

export function Tabs({ items, value, onChange, label, id }: TabsProps) {
  const refs = useRef<Array<HTMLButtonElement | null>>([]);

  const focusTab = (index: number) => {
    const item = items[index];
    if (!item) return;
    onChange(item.value);
    refs.current[index]?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const last = items.length - 1;
    if (event.key === "ArrowRight") {
      event.preventDefault();
      focusTab(index === last ? 0 : index + 1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      focusTab(index === 0 ? last : index - 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      focusTab(0);
    } else if (event.key === "End") {
      event.preventDefault();
      focusTab(last);
    }
  };

  return (
    <div className={styles.list} role="tablist" aria-label={label}>
      {items.map((item, index) => {
        const selected = item.value === value;
        return (
          <button
            key={item.value}
            ref={(node) => {
              refs.current[index] = node;
            }}
            id={`${id}-tab-${item.value}`}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-controls={`${id}-panel-${item.value}`}
            tabIndex={selected ? 0 : -1}
            className={[styles.tab, selected ? styles.selected : ""].filter(Boolean).join(" ")}
            onClick={() => onChange(item.value)}
            onKeyDown={(event) => handleKeyDown(event, index)}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
