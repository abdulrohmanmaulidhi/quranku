import { CircleAlert } from "lucide-react";
import type { ReactNode } from "react";
import { Icon } from "./Icon";
import styles from "./InlineError.module.css";

export interface InlineErrorProps {
  message: string;
  action?: ReactNode;
}

export function InlineError({ message, action }: InlineErrorProps) {
  return (
    <div className={styles.notice} role="alert">
      <span className={styles.icon}>
        <Icon icon={CircleAlert} size={20} />
      </span>
      <p className={styles.message}>{message}</p>
      {action ? <div className={styles.action}>{action}</div> : null}
    </div>
  );
}
