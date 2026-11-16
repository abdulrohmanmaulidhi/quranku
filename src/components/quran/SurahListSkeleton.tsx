import { Skeleton } from "@/components/ui/Skeleton";
import styles from "./SurahListSkeleton.module.css";

export function SurahListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className={styles.list} aria-hidden="true">
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className={styles.row}>
          <Skeleton width="1.25rem" height="0.75rem" />
          <div className={styles.body}>
            <Skeleton width="8rem" height="0.95rem" />
            <Skeleton width="6rem" height="0.7rem" />
          </div>
          <Skeleton width="4.5rem" height="1.25rem" radius="sm" />
        </div>
      ))}
    </div>
  );
}
