# Design Decisions Log

## Quran PWA

**Versi:** 1.0
**Tanggal dibuat:** 2026-11-12

Catat setiap keputusan desain di sini agar tidak mengulang perdebatan yang sama. Satu keputusan = satu baris di tabel ringkasan + (bila perlu) satu entri rinci.

**Status:** `Diusulkan` · `Diputuskan` · `Ditunda` · `Terbuka` · `Diganti`

---

## Ringkasan

| ID    | Keputusan                                                                                | Status     | Tanggal    | Ditinjau ulang bila                                        |
| ----- | ---------------------------------------------------------------------------------------- | ---------- | ---------- | ---------------------------------------------------------- |
| D-001 | PWA local-first, tanpa backend dan tanpa akun untuk Release 1                            | Diputuskan | 2026-11-12 | Sinkronisasi antar perangkat dibutuhkan                    |
| D-002 | Teks Arab dari Tanzil (Uthmani v1.1), ditampilkan tanpa perubahan                        | Diputuskan | 2026-11-12 | Ada sumber yang lebih sesuai dan berlisensi jelas          |
| D-003 | Terjemahan Indonesia dari QuranEnc (`indonesian_affairs`, Kemenag)                     | Diputuskan | 2026-11-17 | Izin dicabut atau edisi baru terbit    |
| D-004 | Alat desain: FigCraft                                                                    | Diputuskan | 2026-11-12 | Alat tidak memadai untuk kebutuhan desain                  |
| D-005 | Varian Reader: A (mobile) dan C (desktop) sebagai dugaan awal                            | Diusulkan  | 2026-11-12 | Hasil evaluasi B di `DESIGN-TEST-PLAN.md`                  |
| D-006 | Font Arab: Noto Naskh Arabic; KFGQPC HAFS dievaluasi dan tidak dipakai                        | Diputuskan | 2026-11-19 | Uji A4 di perangkat menunjukkan masalah harakat            |
| D-007 | Tema Terang dan Gelap di Release 1; tema "warm" ditunda                                  | Diputuskan | 2026-11-12 | Uji pembaca menunjukkan kebutuhan                          |
| D-008 | Mode mushaf per halaman ditunda                                                          | Ditunda    | 2026-11-12 | Ada sumber tata letak halaman terverifikasi                |
| D-009 | Sapaan antarmuka memakai "Anda"                                                          | Diusulkan  | 2026-11-12 | Uji pembaca                                                |
| D-010 | Istilah UI: "Penanda" untuk bookmark, "Ayat" untuk ayah                                  | Diusulkan  | 2026-11-12 | Uji pembaca                                                |
| D-011 | Navigasi mobile: Beranda · Quran · Penanda · Pengaturan; pencarian di Beranda dan Indeks | Diusulkan  | 2026-11-12 | Hasil uji kegunaan tugas 5                                 |
| D-012 | Basmalah dipisah dari ayat 1 di lapisan tampilan dan tampil di baris sendiri di Reader          | Diputuskan | 2026-11-19 | Data sumber berubah atau perlu terjemahan basmalah         |
| D-013 | Gaya nomor ayat (Arab-Indic atau Latin)                                                  | Terbuka    | 2026-11-12 | Hasil uji A dan B                                          |
| D-014 | Perpindahan perangkat lewat ekspor/impor penanda (berkas JSON)                           | Diputuskan | 2026-11-12 | Akun dan sinkronisasi dibangun                             |
| D-015 | Pemicu aksi ayat di Reader kontinu: "..." hanya pada ayat terpilih                       | Diputuskan | 2026-11-13 | Uji kegunaan: tombol tidak ditemukan atau tak dipakai      |
| D-016 | Target sentuh 44x44 px lewat padding, bukan memperbesar gambar                           | Diputuskan | 2026-11-13 | CSS tidak dapat mencapai 44 px tanpa menggeser tata letak  |
| D-017 | Atribusi Tanzil "Teks Arab: Tanzil (CC BY 3.0)" di setiap varian Reader                  | Diputuskan | 2026-11-13 | Pemilik lisensi meminta bentuk atribusi lain               |
| D-018 | Set ikon: Lucide (ISC), grid 24, stroke 2, warna lewat variabel                          | Diputuskan | 2026-11-14 | Ada glyph yang tidak tersedia atau rendering bermasalah    |
| D-019 | Ikon terisi menandakan keadaan aktif/tersimpan, garis untuk aksi                         | Diganti sebagian | 2026-11-14 | Uji kegunaan: state tidak terbaca                     |
| D-020 | Nama latin surah: transliterasi Tanzil atau daftar Indonesia                             | Terbuka    | 2026-11-15 | Daftar nama Indonesia terverifikasi tersedia               |
| D-021 | Rute kanonis `/surah`; rute lama `/quran*` dialihkan                                     | Diputuskan | 2026-11-15 | Struktur informasi berubah                                 |
| D-022 | Arti nama surah dalam bahasa Inggris tidak ditampilkan; baris memakai Makkiyah/Madaniyah | Diputuskan | 2026-11-15 | Uji pembaca meminta arti nama                              |
| D-023 | Tema: Dexie sebagai sumber setelah hidrasi; `localStorage` hanya cadangan awal                | Diputuskan | 2026-11-15 | Alur hidrasi tema berubah                                  |
| D-030 | PWA: app shell precache, data berversi, pembaruan tanpa muat ulang paksa                  | Diputuskan | 2026-11-16 | Strategi cache atau alur pembaruan berubah                 |
| D-031 | Unduhan data offline otomatis setelah idle, dengan progres dan penanganan kuota            | Diputuskan | 2026-11-16 | Kuota, kebijakan data saver, atau alur unduhan berubah      |
| D-032 | Hasil pencarian Arab menampilkan teks ayat utuh dari `ar/*.json`, bukan cuplikan           | Diputuskan | 2026-11-16 | Aturan tampilan teks Arab berubah                          |
| D-033 | Indeks pencarian Arab: referensi + teks ternormalisasi, dimuat malas                       | Diputuskan | 2026-11-16 | Format indeks atau algoritme pencarian berubah             |
| D-034 | Pencarian terjemahan: indeks terpisah, tanpa catatan kaki, tampil paksa sekali kunjungan   | Diputuskan | 2026-11-17 | Perlu stemming atau pencarian catatan kaki                 |
| D-035 | Ukuran teks terjemahan 4 tingkat dan pratinjau penanda dua baris                           | Diputuskan | 2026-11-18 | Desain meminta pratinjau utuh atau ukuran tambahan          |
| D-036 | Halaman dimuat per rute dengan `lazy` dan `Suspense` di `RootLayout`                       | Diputuskan | 2026-11-18 | Navigasi terasa lambat atau strategi prefetch berubah       |
| D-037 | Ikon navigasi selalu garis; status aktif lewat latar, bobot, dan aksen                     | Diputuskan | 2026-11-18 | Uji kegunaan: tab aktif tidak terbaca                       |
| D-038 | Progres baca mengikuti gulir dan tombol kembali ke atas di Reader                          | Diputuskan | 2026-11-18 | Progres dinilai mengganggu atau tombol menutupi konten      |
| D-039 | Pencarian terjemahan mengabaikan imbuhan umum lewat varian kueri                           | Diputuskan | 2026-11-19 | Muncul keluhan presisi hasil pencarian                     |
| D-024 | Deep link ayat: `/surah/:surah/:ayah` kanonis; `?ayah=N` tetap didukung                  | Diputuskan | 2026-11-15 | Pola rute berubah                                          |
| D-025 | Posisi baca tidak ditimpa gulir programatik; pembaruan setelah interaksi pengguna        | Diputuskan | 2026-11-15 | Semantik posisi baca berubah                               |
| D-026 | Menu aksi ayat membuka ke atas bila ruang bawah tidak cukup, di luar containment kartu    | Diputuskan | 2026-11-15 | Menu diganti portal atau bottom sheet                      |
| D-027 | "Lompat ke" memakai dialog native dengan tab Surah & Ayat dan Juz                         | Diputuskan | 2026-11-15 | S06 diubah menjadi sheet penuh atau ditambah pencarian      |
| D-028 | Ekspor/impor penanda bersifat aditif; hapus data lokal menghapus Dexie dan tema tersimpan  | Diputuskan | 2026-11-15 | Format cadangan berubah atau akun ditambahkan               |
| D-029 | "Bagikan ayat" hanya tampil bila Web Share API tersedia; teks Arab disertakan verbatim    | Diputuskan | 2026-11-15 | Perlu tautan berbagi khusus atau berbagi tanpa teks Arab    |

---

## Entri rinci

### D-001 — PWA local-first, tanpa backend

- **Konteks:** teks Qur'an statis; Release 1 tidak memerlukan akun atau sinkronisasi.
- **Keputusan:** semua data referensi dibundel di aplikasi; data pengguna disimpan lokal.
- **Alasan:** lebih cepat, offline otomatis, tanpa biaya server, risiko operasional lebih kecil.
- **Dampak desain:** tidak ada layar login; perlu ekspor/impor penanda; perlu state offline dan penyiapan data.

### D-002 — Sumber teks Arab

- **Keputusan:** Tanzil Uthmani v1.1 (CC BY 3.0).
- **Syarat:** tampilkan atribusi; teks tidak boleh diubah; normalisasi untuk pencarian dilakukan di indeks terpisah.
- **Catatan:** baca syarat lengkap di tanzil.net sebelum rilis publik.

### D-003 — Terjemahan Indonesia

- **Tanggal:** 2026-11-17
- **Status:** Diputuskan
- **Konteks:** Reader membutuhkan terjemahan Indonesia untuk Release 1, tetapi belum ada sumber dengan izin redistribusi yang jelas. Aplikasi gratis, tanpa iklan, tanpa akun, dan menyimpan data secara offline, sehingga izin harus mencakup penyalinan berkas ke perangkat.
- **Opsi yang dipertimbangkan:** (a) memakai terjemahan Kemenag dari Tanzil, (b) memakai API resmi Qur'an Kemenag, (c) memakai terjemahan dari QuranEnc, (d) merilis tanpa terjemahan.
- **Keputusan:** memakai **QuranEnc.com**, terjemahan Indonesia "Ministry of Religious Affairs" (`indonesian_affairs`, penerbit Kementerian Agama RI, versi 1.0.1, pembaruan 2025-06-23). QuranEnc menyatakan isi terjemahan "can be downloaded and re-published" dengan tujuh syarat: tanpa perubahan, sebut penerbit dan QuranEnc.com, cantumkan nomor versi, pertahankan info penerjemah, laporkan catatan ke QuranEnc, perbarui ke versi terbaru, dan tanpa iklan yang tidak pantas.
- **Alasan:** satu-satunya opsi dengan izin redistribusi tertulis dan publik; edisi lebih baru dari berkas Tanzil (2010) dan menyertakan catatan kaki. Tanzil hanya mengizinkan pemakaian non-komersial tanpa menyatakan izin redistribusi, dan hak dasarnya tetap milik penerbit. API Kemenag memerlukan surat permohonan dan token, serta belum menjelaskan redistribusi offline. Scrape `quran.kemenag.go.id` dilarang.
- **Dampak (desain, konten, teknis):** `data/source/tr/indonesian_affairs.json` menyimpan salinan verbatim beserta syarat dan checksum; `scripts/fetch-translation.mjs` adalah alat dev sekali jalan. Build menghasilkan `tr/indonesian_affairs/NNN.json` dan `SOURCE.txt`; manifest mencatat penerbit, versi, lisensi, URL, tanggal ambil, dan SHA-256. Reader menampilkan terjemahan secara bawaan di bawah teks Arab (dapat disembunyikan lewat Pengaturan baca; pilihan disimpan di perangkat), dengan label sumber singkat di bawah header surah. Catatan kaki dibuka per ayat lewat panel lipat dan penanda `[n]` dipertahankan. S10 menampilkan atribusi ganda (Kemenag dan QuranEnc.com), versi, syarat pemakaian, dan SHA-256. Dataset naik ke v2; berkas `tr/` ikut diunduh untuk mode offline. Pencarian terjemahan ditunda.
- **Risiko yang diterima:** izin berasal dari platform penerbit, bukan surat langsung Kemenag. Tersedia jalur takedown: hapus direktori `tr/` dan naikkan `DATASET_VERSION`.
- **Ditinjau ulang bila:** QuranEnc mencabut izin, menerbitkan versi baru, atau aplikasi mulai dimonetisasi sehingga syarat non-komersial/konten berubah.
- **Bukti:** `data/source/tr/SOURCE.md` (salinan syarat + tanggal akses), `data/source/CHECKSUMS.txt`, dan keluaran `pnpm verify:output`.

### D-005 — Varian Reader

- **Dugaan awal:** A untuk mobile, C untuk desktop.
- **Cara memutuskan:** rubrik B di `DESIGN-TEST-PLAN.md`.
- **Hasil:** _(diisi setelah evaluasi)_

### D-006 — Font Arab

- **Tanggal:** 2026-11-19
- **Status:** Diputuskan
- **Konteks:** Teks Arab dirender dengan Noto Naskh Arabic (SIL OFL, 52 KB woff2). Kandidat lain di `DESIGN-TEST-PLAN.md` A2: Amiri Quran, Scheherazade New, dan KFGQPC Uthmanic Script HAFS (typeface mushaf Madinah).
- **Opsi yang dipertimbangkan:** (a) tetap Noto Naskh Arabic, (b) KFGQPC Uthmanic Script HAFS.
- **Keputusan:** Noto Naskh Arabic dipertahankan untuk Release 1. KFGQPC Uthmanic Script HAFS sudah dicoba dan dibatalkan: seluruh 68 codepoint data tersedia di `cmap`-nya, tetapi tanda `۟` (U+06DF, 3.988 kemunculan) dirender sebagai cakram penuh dengan cincin putus-putus yang menyatu menjadi gumpalan pada 24–28 px, sementara Noto menggambarnya sebagai lingkaran berongga yang ringan. Berkas HAFS juga menambah 291 KB precache dan lisensinya melarang subset maupun konversi, sehingga tidak ada ruang optimasi ukuran.
- **Alasan:** keterbacaan pada ukuran UI lebih penting daripada kemiripan dengan cetakan mushaf, dan tidak ada perbaikan yang mungkin tanpa melanggar lisensi font.
- **Dampak (desain, konten, teknis):** tidak ada perubahan kode; `--font-arabic` tetap `"Noto Naskh Arabic", "Amiri Quran", "Scheherazade New", serif`; S10 tetap menampilkan Noto Naskh Arabic beserta berkas lisensinya.
- **Catatan pengujian:** daftar periksa A4 di `DESIGN-TEST-PLAN.md` belum dijalankan di perangkat fisik. Keputusan diambil dari render Chromium (desktop, Pixel 5, 320 px; terang dan gelap) atas persetujuan pemilik produk, sehingga atribusi di S10 tidak mengklaim uji perangkat.
- **Ditinjau ulang bila:** uji A4 di perangkat nyata menunjukkan harakat terpotong atau harakat bertumpuk tidak terbaca.

### D-012 — Basmalah

- **Masalah:** pada sebagian berkas teks, basmalah bisa ikut tertulis di awal ayat pertama sebuah surah (kecuali Al-Fatihah dan At-Taubah). Perlu dicek pada berkas yang diunduh.
- **Temuan (2026-11-15, Tanzil Uthmani v1.1):** basmalah menyatu di awal ayat 1 pada 113 surah. 111 surah memakai bentuk yang sama persis dengan 1:1; surah 95 dan 97 memakai bentuk dengan shadda pada ba; surah 9 tidak memiliki basmalah; pada surah 1 basmalah adalah ayat 1 itu sendiri. Rincian di `data/source/SOURCES.md` §4.
- **Dampak pada build:** `build-data` menyalin teks apa adanya dan tidak memotong basmalah. Header basmalah di `SurahHeader` belum dapat diisi tanpa memilih opsi (b) atau (c).
- **Pertanyaan:** bagaimana menampilkan basmalah sebagai header tanpa mengubah teks sumber?
- **Opsi:** (a) tampilkan teks apa adanya, (b) pisahkan di lapisan tampilan tanpa mengubah data tersimpan, (c) pakai sumber yang memisahkan basmalah secara eksplisit.
- **Keputusan:** Opsi (b), 2026-11-19. `splitBasmalah` (`src/features/quran/basmalah.ts`) membagi teks ayat 1 menjadi basmalah dan sisa teks untuk tampilan saja. Reader menampilkan basmalah sebagai baris tersendiri tepat di bawah petunjuk "Ketuk ayat untuk membuka aksi.", sebelum daftar ayat; `AyahCard` ayat 1 menampilkan sisa teksnya. Batas diambil dari spasi keempat pada string asli, sehingga bentuk varian surah 95 dan 97 ikut terbawa tanpa diketik ulang. Surah 1 tidak dipisah karena basmalah adalah ayat 1; surah 9 tidak memiliki basmalah. Data tersimpan, checksum, dan indeks pencarian tidak berubah. Salin, bagikan, dan ekspor tetap memakai `ayah.text` utuh; hasil pencarian Arab tetap menampilkan ayat utuh (D-032).
- **Alasan:** nomor ayat 1 kembali menempel pada ayat yang benar tanpa memotong data atau menambah sumber baru. Pemisahan di lapisan tampilan juga menjaga keluaran build identik dengan Tanzil.
- **Dampak (desain, konten, teknis):** `src/features/quran/basmalah.ts`, `ReaderPage` (baris `data-basmalah` dan gaya `.basmalah` di bawah petunjuk), `AyahCard` (prop `arabicText` untuk tampilan), S03, `CONTENT-RULES`, unit test `basmalah` dan `reader`, E2E `basmalah.spec.ts` serta tes verbatim yang membaca ayat 1. `SurahHeader` hanya berisi identitas surah. Deep link ke ayat 1 menggulir ke atas agar basmalah terlihat. Tidak ada terjemahan untuk baris basmalah karena QuranEnc tidak menyediakannya per surah.
- **Catatan pengujian:** unit test membaca `data/source/quran-uthmani.txt` dan memastikan seluruh 112 surah terpisah tepat setelah empat kata, `basmalah + " " + sisa === teks sumber`, dan bentuk dasar basmalah sama dengan 1:1 setelah normalisasi. Surah 1, surah 9, dan 27:30 diuji tidak tersentuh.
- **Ditinjau ulang bila:** data sumber berubah sehingga basmalah bukan lagi empat kata pertama, atau muncul kebutuhan terjemahan basmalah di header.

### D-015 — Pemicu aksi ayat di Reader kontinu (varian B)

- **Tanggal:** 2026-11-13
- **Status:** Diputuskan
- **Konteks:** Varian B menampilkan ayat sebagai aliran kontinu tanpa kartu, sehingga tidak ada tempat tetap untuk aksi ayat (tandai, salin). Rubrik B2 menilai kemudahan membuka aksi ayat.
- **Opsi yang dipertimbangkan:** (a) tekan lama pada ayat, (b) tombol "..." di ujung setiap ayat, (c) tombol "..." hanya pada ayat terpilih.
- **Keputusan:** Opsi (c). Mengetuk ayat membuatnya terpilih (latar `color.surface-raised`, garis `color.accent` 2 px, radius 8); bar aksi 44 px muncul tepat di bawah ayat dengan tombol "..." 44×44 di ujung ayat (sisi kiri pada teks RTL) dan label "Aksi ayat N".
- **Alasan:** pilihan (a) tidak ditemukan pengguna baru dan tidak terlihat oleh pembaca layar; pilihan (b) menambah satu ikon per ayat pada tampilan yang tujuannya bersih.
- **Dampak:** tiga state baru di setiap varian Reader: diam → ayat terpilih → sheet aksi (S04). Batal dengan mengetuk area lain atau menggulir. Pembaca layar mengumumkan "Ayat N dari M, QS. …, terpilih" dan tombol aksi sebagai kontrol terpisah. Berlaku juga di desktop (S03-A).
- **Ditinjau ulang bila:** uji kegunaan menunjukkan pengguna tidak menemukan tombol, atau ayat terpilih tidak pernah dipakai.
- **Bukti:** `figcraft/Quranku.figcraft`, frame `S03-B · ayat terpilih` dan `S03-A · desktop (ayat terpilih)`.

### D-016 — Target sentuh 44×44 px dengan padding

- **Tanggal:** 2026-11-13
- **Status:** Diputuskan
- **Konteks:** Audit kanvas menemukan kontrol di bawah 44 px: segmented 34–40, `Switch` 26, ikon aksi baris 20, tautan teks "Tutup"/"Lihat semua" 20, tombol +/- stepper 12×24.
- **Keputusan:** kontrol yang terlihat kecil tidak diperbesar gambarnya; area sentuh dinaikkan ke 44×44 lewat padding atau pembungkus transparan. Kontrol yang memang berbentuk baris (baris pengaturan, tab, tombol) dinaikkan tingginya ke 44–48.
- **Alasan:** menjaga kepadatan visual sambil memenuhi target 44×44 di `AGENTS.md`.
- **Dampak:** `Switch` memakai toggle seluruh baris 48 px; segmen tema memakai padding 44 di dalam track 48; tombol +/- memakai area 44 di dalam stepper 116; tautan teks mendapat padding vertikal 44. Tidak ada perubahan token warna atau tipografi.
- **Ditinjau ulang bila:** implementasi CSS tidak bisa mencapai 44 px tanpa menggeser tata letak.
- **Bukti:** frame `S01 · Fokus & urutan baca`; temuan audit aksesibilitas 2026-11-13.

### D-017 — Atribusi Tanzil di semua varian Reader

- **Tanggal:** 2026-11-13
- **Status:** Diputuskan
- **Konteks:** `CONTENT-RULES.md` mewajibkan atribusi Tanzil tampil; sebelumnya hanya ada di S10 dan footer Reader A.
- **Keputusan:** setiap varian Reader (A, B, C, 320 px, 200%) menampilkan satu baris footer "Teks Arab: Tanzil (CC BY 3.0)" dengan tautan "Sumber & Atribusi" menuju S10, di akhir konten surah.
- **Alasan:** kewajiban lisensi harus terlihat tanpa membuka Pengaturan.
- **Dampak:** menambah 40 px di akhir konten; tidak mengubah teks Arab. Teks atribusi memakai string persis dari `CONTENT-RULES.md`.
- **Ditinjau ulang bila:** pemilik lisensi meminta bentuk atribusi lain.
- **Bukti:** footer di `S03 · Reader A`; halaman `S10 · Sumber & Atribusi`.

### D-018 — Set ikon: Lucide

- **Tanggal:** 2026-11-14
- **Status:** Diputuskan
- **Konteks:** kanvas memakai 11 glyph gambar tangan dalam 283 salinan; grid tidak seragam (16×12, 18×18, 20×20, 24×24), stroke 1.6–1.8, dan beberapa bentuk tidak konsisten dengan labelnya.
- **Opsi yang dipertimbangkan:** (a) Lucide (ISC), (b) Hugeicons free (MIT), (c) tetap gambar tangan dan hanya merapikan grid.
- **Keputusan:** Lucide, grid 24, ukuran tampilan 20–24 px mengikuti konteks komponen. Stroke 2 pada grid 24 dan diskalakan proporsional (2 × ukuran/24, minimum 1,5); cap dan join `round`. Warna ikon selalu lewat variabel tema, tidak pernah hex mentah. Geometri diganti di tempat dengan `node.set path` sehingga binding, posisi, dan urutan layer tidak berubah.
- **Alasan:** satu bahasa bentuk, lisensi ISC yang jelas, dukungan `fill` untuk keadaan aktif, dan penggantian tanpa risiko tata letak.
- **Dampak:** seluruh ikon di 46 frame dan 11 komponen diganti di tempat; salinan di dalam instance ikut berubah otomatis, sehingga posisi, binding warna, dan urutan layer tidak berubah. Nama layer menjadi `icon/lucide/<glyph>`. Glyph yang dipakai: search, arrow-right, arrow-left, house, book-open, bookmark, sliders-horizontal, chevron-left, chevron-right, chevron-down, x, copy, link-2, share. Strip referensi 14 glyph ada di halaman `Components` (`Ikon · Lucide`). Notis lisensi ISC disertakan saat scaffold aplikasi.
- **Ditinjau ulang bila:** ada glyph yang tidak tersedia di Lucide atau renderingnya bermasalah di perangkat uji.
- **Bukti:** `S01 · Beranda`, `S03 · Reader A`, `S04 · Sheet Aksi Ayat`, halaman `Components`.

### D-019 — Ikon terisi untuk keadaan aktif

- **Tanggal:** 2026-11-14
- **Status:** Diputuskan
- **Konteks:** tab navigasi aktif dan status terpenanda sebelumnya hanya dibedakan warna. `ACCESSIBILITY-CHECKLIST.md` dan `SCREEN-SPECS.md` melarang informasi disampaikan hanya lewat warna.
- **Keputusan:** ikon terisi menandakan keadaan aktif atau tersimpan; ikon garis menandakan aksi atau keadaan tidak aktif. Di `BottomNav` dan `SideNav` desktop, ikon tab aktif memakai `fill` variabel aksen selain warna teks. Tombol penanda pada `AyahCard` tetap garis karena merupakan aksi, bukan status; setelah alur penanda dibangun, keadaan tersimpan memakai `bookmark` terisi.
- **Alasan:** bentuk terisi terbaca tanpa membedakan warna dan tetap jelas pada mode Gelap.
- **Dampak:** seluruh ikon tab aktif di `BottomNav` (8 frame) dan `SideNav` desktop kini terisi; tidak ada perubahan ukuran atau tata letak. Aturan ini menjadi acuan saat membuat state "tersimpan" di Reader.
- **Diganti sebagian oleh D-037:** ikon navigasi kembali selalu garis; ikon terisi hanya untuk status tersimpan.
- **Ditinjau ulang bila:** uji kegunaan menunjukkan pengguna tidak membedakan keadaan terisi dan garis.
- **Bukti:** `S01 · Beranda`, `S02 · Indeks Surah`, `S07 · Penanda (gelap)`, `S03-A · desktop`.

### D-020 — Nama latin surah

- **Tanggal:** 2026-11-15
- **Status:** Terbuka
- **Konteks:** `surahs.json` v1 memakai `nameLatin` dari metadata Tanzil (mis. "Al-Kahf", "Al-Faatiha"), sedangkan desain dan `CONTENT-RULES.md` memakai transliterasi Indonesia (mis. "Al-Kahfi", "Al-Fatihah").
- **Opsi yang dipertimbangkan:** (a) tampilkan `nameLatin` Tanzil apa adanya, (b) tambahkan tabel nama Indonesia terkurasi di lapisan data atau UI, (c) ganti sumber metadata.
- **Keputusan:** _(diisi setelah daftar nama terverifikasi tersedia)_
- **Dampak:** sampai diputuskan, UI memakai `nameLatin` Tanzil atau memetakan sendiri; ejaan Indonesia tidak boleh dikarang.
- **Ditinjau ulang bila:** daftar nama Indonesia resmi/terverifikasi tersedia.

### D-021 — Rute kanonis `/surah`

- **Tanggal:** 2026-11-15
- **Status:** Diputuskan
- **Konteks:** `ARCHITECTURE.md` menyebut `/quran`, sedangkan implementasi dan label navigasi memakai "Quran" sebagai nama fitur, bukan bagian URL.
- **Opsi yang dipertimbangkan:** (a) pertahankan `/quran`, (b) pindah ke `/surah`, (c) dukung keduanya tanpa pengalihan.
- **Keputusan:** rute kanonis adalah `/surah`, `/surah/:surah`, dan `/surah/:surah/:ayah`. Rute lama `/quran`, `/quran/:surah`, dan `/quran/:surah/:ayah` dialihkan dengan mempertahankan query. `/sumber` dialihkan ke `/pengaturan/sumber`.
- **Alasan:** URL menyebut objek yang dibuka (surah), konsisten dengan istilah "Indeks Surah", dan menghindari dua URL setara untuk konten yang sama.
- **Dampak:** tautan dalam, pengujian navigasi, dan tabel rute `ARCHITECTURE.md` memakai bentuk `/surah`; tautan lama tetap berfungsi.
- **Ditinjau ulang bila:** struktur informasi atau istilah navigasi berubah.

### D-022 — Arti nama surah berbahasa Inggris tidak ditampilkan

- **Tanggal:** 2026-11-15
- **Status:** Diputuskan
- **Konteks:** metadata Tanzil menyediakan `nameEnglish` (mis. "The Cave"). Antarmuka berbahasa Indonesia dan belum ada daftar arti nama yang terkurasi.
- **Keputusan:** `nameEnglish` tetap tersimpan di data tetapi tidak dirender. Baris surah menampilkan `Makkiyah`/`Madaniyah` dan jumlah ayat dari metadata yang tervalidasi.
- **Alasan:** menghindari campuran bahasa dan terjemahan arti nama yang belum ditinjau.
- **Dampak:** `SurahRow`, `SurahHeader`, dan hasil pencarian tidak menampilkan arti bahasa Inggris. Pencarian tetap mengenali nama Latin, nama Arab, dan nomor surah.
- **Ditinjau ulang bila:** uji pembaca menunjukkan kebutuhan arti nama atau tersedia daftar arti yang terverifikasi.

### D-023 — Tema: Dexie sebagai sumber, `localStorage` sebagai cadangan awal

- **Tanggal:** 2026-11-15
- **Status:** Diputuskan
- **Konteks:** tema harus tetap diingat antar kunjungan dan tersedia sebelum basis data siap.
- **Keputusan:** preferensi `light`, `dark`, atau `system` disimpan di Dexie (`settings` kunci `theme`) setelah hidrasi. `localStorage` dengan kunci `quranku.theme` hanya menjadi nilai awal sebelum Dexie terbaca. Pilihan `system` mengikuti `prefers-color-scheme`. Nilai lain diabaikan dan dianggap `system`.
- **Alasan:** tidak ada kedipan tema saat muat awal, sementara seluruh data pengguna tetap berada di perangkat dan satu sumber kebenaran tersedia setelah hidrasi.
- **Dampak:** `ThemeProvider` membaca `localStorage`, lalu menimpa dengan nilai Dexie bila ada, dan menulis perubahan ke Dexie. `localStorage` tidak dihapus agar pembacaan awal tetap cepat.
- **Ditinjau ulang bila:** alur hidrasi tema atau skema pengaturan berubah.

### D-024 — Deep link ayat

- **Tanggal:** 2026-11-15
- **Status:** Diputuskan
- **Konteks:** tautan juz dan tautan lama memakai `?ayah=N`; bentuk path lebih mudah dibagikan dan dibaca.
- **Keputusan:** bentuk kanonis tautan ayat adalah `/surah/:surah/:ayah`. Parameter `?ayah=N` tetap didukung. Ayat yang dituju digulir ke tengah layar dan diberi label "Ayat dituju". Nomor di luar rentang menampilkan pemberitahuan yang dapat ditutup tanpa memblokir bacaan.
- **Alasan:** kompatibilitas dengan tautan yang sudah ada tanpa mengorbankan URL yang jelas.
- **Dampak:** `ReaderPage` membaca path lalu query; `JuzRow` memakai bentuk query; pengujian mencakup kedua bentuk dan nomor tidak valid.
- **Ditinjau ulang bila:** pola rute atau perilaku gulir berubah.

### D-025 — Posisi baca tidak ditimpa gulir programatik

- **Tanggal:** 2026-11-15
- **Status:** Diputuskan
- **Konteks:** deep link menggulir ayat tujuan ke tengah layar. Pendeteksi posisi membaca memilih ayat teratas yang masih terlihat, sehingga ayat sebelum tujuan (mis. 9 saat tujuan 10) langsung tersimpan dan kartu "Lanjutkan membaca" menunjuk ayat yang salah.
- **Keputusan:** posisi awal disimpan dari ayat tujuan deep link (atau ayat 1). Pembaruan berbasis gulir hanya aktif setelah pengguna berinteraksi lewat `wheel`, `touchmove`, `pointerdown`, atau `keydown`. Gulir programatik dan pemulihan posisi tidak mengubah posisi tersimpan.
- **Alasan:** kartu "Lanjutkan membaca" harus menunjuk ayat yang dibuka pengguna, bukan ayat yang kebetulan berada di ambang atas setelah gulir otomatis.
- **Dampak:** `ReaderPage` menyimpan penanda interaksi di `useRef`; pengujian E2E memastikan deep link `18:10` menghasilkan posisi `18:10`. Gulir dengan scrollbar tetap terdeteksi lewat `pointerdown`.
- **Ditinjau ulang bila:** semantik posisi baca berubah atau ada metode gulir asistif yang perlu dilacak.

### D-026 — Menu aksi ayat membuka ke atas bila ruang bawah tidak cukup

- **Tanggal:** 2026-11-15
- **Status:** Diputuskan
- **Konteks:** menu aksi berada di dalam kartu ayat. Pada 320 px dan ayat panjang, menu terbuka ke bawah melewati batas viewport; `content-visibility: auto` pada kartu juga memotong menu sehingga sebagian aksi tidak dapat diketuk.
- **Keputusan:** kartu yang terpilih memakai `content-visibility: visible` dan dinaikkan di atas kartu berikutnya. Menu mengukur ruang di bawah pemicu dan membuka ke atas bila ujung bawahnya akan melewati viewport. Menu diberi `max-height` dan dapat digulir.
- **Alasan:** seluruh aksi (penanda, salin referensi, salin ayat) harus terjangkau pada layar 320 px tanpa mengubah struktur sheet S04.
- **Dampak:** `AyahCard` menyimpan `menuPlacement`; CSS menyediakan varian `.menuTop`. Pengujian E2E penanda berjalan pada desktop dan Pixel 5.
- **Ditinjau ulang bila:** menu diganti portal, popover, atau bottom sheet sesuai S04.

### D-027 — "Lompat ke" memakai dialog dengan pilihan surah/ayat dan awal juz

- **Tanggal:** 2026-11-15
- **Status:** Diputuskan
- **Konteks:** S06 membutuhkan perpindahan cepat tanpa meninggalkan Reader. Daftar 114 surah dan 30 juz harus tetap ringkas di layar 320 px serta dapat dioperasikan dengan papan ketik.
- **Keputusan:** "Lompat ke" membuka `<dialog>` native dengan tab **Surah & Ayat** dan **Juz**. Tab Surah & Ayat memakai pemilih surah dan kolom nomor ayat; nomor kosong membuka awal surah. Nomor di luar rentang menampilkan pesan inline "Surah ini memiliki N ayat." tanpa menutup dialog. Tab Juz memuat daftar juz secara malas dan membuka ayat awal juz yang dipilih.
- **Alasan:** dialog native memberi pengurungan fokus dan tombol Escape tanpa pustaka tambahan; pemilih menghindari daftar panjang dan kesalahan ketik.
- **Dampak:** `JumpToDialog` memakai `useJuz` dengan pemuatan malas; navigasi memakai bentuk kanonis `/surah/:surah/:ayah`; pengujian unit dan E2E mencakup rentang tidak valid, awal surah, awal juz, dan penutupan dialog.
- **Ditinjau ulang bila:** S06 diubah menjadi sheet penuh atau pencarian nomor surah ditambahkan.

### D-028 — Ekspor/impor penanda bersifat aditif

- **Tanggal:** 2026-11-15
- **Status:** Diputuskan
- **Konteks:** pengguna perlu memindahkan penanda ke perangkat lain tanpa akun. Impor yang menimpa data dapat menghapus penanda yang dibuat setelah ekspor.
- **Keputusan:** ekspor menghasilkan JSON `quran-pwa` versi 1 berisi penanda, posisi baca, dan pengaturan. Impor memvalidasi seluruh berkas, menambahkan penanda yang belum ada, melewati duplikat, dan melaporkan jumlah diimpor/dilewati. Posisi baca hanya dipulihkan bila perangkat belum punya posisi. Pengaturan yang dikenal (`theme`, `reader.arabicSize`, `reader.showTranslation`, `reader.translationSize`) hanya diisi bila belum ada. Berkas tidak valid ditolak tanpa mengubah data.
- **Alasan:** impor tidak boleh menghapus data lokal, sementara migrasi perangkat tetap membawa posisi dan preferensi bila perangkat tujuan masih kosong.
- **Dampak:** `src/lib/db/backup.ts` menangani format dan transaksi Dexie; Pengaturan menyediakan ekspor, impor, dan "Hapus data lokal" dengan dialog konfirmasi. Hapus data membersihkan tabel Dexie dan kunci `localStorage` tema, lalu tema kembali ke `system`.
- **Ditinjau ulang bila:** format cadangan berubah, pengaturan baru perlu ikut dipulihkan, atau akun dan sinkronisasi ditambahkan.

### D-029 — Berbagi ayat lewat Web Share API

- **Tanggal:** 2026-11-15
- **Status:** Diputuskan
- **Konteks:** S04 meminta aksi bagikan bila perangkat mendukung. Tidak semua peramban menyediakan `navigator.share`, dan teks Arab harus tetap utuh saat dibagikan.
- **Keputusan:** aksi "Bagikan ayat" hanya dirender bila `navigator.share` tersedia. Muatannya memakai teks ayat Arab verbatim, referensi, atribusi Tanzil, dan URL kanonis `/surah/:surah/:ayah`. Pembatalan oleh pengguna tidak menampilkan galat; kegagalan lain menampilkan "Tidak dapat membagikan. Coba lagi."
- **Alasan:** memakai lembar berbagi bawaan perangkat tanpa menambah dependensi atau mengirim data ke layanan pihak ketiga. Teks Arab tidak diringkas atau dinormalisasi.
- **Dampak:** `AyahCard` memeriksa ketersediaan API saat render; pengujian unit dan E2E meniru `navigator.share` dan memastikan muatan berisi teks verbatim.
- **Ditinjau ulang bila:** diperlukan tautan berbagi yang dapat dipratinjau, atau aksi berbagi harus tersedia tanpa Web Share API.

### D-030 — Strategi cache PWA dan pembaruan tanpa muat ulang paksa

- **Tanggal:** 2026-11-16
- **Status:** Diputuskan
- **Konteks:** Release 1 harus dapat dipasang dan dibuka tanpa jaringan, tanpa backend. Teks Al-Qur'an tidak boleh berubah, dan pembaruan tidak boleh menghilangkan posisi baca.
- **Opsi yang dipertimbangkan:** (a) precache seluruh data saat instalasi, (b) cache saat dibaca saja, (c) precache app shell + unduhan data di latar dengan progres, (d) memaksa muat ulang saat versi baru tersedia.
- **Keputusan:** memakai `vite-plugin-pwa` dengan `registerType: "prompt"` dan `injectRegister: null`. App shell (HTML/JS/CSS/font/ikon) di-precache Workbox. Data Quran memakai cache berversi `quranku-data-v1` dengan strategi `CacheFirst` untuk `ar/*.json` dan `search/*.json`. Pembaruan hanya menampilkan pemberitahuan "Versi baru tersedia."; pengguna memilih **Muat ulang**, tidak ada reload paksa. Cache data lama dihapus saat aplikasi mulai.
- **Alasan:** app shell kecil dapat diprecache saat instalasi, sedangkan seluruh data Quran (~1,6 MB teks + indeks) lebih baik diunduh di latar agar kunjungan pertama tetap cepat. Prompt pembaruan menjaga posisi baca dan kontrol pengguna.
- **Dampak (desain, konten, teknis):** `vite.config.ts` mengatur manifest, ikon, precache, dan runtime caching. `PwaUpdatePrompt` menampilkan pembaruan dan status siap offline. `clearOldDataCaches` mencegah data usang. E2E `pwa.spec.ts` memeriksa manifest, service worker, dan precache; `offline.spec.ts` memeriksa pemakaian data tanpa jaringan.
- **Ditinjau ulang bila:** dataset naik versi besar, strategi cache berubah, atau diperlukan pembaruan otomatis di latar.

### D-031 — Unduhan data offline otomatis dengan progres dan penanganan kuota

- **Tanggal:** 2026-11-16
- **Status:** Diputuskan
- **Konteks:** Pengguna perlu membaca seluruh Al-Qur'an tanpa jaringan, tetapi mengunduh 235 berkas pada kunjungan pertama tidak boleh menghambat interaksi atau menghabiskan kuota tanpa kendali.
- **Opsi yang dipertimbangkan:** (a) unduh semua saat instalasi, (b) hanya cache saat surah dibuka, (c) unduh di latar setelah idle dengan progres dan opsi hapus, (d) ajukan dialog izin unduhan.
- **Keputusan:** `OfflineProvider` memeriksa cache saat mulai, lalu memulai unduhan otomatis setelah `requestIdleCallback` (atau timeout 800 ms) bila perangkat online dan tidak mengaktifkan `Save-Data`. Unduhan memakai Cache API langsung dari halaman, konkurensi 3, dan melaporkan progres lewat banner S11 serta baris Pengaturan. Pengguna dapat mengunduh ulang, mencoba lagi, atau menghapus salinan offline. Kuota penuh dan kegagalan jaringan memiliki pesan terpisah.
- **Alasan:** unduhan di latar memberi pengalaman baca yang langsung dapat dipakai, sementara progres dan opsi hapus menjaga kendali serta ruang penyimpanan pengguna. Cache API langsung memudahkan pelaporan progres dan pembersihan.
- **Dampak (desain, konten, teknis):** `src/features/offline/cache.ts`, `OfflineProvider`, `OfflineSetupBanner`, dan baris data offline di Pengaturan. Setelah pengguna menghapus salinan, unduhan otomatis tidak langsung berjalan lagi pada sesi itu. E2E menunggu seluruh berkas (235 pada dataset v2, termasuk terjemahan dan indeks pencarian) masuk cache sebelum menguji mode offline.
- **Ditinjau ulang bila:** ukuran dataset berubah drastis, kuota perangkat menjadi masalah umum, atau diperlukan unduhan selektif per juz/surah.

### D-032 — Hasil pencarian Arab menampilkan teks ayat utuh

- **Tanggal:** 2026-11-16
- **Status:** Diputuskan
- **Konteks:** S08 menyebut "cuplikan dengan kata cocok ditandai", tetapi aturan proyek melarang memotong atau mengubah teks Arab. Indeks pencarian juga tidak menyimpan teks asli agar tidak ada salinan kedua yang dapat menyimpang.
- **Opsi yang dipertimbangkan:** (a) menampilkan cuplikan yang dipotong, (b) menampilkan teks ayat utuh dari `ar/*.json`, (c) menyimpan teks asli di indeks pencarian.
- **Keputusan:** setiap hasil menampilkan referensi `QS. Nama Surah surah:ayat` dan **teks ayat utuh** yang dibaca dari `ar/XXX.json`. Kata yang cocok ditandai dengan `<mark>` berdasarkan pemetaan posisi ke teks asli. Hasil dibatasi 20 teratas dengan catatan bila batas tercapai. Mode terjemahan diputuskan kemudian di D-034.
- **Alasan:** memenuhi aturan verbatim dan menghindari duplikasi teks di berkas pencarian. Pemetaan sorotan memungkinkan penanda visual tanpa mengubah karakter.
- **Dampak (desain, konten, teknis):** `SearchResultRow` memuat teks per surah lewat `loadSurahText` (di-cache), `ArabicText` menerima `highlightRanges`, dan `findHighlightRanges` memetakan posisi ternormalisasi kembali ke teks asli. Teks hasil selalu identik dengan Reader; diuji di unit dan E2E.
- **Ditinjau ulang bila:** aturan tampilan teks berubah atau diperlukan pratinjau lintas ayat.

### D-033 — Indeks pencarian Arab yang ringkas dan dimuat malas

- **Tanggal:** 2026-11-16
- **Status:** Diputuskan
- **Konteks:** Pencarian Arab harus bekerja tanpa backend dan tanpa memuat seluruh teks Quran di muatan awal.
- **Opsi yang dipertimbangkan:** (a) memindai `ar/*.json` saat mencari, (b) indeks berisi teks asli + ternormalisasi, (c) indeks berisi referensi + teks ternormalisasi saja.
- **Keputusan:** `scripts/build-data.mjs` menghasilkan `public/data/v1/search/arabic.json` berisi `[surah, ayah, normalizedText]` untuk 6.236 ayat (sekitar 775 KB). Indeks dimuat malas hanya saat mode **Arab** aktif dan kueri minimal dua karakter. Pencocokan mewajibkan semua kata kueri muncul; peringkat memberi bobot pada kecocokan persis, awalan, frasa, dan jumlah kemunculan. Normalisasi hanya untuk pencarian dan dijelaskan di `docs/SEARCH-NORMALIZATION.md`.
- **Alasan:** memindai 114 berkas per kueri terlalu lambat dan boros; menyimpan teks asli menggandakan data dan berisiko menyimpang. Referensi + teks ternormalisasi menjaga indeks kecil dan teks tampilan tetap satu sumber.
- **Dampak (desain, konten, teknis):** `scripts/build-data.mjs` dan `verify-output.mjs` memakai `src/lib/search/normalize.mjs` yang sama dengan aplikasi. `loadSearchIndex` memvalidasi jumlah entri dan versi. `searchAyahs` diuji untuk harakat, multi-kata, batas hasil, dan kueri terlalu pendek.
- **Ditinjau ulang bila:** diperlukan pencarian akar kata, atau ukuran indeks Arab melewati anggaran. Pencarian terjemahan diputuskan terpisah di D-034.

### D-034 — Pencarian terjemahan dengan indeks terpisah dan tampilan paksa sekali kunjungan

- **Tanggal:** 2026-11-17
- **Status:** Diputuskan
- **Konteks:** Terjemahan Indonesia sudah tampil di Reader (D-003), tetapi S08 baru mendukung pencarian surah dan Arab. Pengguna perlu menemukan ayat dari kata terjemahan tanpa backend dan tanpa memuat data besar di muatan awal.
- **Opsi yang dipertimbangkan:** (a) memindai `tr/*.json` saat mencari, (b) indeks `[surah, ayat, ternormalisasi]` untuk teks terjemahan, (c) indeks berisi teks asli + catatan kaki. Opsi (b) dan (c) juga dipertimbangkan untuk cakupan: hanya teks atau termasuk catatan kaki.
- **Keputusan:**
  - `scripts/build-data.mjs` menghasilkan `search/translation.json` berskema sama dengan indeks Arab: `{ schemaVersion: 1, datasetVersion, entries: [[surah, ayah, normalizedText]] }` untuk 6.236 ayat, memakai `normalizeForSearch` yang sama. **Hanya teks terjemahan** yang diindeks; catatan kaki tidak.
  - Indeks dimuat malas hanya saat mode **Terjemahan** aktif dan kueri ≥ 3 karakter. Panjang minimum 3 karena kata Indonesia dua huruf terlalu umum.
  - Pencocokan memakai `searchAyahs`: semua kata kueri harus muncul (AND), tanpa stemming/imbuhan. Keterbatasan ini ditulis di UI dan dokumen.
  - Baris hasil (`TranslationResultRow`) menampilkan teks terjemahan utuh dengan `<mark>` dari `findHighlightRanges`; teks diambil dari berkas terjemahan, bukan dari indeks.
  - Tautan hasil membuka Reader dengan `state={{ showTranslation: true }}`. Reader menampilkan terjemahan untuk kunjungan itu tanpa mengubah pengaturan tersimpan; mengubah sakelar atau menekan reset membatalkan paksa tampil.
  - Indeks ikut diunduh offline sehingga jumlah berkas menjadi **235** (≈5,6 MB).
- **Alasan:** memisahkan indeks menjaga muatan awal tetap kecil dan tidak menggandakan teks terjemahan di berkas pencarian. Menampilkan teks utuh mematuhi aturan verbatim. Paksa tampil sekali kunjungan menghindari perubahan pengaturan diam-diam, sementara pengguna tetap dapat mematikannya.
- **Dampak (desain, konten, teknis):** `scripts/build-data.mjs` (anggaran 1,6 MB, peringatan > 1,4 MB), `scripts/verify-output.mjs`, `src/lib/search/index.ts` (parser + pemuat indeks ganda), `useTranslationSearchIndex`, `SearchPage` tiga mode, `TranslationResultRow`, `ReaderPage` (`forceTranslation`), `src/features/offline/cache.ts`, serta unit/E2E baru. Ukuran terukur: indeks terjemahan ≈1,1 MB, indeks Arab ≈775 KB, total data ≈5,6 MB.
- **Ditinjau ulang bila:** diperlukan pencarian berimbuhan/stemming, pencarian catatan kaki, atau ukuran indeks melewati anggaran.

### D-035 — Ukuran teks terjemahan 4 tingkat dan pratinjau penanda dua baris

- **Tanggal:** 2026-11-18
- **Status:** Diputuskan
- **Konteks:** S05 menjanjikan empat tingkat ukuran terjemahan dan S07 menjanjikan pratinjau terjemahan pada daftar penanda. Token `--text-translation-*` sudah ada tetapi belum dipakai; `AyahCard` memakai ukuran UI 14 px. Daftar penanda hanya menampilkan referensi dan tanggal.
- **Opsi yang dipertimbangkan:** (a) membiarkan ukuran tunggal dan penanda tanpa pratinjau, (b) menyimpan potongan pratinjau di basis data, (c) membaca terjemahan dari data surah saat daftar ditampilkan dan memotong hanya pada lapisan tampilan.
- **Keputusan:** ukuran terjemahan memakai kunci `reader.translationSize` (`s`/`m`/`l`/`xl`, bawaan `m`), diterapkan lewat atribut `data-size` pada kontainer terjemahan dan token `--text-translation-*`. Stepper hanya tampil saat terjemahan aktif dan ikut di "Atur ulang ke bawaan". Pratinjau penanda membaca terjemahan per surah secara malas, ditampilkan verbatim dengan `line-clamp: 2`; bila terjemahan gagal dimuat, baris tetap menampilkan referensi dan tanggal. Teks Arab tidak pernah dipotong.
- **Alasan:** memenuhi janji S05/S07 tanpa mengubah data, tanpa duplikasi teks di basis data, dan tanpa dependensi baru. Memotong terjemahan pada daftar diperbolehkan; memotong teks Arab tidak.
- **Dampak (desain, konten, teknis):** `useTranslationSize`, `AyahCard`, `ReadingSettings`, `ReaderPage`, `BookmarksPage`, `backup.ts` (kunci baru pada ekspor/impor), `AyahCard.module.css`, `BookmarksPage.module.css`, unit/E2E, serta S05/S07 di `SCREEN-SPECS.md`.
- **Ditinjau ulang bila:** desain meminta pratinjau utuh, ukuran tambahan, atau pratinjau yang tersedia offline tanpa memuat berkas surah.

### D-036 — Pemuatan halaman per rute

- **Tanggal:** 2026-11-18
- **Status:** Diputuskan
- **Konteks:** `router.tsx` mengimpor seluruh halaman secara statis sehingga satu chunk `index-*.js` mencapai **511 KB (160 KB gzip)** dan Vite memperingatkan chunk > 500 KB. Pengguna hanya membuka satu layar per kunjungan.
- **Opsi yang dipertimbangkan:** (a) menaikkan `chunkSizeWarningLimit` tanpa mengubah apa pun, (b) memisahkan vendor saja, (c) memuat tiap halaman dengan `React.lazy` dan `Suspense` di `RootLayout`.
- **Keputusan:** semua halaman didaftarkan di `src/app/lazyPages.ts` dengan `React.lazy`; `RootLayout` membungkus `Outlet` dengan `Suspense` dan fallback skeleton ber-`role="status"`. Pemisahan vendor tidak dilakukan terpisah karena pemisahan rute sudah menurunkan muatan awal.
- **Alasan:** muatan awal turun ke **333,36 KB (105,46 KB gzip)** tanpa peringatan ukuran chunk, tanpa dependensi baru, dan tanpa perubahan perilaku rute. Service worker tetap mem-precache semua chunk sehingga rute malas tetap tersedia offline.
- **Dampak (desain, konten, teknis):** `src/app/lazyPages.ts` (baru), `src/app/router.tsx`, `RootLayout.tsx`, `RootLayout.module.css` (`.fallback`), serta cakupan axe untuk Penanda, Sumber, dan dialog Pengaturan baca.
- **Ditinjau ulang bila:** navigasi rute terasa lambat (perlu prefetch), jumlah halaman bertambah banyak, atau strategi *code splitting* diganti.

### D-037 — Ikon navigasi selalu garis

- **Tanggal:** 2026-11-18
- **Status:** Diputuskan
- **Konteks:** D-019 membuat ikon tab aktif terisi sehingga bentuknya berubah antar-state dan tampak tidak konsisten dengan ikon lain di `SideNav` dan `BottomNav`. Permintaan pengguna: ikon tetap garis, warna aksen dipakai saat aktif dan hover.
- **Opsi yang dipertimbangkan:** (a) mempertahankan ikon terisi (D-019), (b) ikon garis dengan warna aksen saja tanpa cue lain, (c) ikon garis dengan cue bentuk tambahan.
- **Keputusan:** `SideNav` dan `BottomNav` selalu memakai ikon garis. Keadaan aktif ditandai pil latar `--color-accent-subtle`, teks dan ikon aksen, bobot 600, serta `aria-current="page"` dari `NavLink`. Hover memakai warna aksen dengan latar `--color-surface`. Ikon terisi tetap dipakai untuk status tersimpan (penanda ayat) dan bukan untuk navigasi.
- **Alasan:** menyatukan bahasa bentuk ikon tanpa mengandalkan warna saja — bobot tebal dan pil latar membedakan tab aktif meski warna tidak terbaca. `aria-current` menjaga status tetap tersedia bagi pembaca layar.
- **Dampak (desain, konten, teknis):** `SideNav.tsx`, `BottomNav.tsx`, `SideNav.module.css`, `BottomNav.module.css`, cek E2E di `navigation.spec.ts`, `COMPONENT-INVENTORY.md`; mengganti sebagian D-019.
- **Ditinjau ulang bila:** uji kegunaan menunjukkan tab aktif tidak terbaca tanpa ikon terisi.

### D-038 — Progres baca mengikuti gulir dan tombol kembali ke atas

- **Tanggal:** 2026-11-18
- **Status:** Diputuskan
- **Konteks:** bar progres di `TopBar` hanya muncul pada deep link dan nilainya statis (`targetAyah / ayahCount`), sehingga tidak mencerminkan posisi baca. Setelah menggulir jauh di surah panjang, pengguna harus menggulir balik ke atas untuk kembali ke header.
- **Opsi yang dipertimbangkan:** (a) membiarkan progres statis, (b) menyimpan persentase di state React, (c) memperbarui bar lewat DOM dari dalam komponen sendiri.
- **Keputusan:** `ReadingProgress` menghitung `scrollY / (scrollHeight - innerHeight)`, memperbarui `transform: scaleX()` dan `aria-valuenow` lewat `requestAnimationFrame` tanpa re-render `ReaderPage`; tinggi konten yang berubah (terjemahan/font) dipantau `ResizeObserver`. Halaman tanpa gulir dianggap 100%. `BackToTop` (target 44×44, ikon panah atas) muncul setelah satu layar tergulir, tidak masuk urutan tab saat tersembunyi, dan memakai gulir halus kecuali `prefers-reduced-motion: reduce`.
- **Alasan:** membaca surah panjang butuh umpan balik posisi dan jalan cepat ke atas. Memperbarui lewat DOM menghindari render ulang ratusan `AyahCard` tiap frame; `ResizeObserver` menjaga akurasi saat terjemahan dimuat.
- **Dampak (desain, konten, teknis):** `ReadingProgress.tsx` + CSS, `BackToTop.tsx` + CSS, `TopBar` (prop `readingProgress` menggantikan `progress`), `ReaderPage`, E2E `reader-progress.spec.ts`, S03 dan `COMPONENT-INVENTORY.md`.
- **Ditinjau ulang bila:** progres dinilai mengganggu, tombol menutupi konten pada layar pendek, atau Reader beralih ke virtualisasi daftar.

### D-039 — Pencarian terjemahan mengabaikan imbuhan umum

- **Tanggal:** 2026-11-19
- **Status:** Diputuskan
- **Konteks:** D-034 menetapkan pencarian terjemahan memakai pencocokan substring apa adanya. Akibatnya kueri berbentuk berimbuhan hanya menemukan ayat yang memakai bentuk yang sama: "diketahui" menghasilkan 11 ayat, padahal bentuk dasar "tahu" muncul jauh lebih sering.
- **Opsi yang dipertimbangkan:** (a) membiarkan apa adanya, (b) pustaka stemmer Indonesia penuh (mis. Sastrawi), (c) penyederhanaan imbuhan ringan di sisi kueri.
- **Keputusan:** Opsi (c). `src/lib/search/affixes.ts` menghasilkan varian tiap kata kueri dengan membuang awalan (me-, men-, mem-, meng-, meny-, menge-, penge-, peng-, peny-, pem-, pen-, pember-, per-, ber-, ter-, di-, ke-, se-, pe-) dan akhiran (kannya, annya, nya, lah, kah, pun, kan, an, ku, mu, i), termasuk pemulihan huruf luluh (meng- → k, meny- → s, mem- → p, men- → t). Varian diterapkan berantai (diketahui → ketahu → tahu) dengan batas 12 varian dan panjang minimum 4 karakter agar kata seperti "mengapa" tidak menjadi "apa". Hanya dipakai saat mode Terjemahan; pencarian Arab dan indeks tidak berubah. Penyorotan memakai varian yang sama supaya bagian kata yang cocok tetap ditandai.
- **Alasan:** menaikkan daya temu tanpa menambah ukuran unduhan, tanpa mengubah indeks, dan tanpa ketergantungan baru. Stemmer penuh akan menambah ratusan KB kamus untuk manfaat yang belum terbukti.
- **Dampak (desain, konten, teknis):** `src/lib/search/affixes.ts`, `features/quran/search.ts` (opsi `stem`), `lib/search/normalize.mjs` (`findHighlightRanges` menerima varian tambahan), `TranslationResultRow`, petunjuk mode Terjemahan di S08, unit test `search-affixes`/`search-translation-stem`, E2E `search-translation.spec.ts`.
- **Ditinjau ulang bila:** muncul keluhan presisi (hasil tidak relevan) atau dibutuhkan pencarian lintas makna/tafsir.

---

## Templat entri baru

```
### D-0XX — Judul keputusan
- **Tanggal:**
- **Status:** Diusulkan / Diputuskan / Ditunda / Diganti
- **Konteks:**
- **Opsi yang dipertimbangkan:**
- **Keputusan:**
- **Alasan:**
- **Dampak (desain, konten, teknis):**
- **Ditinjau ulang bila:**
- **Bukti:** (tautan ke hasil uji, tangkapan layar, dsb.)
```
