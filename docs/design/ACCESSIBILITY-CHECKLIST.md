# Accessibility Checklist

## Quran PWA

**Versi:** 1.0
**Tanggal:** 2026-11-12
**Target:** WCAG 2.2 tingkat AA
**Acuan:** PRD.md (bagian 8), DESIGN-TOKENS.md, SCREEN-SPECS.md

Gunakan checklist ini di tiga titik: saat **mendesain** (di FigCraft), saat **implementasi**, dan sebelum **rilis**. Centang hanya setelah diperiksa, bukan diasumsikan.

---

## 1. Dapat dipersepsi

### Kontras dan warna

- [ ] Teks biasa memiliki kontras ≥ 4.5:1 di tema Terang **dan** Gelap (nilai terverifikasi ada di `DESIGN-TOKENS.md` §1.2).
- [ ] Batas input dan kontrol memiliki kontras ≥ 3:1 (`color.border-strong`).
- [ ] Informasi tidak disampaikan hanya lewat warna (penanda aktif, ayat terakhir dibaca, error memakai ikon/teks juga).
- [ ] Setiap kombinasi warna baru dihitung ulang kontrasnya.
- [ ] Warna pemutar (bar + icon) memiliki kontras ≥ 3:1 terhadap latar, dan teks/ikon terbaca pada kedua tema.

### Teks dan tata letak

- [ ] Teks dapat diperbesar sampai **200%** tanpa kehilangan konten atau fungsi.
- [ ] Layout tetap utuh pada lebar **320 px** tanpa gulir horizontal (reflow).
- [ ] Ukuran font memakai satuan relatif (rem) sehingga mengikuti pengaturan pengguna.
- [ ] Tinggi baris Arab cukup agar harakat tidak terpotong, termasuk pada ukuran terbesar.
- [ ] Jarak antar teks dapat disesuaikan tanpa merusak layout.
- [ ] Teks Arab memakai font yang menampilkan semua harakat dan tanda dengan benar (lihat `DESIGN-TEST-PLAN.md` bagian A).

### Non-teks

- [ ] Ikon fungsional memiliki label teks aksesibel.
- [ ] Ikon dekoratif disembunyikan dari pembaca layar.

## 2. Dapat dioperasikan

### Media (audio)

- [ ] Semua kontrol pemutar dijalankan dengan keyboard dan layar sentuh (putar/jeda/lewati/mundur/stop, ulangan, kecepatan, tutup, dan per-ayat di Reader).
- [ ] Label aksesibel lengkap (role="region" aria-label "Pemutar audio", tombol dengan aria-label).
- [ ] Target sentuh pemutar ≥ 44×44 px, bisa difokus dengan outline jelas.
- [ ] Pembesaran 200% tidak menutupi ayat yang sedang diputar.
- [ ] Status putar/jeda diumumkan lewat Media Session dan (di Reader) status dalam nomor ayat.

### Keyboard dan fokus

- [ ] Semua fungsi dapat dijalankan dengan keyboard.
- [ ] Urutan fokus logis (sesuai urutan baca visual) dan tidak ada jebakan fokus.
- [ ] Fokus terlihat jelas (`focus.ring`: outline 2 px, offset 2 px, kontras ≥ 3:1).
- [ ] Sheet dan dialog: fokus pindah masuk saat dibuka, kembali ke pemicu saat ditutup, `Esc` menutup.
- [ ] Ada cara melewati navigasi langsung ke konten (_skip link_) di versi desktop.

### Sentuhan dan gestur

- [ ] Target sentuh ≥ **44×44 px** (minimum WCAG 2.2 AA adalah 24×24 px; kita memakai lebih besar untuk kenyamanan).
- [ ] Tidak ada fungsi yang hanya bisa dilakukan lewat gestur kompleks (geser, tahan lama) tanpa alternatif.
- [ ] Tidak ada fungsi yang hanya muncul saat _hover_.
- [ ] Aksi destruktif memiliki konfirmasi atau **Urungkan**.

### Gerak

- [ ] Menghormati `prefers-reduced-motion`.
- [ ] Tidak ada animasi berkedip atau bergerak otomatis yang mengganggu.
- [ ] Pesan sementara (snackbar) bertahan cukup lama untuk dibaca atau dapat dijeda.

## 3. Dapat dipahami

- [ ] Atribut bahasa benar: `lang="id"` pada UI, `lang="ar"` dan `dir="rtl"` pada teks Arab.
- [ ] Navigasi konsisten di semua layar.
- [ ] Label dan istilah konsisten (lihat `CONTENT-RULES.md`).
- [ ] Pesan error menjelaskan masalah dan cara memperbaikinya.
- [ ] Input (mis. nomor ayat) memiliki label dan petunjuk rentang yang jelas.
- [ ] Perubahan konteks (mis. pindah surah) tidak terjadi tanpa tindakan pengguna.

## 4. Kokoh (pembaca layar dan teknologi bantu)

- [ ] Struktur semantik: landmark (`header`, `nav`, `main`), heading berjenjang, daftar sebagai `ul/ol`.
- [ ] Setiap ayat dapat dinavigasi: urutan baca = nomor ayat → Arab → terjemahan → aksi.
- [ ] Tombol penanda mengumumkan statusnya (mis. `aria-pressed` atau label "Hapus penanda").
- [ ] Perubahan status (penanda ditambah/dihapus, offline/online, impor selesai) diumumkan lewat _live region_.
- [ ] Sheet dan dialog memakai peran yang benar dan memiliki nama aksesibel.
- [ ] Kontrol ukuran teks memberi tahu nilainya (mis. "Ukuran Arab: 3 dari 5").
- [ ] Tombol putar pada setiap ayat memiliki label yang jelas (`Putar audio ayat N`); pemutar muncul sebagai `region` saat ada track aktif.
- [ ] Pilihan Qari di Pengaturan memakai pilihan radio yang jelas: nama, nama Arab, ragam, dan bentuk; pilihan aktif ditandai ikon cek dan status terisi.
- [ ] Diuji dengan pembaca layar nyata: **TalkBack** (Android) dan **VoiceOver** (iOS), serta satu pembaca layar desktop.
- [ ] Diperiksa bahwa pembaca layar tidak salah membaca teks Arab (ketersediaan suara Arab bergantung perangkat; catat batasannya).

## 5. Khusus teks Arab dan RTL

- [ ] Arah RTL benar pada Arab; campuran Arab–Latin (referensi, nomor) tidak tertukar (bidi).
- [ ] Penyambungan huruf utuh (tanpa `letter-spacing`, tanpa bold/italic sintetis).
- [ ] Teks dapat dipilih dan disalin dengan hasil identik dengan sumber.
- [ ] Pembungkusan baris tidak memecah ayat secara keliru.
- [ ] Pembesaran teks tidak memotong harakat atau menumpuk baris.

## 6. Khusus PWA

- [ ] Layout menghormati _safe area_ pada mode standalone.
- [ ] Orientasi potret dan lanskap sama-sama dapat dipakai.
- [ ] Status offline dan penyiapan data dikomunikasikan lewat teks (bukan hanya ikon).
- [ ] Ajakan instal dapat ditutup dengan keyboard dan pembaca layar.
- [ ] Pembaruan aplikasi tidak memaksa muat ulang yang menghilangkan posisi baca.

## 7. Serah terima desain (di FigCraft)

- [ ] Anotasi urutan fokus pada tiap layar.
- [ ] Anotasi label aksesibel untuk setiap ikon/kontrol.
- [ ] Anotasi level heading.
- [ ] Layar digambar pada skala teks 100% dan 200%, tema Terang dan Gelap.
- [ ] State fokus, error, dan kosong tersedia untuk setiap komponen.

## 8. Pengujian sebelum rilis

| Pengujian                                        | Alat/cara                    | Status |
| ------------------------------------------------ | ---------------------------- | ------ |
| Otomatis (kontras, label, struktur)              | Lighthouse, axe DevTools     | ☐      |
| Keyboard saja                                    | Manual di desktop            | ☐      |
| Pembaca layar mobile                             | TalkBack, VoiceOver          | ☐      |
| Pembesaran teks 200%                             | Pengaturan OS + zoom browser | ☐      |
| Lebar 320 px                                     | DevTools + perangkat kecil   | ☐      |
| Reduced motion                                   | Pengaturan OS                | ☐      |
| Uji dengan pengguna yang memakai teknologi bantu | Bila memungkinkan            | ☐      |

Cacat aksesibilitas yang menghalangi membaca atau menemukan ayat berstatus **kritis** dan harus selesai sebelum rilis.
