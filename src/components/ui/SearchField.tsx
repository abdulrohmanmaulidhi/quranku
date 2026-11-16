import { useId, useRef } from "react";
import { Search, X } from "lucide-react";
import { Icon } from "./Icon";
import styles from "./SearchField.module.css";

export interface SearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder?: string;
  id?: string;
  autoFocus?: boolean;
  onSubmit?: () => void;
  maxLength?: number;
  className?: string;
}

export function SearchField({
  value,
  onChange,
  label,
  placeholder,
  id,
  autoFocus = false,
  onSubmit,
  maxLength,
  className,
}: SearchFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClear = () => {
    onChange("");
    inputRef.current?.focus();
  };

  return (
    <form
      role="search"
      className={[styles.field, className].filter(Boolean).join(" ")}
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit?.();
      }}
    >
      <span className={styles.icon} aria-hidden="true">
        <Icon icon={Search} size={20} />
      </span>
      <label htmlFor={inputId} className="sr-only">
        {label}
      </label>
      <input
        ref={inputRef}
        id={inputId}
        type="search"
        className={styles.input}
        value={value}
        placeholder={placeholder}
        autoComplete="off"
        autoFocus={autoFocus}
        maxLength={maxLength}
        enterKeyHint="search"
        onChange={(event) => onChange(event.target.value)}
      />
      {value ? (
        <button
          type="button"
          className={styles.clear}
          aria-label="Hapus pencarian"
          onClick={handleClear}
        >
          <Icon icon={X} size={18} />
        </button>
      ) : null}
    </form>
  );
}
