import { useEffect } from "react";
import { X } from "lucide-react";
import { Icon } from "./Icon";
import styles from "./Snackbar.module.css";

export interface SnackbarAction {
  label: string;
  onClick: () => void;
}

export interface SnackbarProps {
  message: string;
  tone?: "success" | "error";
  action?: SnackbarAction;
  onDismiss: () => void;
}

const AUTO_DISMISS_MS = 5000;

export function Snackbar({ message, tone = "success", action, onDismiss }: SnackbarProps) {
  useEffect(() => {
    const timer = window.setTimeout(onDismiss, AUTO_DISMISS_MS);
    return () => window.clearTimeout(timer);
  }, [message, onDismiss]);

  return (
    <div className={[styles.bar, tone === "error" ? styles.error : ""].filter(Boolean).join(" ")}>
      <p className={styles.message} role="status" aria-live="polite">
        {message}
      </p>
      {action ? (
        <button type="button" className={styles.action} onClick={action.onClick}>
          {action.label}
        </button>
      ) : null}
      <button type="button" className={styles.close} aria-label="Tutup" onClick={onDismiss}>
        <Icon icon={X} size={18} />
      </button>
    </div>
  );
}
