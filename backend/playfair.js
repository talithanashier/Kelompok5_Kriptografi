let plaintext = "HELLOWORLD";

//buat matrix 5x5
function createMatrix(key) {
    let cleanKey = key.toUpperCase().replace(/\s+/g, '').replace(/J/g, 'I');
    const alphabet = "ABCDEFGHIKLMNOPQRSTUVWXYZ"; 
    
    let combined = cleanKey + alphabet;
    let uniqueChars = [...new Set(combined)]; //hapus duplikat
    
    let matrix = [];
    for (let i = 0; i < 25; i += 5) {
        matrix.push(uniqueChars.slice(i, i + 5));
    }
    return matrix;
}

//cari posisi huruf di matrix
function findCoordinates(matrix, char) {
    for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 5; col++) {
            if (matrix[row][col] === char) {
                return { row, col };
            }
        }
    }
    return null;
}

//proses plaintext, tambahkan x di antara huruf yg sama dan akhir jika total ganjil
function prepareText(plaintext) {
    //buat jadi uppercase dan hilangkan spasi
    let cleanText = plaintext.toUpperCase().replace(/\s+/g, '').replace(/J/g, 'I');
    let processedText = "";

    for (let i = 0; i < cleanText.length; i += 2) {
        let first = cleanText[i];
        let second = cleanText[i + 1];

        if (second === undefined) {
            processedText += first + "X";
        } 
        else if (first === second) {
            processedText += first + "X";
            i--; 
        } 
        else {
            processedText += first + second;
        }
    }
    return processedText;
}

function cleanDecrypted(text) {
    let cleaned = "";
    for (let i = 0; i < text.length; i++) {
        // hapus x diantara huruf yg sama 
        if (text[i] === "X" && i > 0 && i < text.length - 1 && text[i - 1] === text[i + 1]) {
            continue;
        }
        cleaned += text[i];
    }

    // hapus x terakhir
    if (cleaned.endsWith("X")) {
        cleaned = cleaned.slice(0, -1);
    }
    return cleaned;
}

function encryptPlayfair(plaintext, key) {
    let ciphertext = "";
    
    let processedText = prepareText(plaintext);
    const matrix = createMatrix(key); 

    for (let i = 0; i < processedText.length; i += 2) {
        let h1 = processedText[i];
        let h2 = processedText[i + 1];

        let pos1 = findCoordinates(matrix, h1);
        let pos2 = findCoordinates(matrix, h2);

        let k1_row, k1_col, k2_row, k2_col;

        // baris sama, geser 1 ke kanan
        if (pos1.row === pos2.row) {
            k1_row = pos1.row;
            k2_row = pos2.row;
            k1_col = (pos1.col + 1) % 5;
            k2_col = (pos2.col + 1) % 5;
        }
        // kolom sama, geser 1 ke bawah
        else if (pos1.col === pos2.col) {
            k1_col = pos1.col;
            k2_col = pos2.col;
            k1_row = (pos1.row + 1) % 5;
            k2_row = (pos2.row + 1) % 5;
        }
        // tukar kolom
        else {
            k1_row = pos1.row;
            k1_col = pos2.col;
            k2_row = pos2.row;
            k2_col = pos1.col;
        }

        ciphertext += matrix[k1_row][k1_col] + matrix[k2_row][k2_col];
    }

    console.log(`PlainText : ${plaintext}`);
    console.log(`PlainText Setelah Diproses: ${processedText}`);
    console.log(`CipherText : ${ciphertext}`);
    return ciphertext;
}

//dekripsi
function decryptPlayfair(ciphertext, key) {
    let decryptedText = "";
    const matrix = createMatrix(key); 
    
    let cleanCipher = ciphertext.toUpperCase().replace(/\s+/g, '');

    for (let i = 0; i < cleanCipher.length; i += 2) {
        let h1 = cleanCipher[i];
        let h2 = cleanCipher[i + 1];

        let pos1 = findCoordinates(matrix, h1);
        let pos2 = findCoordinates(matrix, h2);

        let p1_row, p1_col, p2_row, p2_col;

        // baris sama, geser 1 ke kiri
        if (pos1.row === pos2.row) {
            p1_row = pos1.row;
            p2_row = pos2.row;
            p1_col = (pos1.col + 4) % 5;
            p2_col = (pos2.col + 4) % 5;
        }
        //kolom sama, geser 1 ke atas
        else if (pos1.col === pos2.col) {
            p1_col = pos1.col;
            p2_col = pos2.col;
            p1_row = (pos1.row + 4) % 5;
            p2_row = (pos2.row + 4) % 5;
        }
        // tukar kolom
        else {
            p1_row = pos1.row;
            p1_col = pos2.col;
            p2_row = pos2.row;
            p2_col = pos1.col;
        }

        decryptedText += matrix[p1_row][p1_col] + matrix[p2_row][p2_col];
    }

    let plaintext = cleanDecrypted(decryptedText)

    console.log(`CipherText : ${cleanCipher}`);
    console.log(`Hasil Dekripsi : ${decryptedText}`);
    console.log(`PlainText : ${plaintext}`);
    
    return plaintext;
}

//tes
console.log("--- ENKRIPSI ---");
let encryptedResult = encryptPlayfair(plaintext, "Prabowo Sawitanto");

console.log("\n--- DEKRIPSI ---");
decryptPlayfair(encryptedResult, "Prabowo Sawitanto");
