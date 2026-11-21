# Content Rules

## Quran PWA

**Versi:** 1.0
**Tanggal:** 2026-11-12
**Acuan:** PRD.md (bagian 9), PRODUCT-SPECIFICATION.md (bagian 3.3, 3.5)

Dokumen ini mengatur bagaimana konten Al-Qur'an dan teks antarmuka ditampilkan. Aturan bagian 1–3 bersifat **wajib**.

---

## 1. Integritas teks Al-Qur'an

1. Teks Arab bersumber dari **Uthmani Hafs 20** (KFGQPC, paket QuranEnc) dan ditampilkan **apa adanya**. Teks dan fontnya dipakai berpasangan; font tidak boleh diubah atau di-subset (D-042).
2. Teks Arab **tidak** diketik ulang, diedit, diringkas, atau dihasilkan AI. Di desain, selalu disalin dari berkas sumber.
3. Teks Arab tidak boleh:
   - dipotong (`text-overflow: ellipsis`, `line-clamp`, dll.),
   - diubah urutannya,
   - diberi `letter-spacing`, bold atau italic sintetis, atau `text-transform`.
4. Normalisasi (menghapus harakat, menyamakan alif, dll.) hanya untuk **indeks pencarian**, tidak pernah untuk tampilan.
5. Semua ayat diidentifikasi dengan kunci `(nomor surah, nomor ayat)`.
6. Perbedaan jenis konten selalu jelas secara visual dan berlabel:

| Jenis                   | Cara ditampilkan                                                          |
| ----------------------- | ------------------------------------------------------------------------- |
| Teks Al-Qur'an (Arab)   | Font Arab, ukuran besar, RTL                                              |
| Terjemahan              | Font terjemahan, ukuran lebih kecil, label sumber, `color.text-secondary` |
| Transliterasi (ditunda) | Gaya terpisah (miring dan redup), label "Transliterasi"                   |
| Tafsir (ditunda)        | Panel terpisah dengan penulis dan sumber                                  |

7. Dilarang menampilkan teks buatan AI sebagai teks Al-Qur'an, terjemahan, atau tafsir.
8. Basmalah: tampil sebagai baris header untuk surah 2–114 (kecuali 9) sesuai D-012/D-042. Teksnya diambil apa adanya dari 1:1 (`basmalah.json`); ayat 1 surah lain tidak dipotong.

## 2. Atribusi dan lisensi

Atribusi wajib tampil di S10 (Sumber & Atribusi) dan dapat dijangkau dari Reader.

### 2.1 Teks Al-Qur'an

> Teks Al-Qur'an (Uthmani Hafs) bersumber dari paket Hafs 20 yang disediakan QuranEnc.com, yaitu teks Uthmani Hafs versi 20 dari King Fahd Glorious Quran Printing Complex (KFGQPC). Teks ditampilkan tanpa perubahan; fontnya dipakai tanpa modifikasi sesuai lisensi KFGQPC.

_(Berkas lisensi font: `public/fonts/licenses/KFGQPC-Hafs.txt`.)_

### 2.2 Terjemahan

> Terjemahan: **Kementerian Agama Republik Indonesia** — sumber data **QuranEnc.com**, versi 1.0.1. Teks dan catatan kaki ditampilkan tanpa perubahan. Lisensi: QuranEnc Terms and Policies (penerbitan ulang diizinkan dengan syarat).

Tampilkan nama penerbit, QuranEnc.com, nomor versi, dan tautan di S10. Jangan mengubah, memotong, atau menghapus catatan kaki. Laporkan catatan tentang terjemahan ke QuranEnc, bukan diperbaiki sendiri (D-003).

### 2.3 Font

Cantumkan nama font dan lisensinya (mis. SIL OFL) di S10.

### 2.4 Audio tilawah

> Rekaman murattal disediakan oleh EveryAyah.com, dan setiap Qari dinyatakan oleh namanya, nama Arabnya, ragamnya, dan bentuknya. Nama dan bentuknya tidak diubah dari sumber.

Tampilkan nama Qari yang sedang diputar di pemutar audio (tombol putar pada setiap ayat dan Pemutar). Cantumkan EveryAyah.com beserta ragam dan bentuknya di S10 (rujukan [D-044](DESIGN-DECISIONS.md#d-044-pemutar-audio-al-quran-segar-everyayah)). Jangan menyebutkan pihak lain sebagai penyedia suara.

Saat memutar atau mengunduh audio, server EveryAyah melihat alamat IP dan ayat yang diminta (lihat [D-044](DESIGN-DECISIONS.md#d-044-pemutar-audio-al-quran-segar-everyayah)); audio tidak dikirim ke pihak lain.

### 2.5 Pernyataan

> Terjemahan bukan Al-Qur'an itu sendiri. Aplikasi ini tidak menggantikan guru atau ulama.

## 3. Salin dan bagikan

- **Salin ayat:** menyalin teks Arab (verbatim), terjemahan, referensi, dan satu baris sumber.
- **Salin referensi:** hanya "QS. Nama Surah nomor:ayat".
- Format referensi seragam: `QS. Al-Kahfi 18:10`.

Contoh keluaran salin ayat:

```
[teks Arab, verbatim]

[terjemahan]

QS. Al-Kahfi 18:10
Sumber: KFGQPC Hafs 20 via QuranEnc (teks Arab), [nama terjemahan]
```

## 4. Gaya dan nada teks antarmuka

- **Bahasa:** Indonesia. Sapaan: **"Anda"** (D-009).
- **Nada:** tenang, sopan, singkat, tidak menggurui.
- **Hindari:** bahasa gamifikasi ("Hebat!", "Pertahankan streak!"), tekanan sosial, tanda seru berlebihan, humor di sekitar ayat.
- Pesan error: jelaskan masalah dan tawarkan langkah, tanpa istilah teknis.
- Tidak ada pesan yang menilai jumlah atau kerutinan membaca pengguna.

## 5. Istilah baku

| Konsep             | Istilah di UI                       |
| ------------------ | ----------------------------------- |
| Surah              | Surah                               |
| Ayah               | Ayat                                |
| Bookmark           | Penanda                             |
| Last-read position | Terakhir dibaca / Lanjutkan membaca |
| Translation        | Terjemahan                          |
| Transliteration    | Transliterasi                       |
| Reader settings    | Pengaturan baca                     |
| Jump to            | Lompat ke                           |
| Undo               | Urungkan                            |
| Offline            | Offline                             |

Putuskan pilihan akhir "Penanda" vs "Bookmark" lewat uji pembaca (D-010).

## 6. Contoh teks UI

| Konteks                         | Teks                                                                                                                     |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Tombol mulai                    | Mulai membaca                                                                                                            |
| Kartu lanjut                    | Lanjutkan membaca · Al-Kahfi, ayat 10                                                                                    |
| Penanda ditambah                | Penanda ditambahkan                                                                                                      |
| Penanda dihapus                 | Penanda dihapus · Urungkan                                                                                               |
| Daftar penanda kosong           | Belum ada penanda. Ketuk ikon penanda pada ayat untuk menyimpannya.                                                      |
| Offline                         | Offline · bacaan tetap tersedia                                                                                          |
| Surah belum tersedia offline    | Surah ini belum tersedia offline. Sambungkan internet sekali untuk menyimpannya.                                         |
| Cari kosong                     | Tidak ada hasil untuk “…”. Coba kata lain.                                                                               |
| Petunjuk cari Arab              | Pencarian Arab mengabaikan harakat.                                                                                      |
| Petunjuk cari terjemahan        | Pencarian terjemahan mengabaikan huruf besar/kecil dan diakritik.                                                        |
| Lompat ke: ayat di luar rentang | Surah ini memiliki N ayat.                                                                                               |
| Penyiapan offline               | Menyiapkan Al-Qur'an untuk dibaca offline…                                                                               |
| Pembaruan                       | Versi baru tersedia. Muat ulang untuk memperbarui.                                                                       |
| Hapus data                      | Hapus data lokal? Penanda, posisi terakhir, dan pengaturan akan dihapus dari perangkat ini dan tidak dapat dikembalikan. |
| Gagal salin                     | Tidak dapat menyalin. Coba lagi.                                                                                         |

## 7. Format angka dan tanggal

- Angka di antarmuka: angka Latin (0–9).
- Nomor ayat pada baris Arab: angka Latin (D-013).
- Tanggal: format Indonesia (mis. 12 November 2026); waktu disimpan UTC, ditampilkan sesuai zona pengguna.

## 8. Privasi di dalam konten

- Tidak ada teks yang menyiratkan data pengguna dikirim ke server.
- Jelaskan di S09/S10 bahwa penanda, posisi terakhir, dan pengaturan tersimpan **hanya di perangkat ini**.
- Tidak ada analitik pihak ketiga yang memuat teks pencarian atau riwayat baca perorangan.

## 9. Daftar periksa konten sebelum rilis

- [ ] Atribusi KFGQPC dan QuranEnc tampil dan akurat.
- [ ] Terjemahan: izin jelas dan atribusi terisi.
- [ ] Teks Arab di build identik dengan berkas sumber (uji checksum/jumlah: 114 surah, 6.236 ayat).
- [ ] Tidak ada teks Arab yang terpotong di layar mana pun.
- [ ] Basmalah ditinjau orang yang berkompeten; tampilan saat ini mengikuti D-012.
- [ ] Semua teks UI mengikuti nada dan istilah baku.
- [ ] Tidak ada bahasa gamifikasi.
