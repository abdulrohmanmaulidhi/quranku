import { DATASET_VERSION } from "./version";

export const DATA_ROOT = `data/v${DATASET_VERSION}`;

/**
 * URL aset data. Jalur diturunkan dari versi dataset, bukan ditulis manual.
 * Aplikasi di-deploy di root domain sehingga `BASE_URL` bernilai "/"; sub-path
 * belum didukung (lihat manifest PWA di vite.config.ts).
 */
export function dataUrl(path: string): string {
  const base = import.meta.env.BASE_URL;
  const normalizedBase = base.endsWith("/") ? base : `${base}/`;
  return `${normalizedBase}${DATA_ROOT}/${path}`;
}
