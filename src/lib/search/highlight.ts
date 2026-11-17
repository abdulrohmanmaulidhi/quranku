export interface HighlightRange {
  start: number;
  end: number;
}

export interface HighlightSegment {
  text: string;
  highlighted: boolean;
}

/**
 * Membagi teks asli menjadi potongan tersorot tanpa mengubah satu karakter pun.
 * Rentang di luar batas atau tumpang tindih dirapikan di sini.
 */
export function toHighlightSegments(
  text: string,
  ranges: readonly HighlightRange[],
): HighlightSegment[] {
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

  const segments: HighlightSegment[] = [];
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
