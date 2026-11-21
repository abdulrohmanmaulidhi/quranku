import type { Ayah, Surah, TranslationAyah } from "@/lib/data/types";
import { formatReference } from "@/lib/format/reference";

export function buildReferenceCopy(surah: Surah, ayah: Ayah): string {
  return formatReference(surah.nameLatin, surah.n, ayah.n);
}

export function buildAyahCopy(surah: Surah, ayah: Ayah, translation?: TranslationAyah): string {
  const parts = [ayah.text];
  if (translation) parts.push(translation.text);
  parts.push(buildReferenceCopy(surah, ayah));
  parts.push(
    translation
      ? "Sumber: KFGQPC Hafs 20 via QuranEnc (teks Arab), QuranEnc (terjemahan)"
      : "Sumber: KFGQPC Hafs 20 via QuranEnc (teks Arab)",
  );
  return parts.join("\n\n");
}
