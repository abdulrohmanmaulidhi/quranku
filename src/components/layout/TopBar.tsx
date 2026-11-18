import type { ReactNode } from "react";
import { ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Icon } from "../ui/Icon";
import { ReadingProgress } from "./ReadingProgress";
import styles from "./TopBar.module.css";

export interface TopBarProps {
  title: string;
  backTo?: string;
  onBack?: () => void;
  backLabel?: string;
  actions?: ReactNode;
  readingProgress?: boolean;
}

export function TopBar({
  title,
  backTo,
  onBack,
  backLabel = "Kembali",
  actions,
  readingProgress = false,
}: TopBarProps) {
  const backButton = onBack ? (
    <button type="button" aria-label={backLabel} className={styles.back} onClick={onBack}>
      <Icon icon={ChevronLeft} size={20} />
    </button>
  ) : backTo ? (
    <Link to={backTo} aria-label={backLabel} className={styles.back}>
      <Icon icon={ChevronLeft} size={20} />
    </Link>
  ) : null;

  return (
    <header className={styles.bar}>
      <div className={styles.inner}>
        {backButton}
        <p className={styles.title}>{title}</p>
        <div className={styles.actions}>{actions}</div>
      </div>
      {readingProgress ? <ReadingProgress /> : null}
    </header>
  );
}
