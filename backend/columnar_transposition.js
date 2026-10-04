/* Mengenkripsi teks dengan menulis per baris dan membaca per kolom. */
function encryptColumnarTransposition(text, key) {
  validateColumnarInput(text, key);

  // Array.from menjaga karakter Unicode tetap utuh, termasuk emoji.
  const characters = Array.from(text);
  let ciphertext = '';

  // Contoh teks ABCDEFGHIJ dengan key 5 ditulis dalam dua baris:
  // A B C D E
  // F G H I J
  // Baca A,F lalu B,G dan seterusnya untuk membentuk ciphertext.
  for (let column = 0; column < key; column++) {
    // Index dimulai dari kolom saat ini. Penambahan key pindah ke baris berikutnya.
    for (let index = column; index < characters.length; index += key) {
      ciphertext += characters[index];
    }
  }

  return ciphertext;
}

/** Membalik susunan kolom dan mengembalikan teks ke urutan per baris. */
function decryptColumnarTransposition(ciphertext, key) {
  validateColumnarInput(ciphertext, key);

  const characters = Array.from(ciphertext);
  // Hasil bagi menentukan panjang dasar kolom; sisa menentukan kolom ekstra.
  const quotient = Math.floor(characters.length / key);
  const remainder = characters.length % key;
  const rowCount = quotient + (remainder > 0 ? 1 : 0);

  // Buat matriks kosong. Baris terakhir mungkin hanya memiliki beberapa sel.
  const matrix = Array.from({ length: rowCount }, () => new Array(key));
  let cursor = 0;

  // Saat enkripsi, ciphertext dibaca per kolom dari kiri ke kanan.
  // Saat dekripsi, potong ciphertext sesuai panjang setiap kolom lalu susun kembali.
  for (let column = 0; column < key; column++) {
    // Contoh 18 karakter dengan key 5: quotient 3, remainder 3.
    // Kolom 1-3 memiliki 4 karakter; kolom 4-5 memiliki 3 karakter.
    const columnLength = quotient + (column < remainder ? 1 : 0);

    // Isi satu kolom dari atas ke bawah sebelum berpindah ke kolom berikutnya.
    for (let row = 0; row < columnLength; row++) {
      matrix[row][column] = characters[cursor];
      cursor++;
    }
  }

  // Baca kembali matriks dari kiri ke kanan per baris.
  // Sel yang kosong di ujung baris terakhir dilewati karena tidak memakai padding.
  return matrix.flat().filter(character => character !== undefined).join('');
}

/** Menolak teks non-string dan key yang bukan bilangan bulat positif. */
function validateColumnarInput(text, key) {
  if (typeof text !== 'string') {
    throw new TypeError('Teks harus berupa string.');
  }
  if (!Number.isInteger(key) || key < 1) {
    throw new TypeError('Key harus berupa bilangan bulat positif.');
  }
}
