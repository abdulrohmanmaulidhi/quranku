# Sumber data

Diambil pada **2026-11-21** (teks Arab, nama surah) dan **2026-11-17** (terjemahan). Berkas mentah tidak boleh diedit; perubahan sumber berarti versi dataset baru.

## 1. Teks Arab

| Field | Nilai |
| --- | --- |
| Berkas | `quran-hafs.csv` |
| Nama | Uthmani Hafs Text (KFGQPC Hafs 20) |
| Versi | 20 |
| Lisensi teks | Tidak ada berkas lisensi terpisah; didistribusikan QuranEnc bersama font KFGQPC |
| Lisensi font | KFGQPC End-User License — boleh dipakai, disalin, didistribusikan; tidak boleh diubah atau di-subset |
| Tautan | https://quranenc.com/en/home/api |
| URL unduhan | `https://quranenc.com/downloads/assets/Hafs_20.zip` |
| Format | CSV berheader `"id","sura","aya","uthmani"`, satu ayat per baris |
| SHA-256 | `b8a49f903ade78a444c918d584f26ca184b5446720419a1d80b71a29573b3310` |

Paket juga memuat `Hafs_20.woff2` (font yang cocok dengan teks ini) dan `Hafs_20.ttf`. Font disalin ke `public/fonts/Hafs_20.woff2` tanpa subset; lisensinya masuk `public/fonts/licenses/KFGQPC-Hafs.txt`. Teks dan font harus dipakai berpasangan.

Perbedaan penting dari teks Tanzil: Hafs 20 memakai sukun `U+06E1` (37.148 kemunculan), tidak memakai `U+06DF`, dan **tidak menyalin basmalah** ke ayat 1 surah 2–114.

## 2. Metadata

| Field | Nilai |
| --- | --- |
| Berkas | `quran-data.js` |
| Nama | Tanzil Quran Metadata |
| Versi | 1.0 |
| Lisensi | Creative Commons Attribution 3.0 |
| Tautan | https://tanzil.net/res/text/metadata/quran-data.js |
| SHA-256 | `9e9930c592aaa34b5c7a79ff4e99ffdc782263a266090bfe2c49e4ed4bac4ca4` |

Berisi `Sura`, `Juz`, `HizbQaurter`, `Manzil`, `Ruku`, `Page`, dan `Sajda`. Build memakai `Sura` dan `Juz`; jumlah ayat per surah dipakai untuk memvalidasi CSV.

## 3. Nama surah

| Field | Nilai |
| --- | --- |
| Berkas | `surah-names-id.json` |
| Nama | QuranEnc Indonesian Surah Names |
| Versi | 1.0 |
| Lisensi | QuranEnc Terms and Policies |
| Sumber | `https://quranenc.com/api/v1/translations/sowar_names?iso_code=id` |
| SHA-256 | `2fb4cfaec3a36eda16fcdcaf69f49792581ebf4f22753f7db62d514620ff6279` |

Berisi 114 nama berdiakritik dan sebagian memakai backtick. Build menormalkan untuk tampilan: diakritik dibuang, backtick menjadi apostrof (`An-Nisā`` → `An-Nisa'`). Nama asli tetap tersimpan verbatim di berkas ini. Ejaan Tanzil disimpan sebagai alias pencarian.

## 4. Terjemahan Indonesia

| Field | Nilai |
| --- | --- |
| Berkas | `tr/indonesian_affairs.json` |
| Nama | Indonesian Translation - Ministry of Religious Affairs |
| Penerbit | Kementerian Agama Republik Indonesia |
| Versi | 1.0.1 (pembaruan sumber 2025-06-23) |
| Diambil | 2026-11-17 |
| Sumber | QuranEnc.com — `https://quranenc.com/api/v1/translation/sura/indonesian_affairs/{surah}` |
| Lisensi | QuranEnc Terms and Policies — boleh diunduh dan diterbitkan ulang dengan tujuh syarat |
| SHA-256 | `8be2ea728ed6ebeee165e802117a58b2582546617b1411054af9ac226c40165b` |

Syarat lengkap dan salinan teksnya ada di `tr/SOURCE.md`. Ringkasnya: tanpa perubahan, sebut penerbit dan QuranEnc.com, cantumkan versi, pertahankan info penerjemah, laporkan catatan ke sumber, perbarui ke versi terbaru, dan tanpa iklan tidak pantas.

Berkas berisi 6.236 entri `{surah, ayah, text, footnotes}`. Teks Arab dari respons API **tidak** disimpan agar tidak ada salinan kedua teks Al-Qur'an. Pembaruan dilakukan dengan menjalankan `node scripts/fetch-translation.mjs`, bukan mengedit berkas.

## 5. Basmalah pada teks Hafs 20

Basmalah **hanya** ada di 1:1. Ayat 1 surah 2–114 tidak memuatnya (2:1 = `الٓمٓ`), dan surah 9 tidak memiliki basmalah. Build menghasilkan `basmalah.json` dari 1:1; header reader memakainya untuk surah 2–114 kecuali 9. Tidak ada pemotongan teks ayat.
