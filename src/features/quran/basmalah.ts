export interface BasmalahSplit {
  /** Empat kata pertama ayat 1, persis seperti pada data sumber. */
  basmalah: string;
  /** Sisa teks ayat 1 setelah basmalah, persis seperti pada data sumber. */
  rest: string;
}

/**
 * Tanzil menyalin basmalah di awal teks ayat 1 pada surah 2–114, kecuali
 * surah 9. Basmalah bukan bagian ayat itu, jadi Reader menampilkannya sebagai
 * baris tersendiri di header.
 *
 * Fungsi ini hanya membagi untuk tampilan: `basmalah` dan `rest` adalah
 * potongan dari `text` yang sama. Tidak ada karakter yang ditambah, diubah,
 * atau diketik ulang, dan data tersimpan tidak pernah dipotong.
 *
 * Surah 1 tidak dipisah karena basmalah adalah ayat 1 itu sendiri.
 */
export function splitBasmalah(surah: number, ayah: number, text: string): BasmalahSplit | null {
  if (ayah !== 1 || surah === 1 || surah === 9) return null;

  // Basmalah selalu empat kata. Cari batas setelah spasi keempat tanpa
  // menormalkan atau menyalin ulang teksnya.
  let cut = -1;
  for (let index = 0; index < 4; index += 1) {
    cut = text.indexOf(" ", cut + 1);
    if (cut === -1) return null;
  }

  if (cut + 1 >= text.length) return null;

  return { basmalah: text.slice(0, cut), rest: text.slice(cut + 1) };
}
