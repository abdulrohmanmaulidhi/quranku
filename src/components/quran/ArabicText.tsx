import { useMemo } from "react";
import type { CSSProperties } from "react";
import styles from "./ArabicText.module.css";

export type ArabicSize = "s" | "m" | "l" | "xl" | "xxl";

export interface HighlightRange {
  start: number;
  end: number;
}

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

interface Segment {
  text: string;
  highlighted: boolean;
}

function toSegments(text: string, ranges: readonly HighlightRange[]): Segment[] {
  if (ranges.length === 0) return [{ text, highlighted: false }];

  const sorted = [...ranges]
    .filter((range) => Number.isInteger(range.start) && Number.isInteger(range.end))
    .map((range) => ({
      start: Math.max(0, Math.min(text.length, range.start)),
      end: Math.max(0, Math.min(text.length, range.end)),
    }))
    .filter((range) => range.end > range.start)
    .sort((a, b) => a.start - b.start);

  const merged: HighlightRange[] = [];
  for (const range of sorted) {
    const last = merged[merged.length - 1];
    if (last && range.start <= last.end) {
      last.end = Math.max(last.end, range.end);
    } else {
      merged.push({ ...range });
    }
  }

  const segments: Segment[] = [];
  let cursor = 0;
  for (const range of merged) {
    if (range.start > cursor) {
      segments.push({ text: text.slice(cursor, range.start), highlighted: false });
    }
    segments.push({ text: text.slice(range.start, range.end), highlighted: true });
    cursor = range.end;
  }
  if (cursor < text.length) {
    segments.push({ text: text.slice(cursor), highlighted: false });
  }

  return segments;
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
    () => (highlightRanges ? toSegments(text, highlightRanges) : null),
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
