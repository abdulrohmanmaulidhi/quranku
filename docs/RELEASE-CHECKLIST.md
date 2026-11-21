# Daftar Periksa Rilis

Dipakai sebelum menaikkan versi Release 1. Salin tabel status ke catatan rilis
dan isi tanggal serta nama pemeriksa. Gate otomatis harus lulus pada commit
yang akan dirilis; jangan merilis dari working tree yang kotor.

**Versi aplikasi:** `package.json` → `version`
**Versi dataset:** `public/data/v3/manifest.json` → `version` dan `checksum`
**Commit:** `git rev-parse --short HEAD`

## 1. Gate otomatis

| Pemeriksaan    | Perintah              | Syarat                                   | Status |
| -------------- | --------------------- | ---------------------------------------- | ------ |
| Data           | `pnpm validate:data`  | 114 surah, 6.236 ayat, urutan, checksum  | ☐      |
| Tipe           | `pnpm typecheck`      | Tanpa galat                              | ☐      |
| Lint           | `pnpm lint`           | Tanpa temuan                             | ☐      |
| Format         | `pnpm format:check`   | Semua berkas sesuai Prettier             | ☐      |
| Unit           | `pnpm test`           | Semua lulus                              | ☐      |
| E2E            | `pnpm test:e2e`       | Semua lulus, termasuk axe                | ☐      |
| Build          | `pnpm build`          | `verify:output` OK, 236 berkas data      | ☐      |
| Lighthouse     | `pnpm lighthouse`     | Aksesibilitas ≥ 0,95, tanpa galat serius | ☐      |

`pnpm build` menjalankan `validate:data`, `build:data`, dan `verify:output`
secara berurutan. `public/data` dihasilkan ulang dan tidak di-commit.

## 2. Sapuan manual

| Area                    | Cara                                                              | Status |
| ----------------------- | ----------------------------------------------------------------- | ------ |
| Lebar 320 px            | Beranda, Indeks, Reader, Cari, Penanda, Pengaturan: tanpa gulir horizontal | ☐ |
| Zoom 200%               | Teks tidak terpotong, tombol tetap 44×44 px                        | ☐      |
| Tema terang dan gelap   | Semua layar utama, termasuk fokus keyboard                        | ☐      |
| Keyboard                | Tab mencapai semua kontrol, fokus terlihat, Escape menutup dialog | ☐      |
| Teks Arab               | Tetap RTL, harakat Hafs 20 utuh, tanpa letter-spacing             | ☐      |
| Target sentuh           | Semua kontrol ≥ 44×44 px                                          | ☐      |
| Atribusi                | KFGQPC, QuranEnc, dan Tanzil tampil di Reader dan Sumber & Atribusi | ☐    |
| PWA offline             | Muat ulang saat offline, baca surah tersimpan, cari tetap jalan   | ☐      |
| Ajakan pasang (D-040)   | Chromium: muncul setelah ayat 5, "Nanti" hilang 14 hari; iOS: instruksi di Pengaturan | ☐ |

## 3. Uji perangkat nyata

| Uji                                    | Perangkat          | Status |
| -------------------------------------- | ------------------ | ------ |
| Font Arab A4 (D-042): Hafs 20, harakat dan tanda waqaf terbaca | Android, iOS | ☐ |
| Instalasi PWA dari peramban dan peluncuran `standalone` | Android, iOS, desktop | ☐ |
| Offline setelah instalasi, mode pesawat            | Android, iOS        | ☐ |
| Pembacaan dengan TalkBack dan VoiceOver            | Android, iOS        | ☐ |

## 4. Sebelum menandai rilis

- [ ] Semua keputusan yang terbuka dan memblokir sudah dicatat di
      `docs/design/DESIGN-DECISIONS.md`.
- [ ] Teks baru di UI memakai istilah `CONTENT-RULES.md` dan sapaan "Anda".
- [ ] Tidak ada analytics, iklan, atau panggilan jaringan ke pihak ketiga.
- [ ] Tidak ada perubahan pada teks Arab atau terjemahan selain dari sumber.
- [ ] Catatan rilis menyebut versi dataset dan perubahan perilaku.

## 5. Rollback

Rilis disajikan sebagai berkas statis; rollback tidak menyentuh data pengguna.

1. Kembalikan deployment ke artefak `dist/` dari commit stabil sebelumnya
   (simpan artefak per rilis, jangan hanya tag git).
2. Build ulang dari commit tersebut sehingga service worker memakai hash aset
   lama. Naikkan `DATASET_VERSION` (`src/lib/data/version.ts` dan
   `scripts/lib/source.mjs`) hanya bila skema data ikut berubah.
3. Pastikan `public/data/v3/manifest.json` kembali ke versi dataset lama bila
   skema data berubah; cache data berversi (`quranku-data-v*`) akan dibersihkan
   otomatis oleh service worker.
4. Verifikasi: beranda terbuka, Reader menampilkan surah 1, pencarian Arab
   mengembalikan hasil, data pengguna (penanda, posisi) tetap ada.
5. Catat penyebab dan tindakan di catatan rilis.

Data pengguna tersimpan di IndexedDB dan tidak dihapus oleh rollback. Jangan
meminta pengguna menghapus data lokal kecuali skema Dexie berubah tanpa migrasi.

## 6. Item terbuka

| Item                                             | Status                                          |
| ------------------------------------------------ | ----------------------------------------------- |
| Nama surah ejaan Kemenag (D-020)                 | Menunggu daftar terverifikasi                   |
| Uji font Arab perangkat nyata (D-006)            | Belum dijalankan                                |
| Tinjauan basmalah oleh orang berkompeten (D-012) | Belum dijalankan                                |

## 7. Hasil audit terakhir

**2026-11-19**

- Lighthouse desktop: beranda 100/100/100/91, Reader 97/100/100/91, pencarian
  97/100/100/91 (performa/aksesibilitas/best-practices/SEO). SEO 91 hanya
  peringatan, bukan gate.
- 320 px terang dan gelap: tanpa gulir horizontal pada Reader, Pengaturan, dan
  ajakan pasang.
- Teks 200%: tanpa gulir horizontal setelah judul layar diizinkan membungkus.
- Ajakan pasang: tombol 44 px, tidak menutup Snackbar pembaruan, muncul hanya
  setelah ayat kelima.
