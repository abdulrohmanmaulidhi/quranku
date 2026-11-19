# Quranku

PWA local-first untuk membaca Al-Qur'an tanpa gangguan. Tanpa akun, tanpa iklan, dan tanpa backend: teks Al-Qur'an dibundel sebagai berkas statis, data pengguna disimpan di perangkat.

## Fitur

- Baca 114 surah / 6.236 ayat dari teks **Tanzil Uthmani v1.1** tanpa perubahan.
- Deep link ayat `/surah/:surah/:ayah`, penanda, posisi baca, serta pengaturan ukuran teks Arab dan terjemahan.
- Terjemahan Indonesia (Kementerian Agama RI via QuranEnc) dengan catatan kaki dan atribusi sumber, dapat disembunyikan.
- Pencarian surah (nama Latin, nama Arab, nomor), pencarian ayat Arab yang mengabaikan harakat, dan pencarian terjemahan Indonesia.
- Hasil pencarian menampilkan teks ayat atau terjemahan utuh dengan kata cocok disorot.
- Dapat dipasang sebagai PWA dan dibaca offline. Data diunduh di latar dengan progres; pengguna dapat menghapus salinan offline.
- Tema terang/gelap, target sentuh 44 px, dan target WCAG 2.2 AA.
- Ekspor/impor penanda lewat berkas JSON.

## Yang sengaja tidak ada

- Backend, akun, sinkronisasi, atau analitik yang merekam pencarian/riwayat.
- Iklan, pop-up, gamifikasi, atau pencarian tafsir/makna.

## Menjalankan

Prasyarat: Node.js >= 22.12 dan pnpm 12.

```bash
pnpm install
pnpm dev
```

`predev` dan `prebuild` menjalankan validasi serta build data. Anda tidak perlu mengedit `data/source/` atau `public/data/` secara manual.

Aplikasi di-deploy di root domain (`base: "/"`); deploy di sub-path belum didukung karena manifest PWA memakai jalur absolut.

Jika generator data berubah dan `public/data/v2` sudah ada, build data akan menolak menimpa versi lama. Hapus direktori keluaran itu (bukan `data/source/`), lalu jalankan ulang:

```bash
rm -rf public/data/v2
pnpm validate:data && pnpm build:data && pnpm verify:output
```

| Perintah                   | Fungsi                                                     |
| -------------------------- | ---------------------------------------------------------- |
| `pnpm dev`                 | Server pengembangan                                        |
| `pnpm build`               | Build produksi (validasi + build data + verifikasi)        |
| `pnpm preview`             | Pratinjau build produksi                                   |
| `pnpm test`                | Unit test Vitest                                           |
| `pnpm test:e2e`            | E2E Playwright (desktop + Pixel 5)                         |
| `pnpm lighthouse`          | Lighthouse CI terhadap build                               |
| `pnpm typecheck`           | TypeScript                                                 |
| `pnpm lint`                | ESLint                                                     |
| `pnpm format:check`        | Prettier                                                   |
| `pnpm validate:data`       | Validasi sumber: 114 surah, 6.236 ayat, urutan, checksum   |
| `pnpm build:data`          | Hasilkan `public/data/v2/` termasuk indeks pencarian       |
| `pnpm verify:output`       | Bandingkan keluaran dengan sumber dan checksum             |
| `pnpm generate:pwa-assets` | Buat ulang ikon PWA dari `public/icons/icon.svg`           |
| `pnpm fetch:translation`   | Ambil ulang terjemahan QuranEnc (alat dev, butuh jaringan) |

## Data dan lisensi

- Teks Arab: [Tanzil Project](https://tanzil.net/) — Uthmani v1.1, CC BY 3.0. Teks ditampilkan verbatim; atribusi tampil di aplikasi.
- Metadata surah/juz: berkas metadata Tanzil.
- Terjemahan Indonesia: **Kementerian Agama RI** via [QuranEnc.com](https://quranenc.com/), versi 1.0.1. Diterbitkan ulang sesuai QuranEnc Terms and Policies; teks dan catatan kaki tidak diubah.
- Ikon antarmuka: Lucide (ISC). Font: Inter dan Noto Naskh Arabic.

Berkas data mentah ada di `data/source/` dan tidak boleh diubah. `public/data/` dihasilkan oleh skrip dan tidak disimpan di git.

## Struktur singkat

```text
data/source/        sumber Tanzil dan terjemahan QuranEnc (jangan diedit)
scripts/            validasi, build data, verifikasi
public/data/v2/     keluaran build (gitignored)
src/app/            router, provider, layout
src/pages/          Beranda, Indeks, Reader, Cari, Penanda, Pengaturan
src/features/       data Quran, pencarian, offline, library
src/lib/            data client, Dexie, format, utilitas
tests/unit/         Vitest
tests/e2e/          Playwright
docs/               arsitektur dan spesifikasi desain
```

## Dokumentasi

- [Arsitektur](docs/ARCHITECTURE.md)
- [Spesifikasi layar](docs/design/SCREEN-SPECS.md)
- [Keputusan desain](docs/design/DESIGN-DECISIONS.md)
- [Normalisasi pencarian](docs/SEARCH-NORMALIZATION.md)
- [Aturan konten](docs/design/CONTENT-RULES.md)
- [Checklist aksesibilitas](docs/design/ACCESSIBILITY-CHECKLIST.md)

## Privasi

Semua data pengguna (penanda, posisi baca, pengaturan) hanya tersimpan di perangkat melalui IndexedDB. Tidak ada pengiriman teks pencarian atau riwayat baca ke server.
