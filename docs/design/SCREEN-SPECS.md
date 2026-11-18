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
- Header surah (dan basmalah sesuai keputusan Q3).
- Daftar ayat. Tiap ayat: penanda nomor ayat, teks Arab (RTL), terjemahan, tombol **Aksi** (S04) dan ikon penanda.
- Penanda "terakhir dibaca" (sorotan `accent-subtle`).
- Navigasi surah sebelumnya/berikutnya di akhir daftar.
- Indikator progres tipis di bawah bilah atas; lebarnya mengikuti posisi gulir.
- Tombol **Kembali ke atas** (panah atas) di kanan bawah, muncul setelah satu layar tergulir.

**Aturan**

- Arab selalu RTL, tanpa pemotongan, harakat utuh.
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

**Ditunda:** putar audio, catatan, tafsir.

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
- Petunjuk di mode Arab: "Pencarian Arab mengabaikan harakat." Petunjuk di mode Terjemahan: "Pencarian terjemahan mengabaikan huruf besar/kecil dan diakritik."
- Catatan bahwa pencarian terjemahan hanya mencakup **teks terjemahan**, bukan catatan kaki, dan belum menangani imbuhan/stemming.

**Aturan**

- Hasil membuka Reader tepat di ayat yang dirujuk. Hasil terjemahan membuka Reader dengan terjemahan tampil untuk kunjungan itu, tanpa mengubah pengaturan tersimpan.
- Batas panjang kueri 100 karakter. Panjang minimum kueri Arab 2 karakter; terjemahan 3 karakter.
- Pencocokan mewajibkan semua kata kueri muncul (AND), tanpa stemming/imbuhan.
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
- **Bacaan:** terjemahan terpilih (info sumber).
- **Bahasa:** Indonesia (pilihan lain ditunda).
- **Data saya:** ekspor penanda (berkas JSON), impor penanda, data offline (status, unduh, hapus salinan), hapus data lokal (dialog konfirmasi).
- **Tentang:** Sumber & Atribusi (S10), versi aplikasi, versi dataset, kebijakan privasi.

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
- **Ajakan instal:** instalasi memakai prompt bawaan peramban dari manifest dan service worker. Ajakan kustom belum diimplementasikan.
- **Pembaruan tersedia:** "Versi baru tersedia." dengan aksi **Muat ulang**; tidak ada muat ulang paksa.

| State                   | Perilaku                                                         |
| ----------------------- | ---------------------------------------------------------------- |
| Penyiapan gagal         | "Tidak dapat menyiapkan mode offline. Coba lagi saat terhubung." |
| Ruang penyimpanan penuh | Pesan jelas dengan saran membebaskan ruang                       |
