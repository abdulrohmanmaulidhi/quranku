# Design Test Plan

## Quran PWA

**Versi:** 1.0
**Tanggal:** 2026-11-12
**Tujuan:** memilih desain berdasarkan bukti, bukan selera.

Ada tiga uji, dilakukan berurutan:

- **A. Uji rendering Arab** (menentukan font dan tata letak teks)
- **B. Evaluasi varian Reader** (menentukan arah layout)
- **C. Uji kegunaan dengan calon pembaca**

> **Aturan emas:** teks Arab di kanvas desain **disalin dari `data/source/quran-hafs.csv`**, tidak pernah diketik ulang. Salah satu huruf atau harakat saja membuat hasil uji tidak sah.

---

## A. Uji rendering Arab

### A1. Teks uji (rujukan ayat)

| Kode | Rujukan                        | Alasan                                             |
| ---- | ------------------------------ | -------------------------------------------------- |
| T1   | Al-Fatihah 1:1–7               | Surah paling sering dibaca; ayat pendek            |
| T2   | Al-Baqarah 2:1                 | Huruf muqatta'at (_Alif Lam Mim_)                  |
| T3   | Al-Baqarah 2:282               | Ayat terpanjang, uji pembungkusan baris            |
| T4   | An-Nur 24:35                   | Ayat panjang dengan banyak harakat dan tanda waqaf |
| T5   | Al-Ikhlas 112                  | Surah pendek, uji kepadatan                        |
| T6   | Al-A'raf 7:206                 | Ayat sajdah                                        |
| T7   | At-Taubah 9:1                  | Surah tanpa basmalah di awal                       |
| T8   | Yasin 36:1                     | Huruf muqatta'at dan harakat kecil                 |
| T9   | Ar-Rahman 55:13 dan sekitarnya | Pengulangan, uji ritme visual                      |
| T10  | Al-Kahfi 18:10                 | Ayat target uji kegunaan (C)                       |

### A2. Font kandidat

Amiri Quran · Scheherazade New · Noto Naskh Arabic. (Tambahkan font lain bila ada. Verifikasi lisensi tiap font.)

### A3. Perangkat dan lingkungan uji

| Kelompok          | Contoh                                                  |
| ----------------- | ------------------------------------------------------- |
| Android           | HP layar kecil (~360 px), HP menengah, Chrome terbaru   |
| iOS               | iPhone dengan Safari (rendering harakat sering berbeda) |
| Tablet            | iPad Safari atau tablet Android                         |
| Desktop           | Chrome, Firefox, Safari                                 |
| Pengaturan sistem | Skala font 100%, 130%, 200%; mode terang dan gelap      |

### A4. Daftar periksa rendering (per font × perangkat)

| #   | Pemeriksaan                                                                           | Lulus? |
| --- | ------------------------------------------------------------------------------------- | ------ |
| 1   | Tidak ada kotak kosong (tofu) atau glyph pengganti                                    |
| 2   | Harakat bertumpuk (syaddah + fathah/kasrah/dammah) tampil benar dan tidak bertabrakan |
| 3   | Alif kecil (khanjariyah), tanda waqaf, dan tanda sajdah tampil jelas                  |
| 4   | Tanwin berurutan tampil sesuai Mushaf Madinah                                         |
| 5   | Harakat atas/bawah tidak terpotong oleh tinggi baris                                  |
| 6   | Penyambungan huruf utuh (tanpa `letter-spacing`, tanpa bold/italic sintetis)          |
| 7   | Arah RTL benar, urutan ayat tidak terbalik                                            |
| 8   | Nomor ayat dan referensi campuran Arab–Latin (bidi) tidak tertukar                    |
| 9   | Pembungkusan baris tidak memecah ayat secara keliru                                   |
| 10  | Menyalin teks dari layar menghasilkan teks yang identik dengan sumber                 |
| 11  | Terbaca nyaman pada 5 ukuran (24–48 px)                                               |
| 12  | Tetap utuh pada pembesaran teks 200% dan lebar 320 px                                 |

### A5. Aturan keputusan font

- Gagal pada pemeriksaan 1–7 di **salah satu** perangkat utama → font **gugur**.
- Dari font yang lulus, pilih berdasarkan keterbacaan (penilaian 3–5 pembaca, skala 1–5) dan ukuran berkas.
- Catat hasil dan alasannya di `DESIGN-DECISIONS.md`.

---

## B. Evaluasi varian Reader

### B1. Varian

| Varian | Deskripsi                                                        |
| ------ | ---------------------------------------------------------------- |
| A      | Ayat per kartu: Arab besar, terjemahan di bawahnya, aksi di sisi |
| B      | Alur kontinu seperti mushaf, terjemahan dibuka per ayat          |
| C      | Dua kolom (desktop): Arab di kanan, terjemahan di kiri           |

Untuk setiap varian, buat layar Reader mobile 390×844 dan (untuk A dan C) desktop 1440×900, dengan teks uji T1, T3, dan T4.

### B2. Rubrik penilaian (skala 1–5)

| Kriteria                                           | Bobot |   A |   B |   C |
| -------------------------------------------------- | ----: | --: | --: | --: |
| Keterbacaan teks Arab                              |   30% |     |     |     |
| Kemudahan membaca terjemahan berdampingan          |   15% |     |     |     |
| Kemudahan membuka aksi ayat (penanda, salin)       |   15% |     |     |     |
| Ketenangan visual (minim gangguan)                 |   15% |     |     |     |
| Kemudahan orientasi (tahu sedang di ayat berapa)   |   10% |     |     |     |
| Kemudahan implementasi PWA (risiko teknis)         |   10% |     |     |     |
| Dukungan aksesibilitas (teks besar, pembaca layar) |    5% |     |     |     |
| **Skor tertimbang**                                |  100% |     |     |     |

Cara menghitung: skor tertimbang = jumlah (nilai × bobot). Dua penilai mengisi terpisah, lalu dirata-rata.

### B3. Aturan keputusan

- Varian dengan skor tertimbang tertinggi menjadi dasar, **kecuali** ia mendapat nilai ≤ 2 pada "Keterbacaan teks Arab".
- Selisih skor < 0,3: pilih yang lebih sederhana diimplementasikan.
- Varian B ditunda ke rilis berikutnya jika membutuhkan data halaman mushaf yang belum terverifikasi (lihat spesifikasi bagian 3.3).
- Catat keputusan dan alasannya di `DESIGN-DECISIONS.md`.

---

## C. Uji kegunaan

### C1. Peserta

3–5 calon pembaca (mayoritas pembaca harian Al-Qur'an di HP). Variasikan usia dan kenyamanan teknologi. Sertakan minimal satu pengguna iPhone dan satu Android jika memungkinkan.

### C2. Persiapan

- Prototipe interaktif yang dapat diklik (alur pada `USER-FLOWS.md`) atau build awal.
- Perangkat milik peserta atau perangkat uji.
- Formulir catatan pengamat (C6).
- Jelaskan bahwa **desainnya yang diuji, bukan peserta**.

### C3. Tugas

| #   | Tugas (diucapkan ke peserta)                                                        | Layar utama        |
| --- | ----------------------------------------------------------------------------------- | ------------------ |
| 1   | "Buka Surah Al-Kahfi ayat 10."                                                      | S01, S02, S06, S03 |
| 2   | "Buat tulisan Arabnya lebih besar sampai nyaman dibaca."                            | S05                |
| 3   | "Beri penanda pada ayat ini, lalu temukan lagi nanti."                              | S04, S07           |
| 4   | "Tutup aplikasinya, lalu buka lagi dan lanjutkan dari tempat tadi."                 | S01                |
| 5   | "Cari ayat yang mengandung kata ‘sabar’ dalam terjemahan, lalu buka salah satunya." | S08                |
| 6   | "Ganti ke tampilan gelap."                                                          | S05 / S09          |
| 7   | "Cari tahu dari mana teks Al-Qur'an dan terjemahan ini berasal."                    | S10                |

### C4. Metrik per tugas

- Selesai tanpa bantuan (ya/tidak)
- Waktu selesai
- Jumlah salah ketuk
- Komentar spontan
- Nilai kemudahan 1–5 (_Single Ease Question_)

### C5. Target awal (hipotesis, dikalibrasi setelah putaran pertama)

| Metrik                                       | Target                       |
| -------------------------------------------- | ---------------------------- |
| Penyelesaian tugas 1–6 tanpa bantuan         | ≥ 4 dari 5 peserta per tugas |
| Waktu median tugas 1                         | ≤ 15 detik                   |
| Nilai kemudahan rata-rata                    | ≥ 4                          |
| Peserta yang menemukan sumber teks (tugas 7) | ≥ 3 dari 5                   |

### C6. Formulir catatan pengamat

```
Peserta: ____  Perangkat: ____  Tanggal: ____  Varian: ____
Tugas | Selesai? | Waktu | Salah ketuk | Kutipan penting | Skor 1–5
1
2
...
Masalah keterbacaan Arab yang diamati:
Masalah lain:
Saran peserta:
```

### C7. Pertanyaan penutup

1. Bagian mana yang paling nyaman? Paling mengganggu?
2. Apakah ada yang Anda cari tapi tidak ketemu?
3. Apakah terjemahan dan teks Arab mudah dibedakan?
4. Apakah tampilan ini terasa pantas untuk membaca Al-Qur'an?

---

## D. Pelaporan

| Bagian        | Isi                                                             |
| ------------- | --------------------------------------------------------------- |
| Ringkasan     | Keputusan (font, varian) dan alasan singkat                     |
| Hasil A       | Matriks lulus/gagal font × perangkat                            |
| Hasil B       | Tabel skor varian                                               |
| Hasil C       | Metrik per tugas, temuan utama, severity (kritis/sedang/ringan) |
| Tindak lanjut | Daftar perbaikan dengan penanggung jawab                        |

Semua keputusan dicatat di `DESIGN-DECISIONS.md`. Masalah keterbacaan Arab berstatus kritis dan harus selesai sebelum desain diserahkan ke implementasi.
