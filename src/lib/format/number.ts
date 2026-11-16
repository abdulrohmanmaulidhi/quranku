export function formatNumber(value: number): string {
  return new Intl.NumberFormat("id-ID").format(value);
}

export function formatAyahCount(value: number): string {
  return `${formatNumber(value)} ayat`;
}

export function formatSurahPosition(order: number): string {
  return `Surah ke-${formatNumber(order)}`;
}
