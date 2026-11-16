/**
 * Pintu masuk TypeScript untuk implementasi normalisasi bersama.
 * Skrip build data mengimpor `normalize.mjs` langsung agar Node dapat
 * menjalankannya tanpa langkah kompilasi.
 */
export { findHighlightRanges, normalizeForSearch, normalizeWithMap } from "./normalize.mjs";
