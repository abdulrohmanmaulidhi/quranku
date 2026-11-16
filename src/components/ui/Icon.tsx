import type { LucideIcon, LucideProps } from "lucide-react";

export interface IconProps extends Omit<LucideProps, "size" | "strokeWidth" | "fill"> {
  icon: LucideIcon;
  size?: number;
  filled?: boolean;
}

/**
 * Ikon Lucide dengan aturan D-018: stroke 2 pada grid 24, diskalakan
 * proporsional dan tidak pernah di bawah 1,5.
 */
export function Icon({ icon: Glyph, size = 20, filled = false, ...props }: IconProps) {
  const strokeWidth = Math.max(1.5, (2 * size) / 24);

  return (
    <Glyph
      aria-hidden="true"
      focusable="false"
      size={size}
      strokeWidth={strokeWidth}
      fill={filled ? "currentColor" : "none"}
      {...props}
    />
  );
}
