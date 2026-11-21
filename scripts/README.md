# scripts

Skrip pembangun dan validator data. Lihat `docs/ARCHITECTURE.md` bagian 4.

| Perintah                 | Skrip                   | Fungsi                                                                                                                                                                                       |
| ------------------------ | ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm validate:data`     | `validate-data.mjs`     | Memeriksa `data/source/`: checksum SHA-256, 114 surah, 6.236 ayat, urutan tanpa celah, tanpa duplikat, teks tidak kosong, jumlah ayat per surah cocok dengan metadata, dan 30 juz berurutan. |
| `pnpm build:data`        | `build-data.mjs`        | Menghasilkan `public/data/v3/` (manifest, `COPYRIGHT.txt`, `basmalah.json`, surahs, juz, `ar/`, `tr/indonesian_affairs/`, `search/`). Teks Arab dan terjemahan disalin verbatim.             |
| `pnpm fetch:translation` | `fetch-translation.mjs` | Mengunduh terjemahan QuranEnc ke `data/source/tr/` beserta syarat pemakaian dan checksum. Alat dev; tidak dijalankan saat build.                                                             |
| `pnpm verify:output`     | `verify-output.mjs`     | Membandingkan keluaran dengan sumber dan manifest; gagal bila ada teks, berkas, atau checksum yang berbeda.                                                                                  |

Aturan:

- Skrip hanya **membaca** `data/source/` dan **menulis** `public/data/`.
- Tidak ada langkah yang mengubah teks Arab. Normalisasi hanya boleh untuk indeks pencarian, bukan untuk keluaran `ar/`.
- Build gagal jika sumber tidak valid.
- Versi dataset ada di `scripts/lib/source.mjs` (`DATASET_VERSION`). Koreksi konten = naikkan versi, bukan menimpa versi lama.
- Terjemahan hanya diambil lewat `fetch-translation.mjs`; jangan mengedit berkas di `data/source/tr/` secara manual.
- Build bersifat idempoten: menjalankan ulang dengan sumber yang sama tidak mengubah berkas; bila isi versi yang ada berbeda, build menolak menimpa.

Berkas bersama ada di `scripts/lib/source.mjs`: parsing CSV `quran-hafs.csv`, nama surah `surah-names-id.json`, metadata `quran-data.js`, dan validasi.
