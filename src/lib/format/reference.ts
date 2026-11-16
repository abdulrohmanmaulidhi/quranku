export function formatReference(surahName: string, surah: number, ayah: number): string {
  return `QS. ${surahName} ${surah}:${ayah}`;
}
