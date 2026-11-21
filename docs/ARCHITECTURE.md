# Architecture

## Quran PWA

**Versi:** 1.0
**Tanggal:** 2026-11-12

---

## 1. Keputusan inti

| Keputusan       | Pilihan                                             | Alasan                                                                        |
| --------------- | --------------------------------------------------- | ----------------------------------------------------------------------------- |
| Bentuk aplikasi | PWA (satu aplikasi web)                             | Teks Qur'an statis; PWA dapat dipasang di Android dan iOS tanpa toko aplikasi |
| Backend         | **Tidak ada**                                       | Tidak ada akun atau sinkronisasi di Release 1                                 |
| Data Quran      | Dibundel sebagai JSON statis, dihasilkan saat build | Cepat, offline otomatis, tanpa biaya server                                   |
| Data pengguna   | IndexedDB di perangkat                              | Privat secara bawaan                                                          |
| Hosting         | Cloudflare Pages (statis)                           | Bandwidth tanpa batas pada paket gratis untuk aset statis                     |
| Monorepo        | Tidak (satu project)                                | Tidak ada lebih dari satu aplikasi                                            |

Yang **tidak** dipakai di Release 1: Express, PostgreSQL, Drizzle, autentikasi, OpenAPI, Docker/Nginx, Turborepo, Expo/React Native, Redis, GraphQL.

## 2. Tech stack

| Lapisan       | Pilihan                                                                                                 |
| ------------- | ------------------------------------------------------------------------------------------------------- |
| Bahasa        | TypeScript                                                                                              |
| UI            | React + Vite                                                                                            |
| Router        | React Router (mode SPA)                                                                                 |
| PWA           | `vite-plugin-pwa` (Workbox)                                                                             |
| Data pengguna | Dexie (pembungkus IndexedDB)                                                                            |
| Pencarian     | MiniSearch atau FlexSearch (di klien)                                                                   |
| Gaya          | CSS variables dari `docs/design/DESIGN-TOKENS.md` + CSS Modules (Tailwind boleh jika dipilih eksplisit) |
| Tes           | Vitest (unit), Playwright (E2E, termasuk mode offline), axe-core (aksesibilitas)                        |
| Kualitas      | ESLint, Prettier, `tsc --noEmit`, Lighthouse CI                                                         |
| CI/CD         | GitHub Actions → Cloudflare Pages                                                                       |
| Manajer paket | pnpm                                                                                                    |

Pilihan di atas adalah titik awal. Ubah lewat `docs/design/DESIGN-DECISIONS.md` atau catatan keputusan teknis, bukan secara diam-diam.

## 3. Struktur repositori

```text
quran-pwa/
├── AGENTS.md
├── opencode.json
├── README.md
├── docs/                     # dokumen produk, arsitektur, desain
├── data/
│   └── source/               # berkas mentah QuranEnc/KFGQPC + metadata Tanzil (tidak diubah)
├── scripts/                  # build-data, validate-data
├── public/
│   ├── data/                 # DIHASILKAN oleh build-data (jangan edit manual)
│   ├── fonts/                # font self-hosted + berkas lisensinya
│   └── icons/                # ikon PWA
├── src/
│   ├── app/                  # root, router, penyedia konteks
│   ├── routes/               # halaman (Beranda, Surah, Reader, Cari, Penanda, Pengaturan, Sumber)
│   ├── features/
│   │   ├── quran/            # muat data, navigasi surah/ayat/juz
│   │   ├── bookmarks/
│   │   ├── search/
│   │   ├── settings/
│   │   └── offline/          # status jaringan, penyiapan offline, pembaruan
│   ├── components/ui/        # komponen dasar (lihat COMPONENT-INVENTORY)
│   ├── lib/
│   │   ├── db/               # skema Dexie
│   │   ├── data/             # klien data statis (fetch, cache, validasi)
│   │   ├── arabic/           # normalisasi untuk pencarian (BUKAN untuk tampilan)
│   │   └── format/
│   ├── styles/               # tokens.css, global.css
│   └── sw/                   # kode service worker kustom (jika perlu)
├── tests/
│   ├── unit/
│   └── e2e/
└── .github/workflows/
```

## 4. Data Quran

### 4.1 Sumber

- Teks Arab: **Uthmani Hafs 20** dari paket KFGQPC yang disediakan QuranEnc.com, beserta font `Hafs_20.woff2` (D-042). Teks dan font dipakai berpasangan dan tidak diubah.
- Nama surah Latin: **QuranEnc.com** (`sowar_names?iso_code=id`), dinormalkan untuk tampilan (diakritik dibuang, backtick menjadi apostrof).
- Metadata (juz, sajdah, halaman): file metadata Tanzil. Verifikasi isinya setelah diunduh.
- Terjemahan Indonesia: **QuranEnc.com**, edisi `indonesian_affairs` (Kementerian Agama RI), boleh diterbitkan ulang dengan tujuh syarat. Lihat `DESIGN-DECISIONS.md` D-003.

Berkas mentah disimpan di `data/source/` dan tidak pernah diedit.

### 4.2 Alur build data

```text
data/source/*  →  scripts/validate-data  →  scripts/build-data  →  public/data/<versi>/*
```

1. **Validasi** sumber: jumlah surah (114), jumlah ayat (6.236 total), urutan nomor tanpa celah, tanpa duplikat, tidak ada teks kosong, jumlah ayat per surah cocok dengan metadata.
2. **Build**: menghasilkan JSON per surah dan indeks, **tanpa mengubah teks Arab** (string keluaran harus identik dengan sumber).
3. **Manifest**: mencatat versi dataset, sumber, lisensi, tanggal pengambilan, dan checksum SHA-256 tiap berkas.
4. **CI** menjalankan validasi dan membandingkan checksum. Build gagal jika ada ketidakcocokan.

**Status:** `validate:data`, `build:data`, dan `verify:output` sudah tersedia (lihat `scripts/README.md`). Dataset v3 dibangun dari `quran-hafs.csv` (Hafs 20), `surah-names-id.json` (QuranEnc), `quran-data.js` (metadata 1.0), dan `tr/indonesian_affairs.json` (QuranEnc, Kemenag). Indeks pencarian Arab dan berkas terjemahan per surah dihasilkan saat build.

### 4.3 Tata letak berkas keluaran

```text
public/data/v3/
├── manifest.json                 # versi, sumber, lisensi, checksum
├── COPYRIGHT.txt                 # atribusi KFGQPC, QuranEnc, dan metadata Tanzil
├── basmalah.json                 # teks 1:1 untuk header surah 2–114 kecuali 9
├── surahs.json                   # metadata 114 surah + nama tampilan dan alias
├── juz.json                      # pemetaan juz (jika terverifikasi)
├── ar/
│   ├── 001.json … 114.json       # teks Arab per surah
├── tr/
│   └── indonesian_affairs/
│       ├── 001.json … 114.json   # terjemahan + catatan kaki per surah
│       └── SOURCE.txt            # penerbit, versi, syarat pemakaian
└── search/
    ├── arabic.json               # [surah, ayat, teks ternormalisasi] untuk 6.236 ayat
    └── translation.json          # [surah, ayat, terjemahan ternormalisasi] untuk 6.236 ayat
```

`tr/` berisi terjemahan verbatim dari QuranEnc beserta catatan kaki; teks Arab tidak disalin ke berkas terjemahan (D-003). `search/arabic.json` dan `search/translation.json` hanya berisi referensi dan teks ternormalisasi; teks tampilan tetap dibaca dari `ar/*.json` dan `tr/*/*.json` (D-032, D-033, D-034). Indeks terjemahan tidak memuat catatan kaki.

Contoh isi `ar/001.json` (struktur, bukan data nyata):

```json
{
  "surah": 1,
  "ayahs": [{ "n": 1, "text": "<teks Arab verbatim dari sumber>" }]
}
```

### 4.4 Aturan

- Kunci ayat selalu `(surah, ayat)`.
- Teks Arab, terjemahan, dan (nanti) transliterasi/tafsir disimpan di berkas terpisah.
- Versi dataset ada di path (`/data/v2/`). Nilai ini berasal dari `DATASET_VERSION` di `src/lib/data/version.ts` dan `scripts/lib/source.mjs`; naikkan keduanya bersamaan. Koreksi konten = versi baru, bukan menimpa berkas.
- Basmalah: ikuti keputusan **D-012** setelah berkas sumber diperiksa. Jangan mengubah data tersimpan.

## 5. Data pengguna (IndexedDB)

| Tabel       | Kunci          | Isi                                                           |
| ----------- | -------------- | ------------------------------------------------------------- |
| `bookmarks` | `[surah+ayah]` | `createdAt`                                                   |
| `position`  | `'last'`       | `{ surah, ayah, updatedAt }`                                  |
| `settings`  | `key`          | tema, ukuran Arab, ukuran terjemahan, tampil terjemahan, dll. |
| `meta`      | `key`          | versi skema, versi dataset yang ter-cache                     |

- Satu penanda per ayat (kunci gabungan menjamin tidak ada duplikat).
- Penulisan bersifat idempoten (upsert).
- Migrasi skema memakai sistem versi Dexie.
- Waktu disimpan dalam UTC.
- Implementasi M3: `bookmarks.createdAt` berupa ISO UTC dan daftar diurutkan terbaru lebih dahulu; `position` hanya memiliki satu baris `'last'`; `settings` memakai kunci `theme` (`light`/`dark`/`system`), `reader.arabicSize` (`s`–`xxl`), `reader.showTranslation` (boolean), dan `reader.translationSize` (`s`–`xl`); bawaan `m` untuk kedua ukuran.
- Posisi baca awal diambil dari ayat tujuan deep link. Gulir programatik tidak menimpa posisi; pembaruan hanya terjadi setelah pengguna berinteraksi (D-025).

### Format ekspor/impor penanda

```json
{
  "app": "quran-pwa",
  "schemaVersion": 1,
  "exportedAt": "2026-11-12T09:00:00Z",
  "bookmarks": [
    { "surah": 18, "ayah": 10, "createdAt": "2026-11-12T08:00:00Z" }
  ],
  "position": { "surah": 18, "ayah": 10 },
  "settings": {}
}
```

Impor: validasi dengan skema, gabungkan berdasarkan `(surah, ayah)`, jangan menghapus data yang ada, laporkan jumlah diimpor dan dilewati. Posisi baca hanya dipulihkan bila perangkat belum memilikinya. Pengaturan yang dikenal (`theme`, `reader.arabicSize`, `reader.showTranslation`, `reader.translationSize`) hanya diisi bila belum ada. Berkas dengan bentuk atau rentang tidak valid ditolak seluruhnya, dan pesan galat tampil di Pengaturan (D-028).

## 6. Rute

| Rute                  | Layar                                                      |
| --------------------- | ---------------------------------------------------------- |
| `/`                   | Beranda                                                    |
| `/surah`              | Indeks Surah (tab Surah/Juz)                               |
| `/surah/:surah`       | Reader (`?ayah=N` untuk menggulir ke ayat)                 |
| `/surah/:surah/:ayah` | Reader langsung ke ayat (bentuk tautan kanonis)            |
| `/cari`               | Cari                                                       |
| `/penanda`            | Penanda                                                    |
| `/pengaturan`         | Pengaturan                                                 |
| `/pengaturan/sumber`  | Sumber & Atribusi                                          |

Rute lama `/quran`, `/quran/:surah`, dan `/quran/:surah/:ayah` dialihkan permanen ke bentuk `/surah`; `/sumber` dialihkan ke `/pengaturan/sumber`. Parameter `?ayah=N` tetap didukung untuk tautan juz dan tautan lama (D-024).

Hosting statis perlu _fallback_ SPA agar rute dalam dapat dimuat langsung. Cloudflare Pages memperlakukan project tanpa `404.html` sebagai SPA, tetapi verifikasi perilakunya di staging.

## 7. Service worker dan offline

| Aset                                     | Strategi                                                                                              |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| App shell (HTML/JS/CSS/font/ikon)        | Precache Workbox, versi lewat hash berkas                                                             |
| `manifest.json`, `surahs.json`, `juz.json` | Precache (juga disalin ke cache data oleh unduhan offline)                                            |
| `ar/*.json`, `search/*.json`             | `CacheFirst` di cache berversi `quranku-data-v1`; diunduh di latar setelah idle (progres di S11)      |
| `tr/*/*.json`                            | `CacheFirst` di cache data yang sama; diunduh bersama `ar/*.json`                                      |

- Manifest dan service worker dihasilkan `vite-plugin-pwa` 2 (`registerType: "prompt"`, `injectRegister: null`).
- Pembaruan: tampilkan "Versi baru tersedia." dan **jangan** muat ulang paksa (posisi baca tidak boleh hilang). Pemeriksaan pembaruan dilakukan tiap jam selama aplikasi terbuka.
- Cache data memakai nama berversi. Saat versi dataset berubah, cache `quranku-data-*` lama dihapus saat aplikasi mulai.
- Unduhan offline memakai Cache API langsung dari halaman, konkurensi 3, dan berhenti otomatis bila pengguna menghapus salinan pada sesi itu. `Save-Data` menunda unduhan otomatis.
- Kuota penuh dan kegagalan jaringan memiliki pesan terpisah di banner S11 dan Pengaturan.
- Uji offline di Playwright (`setOffline`) mencakup navigasi Reader, pencarian, dan service worker; tetap uji di perangkat nyata sebelum rilis.

## 8. Pencarian

- Mode: **Surah**, **Arab**, dan **Terjemahan** (D-034).
- Normalisasi Arab hanya untuk **indeks** dan pencocokan: hapus harakat dan tanda Qur'ani, samakan varian alif, alif maksura, ta marbuta, dan tatweel. Tampilan tetap memakai teks asli. Rincian di `docs/SEARCH-NORMALIZATION.md`.
- Indeks `search/arabic.json` dihasilkan oleh `scripts/build-data.mjs` dengan format `[surah, ayat, teks ternormalisasi]`; total 6.236 entri (~775 KB).
- Indeks `search/translation.json` memakai format dan normalisasi yang sama untuk teks terjemahan (tanpa catatan kaki); total 6.236 entri (~1,1 MB), anggaran 1,6 MB.
- Indeks dimuat malas hanya saat mode yang bersangkutan aktif: Arab setelah dua karakter, Terjemahan setelah tiga karakter. Tidak ada indeks di muatan awal.
- Semua kata kueri harus muncul. Peringkat memberi bobot kecocokan persis, awalan, frasa, dan jumlah kemunculan; 20 hasil pertama ditampilkan dan dapat ditambah 20 per kali hingga 100.
- Batas panjang kueri 100 karakter dan debounce input 250 ms.
- Hasil Arab menampilkan teks ayat utuh dari `ar/*.json`; hasil terjemahan menampilkan teks dari `tr/*/*.json`. Keduanya menyorot kata cocok dengan `<mark>` yang dipetakan ke teks asli.
- Pencarian terjemahan mewajibkan semua kata muncul. Imbuhan umum Indonesia ditoleransi dengan membuat varian kueri di sisi pencarian (D-039); indeks tidak berubah. Tidak ada pencarian semantik.
- Tidak ada pencarian semantik, vektor, tafsir, atau akar kata.

## 9. Kinerja

- Jangan memuat seluruh Qur'an di muatan awal. Muat per surah.
- Daftar panjang (Al-Baqarah) memakai virtualisasi atau pemuatan bertahap bila perlu.
- Font Arab: `font-display: swap`; jangan subset yang menghilangkan glyph.
- Tetapkan anggaran ukuran dan waktu interaktif setelah build pertama, ukur p75 pada perangkat nyata.

## 10. Privasi dan keamanan

- Semua data pengguna hanya di perangkat. Tidak ada pengiriman ke server.
- Tanpa analitik pihak ketiga secara bawaan. Jika kelak ditambahkan: agregat, tanpa cookie, tanpa teks pencarian, tanpa riwayat baca perorangan.
- Header keamanan lewat berkas `_headers` (CSP ketat, `X-Content-Type-Options`, `Referrer-Policy`).
- Tidak ada rahasia di repo. Pindai dependensi (Dependabot atau `pnpm audit`).
- Impor berkas pengguna divalidasi ketat dengan skema.

## 11. Pengujian

| Jenis            | Cakupan                                                                                                                                   |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Unit             | Navigasi surah/ayat/juz, normalisasi Arab, validator data, skema impor/ekspor, layanan penanda                                            |
| Integrasi        | Dexie (penanda, posisi, pengaturan), klien data statis                                                                                    |
| E2E (Playwright) | Buka surah dan baca; ubah pengaturan; beri penanda dan pulihkan; cari dan buka hasil tepat; lanjutkan membaca; mode offline; ekspor/impor |
| Aksesibilitas    | axe-core di E2E + uji manual (lihat `ACCESSIBILITY-CHECKLIST.md`)                                                                         |
| Konten           | Uji integritas data (jumlah, urutan, checksum) + tinjauan orang yang berkompeten. Lulus uji kode saja bukan bukti teks benar              |
| Perangkat        | Rendering Arab sesuai `DESIGN-TEST-PLAN.md` bagian A                                                                                      |

## 12. Deployment

- Cloudflare Pages, build dari GitHub. Hanya aset statis (tanpa Pages Functions).
- Batas paket gratis yang relevan: 500 build/bulan, 20.000 file per situs, 25 MiB per file. Proyek ini jauh di bawahnya, tetapi periksa kembali syarat terbaru sebelum rilis.
- Audio (rilis berikutnya) **tidak** dihosting di sini; gunakan CDN reciter yang berlisensi.
- Domain `.pages.dev` gratis. Domain sendiri opsional.
- Siapkan prosedur rollback (deploy ulang versi sebelumnya).

## 13. CI (GitHub Actions)

Workflow `.github/workflows/ci.yml` menjalankan tiga job:

1. **Quality:** instal dependensi, lint, typecheck, unit test, `validate:data`, dan `verify:output`.
2. **E2E:** build produksi lalu Playwright pada Chromium dan emulasi Pixel 5 (termasuk PWA, offline, pencarian, aksesibilitas, dan 320 px).
3. **Lighthouse:** build lalu `lhci autorun` terhadap beranda, Reader, dan hasil pencarian Arab. Ambang aksesibilitas 0.95, performa 0.85 (peringatan), best practices dan SEO 0.9.

Deploy ke Cloudflare Pages dilakukan di luar workflow ini (cabang utama) sampai kredensial dan prosedur rollback ditetapkan.

## 14. Skrip

| Skrip                | Fungsi                                                  |
| -------------------- | ------------------------------------------------------- |
| `pnpm dev`           | Server pengembangan (`predev` menyiapkan data)          |
| `pnpm build`         | Build produksi (validasi, build-data, verifikasi dulu)  |
| `pnpm test`          | Unit test (`pretest` menyiapkan data)                   |
| `pnpm test:e2e`      | Playwright terhadap build produksi                      |
| `pnpm lighthouse`    | Lighthouse CI terhadap build (`lhci autorun`)           |
| `pnpm generate:pwa-assets` | Membuat ulang ikon PWA dari `public/icons/icon.svg` |
| `pnpm typecheck`     | `tsc -b`                                                |
| `pnpm lint`          | ESLint                                                  |
| `pnpm format`        | Prettier tulis ulang                                    |
| `pnpm format:check`  | Prettier pemeriksaan                                    |
| `pnpm validate:data` | Validasi berkas sumber dan keluaran                     |
| `pnpm build:data`    | Menghasilkan `public/data/<versi>/`                     |
| `pnpm verify:output` | Membandingkan keluaran dengan sumber dan checksum       |

## 15. Jalur ke rilis berikutnya

| Kebutuhan                      | Rencana                                                                                                          |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| Tafsir dan terjemahan tambahan | Berkas data tambahan per sumber dengan label dan lisensi                                                         |
| Akun dan sinkronisasi          | Tambahkan backend **terpisah**. Data pengguna sudah terpisah dari data referensi, jadi reader tidak perlu diubah |
| Aplikasi native                | Evaluasi setelah PWA terbukti; PWA sudah dapat dipasang                                                          |

## 16. Pertanyaan terbuka

| #   | Pertanyaan                                   | Terkait               |
| --- | -------------------------------------------- | --------------------- |
| 1   | Penanganan basmalah pada berkas sumber       | D-012                 |
| 2   | Font Arab final dan lisensinya               | D-006                 |
| 3   | Versi minimum browser dan OS yang didukung   | —                     |
| 4   | Anggaran ukuran dan kinerja                  | Setelah build pertama |
| 5   | Siapa yang meninjau impor dan koreksi konten | PRD §13               |

## 17. Prioritas dokumen bila ada konflik

1. `docs/ARCHITECTURE.md` (teknis)
2. `docs/design/*` (desain dan konten)
3. `docs/PRD.md` dan `docs/PRODUCT-SPECIFICATION.md` (produk; bagian API/akun/Expo **ditunda**)
4. `docs/archive/*` (hanya referensi, bukan instruksi)

## 18. Status implementasi

### Sudah berjalan

- Fondasi Vite + React + TypeScript, router, tata letak, token desain, tema terang/gelap.
- Pipeline data Hafs 20 (dataset v3): validasi CSV, build, verifikasi checksum, 114 surah, 6.236 ayat, 30 juz.
- S01 Beranda (termasuk kartu "Lanjutkan membaca"), S02 Indeks Surah/Juz.
- S03 Reader dengan deep link ayat, penanda, pengaturan ukuran Arab, salin referensi/ayat, bagikan lewat Web Share API, basmalah sebagai baris tampilan (D-012), dan atribusi.
- S06 "Lompat ke": dialog dengan tab Surah & Ayat dan Juz; validasi rentang ayat, keadaan memuat/galat untuk juz, dan navigasi ke awal juz.
- S07 Penanda: daftar terbaru lebih dahulu, hapus, dan urungkan.
- S09 Pengaturan dasar, ekspor/impor penanda (JSON), data offline (unduh/hapus), hapus data lokal dengan dialog konfirmasi, dan S10 Sumber & Atribusi.
- S08 Cari: mode Surah, Arab, dan Terjemahan; indeks dimuat malas per mode, sorotan kata, hasil membuka Reader tepat di ayat (terjemahan tampil sekali kunjungan untuk hasil terjemahan).
- Pencarian surah berdasarkan nama Latin, nama Arab, dan nomor; filter juz.
- PWA: manifest, ikon, precache app shell, runtime cache data, prompt pembaruan tanpa muat ulang paksa, banner progres offline, dan baris data offline di Pengaturan.
- Ajakan pasang non-modal setelah pembaca melewati beberapa ayat, dengan tombol "Nanti" yang diingat 14 hari, serta entri "Aplikasi" di Pengaturan untuk Chromium dan instruksi manual iOS (D-040).
- Unduhan offline otomatis setelah idle (kecuali `Save-Data`), cache berversi `quranku-data-v1`, penanganan kuota/jaringan, dan pembersihan cache lama.
- Dexie v1: `bookmarks`, `position`, `settings`, `meta`; tema, posisi baca, dan ukuran Arab tersimpan di perangkat.
- Terjemahan Indonesia QuranEnc (Kemenag) di dataset v2: berkas per surah, catatan kaki, manifest, dan verifikasi checksum (D-003).
- Pemutar audio (D-044): audio dialirkan dari EveryAyah (MP3 64 kbps), enam Qari dengan alafasy sebagai default, putar per ayat dengan auto-advance, repeat off/surah/one, rates 0,75/1/1,25/1,5, Media Session, dan tombol putar per ayat pada Reader.
- Queue surah (D-045): "Putar Surah" di SurahHeader — mulai dari ayat 1, maju otomatis hingga akhir surah, X menutup pemutar; indikator aktif (`.audioActive`, `data-playing`, "Berhenti Surah").
- Media Session durasi/posisi/seek (D-046): `setPositionState` disinkronkan melalui `timeupdate`/`durationchange`/`loadedmetadata`/`play`/`pause`; handler `seekto` menggunakan `details.seekTime` (absolut) atau `details.seekOffset` (relatif).
- Retry EveryAyah (D-047): `start()` mencoba `audio.play()` 3× (backoff 500·attempt ms), ulang `audio.src` saat retry, guard `retryingRef` pada `onError` (tidak error sementara selama retry).
- Volume (D-048): `AudioContext` (`volume`, `muted`, `setVolume`, `toggleMute`); `PlayerBar` tombol mute + label "Matikan suara"/"Suara dimatikan"; play button aria-label "Memuat audio…" saat loading; unit `normalizeVolume` (clamp ke [0, 1]).
- Per-surah offline: Cache Storage `quranku-audio-v1` dengan unduhan konkurensi 3 dan 3 percobaan; audio tidak di-bundle dan tidak dimasukkan ke `OFFLINE_DATA_PATHS`.
- Qari segar (EveryAyah, D-044): rangkaian Qari lengkap dari 1:1, stream langsung dari jaringan, atribusi EveryAyah dicantumkan di S10 dan pemutar, dan saat memutar/mengunduh server EveryAyah melihat IP dan ayat yang diminta (lihat `data/source/SOURCES.md` §6).
- Unit test (Vitest) dan E2E (Playwright) untuk navigasi, teks Arab verbatim, RTL, 320 px, target sentuh, tema, axe, penanda, posisi baca, ukuran Arab, ekspor/impor, berbagi, pencarian Arab dan terjemahan, PWA, offline, dan audio.
- CI GitHub Actions (quality, E2E, Lighthouse) dan konfigurasi `lighthouserc.json`.

### Belum dikerjakan

- Uji perangkat nyata dan keputusan akhir font Arab (D-006) sebelum rilis publik.
- Pemetaan nama surah ejaan Kemenag; menunggu daftar terverifikasi (D-020).
- Tinjauan basmalah oleh orang yang berkompeten (keputusan tampilan sudah ada di D-012).

Rincian gate dan langkah rilis ada di `docs/RELEASE-CHECKLIST.md`.
