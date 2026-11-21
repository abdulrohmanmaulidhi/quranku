# Screen Specifications

## Quran PWA

**Versi:** 1.0
**Tanggal:** 2026-11-12
**Acuan:** PRODUCT-SPECIFICATION.md (bagian 1–4), DESIGN-TOKENS.md, CONTENT-RULES.md

Setiap layar wajib punya state: **memuat, terisi, kosong, error, offline/sebagian**, dan (bila relevan) izin ditolak. Karena data Quran dibundel, state "memuat" terutama muncul pada kunjungan pertama.

---

## 0. Kerangka aplikasi (App Shell)

### Navigasi

| Platform               | Item                                               |
| ---------------------- | -------------------------------------------------- |
| Mobile (bilah bawah)   | Beranda · Quran · Penanda · Pengaturan             |
| Desktop (sidebar/atas) | Beranda · Baca Quran · Cari · Penanda · Pengaturan |

- Pencarian di mobile diakses dari kolom cari di **Beranda** dan **Indeks Surah** (keputusan terbuka Q5, lihat `DESIGN-BRIEF.md`).
- Reader **satu ketukan** dari navigasi utama.
- Tidak ada layar login, daftar, atau onboarding wajib.
- Di Reader, bilah bawah disembunyikan agar fokus membaca. Bilah atas tampil lagi saat menggulir ke atas atau mengetuk area atas.
- Hormati _safe area_ (notch dan bilah gestur) pada mode standalone.

### Pola state yang dipakai ulang

| State   | Pola                                                                |
| ------- | ------------------------------------------------------------------- |
| Memuat  | _Skeleton_ sesuai bentuk konten, tanpa spinner penuh layar          |
| Kosong  | Ikon sederhana, 1 kalimat penjelasan, 1 aksi bila ada               |
| Error   | Pesan jelas + tombol **Coba lagi**. Tidak menampilkan detail teknis |
| Offline | Lencana kecil/banner tipis. Tidak memblokir membaca                 |

---

## S01 — Beranda

**Tujuan:** titik awal yang tenang dan jalan cepat kembali membaca.

**Komponen**

- Salam netral (mis. "Assalamu'alaikum").
- **Kartu Lanjutkan Membaca** (jika ada posisi tersimpan): nama surah, nomor ayat.
- Tombol **Mulai membaca** (kunjungan pertama).
- Kolom cari surah (membuka S08).
- Pintasan **Jelajahi surah** (S02) dan **Penanda** (S07).

**Aksi:** ketuk kartu → Reader di ayat tersimpan. Ketuk Mulai membaca → S02 atau Al-Fatihah (putuskan lewat uji).

| State             | Perilaku                                                          |
| ----------------- | ----------------------------------------------------------------- |
| Kunjungan pertama | Tombol utama "Mulai membaca"; tanpa kartu lanjut                  |
| Pengguna kembali  | Kartu "Lanjutkan membaca" tampil di atas                          |
| Memuat            | Skeleton kartu; navigasi tetap aktif                              |
| Kosong            | Tidak berlaku (selalu ada Mulai membaca)                          |
| Error             | Banner + Coba lagi; Reader tetap dapat dibuka bila data ter-cache |
| Offline           | Lencana "Offline · bacaan tetap tersedia"                         |

**Tidak ada:** daftar target harian, _streak_, rekomendasi, ayat harian (ditunda sampai kebijakan editorial dan sumber ditetapkan).

---

## S02 — Indeks Surah

**Tujuan:** menemukan dan membuka surah atau juz.

**Komponen**

- Kolom cari/filter surah.
- Tab: **Surah** | **Juz**.
- Daftar 114 surah. Tiap baris: nomor, nama Arab, nama latin, arti nama, jumlah ayat. Klasifikasi Makkiyah/Madaniyah **hanya jika datanya terverifikasi**.
- Daftar 30 juz (jika metadata juz terverifikasi): nomor juz, surah dan ayat awal.

**Perilaku**

- Ketuk baris → Reader.
- Posisi gulir dipertahankan saat kembali dari Reader.
- Filter mencari nama latin, arti nama, nomor.

| State                       | Perilaku                                                       |
| --------------------------- | -------------------------------------------------------------- |
| Memuat                      | Skeleton baris                                                 |
| Kosong (filter tanpa hasil) | "Tidak ada surah yang cocok dengan “…”." + tombol hapus filter |
| Error                       | Pesan + Coba lagi                                              |
| Offline                     | Tidak berubah (data lokal)                                     |

---

## S03 — Reader (prioritas tertinggi)

**Tujuan:** membaca nyaman tanpa gangguan.

**Hierarki informasi**

1. Identitas surah (nama Arab, nama latin, arti, jumlah ayat).
2. Teks Arab per ayat.
3. Terjemahan (dapat disembunyikan).
4. Aksi ayat.
5. Navigasi sebelumnya/berikutnya.

**Komponen**

- Bilah atas: kembali, nama surah, **Lompat ke** (S06), **Pengaturan baca** (S05).
- Header surah: nama Arab, nama latin, arti, jumlah ayat, **Putar Surah** (F1.2), dan kontrol unduh per-surah (S12).
- Petunjuk "Ketuk ayat untuk membuka aksi.", lalu basmalah pembuka sebagai baris tersendiri sebelum daftar ayat (D-012).
- Daftar ayat. Tiap ayat: penanda nomor ayat, teks Arab (RTL), terjemahan, tombol **Aksi** (S04) dan ikon penanda.
- Tombol putar audio tiap ayat; ayat yang sedang diputar atau sedang memuat ditandai dengan latar tebal `accent-subtle` (`.audioActive`).
- Penanda "terakhir dibaca" (sorotan `accent-subtle`).
- Navigasi surah sebelumnya/berikutnya di akhir daftar.
- Indikator progres tipis di bawah bilah atas; lebarnya mengikuti posisi gulir.
- Tombol **Kembali ke atas** (panah atas) di kanan bawah, muncul setelah satu layar tergulir.
- **Pemutar audio** (bilah tetap di bawah): kontrol sebelum/lewati/putar per ayat, tombol ulangan, tombol kecepatan, nama Qari, dan bilah progres memuat; siap di atas area teks dan di bawah nav pada layar sempit, atas nav pada layar besar, paling bawah (di bawah nav dan safe-area) pada Reader.

**Aturan**

- Arab selalu RTL, tanpa pemotongan, harakat utuh.
- Basmalah pada surah 2–114 (kecuali 9) ditampilkan sebagai baris tersendiri di bawah petunjuk baca, diambil verbatim dari 1:1 (`basmalah.json`); ayat 1 tidak dipotong (D-012/D-042). Surah 1 menampilkan basmalah sebagai ayat 1; surah 9 tanpa basmalah.
- Deep link ke ayat 1 menggulir ke atas halaman agar basmalah tetap terlihat.
- Terjemahan ditampilkan verbatim; atribusi ada di S10 dan dapat dijangkau dari kaki Reader. Catatan kaki dibuka per ayat lewat panel lipat.
- Tidak ada iklan, rekomendasi, atau pop-up di dalam konten.
- Posisi terakhir disimpan setelah pengguna benar-benar menggulir (bukan karena ketukan memilih ayat atau pergeseran tata letak saat terjemahan dimuat).
- Penanda hanya memakai ikon + label aksesibel; status terpenanda tidak hanya lewat warna.

| State                           | Perilaku                                                                           |
| ------------------------------- | ---------------------------------------------------------------------------------- |
| Memuat                          | Skeleton header + beberapa ayat                                                    |
| Terisi                          | Daftar ayat                                                                        |
| Kosong                          | Tidak berlaku                                                                      |
| Error (data surah gagal dimuat) | "Surah belum dapat dimuat." + Coba lagi + kembali ke indeks                        |
| Error (terjemahan gagal dimuat) | Teks Arab tetap tampil; "Terjemahan belum dapat dimuat." + Coba lagi               |
| Offline (data belum ter-cache)  | "Surah ini belum tersedia offline. Sambungkan internet sekali untuk menyimpannya." |
| Offline (data ada)              | Berjalan normal                                                                    |

---

## S04 — Sheet Aksi Ayat

**Pemicu:** ketuk tombol aksi pada ayat.

**Aksi (Release 1)**

- Beri/Hapus penanda
- Salin ayat (Arab + terjemahan + referensi + atribusi)
- Salin referensi saja (mis. "QS. Al-Kahfi 18:10")
- Bagikan (jika _Web Share API_ tersedia)

**Ditunda:** catatan, tafsir.

| State        | Perilaku                                                      |
| ------------ | ------------------------------------------------------------- |
| Terisi       | Daftar aksi, fokus awal pada aksi pertama                     |
| Setelah aksi | Sheet menutup + _snackbar_ konfirmasi ("Penanda ditambahkan") |
| Gagal salin  | "Tidak dapat menyalin. Coba lagi."                            |

---

## S05 — Sheet Pengaturan Baca

**Kontrol**

- Ukuran teks Arab (stepper/slider dengan pratinjau langsung, 5 tingkat).
- Tampilkan terjemahan (sakelar). Ukuran terjemahan (4 tingkat: Kecil–Sangat besar, bawaan Sedang) tampil saat terjemahan aktif.
- Tema: Sistem · Terang · Gelap.
- Jarak baris dan lebar konten (opsional, bila pengujian menunjukkan manfaatnya).
- Terjemahan terpilih (Release 1: satu pilihan; tampil sebagai baris informasi dengan sumber).

**Perilaku:** perubahan berlaku langsung dan tersimpan lokal. Tombol **Atur ulang ke bawaan**.

| State           | Perilaku                                           |
| --------------- | -------------------------------------------------- |
| Terisi          | Kontrol + pratinjau satu ayat contoh               |
| Gagal menyimpan | Pesan ringan; pengaturan tetap berlaku di sesi ini |

---

## S06 — Lompat ke

**Tujuan:** pindah cepat ke surah, ayat, atau juz.

**Komponen:** tab **Surah & Ayat** | **Juz**. Pilih surah → isi nomor ayat (validasi rentang sesuai jumlah ayat surah).

| State             | Perilaku                                    |
| ----------------- | ------------------------------------------- |
| Input tidak valid | "Surah ini memiliki N ayat." (pesan inline) |
| Berhasil          | Tutup sheet, gulir ke ayat, sorot sebentar  |

---

## S07 — Penanda

**Tujuan:** menemukan kembali ayat yang ditandai.

**Komponen**

- Daftar penanda terurut terbaru. Tiap baris: nama surah · ayat N, pratinjau terjemahan singkat (dipotong dua baris), tanggal dibuat bila berguna.
- Aksi: buka, hapus (dengan **Urungkan**).
- Di Pengaturan: ekspor/impor penanda (S09).

**Aturan**

- Satu penanda per ayat.
- Teks Arab **tidak dipotong**. Jika ditampilkan di daftar, tampilkan utuh atau tidak sama sekali.

| State         | Perilaku                                                                                         |
| ------------- | ------------------------------------------------------------------------------------------------ |
| Kosong        | "Belum ada penanda. Ketuk ikon penanda pada ayat untuk menyimpannya." + tombol **Mulai membaca** |
| Terisi        | Daftar                                                                                           |
| Setelah hapus | Snackbar "Penanda dihapus · Urungkan"                                                            |
| Error         | Pesan + Coba lagi                                                                                |

---

## S08 — Cari

**Mode:** **Surah** | **Arab** | **Terjemahan** (segmented control). Mode Terjemahan mencari teks terjemahan Indonesia (D-003) dan memakai indeks terpisah yang dimuat malas.

**Komponen**

- Kolom cari dengan tombol hapus, batas 100 karakter.
- Mode Arab: daftar hasil dengan surah · ayat, **teks ayat utuh** dengan kata cocok ditandai, tanpa memotong teks Arab.
- Mode Terjemahan: daftar hasil dengan surah · ayat, **teks terjemahan utuh** (bukan potongan) dengan kata cocok ditandai. Catatan kaki tidak ikut dicari.
- Petunjuk di mode Arab: "Pencarian Arab mengabaikan harakat." Petunjuk di mode Terjemahan: "Pencarian terjemahan mengabaikan huruf besar/kecil, diakritik, dan imbuhan umum."
- Catatan bahwa pencarian terjemahan hanya mencakup **teks terjemahan**, bukan catatan kaki. Imbuhan umum (awalan/akhiran) disederhanakan ke bentuk dasar; ini bukan stemmer linguistik penuh sehingga bentuk tak beraturan bisa terlewat.

**Aturan**

- Hasil membuka Reader tepat di ayat yang dirujuk. Hasil terjemahan membuka Reader dengan terjemahan tampil untuk kunjungan itu, tanpa mengubah pengaturan tersimpan.
- Batas panjang kueri 100 karakter. Panjang minimum kueri Arab 2 karakter; terjemahan 3 karakter.
- Pencocokan mewajibkan semua kata kueri muncul (AND). Mode Terjemahan juga mencocokkan bentuk dasar dari imbuhan umum (D-039); mode Arab tetap apa adanya.
- Tidak menyiratkan pencarian makna/tafsir.

| State        | Perilaku                                                    |
| ------------ | ----------------------------------------------------------- |
| Awal         | Petunjuk singkat + contoh                                   |
| Mengetik     | Hasil muncul bertahap, skeleton singkat jika perlu          |
| Kosong       | "Tidak ada hasil untuk “…”. Coba kata lain."                |
| Error indeks | "Pencarian belum siap. Coba lagi sebentar lagi."            |
| Offline      | Normal bila indeks sudah tersimpan; jika belum, minta sambungkan internet sekali |

---

## S09 — Pengaturan

**Bagian dan baris**

- **Tampilan:** tema, ukuran teks Arab, ukuran terjemahan, tampilkan terjemahan.
- **Bacaan:** tidak ada — detail sumber tidak diulang di Pengaturan.
- **Bahasa:** Indonesia (pilihan lain ditunda).
- **Data saya:** ekspor penanda (berkas JSON), impor penanda, data offline (status, unduh, hapus salinan), hapus salinan audio tersimpan, hapus data lokal (dialog konfirmasi).
- **Aplikasi:** pasang aplikasi (tombol prompt di Chromium) atau instruksi "Bagikan → Tambah ke Layar Utama" di iOS; status "Aplikasi terpasang" saat berjalan `standalone` (D-040).
- **Tentang:** Sumber & Atribusi (S10, satu-satunya pintu ke detail sumber), versi aplikasi, versi dataset, kebijakan privasi.

| State             | Perilaku                                                                                              |
| ----------------- | ----------------------------------------------------------------------------------------------------- |
| Impor berhasil    | "N penanda diimpor. M sudah ada dan dilewati."                                                        |
| Impor gagal       | "Berkas tidak dapat dibaca. Pastikan berkas ekspor dari aplikasi ini."                                |
| Data offline siap | "Siap offline · 235 dari 235 berkas tersimpan" + opsi hapus salinan                                   |
| Kuota penuh       | "Ruang penyimpanan tidak cukup. Bebaskan ruang, lalu coba lagi."                                      |
| Hapus data        | Dialog: jelaskan yang dihapus (penanda, posisi, pengaturan) dan bahwa tindakan tidak dapat dibatalkan |

---

## S10 — Sumber & Atribusi

**Tujuan:** transparansi sumber dan kepatuhan lisensi.

**Isi**

- Teks Al-Qur'an: Tanzil Project (Uthmani), versi dataset, lisensi CC BY 3.0, pernyataan "ditampilkan tanpa perubahan".
- Terjemahan: Kementerian Agama RI — sumber QuranEnc.com, versi, lisensi/syarat pemakaian, dan tautan.
- Font dan lisensinya.
- Versi aplikasi dan dataset.
- Catatan: terjemahan bukan Al-Qur'an itu sendiri.

Teks atribusi baku ada di `CONTENT-RULES.md`.

| State   | Perilaku               |
| ------- | ---------------------- |
| Terisi  | Daftar sumber          |
| Offline | Normal (konten statis) |

---

## S11 — Status offline dan instal

**Komponen**

- **Lencana/banner offline:** muncul saat tidak ada koneksi. Tidak memblokir. Hilang otomatis saat online.
- **Kemajuan penyiapan offline** (kunjungan pertama): "Menyiapkan Al-Qur'an untuk dibaca offline… N%". Reader tetap dapat dipakai. Unduhan dimulai otomatis setelah idle kecuali `Save-Data` aktif.
- **Ajakan instal:** bar non-modal di bawah Reader, muncul setelah pembaca melewati ayat kelima bila `beforeinstallprompt` tersedia. Tombol **Pasang** memanggil prompt bawaan; **Nanti** menutup ajakan selama 14 hari. Tidak tampil saat `standalone` atau setelah `appinstalled`. iOS memakai instruksi manual di S09 (D-040). Tanpa analytics.
- **Pembaruan tersedia:** "Versi baru tersedia." dengan aksi **Muat ulang**; tidak ada muat ulang paksa.

| State                   | Perilaku                                                         |
| ----------------------- | ---------------------------------------------------------------- |
| Penyiapan gagal         | "Tidak dapat menyiapkan mode offline. Coba lagi saat terhubung." |
| Ruang penyimpanan penuh | Pesan jelas dengan saran membebaskan ruang                       |

---

## S12 — Pemutar audio (Qari)

**Tujuan:** putar audio murattal per ayat tanpa perubahan teks, dengan mode segar dan dukungan offline.

**Layout**

- Posisi: bilah tetap di bawah (bagian S03), tersedia ruang di atasnya; di layar 320–1023 px pada mode Reader di bawah nav (termasuk safe-area), di layar ≥1024 px paling bawah (di bawah nav); gunakan varian `--player-height`/`--player-offset` dari `tokens.css`.
- Isi, dari atas ke bawah: bilah progres 3 px, bar progres, judul `Nama Surah · Ayat X` + nama Qari + durasi `m:ss / m:ss`, tombol lewati sebelum (nonaktif pada ayat pertama), tombol putar/jeda (warna `accent` saat menyala), tombol lewati berikutnya (nonaktif pada ayat terakhir), tombol ulangan (siklus: tanpa → ulangi surah → ulangi ayat), tombol kecepatan (siklus: 0,75× → 1× → 1,25× → 1,5×, terisi 1), tombol volume (Volume2/VolumeX dengan `filled={muted}`, `aria-pressed` saat mute; F2.2).
- Di setiap ayat pada Reader: tombol putar audio, ditandai saat menyala (`.audioActive`).

**Perilaku**

- Urutan: ayat berikut di dalam surah; kembali ke ayat 1 setelah ayat terakhir; repeat off/surah/one; rate 0.75/1/1.25/1.5.
- **Queue surah (F1.2):** tombol **Putar Surah** di header surah (S03) memulai surah dari ayat 1, maju otomatis (auto-advance), dan berhenti di akhir surah. Saat queue aktif, lewati/mundur dan X berlaku seperti normal; X menutup pemutar (token posisi naik diputus sebelum `ended` diproses agar tidak mengawali track berikutnya).
- Prefetches antar-ayat dikonsumsi pada koneksi hemat data.
- **Retry streaming (F2.1):** `start()`: `for (attempt 1..3) { await audio.play(); }`; di rejection non-NotAllowedError → `audio.src = source; await sleep(500 × attempt)`; final → `setStatus("paused")` + `setError("Audio tidak dapat diputar.")`. `onError` diberi guard `retryingRef` (tidak error sementara selama retry).
- Media Session: judul `Nama Surah · Ayat X`, artis nama Qari, ikon; aksi putar, jeda, lewati, mundur, stop, `seekto` (ganti posisi melalui `seekTime`/`seekOffset`); **posisi dan durasi disinkronkan** ke sesi (`setPositionState`: `duration`, `position`, `playbackRate`); status `playing`/`paused`.
- Volume: `AudioProvider` efek `[volume, muted]` → `audio.volume`/`audio.muted`; `setVolume` clamped via `normalizeVolume`.
- Offset: `--player-offset` (7rem di bawah nav; 0px di layar besar); `Snackbar`, `BackToTop`, dan `InstallPrompt` menyesuaikan posisi ini; BottomNav dengan mode Reader berada di atas bilah pemutar.

**State**

| State     | Perilaku                                                                                              |
| --------- | ------------------------------------------------------------------------------------------------------ |
| Memuat    | Spin loader, play button `aria-label="Memuat audio…"`, subtitle "Memuat audio…", bar progres bila metadata datang |
| Putar     | Ikon Pause, posisi dari elemen audio via `timeupdate`                                                   |
| Jeda      | Ikon Play                                                                                               |
| Error     | Teks jelas ("Audio tidak dapat diputar." / "Audio tidak dapat diunduh. Periksa koneksi Anda."), opsi Coba lagi |
| Offline   | Stream dari EveryAyah; bila cache ada untuk ayat ini, dialirkan dari Cache Storage                      |

**Aksesibilitas (D-044/S12)**

- role="region" dengan aria-label "Pemutar audio"; progressbar "Kemajuan ayat".
- Tombol putar/jeda 44×44 px (`--touch-target`), fokus visible, aria-label sesuai status; saat loading aria-label "Memuat audio…".
- Ulangan dibaca: "Ulangan: tanpa ulangan. Ketuk untuk mengubah."; kecepatan: "Kecepatan 1 kali. Ketuk untuk mengubah."
- Volume: "Matikan suara"/"Suara dimatikan" + `aria-pressed` saat mute; `sr-only` announcement "Memutar/Memuat {surah}, ayat {ayah}." (F2.2).
- Riwayat isi disimpan dengan aria-live="polite".

**Atribusi (D-044)**

- Nama Qari dipakai tanpa perubahan dari sumber.
- EveryAyah.com dicantumkan di S10 (Sumber & Atribusi) dan boleh dijangkau dari Reader.
- Saat memutar/mengunduh, server EveryAyah melihat IP dan ayat yang diminta.
