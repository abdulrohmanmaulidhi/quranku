/**
 * Penyederhanaan imbuhan Indonesia untuk pencarian terjemahan.
 *
 * Ini bukan stemmer linguistik penuh: hanya membuang awalan/akhiran yang umum
 * agar kueri berbentuk berimbuhan tetap menemukan ayat yang memakai bentuk
 * dasar. Semua varian dicocokkan sebagai substring pada teks yang sudah
 * dinormalisasi, jadi tidak ada satu karakter pun teks tampilan yang berubah.
 */

const MAX_VARIANTS = 12;
const MIN_VARIANT_LENGTH = 4;

interface PrefixRule {
  readonly prefix: string;
  /** Huruf yang biasanya luluh saat awalan dilekatkan (meng- → k, meny- → s, …). */
  readonly restore?: string;
}

// Awalan diurutkan dari yang paling spesifik agar `menge-` tidak tertangkap `men-`.
const PREFIX_RULES: readonly PrefixRule[] = [
  { prefix: "menge" },
  { prefix: "pember" },
  { prefix: "penge" },
  { prefix: "meng", restore: "k" },
  { prefix: "meny", restore: "s" },
  { prefix: "mem", restore: "p" },
  { prefix: "men", restore: "t" },
  { prefix: "peng", restore: "k" },
  { prefix: "peny", restore: "s" },
  { prefix: "pem", restore: "p" },
  { prefix: "pen", restore: "t" },
  { prefix: "per" },
  { prefix: "ber" },
  { prefix: "ter" },
  { prefix: "me" },
  { prefix: "pe" },
  { prefix: "di" },
  { prefix: "ke" },
  { prefix: "se" },
];

const SUFFIX_RULES: readonly string[] = [
  "kannya",
  "annya",
  "nya",
  "lah",
  "kah",
  "pun",
  "kan",
  "an",
  "ku",
  "mu",
  "i",
];

/**
 * Varian satu kata kueri: kata asli ditambah bentuk setelah awalan/akhiran
 * dibuang (berantai, mis. `diketahui` → `ketahu` → `tahu`).
 *
 * Kata masukan harus sudah dinormalisasi dan berhuruf kecil.
 */
export function variantsForToken(token: string): string[] {
  if (token.length < MIN_VARIANT_LENGTH) return [token];

  const variants: string[] = [token];
  const seen = new Set(variants);
  const queue = [token];

  while (queue.length > 0 && variants.length < MAX_VARIANTS) {
    const word = queue.shift() as string;

    for (const suffix of SUFFIX_RULES) {
      if (!word.endsWith(suffix)) continue;
      const trimmed = word.slice(0, -suffix.length);
      if (trimmed.length < MIN_VARIANT_LENGTH || seen.has(trimmed)) continue;
      seen.add(trimmed);
      variants.push(trimmed);
      queue.push(trimmed);
      if (variants.length >= MAX_VARIANTS) break;
    }

    for (const rule of PREFIX_RULES) {
      if (!word.startsWith(rule.prefix)) continue;
      const rest = word.slice(rule.prefix.length);
      if (rest.length < MIN_VARIANT_LENGTH) continue;

      const stripped = rest;
      if (!seen.has(stripped)) {
        seen.add(stripped);
        variants.push(stripped);
        queue.push(stripped);
      }

      if (rule.restore) {
        const restored = rule.restore + rest;
        if (!seen.has(restored)) {
          seen.add(restored);
          variants.push(restored);
          queue.push(restored);
        }
      }

      if (variants.length >= MAX_VARIANTS) break;
    }
  }

  return variants;
}

/** Varian untuk seluruh kueri, dipakai juga oleh penyorotan hasil. */
export function expandQueryVariants(normalizedQuery: string): string[] {
  const tokens = normalizedQuery.split(" ").filter(Boolean);
  const variants = new Set<string>(tokens);

  for (const token of tokens) {
    for (const variant of variantsForToken(token)) variants.add(variant);
  }

  return [...variants];
}
