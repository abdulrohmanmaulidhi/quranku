import { Skeleton } from "@/components/ui/Skeleton";
import styles from "./SearchResultsSkeleton.module.css";

export function SearchResultsSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className={styles.list} aria-hidden="true">
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className={styles.row}>
          <Skeleton width="7rem" height="0.7rem" />
          <Skeleton width="100%" height="3.5rem" radius="sm" />
        </div>
      ))}
    </div>
  );
}
