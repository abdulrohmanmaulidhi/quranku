import { useMemo } from "react";
import type { CSSProperties } from "react";
import { toHighlightSegments, type HighlightRange } from "@/lib/search/highlight";
import styles from "./ArabicText.module.css";

export type ArabicSize = "s" | "m" | "l" | "xl" | "xxl";

export type { HighlightRange };

export interface ArabicTextProps {
  text: string;
  size?: ArabicSize;
  as?: "p" | "div" | "span";
  className?: string;
  id?: string;
  style?: CSSProperties;
  /** Rentang pada teks asli; hanya membungkus, tidak mengubah karakter. */
  highlightRanges?: readonly HighlightRange[];
}

/**
 * Menampilkan teks Arab apa adanya. Jangan pernah memotong, menormalisasi,
 * atau mengubah isi `text` di komponen ini.
 */
export function ArabicText({
  text,
  size = "m",
  as: Tag = "p",
  className,
  id,
  style,
  highlightRanges,
}: ArabicTextProps) {
  const segments = useMemo(
    () => (highlightRanges ? toHighlightSegments(text, highlightRanges) : null),
    [highlightRanges, text],
  );

  return (
    <Tag
      id={id}
      dir="rtl"
      lang="ar"
      className={[styles.arabic, styles[size], className].filter(Boolean).join(" ")}
      style={style}
    >
      {segments
        ? segments.map((segment, index) =>
            segment.highlighted ? (
              <mark key={index} className={styles.mark}>
                {segment.text}
              </mark>
            ) : (
              <span key={index}>{segment.text}</span>
            ),
          )
        : text}
    </Tag>
  );
}
