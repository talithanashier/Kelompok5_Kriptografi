function createRailFencePattern(length, key) {
  // Dengan 1 rel tidak ada zig-zag. Rumus periode di bawah jadi 0 (modulo nol),
  // jadi kasus ini ditangani terpisah.
  if (key === 1) return new Array(length).fill(0);

  // Satu siklus zig-zag penuh (turun lalu naik) memakan 2*(key-1) karakter.
  // Rel paling atas dan paling bawah tidak dihitung dua kali.
  const period = 2 * (key - 1);
  const pattern = [];

  for (let i = 0; i < length; i++) {
    // Posisi karakter di dalam siklus saat ini (0 .. period-1)
    const pos = i % period;

    // pos < key : fase turun, nomor rel sama dengan pos.
    // pos >= key: fase naik, nomor rel dicerminkan (period - pos).
    // Contoh key=3, period=4: pos 0,1,2,3 -> rel 0,1,2,1
    pattern.push(pos < key ? pos : period - pos);
  }
  return pattern;
}

function encryptRailFence(text, key) {
  validateRailFenceInput(text, key);

  // Sesuai kaidah kriptografi klasik: spasi diabaikan/dihapus otomatis
  const cleanText = text.replace(/\s+/g, '');
  // Array.from memecah per karakter unicode (jika pakai .split('') bisa merusak emoji)
  const chars = Array.from(cleanText);
  if (chars.length === 0) return '';
  const pattern = createRailFencePattern(chars.length, key);

  // Satu array penampung per rel
  const rails = Array.from({ length: key }, () => []);

  // Masukkan setiap karakter ke rel miliknya, urutan asli tetap terjaga per rel
  chars.forEach((char, i) => rails[pattern[i]].push(char));

  // Ciphertext = isi rel pertama, lalu rel kedua, ... sampai rel terakhir
  return rails.map(rail => rail.join('')).join('');
}

function decryptRailFence(ciphertext, key) {
  validateRailFenceInput(ciphertext, key);

  // Sesuai kaidah kriptografi klasik: spasi diabaikan/dihapus otomatis
  const cleanCipher = ciphertext.replace(/\s+/g, '');
  const chars = Array.from(cleanCipher);
  if (chars.length === 0) return '';
  const pattern = createRailFencePattern(chars.length, key);

  // Langkah 1: hitung berapa karakter yang jatuh di tiap rel.
  // Ini menentukan panjang potongan ciphertext untuk tiap rel.
  const counts = new Array(key).fill(0);
  pattern.forEach(rail => counts[rail]++);

  // Langkah 2: potong ciphertext berurutan. Potongan pertama milik rel pertama,
  // berikutnya rel kedua, dst, dengan panjang sesuai counts.
  const rails = [];
  let cursor = 0;
  for (let rail = 0; rail < key; rail++) {
    rails.push(chars.slice(cursor, cursor + counts[rail]));
    cursor += counts[rail];
  }

  // Langkah 3: telusuri pola zig-zag dari kiri ke kanan. Di setiap posisi,
  // ambil karakter berikutnya dari rel yang bersangkutan.
  // next[rail] menyimpan indeks karakter yang belum terpakai di rel tersebut.
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
