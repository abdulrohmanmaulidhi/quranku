# Design Brief

## Quran PWA

**Versi:** 1.0
**Tanggal:** 2026-11-12
**Alat desain:** FigCraft
**Dokumen terkait:** PRD.md, PRODUCT-SPECIFICATION.md, DESIGN-TOKENS.md, SCREEN-SPECS.md, DESIGN-TEST-PLAN.md

> Catatan: nama produk masih _working title_ ("Quran Platform"). Eksplorasi nama dan identitas merek tidak boleh menghambat desain reader.

---

## 1. Tujuan desain

Merancang pengalaman membaca Al-Qur'an yang **tenang, nyaman, dan tepercaya** dalam bentuk PWA yang berjalan penuh di perangkat (tanpa backend, tanpa akun), sehingga pembaca harian dapat:

1. Membuka surah dan mulai membaca dalam hitungan detik.
2. Membaca teks Arab dengan nyaman (ukuran, jarak baris, tema).
3. Memahami artinya lewat terjemahan Indonesia yang diberi label sumber.
4. Memberi penanda dan melanjutkan bacaan terakhir.
5. Tetap membaca saat offline.

Keberhasilan desain diukur dari **kenyamanan membaca dan kemudahan menemukan ayat**, bukan dari keterlibatan atau durasi pemakaian.

## 2. Konteks yang memengaruhi desain

| Keputusan arsitektur                          | Dampak ke desain                                                                           |
| --------------------------------------------- | ------------------------------------------------------------------------------------------ |
| PWA local-first, tanpa backend                | Tidak ada layar login/daftar. Semua data pengguna tersimpan di perangkat.                  |
| Data Quran dibundel di aplikasi               | Loading nyaris instan; state "memuat" hanya penting pada kunjungan pertama.                |
| Offline sejak kunjungan pertama               | Perlu indikator status offline yang tidak mengganggu dan pesan jelas jika data belum siap. |
| Bisa di-install ke layar utama                | Desain harus nyaman dalam mode standalone (tanpa address bar), dengan _safe area_.         |
| Sinkronisasi antar perangkat belum ada        | Sediakan ekspor/impor penanda (berkas JSON) di Pengaturan.                                 |
| Teks Arab tidak boleh diubah (lisensi Tanzil) | Desain tidak boleh memotong, mengurutkan ulang, atau memodifikasi teks Arab.               |

## 3. Pengguna

**Utama — Pembaca harian (Indonesia):** ingin membaca nyaman dan cepat kembali ke posisi terakhir. Kemungkinan memakai HP Android, kadang iPhone, sebagian di desktop.

**Sekunder — Pelajar baru:** ingin memahami arti ayat lewat terjemahan.

Persona lain (pendengar, penghafal, peneliti) memengaruhi arsitektur, tetapi **tidak** memperluas lingkup Release 1.

## 4. Lingkup layar Release 1

1. Beranda
2. Indeks Surah (tab Surah dan Juz)
3. **Reader (prioritas tertinggi)**
4. Sheet Aksi Ayat
5. Sheet Pengaturan Baca
6. Lompat ke (surah / ayat / juz)
7. Penanda
8. Cari
9. Pengaturan
10. Sumber & Atribusi
11. Status offline dan ajakan instal

Detail tiap layar ada di `SCREEN-SPECS.md`.

## 5. Di luar lingkup Release 1

- Audio, tafsir, terjemahan tambahan, transliterasi (opsional, ditunda).
- Akun, sinkronisasi, target baca, pengingat, catatan pribadi, hafalan.
- Mode mushaf per halaman (butuh sumber tata letak halaman terverifikasi).
- Tema "warm" (dipertimbangkan setelah uji pembaca).
- Iklan, _streak_, papan peringkat, atau elemen gamifikasi apa pun.

## 6. Prinsip desain

1. **Teks Arab adalah pusat perhatian.** Kontrol dan dekorasi menyingkir.
2. **Membaca lebih penting daripada keterlibatan.** Tanpa notifikasi paksa, tanpa pop-up di dalam alur baca.
3. **Sumber transparan.** Teks Arab, terjemahan, dan (nanti) tafsir selalu dapat ditelusuri sumber dan lisensinya.
4. **Dapat diakses sejak awal.** Kontras, ukuran target sentuh, fokus keyboard, teks besar.
5. **Privasi secara bawaan.** Semua aktivitas membaca hanya tinggal di perangkat.
6. **Sederhana dulu.** Satu aksen warna, sedikit komponen, sedikit pilihan.

## 7. Karakter visual

**Kata kunci:** tenang · editorial · hormat · modern

- Banyak ruang kosong, hierarki halus.
- Fondasi netral, **satu** warna aksen (hijau tua).
- Tanpa gradien mencolok, tanpa ornamen berlebihan.
- Tidak memakai kaligrafi dekoratif yang bisa disangka teks Al-Qur'an.
- Terjemahan, transliterasi, dan teks Arab harus mudah dibedakan secara visual.

## 8. Batasan teknis yang harus dihormati desainer

- **RTL:** teks Arab selalu `dir="rtl"`, rata kanan, tanpa `letter-spacing`, tanpa italic/bold sintetis.
- **Font Arab:** dimuat sebagai web font. Pemilihan akhir lewat uji di `DESIGN-TEST-PLAN.md`. Jangan membuat subset font yang menghilangkan glyph diakritik.
- **Responsif:** desain dasar 390×844 (mobile) dan 1440×900 (desktop). Dukungan minimum lebar 320 px.
- **Tanpa ketergantungan hover:** semua aksi harus bisa dilakukan lewat sentuhan dan keyboard.
- **Mode standalone PWA:** hormati _safe area_ (notch, bilah gestur) dan jangan mengandalkan tombol "kembali" browser.
- **Teks bisa membesar:** layout tetap utuh sampai 200% pembesaran teks.
- **Reduced motion:** animasi harus punya versi tanpa gerak.

## 9. Kriteria keberhasilan desain (hipotesis awal, dikalibrasi setelah uji)

- Pengguna baru dapat membuka surah tertentu dan mulai membaca **tanpa bantuan**.
- Teks Arab dengan diakritik tampil benar di semua perangkat uji.
- Pengguna menemukan dan memakai kontrol ukuran teks tanpa petunjuk.
- Pengguna dapat menemukan kembali ayat yang diberi penanda.
- Semua teks lolos kontras minimal 4.5:1 (lihat `DESIGN-TOKENS.md`).
- Tidak ada elemen yang mengganggu alur baca (iklan, pop-up, rekomendasi tak terkait).

## 10. Pertanyaan terbuka

| #   | Pertanyaan                                                          | Pemilik         | Status                       |
| --- | ------------------------------------------------------------------- | --------------- | ---------------------------- |
| Q1  | Terjemahan Indonesia mana yang dipakai dan apakah lisensinya jelas? | Konten          | Terbuka                      |
| Q2  | Font Arab final (Amiri Quran, Scheherazade New, dll.)               | Desain          | Diputuskan lewat uji         |
| Q3  | Penanganan basmalah di awal surah pada data sumber                  | Konten + Desain | Perlu verifikasi file Tanzil |
| Q4  | Gaya nomor ayat: angka Arab-Indic atau Latin                        | Desain          | Diuji                        |
| Q5  | Pencarian di navigasi bawah mobile atau di dalam tab Quran/Beranda  | Desain          | Diuji                        |
| Q6  | Nama produk dan identitas merek                                     | Produk          | Ditunda                      |
| Q7  | Bahasa antarmuka selain Indonesia                                   | Produk          | Ditunda                      |

## 11. Deliverable desain

| Deliverable                             | Dokumen/berkas                               |
| --------------------------------------- | -------------------------------------------- |
| Token warna, tipografi, jarak           | `DESIGN-TOKENS.md` → _variables_ di FigCraft |
| Spesifikasi layar dan state             | `SCREEN-SPECS.md`                            |
| Alur pengguna                           | `USER-FLOWS.md`                              |
| Daftar komponen                         | `COMPONENT-INVENTORY.md`                     |
| Aturan konten dan teks UI               | `CONTENT-RULES.md`                           |
| Checklist aksesibilitas                 | `ACCESSIBILITY-CHECKLIST.md`                 |
| Rencana uji dan kriteria memilih varian | `DESIGN-TEST-PLAN.md`                        |
| Log keputusan                           | `DESIGN-DECISIONS.md`                        |

## 12. Urutan kerja yang disarankan

1. Pasang token ke FigCraft (warna terang/gelap, tipografi, jarak).
2. Siapkan teks uji Arab (salin dari berkas Tanzil, **jangan diketik ulang**).
3. Rancang **3 varian layar Reader**, lalu nilai memakai rubrik di `DESIGN-TEST-PLAN.md`.
4. Putuskan varian, catat di `DESIGN-DECISIONS.md`.
5. Rancang layar lain mengikuti `SCREEN-SPECS.md`, termasuk semua state.
6. Uji dengan 3–5 calon pembaca, perbaiki, lalu serahkan ke implementasi.
