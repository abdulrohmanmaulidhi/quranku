import type { ReactNode } from "react";
import { ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Icon } from "../ui/Icon";
import styles from "./TopBar.module.css";

export interface TopBarProps {
  title: string;
  backTo?: string;
  onBack?: () => void;
  backLabel?: string;
  actions?: ReactNode;
  progress?: number;
}

export function TopBar({
  title,
  backTo,
  onBack,
  backLabel = "Kembali",
  actions,
  progress,
}: TopBarProps) {
  const percent =
    progress === undefined ? undefined : Math.round(Math.min(1, Math.max(0, progress)) * 100);

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
      {percent !== undefined ? (
        <div
          className={styles.track}
          role="progressbar"
          aria-label="Progres baca"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
        >
          <div className={styles.fill} style={{ transform: `scaleX(${percent / 100})` }} />
        </div>
      ) : null}
    </header>
  );
}
