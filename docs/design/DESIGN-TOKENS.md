# Design Tokens

## Quran PWA

**Versi:** 1.0
**Tanggal:** 2026-11-12
**Tujuan:** sumber tunggal nilai desain. Dimasukkan ke _variables_ FigCraft, lalu menjadi CSS custom properties saat implementasi.

> Nilai kontras di bawah **sudah dihitung** (rumus WCAG 2.x) pada 2026-11-12. Hitung ulang jika ada warna yang diubah.

---

## 1. Warna

### 1.1 Semantik — mode Terang dan Gelap

| Token                  | Terang    | Gelap     | Kegunaan                            |
| ---------------------- | --------- | --------- | ----------------------------------- |
| `color.bg`             | `#FAF8F3` | `#121413` | Latar halaman                       |
| `color.surface`        | `#F3F0E8` | `#1A1D1B` | Kartu, baris daftar                 |
| `color.surface-raised` | `#FFFFFF` | `#222623` | Sheet, dialog                       |
| `color.divider`        | `#E2DDD0` | `#2E3330` | Garis pemisah dekoratif             |
| `color.border-strong`  | `#8F8A7E` | `#6B6F6A` | Batas input/kontrol                 |
| `color.text-primary`   | `#1C1B19` | `#E8E6E1` | Teks utama, teks Arab               |
| `color.text-secondary` | `#5E5B54` | `#A8A59E` | Terjemahan, metadata                |
| `color.text-tertiary`  | `#6F6B62` | `#8F8C84` | Keterangan kecil                    |
| `color.accent`         | `#1F6F5C` | `#5FB89E` | Tombol utama, penanda aktif, tautan |
| `color.on-accent`      | `#FFFFFF` | `#0B1512` | Teks/ikon di atas aksen             |
| `color.accent-subtle`  | `#E3EFEA` | `#1B2B26` | Sorotan ayat terakhir dibaca        |
| `color.danger`         | `#B3261E` | `#F2998F` | Aksi hapus, error                   |

### 1.2 Hasil verifikasi kontras

| Pasangan                 | Terang | Gelap | Standar                |
| ------------------------ | -----: | ----: | ---------------------- |
| text-primary / bg        |  16.22 | 14.83 | ≥ 4.5 ✅               |
| text-primary / surface   |  15.11 | 13.63 | ≥ 4.5 ✅               |
| text-secondary / bg      |   6.38 |  7.52 | ≥ 4.5 ✅               |
| text-secondary / surface |   5.95 |  6.91 | ≥ 4.5 ✅               |
| text-tertiary / bg       |   5.00 |  5.51 | ≥ 4.5 ✅               |
| accent / bg              |   5.67 |  7.78 | ≥ 4.5 ✅               |
| accent / surface         |   5.29 |  7.15 | ≥ 4.5 ✅               |
| on-accent / accent       |   6.02 |  7.82 | ≥ 4.5 ✅               |
| accent / accent-subtle   |   5.11 |  6.22 | ≥ 4.5 ✅               |
| danger / bg              |   6.16 |  8.57 | ≥ 4.5 ✅               |
| border-strong / bg       |   3.24 |  3.62 | ≥ 3.0 (komponen UI) ✅ |

Aturan:

- `divider` hanya untuk garis dekoratif. Batas input dan kontrol memakai `border-strong`.
- Jangan menyampaikan informasi hanya lewat warna (selalu tambah ikon/teks).
- Tema "warm" **belum** didefinisikan. Rancang setelah uji pembaca, lalu verifikasi kontrasnya.

## 2. Tipografi

### 2.1 Keluarga font

| Token              | Nilai (kandidat, diputuskan lewat uji)                              |
| ------------------ | ------------------------------------------------------------------- |
| `font.arabic`      | `"Amiri Quran", "Scheherazade New", "Noto Naskh Arabic", serif`     |
| `font.translation` | `"Literata", "Source Serif 4", Georgia, serif`                      |
| `font.ui`          | `"Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif` |

Catatan:

- Periksa **lisensi** setiap font sebelum dibundel (Amiri/Scheherazade/Noto/Inter/Literata umumnya berlisensi terbuka, tetapi verifikasi di sumber resminya).
- Font Arab final ditentukan di `DESIGN-TEST-PLAN.md` (bagian A). Font yang menampilkan harakat bertumpuk salah atau kotak kosong (tofu) **gugur**.
- Muat dengan `font-display: swap` dan sediakan _fallback_ yang sesuai agar teks tetap terbaca saat font belum siap.

### 2.2 Skala teks Arab (px pada desain; implementasi memakai rem)

| Token               | Ukuran | Tinggi baris | Catatan |
| ------------------- | -----: | -----------: | ------- |
| `arabic.s`          |     24 |          2.0 |         |
| `arabic.m` (bawaan) |     28 |          2.0 |         |
| `arabic.l`          |     32 |          2.0 |         |
| `arabic.xl`         |     40 |          2.0 |         |
| `arabic.xxl`        |     48 |          2.0 |         |

- Tinggi baris 2.0 adalah titik awal. Sebagian font butuh 2.2 agar harakat tidak terpotong, sesuaikan setelah uji.
- Bobot: 400. **Jangan** bold atau italic sintetis pada teks Arab. **Jangan** `letter-spacing`.

### 2.3 Skala terjemahan

| Token                    | Ukuran | Tinggi baris |
| ------------------------ | -----: | -----------: |
| `translation.s`          |     14 |          1.6 |
| `translation.m` (bawaan) |     16 |          1.6 |
| `translation.l`          |     18 |          1.6 |
| `translation.xl`         |     20 |          1.6 |

### 2.4 Skala UI

| Token        | Ukuran / tinggi baris | Bobot |
| ------------ | --------------------- | ----: |
| `ui.caption` | 12 / 16               |   400 |
| `ui.body-s`  | 14 / 20               |   400 |
| `ui.body`    | 16 / 24               |   400 |
| `ui.label`   | 14 / 20               |   600 |
| `ui.title-s` | 18 / 26               |   600 |
| `ui.title`   | 22 / 30               |   600 |
| `ui.display` | 28 / 36               |   600 |

## 3. Jarak (grid 4 pt)

| Token     |  px |
| --------- | --: |
| `space.1` |   4 |
| `space.2` |   8 |
| `space.3` |  12 |
| `space.4` |  16 |
| `space.5` |  24 |
| `space.6` |  32 |
| `space.7` |  48 |
| `space.8` |  64 |

## 4. Radius

| Token         |  px |
| ------------- | --: |
| `radius.sm`   |   6 |
| `radius.md`   |  10 |
| `radius.lg`   |  16 |
| `radius.full` | 999 |

## 5. Elevasi

| Token                         | Terang                        | Gelap                                |
| ----------------------------- | ----------------------------- | ------------------------------------ |
| `elevation.0`                 | tanpa bayangan                | tanpa bayangan                       |
| `elevation.1`                 | `0 1px 2px rgba(0,0,0,0.06)`  | gunakan `surface-raised` + `divider` |
| `elevation.2` (sheet, dialog) | `0 4px 16px rgba(0,0,0,0.10)` | `surface-raised` + `divider`         |

## 6. Tata letak dan _breakpoint_

| Token   | Lebar | Catatan                            |
| ------- | ----: | ---------------------------------- |
| `bp.xs` |   320 | Minimum yang didukung (uji reflow) |
| `bp.sm` |   390 | **Ukuran desain mobile**           |
| `bp.md` |   768 | Tablet                             |
| `bp.lg` |  1024 | Desktop kecil                      |
| `bp.xl` |  1440 | **Ukuran desain desktop**          |

| Token                     |   Nilai |
| ------------------------- | ------: |
| `layout.gutter-mobile`    |      16 |
| `layout.gutter-desktop`   |      24 |
| `layout.reader-max-width` |     680 |
| `layout.touch-target-min` | 44 × 44 |

## 7. Gerak

| Token           | Nilai                        |
| --------------- | ---------------------------- |
| `motion.fast`   | 120 ms                       |
| `motion.base`   | 200 ms                       |
| `motion.slow`   | 300 ms                       |
| `motion.easing` | `cubic-bezier(0.2, 0, 0, 1)` |

Dengan `prefers-reduced-motion: reduce`: matikan transisi gerak (geser, skala). Boleh hanya transisi opasitas yang sangat singkat.

## 8. Fokus dan interaksi

| Token            | Nilai                                       |
| ---------------- | ------------------------------------------- |
| `focus.ring`     | outline 2 px `color.accent`, offset 2 px    |
| `state.pressed`  | overlay 8% `color.text-primary`             |
| `state.hover`    | overlay 4% (hanya perangkat dengan pointer) |
| `state.disabled` | opasitas 40% + tidak dapat difokus          |

## 9. Format JSON (untuk impor ke variables)

```json
{
  "color": {
    "bg": { "light": "#FAF8F3", "dark": "#121413" },
    "surface": { "light": "#F3F0E8", "dark": "#1A1D1B" },
    "surface-raised": { "light": "#FFFFFF", "dark": "#222623" },
    "divider": { "light": "#E2DDD0", "dark": "#2E3330" },
    "border-strong": { "light": "#8F8A7E", "dark": "#6B6F6A" },
    "text-primary": { "light": "#1C1B19", "dark": "#E8E6E1" },
    "text-secondary": { "light": "#5E5B54", "dark": "#A8A59E" },
    "text-tertiary": { "light": "#6F6B62", "dark": "#8F8C84" },
    "accent": { "light": "#1F6F5C", "dark": "#5FB89E" },
    "on-accent": { "light": "#FFFFFF", "dark": "#0B1512" },
    "accent-subtle": { "light": "#E3EFEA", "dark": "#1B2B26" },
    "danger": { "light": "#B3261E", "dark": "#F2998F" }
  },
  "space": {
    "1": 4,
    "2": 8,
    "3": 12,
    "4": 16,
    "5": 24,
    "6": 32,
    "7": 48,
    "8": 64
  },
  "radius": { "sm": 6, "md": 10, "lg": 16, "full": 999 },
  "arabic-size": { "s": 24, "m": 28, "l": 32, "xl": 40, "xxl": 48 },
  "translation-size": { "s": 14, "m": 16, "l": 18, "xl": 20 },
  "breakpoint": { "xs": 320, "sm": 390, "md": 768, "lg": 1024, "xl": 1440 }
}
```

## 10. Struktur _variables_ di FigCraft

| Koleksi  | Mode          | Isi                        |
| -------- | ------------- | -------------------------- |
| `Color`  | Terang, Gelap | Semua token warna §1       |
| `Type`   | —             | Ukuran dan tinggi baris §2 |
| `Space`  | —             | §3                         |
| `Radius` | —             | §4                         |

Gunakan _auto layout_ dan komponen yang mengacu ke variables, bukan nilai mentah, supaya ganti tema cukup mengganti mode.
