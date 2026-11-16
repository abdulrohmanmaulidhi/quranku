import type { ButtonHTMLAttributes } from "react";
import type { LucideIcon } from "lucide-react";
import { Icon } from "./Icon";
import styles from "./IconButton.module.css";

export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  icon: LucideIcon;
  label: string;
  iconSize?: number;
  filled?: boolean;
  tone?: "default" | "accent";
}

export function IconButton({
  icon,
  label,
  iconSize = 20,
  filled = false,
  tone = "default",
  className,
  type = "button",
  ...props
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      className={[styles.button, tone === "accent" ? styles.accent : "", className]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      <Icon icon={icon} size={iconSize} filled={filled} />
    </button>
  );
}
