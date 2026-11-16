import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link, type LinkProps } from "react-router-dom";
import styles from "./Button.module.css";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive";
export type ButtonSize = "m" | "l";

interface ButtonStyleProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}

function buttonClassName({
  variant = "primary",
  size = "m",
  fullWidth = false,
  className,
}: ButtonStyleProps & { className?: string }): string {
  return [
    styles.button,
    styles[variant],
    size === "l" ? styles.large : "",
    fullWidth ? styles.fullWidth : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, ButtonStyleProps {}

export function Button({
  variant = "primary",
  size = "m",
  fullWidth = false,
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClassName({ variant, size, fullWidth, className })}
      {...props}
    />
  );
}

export interface ButtonLinkProps extends LinkProps, ButtonStyleProps {
  children: ReactNode;
}

export function ButtonLink({
  variant = "primary",
  size = "m",
  fullWidth = false,
  className,
  ...props
}: ButtonLinkProps) {
  return <Link className={buttonClassName({ variant, size, fullWidth, className })} {...props} />;
}
