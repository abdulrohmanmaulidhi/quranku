import type { ReactNode } from "react";
import styles from "./PageContainer.module.css";

export interface PageContainerProps {
  children: ReactNode;
  width?: "default" | "reader";
  className?: string;
}

export function PageContainer({ children, width = "default", className }: PageContainerProps) {
  return (
    <div
      className={[styles.container, width === "reader" ? styles.reader : "", className]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}
