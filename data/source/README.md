# data/source

Berkas **mentah** dari sumber konten. Isi folder ini tidak boleh diedit.

**Status:** teks Arab dan metadata sudah diunduh pada 2026-11-15. Rincian sumber, lisensi, dan temuan basmalah ada di `SOURCES.md`; checksum ada di `CHECKSUMS.txt`.

## Yang perlu ditaruh di sini

| Berkas | Dari mana | Keterangan |
|---|---|---|
| Teks Arab Tanzil (Uthmani) | https://tanzil.net/download/ | Pilih jenis teks **Uthmani**, format teks dengan nomor ayat (umumnya berbentuk `surah\|ayat\|teks`). Periksa format setelah diunduh. |
| Metadata Tanzil (`quran-data.js`) | https://tanzil.net/res/text/metadata/quran-data.js | Berisi metadata surah, juz, halaman, sajdah. Verifikasi isi dan lisensinya. |
| Terjemahan Indonesia | **Belum ditetapkan** | Lihat `docs/design/DESIGN-DECISIONS.md` D-003. Jangan memakai hasil scrape tidak resmi sebagai data final. |

> Alamat unduhan di atas perlu dicek ulang di situs Tanzil, karena tata letak situs dapat berubah.

## Catatan lisensi

Teks Tanzil berlisensi Creative Commons Attribution 3.0. Boleh disalin dan disebarkan apa adanya, **mengubah teksnya tidak diperbolehkan**, dan atribusi wajib. Baca syarat lengkap di tanzil.net.

## Setelah mengunduh

1. Catat di `SOURCES.md`: nama sumber, versi, tanggal pengambilan, tautan, dan lisensi. _(sudah)_
2. Hitung checksum SHA-256 setiap berkas dan simpan di `CHECKSUMS.txt`. _(sudah)_
3. Jalankan `pnpm validate:data` untuk memastikan 114 surah dan 6.236 ayat. _(sudah)_
4. Periksa bagaimana basmalah direpresentasikan pada berkas (D-012) sebelum menulis build-data. _(sudah diperiksa; keputusan tampilan masih terbuka)_
