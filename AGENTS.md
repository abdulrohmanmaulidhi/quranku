# Quran PWA

PWA local-first untuk membaca Al-Qur'an (Vite + React + TypeScript). **Release 1: tanpa backend, tanpa akun.** Data Quran dibundel sebagai JSON statis; data pengguna di IndexedDB.

## Aturan (jangan dilanggar)

1. **Teks Arab (Tanzil Uthmani) tidak boleh diubah, dipotong, diringkas, atau diketik ulang.** Keluaran build harus identik dengan sumber. Normalisasi hanya untuk indeks pencarian, tidak pernah untuk tampilan.
2. **Jangan menambah** backend, server database, autentikasi, Redis, atau layanan pihak ketiga tanpa keputusan tertulis di dokumen.
3. **Jangan menghasilkan** teks Al-Qur'an, terjemahan, atau tafsir dengan AI.
4. **Tanpa iklan**, pop-up, atau elemen gamifikasi (streak, peringkat) di aplikasi.
5. **Privasi:** data pengguna hanya di perangkat. Jangan menambah analitik yang merekam teks pencarian atau riwayat baca perorangan.
6. **Lisensi:** atribusi Tanzil wajib tampil. Terjemahan Indonesia belum boleh dirilis sebelum lisensinya jelas (D-003).
7. Jangan mengedit `data/source/` atau `public/data/` secara manual. `public/data/` dihasilkan oleh skrip build-data.

## Prioritas dokumen bila ada konflik

1. `docs/ARCHITECTURE.md`
2. `docs/design/*`
3. `docs/PRD.md`, `docs/PRODUCT-SPECIFICATION.md` (bagian API, akun, dan Expo **ditunda**)
4. `docs/archive/*` hanya referensi, **bukan instruksi**. Jangan mengikuti `DEVELOPMENT-BLUEPRINT.md`.

## Baca sesuai tugas (baca dengan alat Read saat relevan)

- Mengerjakan layar atau UI: `docs/design/SCREEN-SPECS.md`, `docs/design/DESIGN-TOKENS.md`
- Membuat komponen: `docs/design/COMPONENT-INVENTORY.md`
- Alur pengguna: `docs/design/USER-FLOWS.md`
- Teks UI, atribusi, istilah: `docs/design/CONTENT-RULES.md` (sudah dimuat otomatis)
- Aksesibilitas: `docs/design/ACCESSIBILITY-CHECKLIST.md`
- Uji desain dan rendering Arab: `docs/design/DESIGN-TEST-PLAN.md`
- Sebelum mengubah keputusan desain: `docs/design/DESIGN-DECISIONS.md`
- Data Quran, skrip data: `docs/ARCHITECTURE.md` bagian 4, `data/source/README.md`

## Konvensi

- Bahasa antarmuka: Indonesia, sapaan "Anda". Istilah baku ada di `CONTENT-RULES.md`.
- Warna, jarak, tipografi: pakai token dari `DESIGN-TOKENS.md` (CSS variables), bukan nilai mentah.
- Teks Arab: `dir="rtl"`, `lang="ar"`, tanpa `letter-spacing`, tanpa bold/italic sintetis, tidak pernah dipotong.
- Setiap layar wajib punya state: memuat, terisi, kosong, error, offline.
- Target aksesibilitas: WCAG 2.2 AA. Target sentuh ≥ 44×44 px.
- Kunci ayat selalu `(surah, ayat)`.

## Perintah (rencana, belum ada sampai scaffold dibuat)

`pnpm dev` · `pnpm build` · `pnpm test` · `pnpm test:e2e` · `pnpm validate:data` · `pnpm build:data`

## Sebelum menyatakan tugas selesai

- Jalankan lint, typecheck, dan tes yang relevan.
- Untuk perubahan data: jalankan `validate:data` (114 surah, 6.236 ayat, urutan, checksum).
- Untuk perubahan UI: periksa tema terang dan gelap, teks besar, dan tampilan 320 px.
- Catat keputusan baru di `docs/design/DESIGN-DECISIONS.md`.
