# Component Inventory

## Quran PWA

**Versi:** 1.0
**Tanggal:** 2026-11-12
**Acuan:** DESIGN-TOKENS.md, SCREEN-SPECS.md, ACCESSIBILITY-CHECKLIST.md

Semua komponen memakai _variables_ dari `DESIGN-TOKENS.md` dan dibuat dengan _auto layout_. Setiap komponen harus punya state yang tercantum.

**Legenda state:** D = default · H = hover (hanya perangkat pointer) · P = pressed · F = focus · X = disabled · L = loading · S = selected/aktif · E = error

---

## 1. Kerangka dan navigasi

| Komponen             | Deskripsi                                                                 | Varian                        | State                     | Dipakai di                     |
| -------------------- | ------------------------------------------------------------------------- | ----------------------------- | ------------------------- | ------------------------------ |
| `BottomNav`          | Bilah navigasi bawah mobile, 4 item (Beranda, Quran, Penanda, Pengaturan) | —                             | D, P, F, S                | S01–S09 (disembunyikan di S03) |
| `SideNav` / `TopNav` | Navigasi desktop                                                          | Sidebar, bilah atas           | D, H, P, F, S             | Semua (desktop)                |
| `TopBar`             | Bilah atas dengan judul, tombol kembali, aksi                             | Reader, Standar               | D, F; auto-hide di Reader | S02–S10                        |
| `PageContainer`      | Wadah dengan gutter dan lebar maksimum                                    | Mobile, Desktop, Reader (680) | —                         | Semua                          |

## 2. Kontrol dasar

| Komponen             | Deskripsi                                               | Varian                                             | State            | Dipakai di     |
| -------------------- | ------------------------------------------------------- | -------------------------------------------------- | ---------------- | -------------- |
| `Button`             | Tombol teks                                             | Primary, Secondary, Ghost, Destructive; ukuran M/L | D, H, P, F, X, L | Banyak         |
| `IconButton`         | Tombol ikon (target ≥ 44×44)                            | Default, Toggle (penanda)                          | D, H, P, F, X, S | Reader, TopBar |
| `SearchField`        | Kolom cari + tombol hapus                               | Beranda, Indeks, Layar Cari                        | D, F, X          | S01, S02, S08  |
| `TextField`          | Input teks/angka                                        | Dengan label, dengan pesan error                   | D, F, X, E       | S06            |
| `SegmentedControl`   | Pilihan 2–4 opsi                                        | Mode cari, Tema                                    | D, F, S          | S05, S08, S09  |
| `Tabs`               | Tab konten                                              | Surah/Juz, Surah&Ayat/Juz                          | D, F, S          | S02, S06       |
| `Switch`             | Sakelar                                                 | —                                                  | D, F, S, X       | S05, S09       |
| `Stepper` / `Slider` | Atur ukuran teks (5 tingkat Arab, 4 tingkat terjemahan) | Dengan pratinjau                                   | D, F, X          | S05            |

## 3. Daftar dan baris

| Komponen          | Deskripsi                                                       | Varian                         | State         | Dipakai di |
| ----------------- | --------------------------------------------------------------- | ------------------------------ | ------------- | ---------- |
| `SurahRow`        | Nomor, nama Arab, nama latin, arti, jumlah ayat                 | Dengan/tanpa klasifikasi turun | D, H, P, F    | S02        |
| `JuzRow`          | Nomor juz, surah dan ayat awal                                  | —                              | D, H, P, F    | S02        |
| `BookmarkRow`     | Surah · ayat, pratinjau terjemahan, tanggal, aksi hapus         | —                              | D, H, P, F    | S07        |
| `SearchResultRow` | Surah · ayat, teks ayat utuh dengan kata cocok ditandai        | Arab, Surah                    | D, H, P, F    | S08        |
| `TranslationResultRow` | Surah · ayat, teks terjemahan utuh dengan kata cocok ditandai | —                           | D, H, P, F    | S08        |
| `SettingsRow`     | Label + nilai/kontrol                                           | Navigasi, Sakelar, Info        | D, H, P, F, X | S09        |

## 4. Komponen Reader

| Komponen            | Deskripsi                                                         | Varian                                                  | State      | Catatan                                        |
| ------------------- | ----------------------------------------------------------------- | ------------------------------------------------------- | ---------- | ---------------------------------------------- |
| `SurahHeader`       | Nama Arab, nama latin, arti, jumlah ayat, basmalah (sesuai D-012) | Dengan/tanpa basmalah                                   | D          | Tanpa dekorasi kaligrafi                       |
| `AyahCard`          | Satu ayat: nomor, Arab, terjemahan, aksi                          | Terjemahan tampil/sembunyi; terakhir dibaca; terpenanda | D, P, F, S | Teks Arab tidak boleh dipotong                 |
| `AyahNumberMarker`  | Penanda nomor ayat                                                | Angka Arab-Indic / Latin (D-013)                        | D          | Uji bidi                                       |
| `ArabicText`        | Teks Arab RTL                                                     | 5 ukuran                                                | D          | `dir="rtl"`, `lang="ar"`, tanpa letter-spacing |
| `TranslationText`   | Terjemahan (inline di AyahCard)                                   | 4 ukuran (`s`–`xl`)                                     | D          | `lang="id"`, dengan label sumber               |
| `ReaderControls`    | Tombol Lompat ke dan Pengaturan baca                              | —                                                       | D, P, F    | Di TopBar                                      |
| `AyahNav`           | Surah sebelumnya/berikutnya                                       | —                                                       | D, P, F, X | Di akhir daftar ayat                           |
| `ReadingProgress`   | Indikator progres tipis                                           | —                                                       | D          | Opsional, tidak mengganggu                     |
| `LastReadHighlight` | Sorotan ayat terakhir dibaca                                      | —                                                       | S          | `accent-subtle` + penanda non-warna            |

## 5. Kartu

| Komponen              | Deskripsi                              | State   | Dipakai di |
| --------------------- | -------------------------------------- | ------- | ---------- |
| `ContinueReadingCard` | Nama surah + ayat tersimpan            | D, P, F | S01        |
| `SourceLabel`         | Label sumber singkat (nama terjemahan, inline di S03) | D       | S03, S08   |
| `AttributionBlock`    | Blok atribusi (sumber, versi, lisensi) | D       | S10        |

## 6. Overlay dan umpan balik

| Komponen        | Deskripsi                                           | Varian                      | State               | Dipakai di    |
| --------------- | --------------------------------------------------- | --------------------------- | ------------------- | ------------- |
| `BottomSheet`   | Panel dari bawah (mobile); modal/popover di desktop | Aksi, Pengaturan, Lompat ke | Terbuka/tertutup, F | S04, S05, S06 |
| `Dialog`        | Konfirmasi                                          | Konfirmasi hapus data       | D, F                | S09           |
| `Snackbar`      | Umpan balik singkat dengan aksi opsional (Urungkan) | Info, Dengan aksi           | Muncul/hilang       | Global        |
| `OfflineBadge`  | Lencana status offline                              | Lencana, Banner             | D                   | Global        |
| `InstallPrompt` | Ajakan instal                                       | —                           | D                   | S11           |
| `UpdateBanner`  | "Versi baru tersedia"                               | —                           | D                   | S11           |

## 7. State konten

| Komponen     | Deskripsi                                                                                  | Dipakai di    |
| ------------ | ------------------------------------------------------------------------------------------ | ------------- |
| `Skeleton`   | Placeholder sesuai bentuk (baris surah, kartu ayat)                                        | Semua layar   |
| `EmptyState` | Ikon + penjelasan + aksi                                                                   | S02, S07, S08 |
| `ErrorState` | Pesan + Coba lagi                                                                          | Semua layar   |
| `Icon set`   | Lucide grid 24 (D-018): garis untuk navigasi, terisi = tersimpan (D-037)                   | Global        |

### 7.1 Ikon

- **Set:** Lucide, lisensi ISC. Grid 24 px; ukuran tampilan 20–24 px mengikuti konteks komponen. Stroke 2 pada grid 24, diskalakan proporsional (2 × ukuran/24, minimum 1,5), `strokeCap` dan `strokeJoin` round.
- **Warna:** selalu lewat variabel tema (`color.text-secondary`, `color.text-tertiary`, `color.accent`, `color.on-accent`), tidak pernah hex mentah.
- **Keadaan:** ikon garis untuk navigasi dan aksi; ikon terisi untuk status tersimpan (D-037). Tab aktif dibedakan lewat pil latar, bobot tebal, warna aksen, dan `aria-current="page"`.
- **Penamaan layer:** `icon/lucide/<glyph>`.
- **Glyph:** `search`, `arrow-right`, `arrow-left`, `house`, `book-open`, `bookmark`, `sliders-horizontal`, `chevron-left`, `chevron-right`, `chevron-down`, `x`, `copy`, `link-2`, `share`.
- **Referensi visual:** halaman `Components`, seksi `Ikon · Lucide`.

---

## 8. Matriks state minimum yang wajib digambar

| Komponen                | Terang | Gelap | Fokus | Teks besar (200%) |
| ----------------------- | ------ | ----- | ----- | ----------------- |
| Button, IconButton      | ✔      | ✔     | ✔     | ✔                 |
| SurahRow, BookmarkRow   | ✔      | ✔     | ✔     | ✔                 |
| AyahCard (semua varian) | ✔      | ✔     | ✔     | ✔                 |
| BottomSheet             | ✔      | ✔     | ✔     | ✔                 |
| Snackbar                | ✔      | ✔     | —     | ✔                 |

## 9. Catatan implementasi bagi desainer

- Beri nama lapisan dan komponen konsisten agar mudah dipetakan ke kode.
- Cantumkan anotasi: urutan fokus, label aksesibel, level heading.
- Komponen yang hanya relevan untuk fitur ditunda (audio, tafsir, catatan, target) **tidak** dibuat sekarang.
