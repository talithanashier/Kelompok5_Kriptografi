function createRailFencePattern(length, key) {
  // Dengan 1 rel, semua karakter berada di rel yang sama.
  if (key === 1) return new Array(length).fill(0);

  // Satu putaran zig-zag memiliki panjang 2*(key-1).
  // Contoh key 3: rel 0, 1, 2, 1, lalu pola diulang.
  const period = 2 * (key - 1);
  const pattern = [];

  for (let i = 0; i < length; i++) {
    // Posisi karakter di dalam putaran saat ini.
    const pos = i % period;

    // Saat turun, nomor rel bertambah. Saat naik, nomor rel bergerak kembali.
    pattern.push(pos < key ? pos : period - pos);
  }
  return pattern;
}

function encryptRailFence(text, key) {
  validateRailFenceInput(text, key);

  // Array.from membaca teks per karakter, termasuk karakter Unicode.
  const chars = Array.from(text);
  const pattern = createRailFencePattern(chars.length, key);

  // Satu array penampung untuk setiap rel.
  const rails = Array.from({ length: key }, () => []);

  // Masukkan tiap karakter ke rel sesuai pola zig-zag.
  chars.forEach((char, i) => rails[pattern[i]].push(char));

  // Ciphertext adalah isi rel pertama, lalu rel kedua, sampai rel terakhir.
  return rails.map(rail => rail.join('')).join('');
}

function decryptRailFence(ciphertext, key) {
  validateRailFenceInput(ciphertext, key);

  const chars = Array.from(ciphertext);
  const pattern = createRailFencePattern(chars.length, key);

  // Langkah 1: hitung jumlah karakter yang harus berada pada setiap rel.
  const counts = new Array(key).fill(0);
  pattern.forEach(rail => counts[rail]++);

  // Langkah 2: potong ciphertext menjadi bagian untuk tiap rel.
  // Bagian pertama milik rel pertama, lalu bagian berikutnya milik rel selanjutnya.
  const rails = [];
  let cursor = 0;
  for (let rail = 0; rail < key; rail++) {
    rails.push(chars.slice(cursor, cursor + counts[rail]));
    cursor += counts[rail];
  }

  // Langkah 3: ikuti pola zig-zag untuk mengambil karakter dari rel yang benar.
  // next menyimpan posisi karakter berikutnya yang belum diambil dari tiap rel.
  const next = new Array(key).fill(0);
  return pattern.map(rail => rails[rail][next[rail]++]).join('');
}

function validateRailFenceInput(text, key) {
  // Pastikan input teks dan key sesuai sebelum algoritma dijalankan.
  if (typeof text !== 'string') {
    throw new TypeError('Teks harus berupa string.');
  }
  if (!Number.isInteger(key) || key < 1) {
    throw new TypeError('Key harus berupa bilangan bulat positif.');
  }
}
