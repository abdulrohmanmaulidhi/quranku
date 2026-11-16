# Normalisasi Pencarian Arab

Dokumen ini menjelaskan normalisasi yang dipakai **hanya untuk pencarian**. Tidak ada normalisasi yang diterapkan pada teks yang ditampilkan.

## Prinsip

1. Teks Al-Qur'an yang ditampilkan selalu berasal dari `public/data/v1/ar/XXX.json` dan identik dengan sumber Tanzil.
2. Indeks pencarian menyimpan referensi `(surah, ayat)` dan teks ternormalisasi, bukan teks asli.
3. Normalisasi yang sama dipakai oleh skrip build dan aplikasi melalui `src/lib/search/normalize.mjs`. Jangan membuat salinan algoritme di tempat lain.
4. Sorotan hasil pencarian hanya membungkus karakter asli dengan `<mark>`; isi teks tidak berubah.

## Alur

```text
data/source/quran-uthmani.txt
        │
        ▼
scripts/build-data.mjs ── normalizeForSearch ──► public/data/v1/search/arabic.json
        │
        └── ar/XXX.json (teks verbatim)

aplikasi
  ├─ memuat indeks malas saat mode Arab + kueri ≥ 2 karakter
  ├─ mencocokkan kueri ternormalisasi dengan entri ternormalisasi
  └─ memuat teks asli dari ar/XXX.json untuk hasil yang tampil
```

## Aturan normalisasi

`normalizeForSearch(value)` melakukan, berurutan:

1. Unicode NFD.
2. Menghapus diakritik Latin (`U+0300`–`U+036F`).
3. Menghapus harakat dan tanda Qur'ani Arab (`U+0610`–`U+061A`, `U+064B`–`U+065F`, `U+0670`, `U+06D6`–`U+06ED`).
4. Menghapus tatweel (`U+0640`).
5. Menyamakan varian alif `أ إ آ ٱ` menjadi `ا`.
6. Menyamakan alif maksura `ى` menjadi `ي`.
7. Menyamakan ta marbuta `ة` menjadi `ه`.
8. Huruf kecil untuk teks Latin.
9. Mengubah apostrof dan tanda hubung (`’ ' \` -`) menjadi spasi.
10. Merapatkan spasi dan memangkas ujung.

Contoh:

| Masukan               | Hasil      |
| --------------------- | ---------- |
| `ٱلرَّحْمَـٰنِ`       | `الرحمن`   |
| `الرحمن`              | `الرحمن`   |
| `Al-Fātiḥah`          | `al fatihah` |
| `  'Asr  `            | `asr`      |

## Pencocokan

`searchAyahs(entries, query, limit)`:

- Memotong kueri pada 100 karakter, lalu menormalisasi.
- Mengabaikan kueri yang ternormalisasi kurang dari 2 karakter.
- Memecah kueri menjadi kata; **semua** kata harus muncul sebagai substring pada teks ternormalisasi.
- Memberi skor: kecocokan persis +1000, awalan +300, frasa +150, dan +5 per kemunculan kata.
- Mengurutkan skor tertinggi, lalu surah dan ayat.
- Mengembalikan maksimal 20 hasil.

Pencarian ini bukan pencarian makna, tafsir, atau akar kata.

## Sorotan

`findHighlightRanges(text, query)` memetakan posisi karakter pada teks ternormalisasi kembali ke teks asli:

1. `normalizeWithMap(text)` menyimpan indeks karakter asli untuk setiap karakter ternormalisasi.
2. Jika frasa utuh ditemukan, frasa itu disorot. Jika tidak, setiap kata disorot terpisah.
3. Rentang yang bertumpuk digabung oleh `ArabicText` sebelum dirender.
4. `ArabicText` merender potongan asli di dalam `<span>` dan `<mark>`; `textContent` hasil akhir harus sama persis dengan teks masukan.

## Pengujian

- `tests/unit/search-arabic.test.ts`: normalisasi, pencocokan, batas hasil, dan pemetaan sorotan.
- `tests/unit/arabic-highlight.test.tsx`: `textContent` tetap identik saat disorot.
- `tests/unit/search-page.test.tsx`: alur layar Cari dan teks verbatim.
- `tests/e2e/search.spec.ts`: pencarian, sorotan, navigasi ke Reader, dan kueri berharakat.
- `tests/e2e/offline.spec.ts`: pencarian dan bacaan tanpa jaringan.

## Batasan

- Pencarian terjemahan menunggu keputusan lisensi D-003.
- Tidak ada stemming, sinonim, atau pencarian semantik.
- Normalisasi Latin hanya membantu nama surah; hasil ayat tetap berasal dari teks Arab.
