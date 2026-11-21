# data/source

Berkas **mentah** dari sumber konten. Isi folder ini tidak boleh diedit.

**Status:** teks Arab Hafs 20 dan nama surah diunduh 2026-11-21; metadata 2026-11-15; terjemahan Indonesia 2026-11-17. Rincian sumber, lisensi, dan temuan basmalah ada di `SOURCES.md`; checksum ada di `CHECKSUMS.txt`.

## Yang perlu ditaruh di sini

| Berkas | Dari mana | Keterangan |
|---|---|---|
| Teks Arab Hafs 20 (`quran-hafs.csv`) | https://quranenc.com/downloads/assets/Hafs_20.zip | CSV berheader `"id","sura","aya","uthmani"`, 6.236 baris. Paket juga memuat font yang cocok. |
| Metadata Tanzil (`quran-data.js`) | https://tanzil.net/res/text/metadata/quran-data.js | Berisi metadata surah, juz, halaman, sajdah. Verifikasi isi dan lisensinya. |
| Nama surah (`surah-names-id.json`) | QuranEnc API (`https://quranenc.com/api/v1/translations/sowar_names?iso_code=id`) | 114 nama; build menormalkan diakritik dan backtick untuk tampilan. |
| Terjemahan Indonesia (`tr/indonesian_affairs.json`) | QuranEnc API (`https://quranenc.com/api/v1/translation/sura/indonesian_affairs/{surah}`) | Kemenag RI, diambil dengan `node scripts/fetch-translation.mjs`. Jangan mengedit berkas; perbarui lewat skrip. |

> Alamat unduhan di atas perlu dicek ulang di situs sumber, karena tata letak situs dapat berubah.

## Catatan lisensi

Teks Arab dan font berasal dari paket Hafs 20 (KFGQPC) yang disediakan QuranEnc. Font boleh dipakai dan didistribusikan tanpa biaya, tetapi **tidak boleh diubah atau di-subset**; lisensinya ada di `public/fonts/licenses/KFGQPC-Hafs.txt`. Atribusi KFGQPC dan QuranEnc wajib tampil. Metadata Tanzil berlisensi CC BY 3.0.

## Setelah mengunduh

1. Catat di `SOURCES.md`: nama sumber, versi, tanggal pengambilan, tautan, dan lisensi. _(sudah)_
2. Hitung checksum SHA-256 setiap berkas dan simpan di `CHECKSUMS.txt`. _(sudah)_
3. Jalankan `pnpm validate:data` untuk memastikan 114 surah dan 6.236 ayat. _(sudah)_
4. Periksa basmalah pada berkas sumber; Hafs 20 tidak menyertakannya di ayat 1. _(sudah)_
