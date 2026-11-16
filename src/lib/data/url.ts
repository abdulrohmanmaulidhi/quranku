import { DATASET_VERSION } from "./version";

export const DATA_ROOT = `data/v${DATASET_VERSION}`;

/**
 * URL aset data menghormati `BASE_URL` agar aplikasi tetap bekerja saat
 * di-deploy di sub-path (mis. preview PR).
 */
export function dataUrl(path: string): string {
  const base = import.meta.env.BASE_URL;
  const normalizedBase = base.endsWith("/") ? base : `${base}/`;
  return `${normalizedBase}${DATA_ROOT}/${path}`;
}
