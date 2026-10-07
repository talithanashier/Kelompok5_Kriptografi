// =========================================================
// KriptoLab Studio — Logika Ringkas & Efisien
// =========================================================

const $ = (id) => document.getElementById(id);
let activeAlgo = 'playfair';

// Efek Animasi Decoder Teks
function animateText(targetEl, text, callback) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*';
  let iter = 0;
  const timer = setInterval(() => {
    targetEl.value = text.split('').map((l, i) => i < iter ? l : chars[Math.floor(Math.random() * chars.length)]).join('');
    iter += Math.ceil(text.length / 8);
    if (iter >= text.length) {
      clearInterval(timer);
      targetEl.value = text;
      if (callback) callback();
    }
  }, 22);
}

// Inisialisasi 3 Kartu Showcase di Bagian Atas
function initShowcasePreviews() {
  // 1. Playfair
  const matrix = createMatrix('KRIPTOGRAFI');
  $('pfPreviewGrid').innerHTML = matrix.flat().map(c => `<div class="pf-mini-cell">${c}</div>`).join('');
  const digraphs = ['HI', 'DE', 'TH', 'EG', 'OL', 'DI', 'NT', 'HE', 'TR', 'EX', 'ES', 'TU', 'MP'];
  $('pfPreviewDigraphs').innerHTML = digraphs.map(d => `<span class="pf-chip">${d}</span>`).join('');

  // 2. Columnar
  const colText = 'EPEHPLDABCERURLHKIQIHQBZSK';
  $('colPreviewGrid').innerHTML = Array.from(colText).slice(0, 24).map(c => `<div class="col-mini-cell">${c}</div>`).join('');

  // 3. Rail Fence
  const railText = 'EPBUKHSPLCRIQ';
  const pat = createRailFencePattern(railText.length, 3);
  let rHtml = '';
  for (let r = 0; r < 3; r++) {
    rHtml += '<div class="rm-row">' + Array.from(railText).map((c, i) => 
      pat[i] === r ? `<span class="rm-cell active">${c}</span>` : `<span class="rm-cell dot">·</span>`
    ).join('') + '</div>';
  }
  $('railPreviewGrid').innerHTML = rHtml;
}

// Inisialisasi Tab Cepat & Kartu Showcase
function syncActiveAlgoUI(algo) {
  document.querySelectorAll('.tab-pill').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === algo);
  });
  document.querySelectorAll('.show-card').forEach(card => {
    card.classList.toggle('active', card.dataset.algo === algo);
  });
}

// Klik Tab Cepat di Atas Input
document.querySelectorAll('.tab-pill').forEach((btn) => {
  btn.addEventListener('click', () => {
    switchAlgorithm(btn.dataset.tab);
  });
});

// Klik Kartu Showcase di Bawah
document.querySelectorAll('.show-card').forEach((card) => {
  card.addEventListener('click', () => {
    switchAlgorithm(card.dataset.algo);
  });
});

if ($('btnSuper')) {
  $('btnSuper').addEventListener('click', () => {
    switchAlgorithm('super');
  });
}

function switchAlgorithm(algo) {
  activeAlgo = algo;
  syncActiveAlgoUI(algo);

  const cfg = {
    rail: { badge: '03 RAIL FENCE', title: 'Rail Fence Cipher Workspace', desc: 'Pratinjau input pada pola zig-zag rel kereta.' },
    columnar: { badge: '02 COLUMNAR', title: 'Columnar Transposition Workspace', desc: 'Pratinjau penulisan baris dan pembacaan per kolom.' },
    playfair: { badge: '01 PLAYFAIR', title: 'Playfair Cipher Workspace', desc: 'Pratinjau matriks 5×5 dan enkripsi pasangan huruf.' },
    super: { badge: 'SUPER ENKRIPSI', title: 'Super Enkripsi Workspace (3 Algoritma)', desc: 'Kombinasi 3 lapis: Playfair → Columnar → Rail Fence.' }
  }[algo];

  $('wsBadge').textContent = cfg.badge;
  $('wsTitle').textContent = cfg.title;
  $('vizDesc').textContent = cfg.desc;

  $('grpRail').style.display = (algo === 'rail' || algo === 'super') ? 'flex' : 'none';
  $('grpCol').style.display = (algo === 'columnar' || algo === 'super') ? 'flex' : 'none';
  $('grpPf').style.display = (algo === 'playfair' || algo === 'super') ? 'flex' : 'none';

  // Reset status card
  $('valBox').className = 'val-box val-idle';
  $('valIcon').innerHTML = `<svg class="ui-icon val-svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
  $('valTitle').textContent = 'Siap Memproses';
  $('valDesc').textContent = 'Pilih Enkripsi, Dekripsi, atau Uji Bolak-Balik di atas.';

  renderInteractiveVisualization();
}

// Mode Visualisasi Interaktif ('encrypt' atau 'decrypt')
let vizMode = 'encrypt';

function setVizMode(mode) {
  vizMode = mode;
  if ($('btnVizEnc')) $('btnVizEnc').classList.toggle('active', mode === 'encrypt');
  if ($('btnVizDec')) $('btnVizDec').classList.toggle('active', mode === 'decrypt');
  renderInteractiveVisualization();
}

if ($('btnVizEnc')) $('btnVizEnc').addEventListener('click', () => setVizMode('encrypt'));
if ($('btnVizDec')) $('btnVizDec').addEventListener('click', () => setVizMode('decrypt'));

// Render Visualisasi Interaktif
function renderInteractiveVisualization() {
  const container = $('vizContent');
  if (!container) return;

  const inText = $('inputText').value || '';
  const outText = $('outputText').value || '';

  // Tentukan teks sumber sesuai mode aktif
  let sourceText = inText;
  let isAutoDerived = false;

  if (vizMode === 'decrypt') {
    if (outText.trim() && (outText.trim() === lastEncryptedCipher || !inText.trim())) {
      sourceText = outText.trim();
    } else if (inText.trim()) {
      if (lastEncryptedCipher && inText.trim() === lastOriginalPlain) {
        sourceText = lastEncryptedCipher;
        isAutoDerived = true;
      } else {
        sourceText = inText.trim();
      }
    } else if (outText.trim()) {
      sourceText = outText.trim();
    }
  }

  if (!sourceText) {
    return container.innerHTML = '<span class="text-muted">Ketik teks di atas untuk melihat visualisasi.</span>';
  }

  if (activeAlgo === 'rail' || activeAlgo === 'super') {
    renderRailVisualization(container, sourceText, vizMode);
  } else if (activeAlgo === 'columnar') {
    renderColumnarVisualization(container, sourceText, vizMode, isAutoDerived);
  } else if (activeAlgo === 'playfair') {
    renderPlayfairVisualization(container, sourceText, vizMode);
  }
}

// 1. Visualisasi Columnar Transposition (Sesuai Materi Kuliah Slide 31 & 32)
function renderColumnarVisualization(container, text, mode) {
  const key = Math.max(1, parseInt($('keyCol').value, 10) || 1);
  // Sesuai materi kuliah Slide 31: teks diproses tanpa spasi
  const cleanText = (text || '').replace(/\s+/g, '');
  const chars = Array.from(cleanText);
  const N = chars.length;
  if (!N) return container.innerHTML = '<span class="text-muted">Ketik teks di atas untuk melihat visualisasi.</span>';

  let html = '<div style="display:flex; flex-direction:column; gap:6px;">';

  if (mode === 'encrypt') {
    // Sesuai Slide 31: Teks disusun mendatar per baris selebar kunci k
    for (let i = 0; i < chars.length; i += key) {
      html += '<div style="display:flex; gap:6px;">';
      for (let c = 0; c < key; c++) {
        const ch = chars[i + c];
        const isFilled = ch !== undefined;
        html += `<span class="rail-cell ${isFilled ? 'filled' : 'empty'}">${ch || ''}</span>`;
      }
      html += '</div>';
    }
    html += '</div>';
  } else {
    // Sesuai Slide 32: Bagi panjang cipherteks dengan kunci
    // Teks cipherteks disusun ke baris selebar hasil bagi (panjang kolom enkripsi)
    const quotient = Math.floor(N / key);
    const remainder = N % key;
    const colLengths = [];
    for (let c = 0; c < key; c++) {
      colLengths.push(quotient + (c < remainder ? 1 : 0));
    }
    const maxCols = Math.max(...colLengths);

    // Potong cipherteks dan susun per baris (Slide 32)
    let cur = 0;
    for (let r = 0; r < key; r++) {
      const rowLen = colLengths[r];
      const rowChars = chars.slice(cur, cur + rowLen);
      cur += rowLen;

      html += '<div style="display:flex; gap:6px;">';
      for (let c = 0; c < maxCols; c++) {
        const ch = rowChars[c];
        const isFilled = ch !== undefined;
        html += `<span class="rail-cell ${isFilled ? 'filled' : 'empty'}">${ch || ''}</span>`;
      }
      html += '</div>';
    }
    html += '</div>';
  }

  container.innerHTML = html;
}

// 2. Visualisasi Rail Fence Cipher
function renderRailVisualization(container, text, mode) {
  const key = Math.max(1, parseInt($('keyRail').value, 10) || 1);
  const chars = Array.from(text);
  const pattern = createRailFencePattern(chars.length, key);
  let html = '<div style="display:flex; flex-direction:column; gap:6px;">';
  
  for (let r = 0; r < key; r++) {
    html += `<div class="rail-row"><span class="rail-label">R${r + 1}</span>` +
      chars.map((c, i) => pattern[i] === r 
        ? `<span class="rail-cell filled" title="${c === ' ' ? 'Spasi' : c}">${c === ' ' ? '␣' : c}</span>`
        : `<span class="rail-cell empty"></span>`
      ).join('') + '</div>';
  }
  html += '</div>';

  container.innerHTML = html;
}

// 3. Visualisasi Playfair Cipher
function renderPlayfairVisualization(container, text, mode) {
  const matrix = createMatrix($('keyPf').value || 'KRIPTOGRAFI');
  let html = `<div style="display:inline-grid; grid-template-columns:repeat(5, 38px); gap:6px;">` +
    matrix.flat().map(c => `<span class="rail-cell filled" style="background:var(--pastel-purple); color:var(--border-color);">${c}</span>`).join('') +
    `</div>`;
  container.innerHTML = html;
}

let lastEncryptedCipher = '';
let lastOriginalPlain = '';

// Scroll Otomatis ke Bagian Output & Hasil Checking
function scrollToOutput() {
  const target = document.querySelector('.bottom-split-section') || $('outputText');
  if (target) {
    target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

// Enkripsi
$('btnEncrypt').addEventListener('click', () => {
  const text = $('inputText').value;
  if (!text.trim()) return alert('Input teks masih kosong!');
  const kR = parseInt($('keyRail').value, 10) || 1;
  const kC = parseInt($('keyCol').value, 10) || 1;
  const kP = $('keyPf').value.trim() || 'K';

  setVizMode('encrypt');

  let res = text;
  try {
    if (activeAlgo === 'rail') res = encryptRailFence(res, kR);
    else if (activeAlgo === 'columnar') res = encryptColumnarTransposition(res.replace(/\s+/g, ''), kC);
    else if (activeAlgo === 'playfair') res = encryptPlayfair(res, kP);
    else if (activeAlgo === 'super') res = encryptRailFence(encryptColumnarTransposition(encryptPlayfair(res, kP), kC), kR);

    lastOriginalPlain = text;
    lastEncryptedCipher = res;

    scrollToOutput();

    animateText($('outputText'), res, () => {
      $('valBox').className = 'val-box val-ok';
      $('valIcon').innerHTML = `<svg class="ui-icon val-svg" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
      $('valTitle').textContent = 'Enkripsi Selesai';
      $('valDesc').textContent = 'Teks berhasil dienkripsi menjadi cipherteks di kotak output.';
      scrollToOutput();
    });
  } catch (e) { alert('Error Enkripsi: ' + e.message); }
});

let isQuickTesting = false;

// Fungsi Dekripsi Fleksibel & Akurat
function performDecryption() {
  const inputVal = $('inputText').value.trim();
  const outputVal = $('outputText').value.trim();

  // Tentukan sumber teks cipher yang akan didekripsi:
  let cipher = '';
  if (isQuickTesting) {
    cipher = outputVal;
  } else if (outputVal && (outputVal === lastEncryptedCipher || !inputVal)) {
    // Jika ada hasil enkripsi di output, dekripsi teks di output
    cipher = outputVal;
  } else if (inputVal) {
    // Pengguna memasukkan cipherteks di input
    cipher = $('inputText').value;
  } else if (outputVal) {
    cipher = $('outputText').value;
  } else {
    return alert('Silakan masukkan cipherteks pada kotak Input atau Output terlebih dahulu!');
  }

  const kR = parseInt($('keyRail').value, 10) || 1;
  const kC = parseInt($('keyCol').value, 10) || 1;
  const kP = $('keyPf').value.trim() || 'K';

  setVizMode('decrypt');

  let res = cipher;
  try {
    if (activeAlgo === 'rail') {
      res = decryptRailFence(res, kR);
    } else if (activeAlgo === 'columnar') {
      res = decryptColumnarTransposition(res.replace(/\s+/g, ''), kC);
    } else if (activeAlgo === 'playfair') {
      let clean = res.toUpperCase().replace(/\s+/g, '').replace(/J/g, 'I');
      if (clean.length % 2 !== 0) clean += 'X';
      res = decryptPlayfair(clean, kP);
    } else if (activeAlgo === 'super') {
      let step1 = decryptRailFence(res, kR);
      let step2 = decryptColumnarTransposition(step1, kC);
      let clean = step2.toUpperCase().replace(/\s+/g, '').replace(/J/g, 'I');
      if (clean.length % 2 !== 0) clean += 'X';
      res = decryptPlayfair(clean, kP);
    }

    scrollToOutput();

    animateText($('outputText'), res, () => {
      // Verifikasi kecocokan teks
      let refText = isQuickTesting ? $('inputText').value : (lastOriginalPlain || $('inputText').value);
      if (activeAlgo === 'playfair' || activeAlgo === 'super') {
        refText = refText.toUpperCase().replace(/\s+/g, '').replace(/J/g, 'I');
      } else if (activeAlgo === 'columnar') {
        refText = refText.replace(/\s+/g, '');
      }
      const isMatch = (res === refText || res === $('inputText').value || res.replace(/\s+/g, '') === refText.replace(/\s+/g, '')) && refText.length > 0;

      if (isQuickTesting || (outputVal === lastEncryptedCipher && lastOriginalPlain)) {
        $('valBox').className = `val-box ${isMatch ? 'val-ok' : 'val-fail'}`;
        $('valIcon').innerHTML = isMatch 
          ? `<svg class="ui-icon val-svg" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`
          : `<svg class="ui-icon val-svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
        $('valTitle').textContent = isMatch ? 'Hasil Dekripsi 100% Identik' : 'Dekripsi Berbeda';
        $('valDesc').textContent = isMatch 
          ? 'Pesan berhasil didekripsi sempurna sesuai dengan plainteks awal.' 
          : 'Hasil dekripsi memiliki perbedaan karakter dengan plainteks.';
        isQuickTesting = false;
      } else {
        $('valBox').className = 'val-box val-ok';
        $('valIcon').innerHTML = `<svg class="ui-icon val-svg" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
        $('valTitle').textContent = 'Dekripsi Selesai';
        $('valDesc').textContent = 'Cipherteks berhasil dipulihkan menjadi plainteks di kotak output.';
      }
      scrollToOutput();
    });
  } catch (e) { alert('Error Dekripsi: ' + e.message); }
}

// Tombol Dekripsi
$('btnDecrypt').addEventListener('click', performDecryption);

// Uji Bolak-Balik
$('btnQuickTest').addEventListener('click', () => {
  const text = $('inputText').value;
  if (!text.trim()) return alert('Input teks masih kosong!');
  isQuickTesting = true;
  $('btnEncrypt').click();
  setTimeout(() => performDecryption(), 500);
});

// Tombol Tukar / Ambil Teks dari Output ke Input
if ($('btnSwapInput')) {
  $('btnSwapInput').addEventListener('click', () => {
    const out = $('outputText').value;
    if (!out.trim()) return alert('Kotak output masih kosong!');
    $('inputText').value = out;
    $('outputText').value = '';
    renderInteractiveVisualization();
  });
}

// File I/O
$('fileInput').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const r = new FileReader();
  r.onload = (ev) => { $('inputText').value = ev.target.result; renderInteractiveVisualization(); };
  r.readAsText(file);
});

$('btnSave').addEventListener('click', () => {
  if (!$('outputText').value) return alert('Output masih kosong!');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([$('outputText').value], { type: 'text/plain;charset=utf-8' }));
  a.download = 'output.txt';
  a.click();
});

$('btnCopy').addEventListener('click', () => {
  if (!$('outputText').value) return;
  navigator.clipboard.writeText($('outputText').value);
  alert('Output berhasil disalin!');
});

$('btnSample').addEventListener('click', () => {
  const list = ['selamat pagi', 'kriptografi klasik modern', 'pesan rahasia'];
  $('inputText').value = list[Math.floor(Math.random() * list.length)];
  renderInteractiveVisualization();
});

// Listener Input
['inputText', 'keyRail', 'keyCol', 'keyPf'].forEach(id => $(id).addEventListener('input', renderInteractiveVisualization));

// Start
initShowcasePreviews();
switchAlgorithm('playfair');
