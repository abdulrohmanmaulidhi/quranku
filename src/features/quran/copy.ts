import type { Ayah, Surah } from "@/lib/data/types";
import { formatReference } from "@/lib/format/reference";

export function buildReferenceCopy(surah: Surah, ayah: Ayah): string {
  return formatReference(surah.nameLatin, surah.n, ayah.n);
}

export function buildAyahCopy(surah: Surah, ayah: Ayah): string {
  return `${ayah.text}\n\n${buildReferenceCopy(surah, ayah)}\nSumber: Tanzil (teks Arab)`;
}
