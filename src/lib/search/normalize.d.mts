export function normalizeForSearch(value: string): string;
export function normalizeWithMap(text: string): {
  normalized: string;
  sourceIndexes: number[];
};
export function findHighlightRanges(
  text: string,
  query: string,
): Array<{ start: number; end: number }>;
