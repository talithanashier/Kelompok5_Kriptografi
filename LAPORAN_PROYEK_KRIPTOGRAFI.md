# IMPLEMENTASI ALGORITMA KRIPTOGRAFI KLASIK BERBASIS WEBSITE

**Disusun oleh (Kelompok 5):**
- Salma Faizatul Jannah (H1D024066)
- Talitha Maharani Nashier (H1D024098)
- Ade Yahya Hendriawan (H1D025090)
- Alldo Firmansyah Putra (H1D025095)
- Muhammad Rifqi Agus Setianto (H1D025113)

**UNIVERSITAS JENDERAL SOEDIRMAN**  
**FAKULTAS TEKNIK**  
**JURUSAN INFORMATIKA**  
**2026**

---

## 1. Deskripsi Singkat Program

### Tujuan Aplikasi
Aplikasi ini bertujuan untuk:
1. Mengimplementasikan algoritma kriptografi klasik dalam aplikasi berbasis web interaktif.
2. Menerapkan proses enkripsi dan dekripsi teks menggunakan tiga algoritma yang dipilih.
3. Menyediakan antarmuka grafis (GUI) yang memungkinkan pengguna melakukan proses kriptografi secara mudah dan interaktif.
4. Menguji keberhasilan proses dekripsi melalui fitur validasi otomatis (*roundtrip test*) untuk memastikan teks dapat dikembalikan sesuai dengan plainteks awal secara sempurna.

### Teknologi yang Digunakan
Aplikasi dikembangkan menggunakan teknologi web standar tanpa *library* kriptografi pihak ketiga:
- **HTML**: Membangun struktur dan elemen antarmuka aplikasi.
- **CSS**: Mengatur tampilan, tata letak responsif, dan estetika visualisasi aplikasi.
- **JavaScript**: Mengimplementasikan logika algoritma enkripsi dan dekripsi serta mengatur interaktivitas pada aplikasi secara *real-time*.

### Algoritma yang Digunakan
Aplikasi mengimplementasikan 3 (tiga) algoritma kriptografi klasik:
1. **Playfair Cipher**: Algoritma substitusi poligram yang memproses teks dalam pasangan dua karakter (*digraph*) menggunakan matriks $5 \times 5$.
2. **Rail Fence Cipher (Zig-Zag)**: Algoritma transposisi yang menyusun karakter dalam pola lintasan rel zig-zag berdasarkan jumlah *rail* yang ditentukan.
3. **Columnar Transposition**: Algoritma transposisi yang menyusun teks ke dalam bentuk tabel baris-kolom dan membaca karakter secara vertikal berdasarkan kunci jumlah kolom.

### Fitur Utama
Aplikasi menyediakan beberapa fitur utama untuk mendukung proses enkripsi dan dekripsi:
- **Input Teks & Unggah Berkas**: Pengguna dapat memasukkan plainteks untuk enkripsi atau cipherteks untuk dekripsi, baik mengetik manual maupun mengunggah berkas `.txt`.
- **Pemilihan Algoritma**: Pengguna dapat memilih salah satu algoritma: Playfair Cipher, Rail Fence Cipher, atau Columnar Transposition (serta Super Enkripsi).
- **Input Kunci (Key)**: Pengguna memasukkan kunci sesuai dengan kebutuhan masing-masing algoritma (kata kunci teks untuk Playfair, angka untuk Rail Fence dan Columnar).
- **Enkripsi**: Mengubah plainteks menjadi cipherteks menggunakan algoritma dan *key* yang dipilih.
- **Dekripsi**: Mengembalikan cipherteks menjadi plainteks menggunakan algoritma dan *key* yang sesuai.
- **Visualisasi Algoritma**: Menampilkan struktur kerja algoritma (matriks $5 \times 5$, rel zig-zag, atau tabel baris-kolom) untuk membantu pengguna memahami alur transposisi/substitusi.
- **Validasi Hasil (Uji Bolak-Balik)**: Membandingkan hasil dekripsi dengan plainteks awal untuk membuktikan bahwa proses enkripsi dan dekripsi berjalan dengan benar (100% Identik / VALID).
- **Alat Bantu**: Fitur tombol **Salin** (*clipboard*) dan **Simpan .txt** untuk mengunduh hasil keluaran.

---

## 2. Algoritma yang Digunakan

### A. Playfair Cipher
* **Deskripsi**:
  Playfair Cipher merupakan algoritma kriptografi klasik yang termasuk dalam kategori substitusi poligram. Berbeda dengan substitusi biasa yang memproses satu karakter, Playfair memproses plainteks dalam pasangan dua karakter (*digraph*) menggunakan matriks berukuran $5 \times 5$.
* **Cara Kerja**:
  1. Membentuk matriks $5 \times 5$ berdasarkan kata kunci (*key*), kemudian menghapus karakter duplikat.
  2. Menggabungkan sisa alfabet ke dalam matriks secara berurutan, dengan huruf $I$ dan $J$ dianggap sebagai satu sel/karakter yang sama.
  3. Plainteks dibagi menjadi pasangan dua karakter (*digraph*). Jika terdapat karakter yang sama dalam satu pasangan atau jumlah karakter ganjil di akhir teks, disisipkan karakter *padding* $X$.
  4. Setiap pasangan karakter dienkripsi berdasarkan posisinya dalam matriks:
     - **Baris yang sama** $\rightarrow$ geser satu kolom ke kanan (siklis).
     - **Kolom yang sama** $\rightarrow$ geser satu baris ke bawah (siklis).
     - **Baris dan kolom berbeda** $\rightarrow$ membentuk persegi panjang dan mengambil karakter pada sudut kolom yang berlawanan.
  5. Pada proses **dekripsi**, digunakan aturan pergeseran kebalikan (geser ke kiri untuk baris yang sama, dan geser ke atas untuk kolom yang sama).
  6. Hasil pasangan karakter digabungkan menjadi cipherteks.

### B. Rail Fence Cipher (Zig-Zag)
* **Deskripsi**:
  Rail Fence Cipher merupakan algoritma kriptografi klasik yang termasuk dalam kategori transposisi. Algoritma ini tidak mengubah karakter plainteks, melainkan mengubah posisi urutan karakter dengan menyusunnya dalam pola lintasan rel zig-zag (turun-naik) berdasarkan jumlah *rail* yang ditentukan oleh kunci. Sesuai kaidah kriptografi klasik pada materi perkuliahan, teks diproses murni tanpa spasi (spasi diabaikan).
* **Cara Kerja**:
  1. Pengguna menentukan jumlah *rail* sebagai *key* (bilangan bulat positif).
  2. Karakter plainteks (tanpa spasi) ditulis secara zig-zag dari rel paling atas ke rel paling bawah, kemudian memantul kembali ke atas secara periodik.
  3. Pada proses **enkripsi**, setelah seluruh karakter ditempatkan, teks dibaca baris demi baris dari rel pertama hingga terakhir untuk menghasilkan cipherteks.
  4. Pada proses **dekripsi**, panjang potongan cipherteks untuk setiap rel dihitung terlebih dahulu, kemudian karakter dialokasikan kembali ke dalam pola rel zig-zag untuk dibaca mengikuti urutan aslinya dari kiri ke kanan.

### C. Columnar Transposition (Transposisi Kolom)
* **Deskripsi**:
  Columnar Transposition merupakan algoritma kriptografi klasik yang termasuk dalam kategori transposisi. Algoritma ini tidak mengubah karakter plainteks, melainkan mengubah posisi karakter dengan menyusunnya ke dalam tabel berdasarkan kunci jumlah kolom yang digunakan. Sesuai kaidah kriptografi klasik pada materi perkuliahan, teks diproses murni tanpa spasi.
* **Cara Kerja**:
  1. Pengguna menentukan *key* berupa bilangan bulat yang digunakan sebagai dasar jumlah kolom.
  2. Plainteks (tanpa spasi) ditulis ke dalam tabel secara baris demi baris selebar kunci kolom.
  3. Pada proses **enkripsi**, setelah seluruh karakter ditempatkan, teks dibaca secara vertikal berdasarkan kolom demi kolom dari atas ke bawah untuk menghasilkan cipherteks.
  4. Pada proses **dekripsi**, panjang cipherteks dibagi dengan jumlah kunci kolom ($N / k$) untuk mengetahui kedalaman tiap kolom. Karakter cipherteks disusun kembali ke dalam tabel dan dibaca untuk merekonstruksi plainteks semula.

---

## 3. Alur Program

Alur kerja program aplikasi secara umum adalah sebagai berikut:
1. Pengguna memasukkan teks asli (*plainteks*) atau teks sandi (*cipherteks*) ke dalam kolom input di halaman web (atau menggunakan fitur unggah berkas `.txt`).
2. Pengguna memilih algoritma yang ingin dijalankan (Playfair Cipher, Rail Fence Cipher, atau Columnar Transposition).
3. Pengguna memasukkan kunci (*key*) yang akan digunakan sesuai format algoritma.
4. Pengguna memilih operasi yang diinginkan, yaitu tombol **Enkripsi Teks** atau **Dekripsi Teks**.
5. Sistem menjalankan logika algoritma berbasis JavaScript di latar belakang dan menampilkan cipherteks atau plainteks secara instan di area output.
6. Pengguna dapat melihat **Visualisasi Algoritma** interaktif (mode Enkripsi maupun Dekripsi) untuk memahami alur pemetaan karakter.
7. Pengguna dapat melakukan uji validitas menggunakan tombol **Uji Bolak-Balik**.
8. Sistem memvalidasi apakah proses dekripsi mengembalikan cipherteks ke teks aslinya dengan tepat (100% Identik / VALID).

---

## 4. Pengujian dan Hasil

Tahapan pengujian pada antarmuka web untuk masing-masing algoritma meliputi:

### A. Playfair Cipher
1. **Pilih Algoritma**: Memilih *Playfair Cipher*.
2. **Masukkan Plaintext**: Menginput teks asli pada kotak input.
3. **Masukkan Key**: Memasukkan kata kunci berupa teks string.
4. **Visualisasi & Hasil**: Sistem menampilkan visualisasi matriks $5 \times 5$ dan menghasilkan keluaran cipherteks di kotak output.

### B. Rail Fence Cipher (Zig-Zag)
1. **Pilih Algoritma**: Memilih *Rail Fence Cipher*.
2. **Masukkan Plaintext**: Menginput teks asli pada kotak input.
3. **Masukkan Key**: Memasukkan bilangan bulat positif penentu jumlah rel.
4. **Visualisasi & Hasil**: Sistem menampilkan representasi rel zig-zag (`R1`, `R2`, ...) dan menyajikan cipherteks hasil pembacaan baris demi baris.

### C. Columnar Transposition
1. **Pilih Algoritma**: Memilih *Columnar Transposition*.
2. **Masukkan Plaintext**: Menginput teks asli pada kotak input.
3. **Masukkan Key**: Memasukkan bilangan bulat positif penentu jumlah kolom matriks.
4. **Visualisasi & Hasil**: Sistem menampilkan visualisasi penulisan baris dan menghasilkan cipherteks hasil pembacaan per kolom.

---

## 5. Perbandingan Algoritma

Ketiga algoritma memiliki karakteristik dan cara kerja yang berbeda. Perbandingan ketiganya dapat dilihat pada tabel berikut:

| Aspek | Playfair Cipher | Rail Fence Cipher | Columnar Transposition |
| :--- | :--- | :--- | :--- |
| **Kategori** | Substitusi Poligram | Transposisi | Transposisi |
| **Prinsip Utama** | Mengganti pasangan karakter berdasarkan posisi pada matriks $5 \times 5$ | Mengubah posisi karakter dengan pola lintasan rel zig-zag | Mengubah posisi karakter berdasarkan pembacaan per kolom |
| **Unit Pemrosesan** | 2 karakter (*digraph*) | 1 karakter (*monograf*) | 1 karakter (*monograf*) |
| **Struktur** | Matriks bujur sangkar $5 \times 5$ | Pola lintasan rel zig-zag | Tabel baris dan kolom |
| **Format Kunci (*Key*)** | Kata kunci berupa teks (*string*) | Jumlah rel (*integer*) | Jumlah kolom (*integer*) |
| **Karakter Berubah?** | **Ya**, karakter disubstitusi menjadi karakter lain | **Tidak**, karakter hanya berpindah posisi | **Tidak**, karakter hanya berpindah posisi |
| **Tingkat Kerumitan** | Relatif Kompleks | Sederhana | Sedang |
| **Visualisasi Web** | Kisi matriks $5 \times 5$ | Diagram baris rel bertingkat | Tabel sel transposisi kolom |
| **Hasil Dekripsi** | Menggunakan aturan geser berlawanan & normalisasi | Mengembalikan posisi karakter dari pola zig-zag | Memulihkan susunan karakter dari kolom ke baris |

---

## 6. Kesimpulan

Berdasarkan perancangan dan implementasi proyek ini, dapat disimpulkan bahwa:
1. Ketiga algoritma klasik (**Playfair Cipher**, **Rail Fence Cipher**, dan **Columnar Transposition**) telah berhasil diimplementasikan secara mandiri menggunakan bahasa JavaScript tanpa bantuan pustaka (*library*) kriptografi eksternal.
2. Penggabungan logika algoritma dengan antarmuka grafis web (HTML, CSS, JS) memberikan kemudahan bagi pengguna dalam melakukan proses enkripsi dan dekripsi secara interaktif, visual, dan seketika (*real-time*).
3. Hasil pengujian validitas (*roundtrip testing*) membuktikan bahwa sistem mampu memulihkan cipherteks menjadi plainteks dengan sempurna, menandakan integritas logika algoritma berjalan 100% benar (*lossless*).

---

## 7. Pembagian Tugas Kelompok

Pembagian tugas dilakukan secara merata untuk memastikan seluruh elemen proyek (kode algoritma, antarmuka, pengujian, dan dokumentasi laporan) dapat diselesaikan dengan optimal:

| Nama Anggota | NIM | Deskripsi Tugas / Peran |
| :--- | :---: | :--- |
| **Salma Faizatul Jannah** | H1D024066 | Merancang antarmuka (UI/UX) dan mengimplementasikan integrasi algoritma ke antarmuka web. |
| **Talitha Maharani Nashier** | H1D024098 | Merancang antarmuka (UI/UX) dan mengimplementasikan integrasi algoritma ke antarmuka web. |
| **Ade Yahya Hendriawan** | H1D025090 | Merancang algoritma Columnar Transposition dan melakukan pengujian (*testing*) fungsionalitas website. |
| **Alldo Firmansyah Putra** | H1D025095 | Merancang algoritma Rail Fence Cipher dan melakukan pengujian (*testing*) fungsionalitas website. |
| **Muhammad Rifqi Agus Setianto** | H1D025113 | Merancang algoritma Playfair Cipher dan melakukan pengujian (*testing*) fungsionalitas website. |
| **Seluruh Anggota** | - | Merancang dan menyusun Laporan Proyek serta bahan presentasi (PPT). |

---

## 8. Link Akses Proyek

* **Link Website (Hosting)**: [https://kriptografi.salstudioz.web.id/](https://kriptografi.salstudioz.web.id/)
* **Link GitHub**: [https://github.com/talithanashier/Kelompok5_Kriptografi](https://github.com/talithanashier/Kelompok5_Kriptografi)