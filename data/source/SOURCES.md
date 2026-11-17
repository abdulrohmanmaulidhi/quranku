# Sumber data

Diambil pada **2026-11-15**. Berkas mentah tidak boleh diedit; perubahan sumber berarti versi dataset baru.

## 1. Teks Arab

| Field | Nilai |
| --- | --- |
| Berkas | `quran-uthmani.txt` |
| Nama | Tanzil Quran Text (Uthmani) |
| Versi | 1.1 |
| Lisensi | Creative Commons Attribution 3.0 |
| Tautan | https://tanzil.net/download/ |
| URL unduhan | `https://tanzil.net/pub/download/index.php?quranType=uthmani&outType=txt-2&marks=true&sajdah=true&tatweel=true&agree=true` |
| Format | `surah\|ayat\|teks`, satu ayat per baris |
| SHA-256 | `6933e133dd56db778c801bf738848454e43648105a151e8d84d86a7cae39ec5f` |

Opsi unduhan: tanda waqaf (`marks`), tanda sajdah (`sajdah`), dan tatweel di bawah alef superskrip (`tatweel`) disertakan; tanda rub-el-hizb tidak. Blok hak cipta Tanzil di akhir berkas dipertahankan apa adanya.

## 2. Metadata

| Field | Nilai |
| --- | --- |
| Berkas | `quran-data.js` |
| Nama | Tanzil Quran Metadata |
| Versi | 1.0 |
| Lisensi | Creative Commons Attribution 3.0 |
| Tautan | https://tanzil.net/res/text/metadata/quran-data.js |
| SHA-256 | `9e9930c592aaa34b5c7a79ff4e99ffdc782263a266090bfe2c49e4ed4bac4ca4` |

Berisi `Sura`, `Juz`, `HizbQaurter`, `Manzil`, `Ruku`, `Page`, dan `Sajda`. Build v1 memakai `Sura` dan `Juz`; data lain belum dipakai.

## 3. Terjemahan Indonesia

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

## 4. Temuan basmalah (untuk D-012)

Basmalah ada di ayat 1 pada 113 surah:

- 111 surah memakai bentuk yang sama persis dengan 1:1. Pada surah 1, basmalah adalah seluruh ayat 1.
- Surah 95 dan 97 memakai bentuk basmalah dengan shadda pada ba.
- Surah 9 tidak memiliki basmalah.

Build **tidak memotong** basmalah dari teks ayat. Keputusan tampilan menunggu D-012.
