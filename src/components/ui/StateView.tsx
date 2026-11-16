import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { CircleAlert } from "lucide-react";
import { Icon } from "./Icon";
import styles from "./StateView.module.css";

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className={styles.state}>
      <span className={styles.icon}>
        <Icon icon={icon} size={24} />
      </span>
      <h2 className={styles.title}>{title}</h2>
      {description ? <p className={styles.description}>{description}</p> : null}
      {action ? <div className={styles.action}>{action}</div> : null}
    </div>
  );
}

export interface ErrorStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
  compact?: boolean;
}

export function ErrorState({ title, description, action, compact = false }: ErrorStateProps) {
  return (
    <div
      className={[styles.state, compact ? styles.compact : ""].filter(Boolean).join(" ")}
      role="alert"
    >
      <span className={styles.icon}>
        <Icon icon={CircleAlert} size={24} />
      </span>
      <h2 className={styles.title}>{title}</h2>
      {description ? <p className={styles.description}>{description}</p> : null}
      {action ? <div className={styles.action}>{action}</div> : null}
    </div>
  );
}
