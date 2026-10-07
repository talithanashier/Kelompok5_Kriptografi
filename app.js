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

  if (activeAlgo === 'rail') {
    renderRailVisualization(container, sourceText, vizMode);
  } else if (activeAlgo === 'super') {
    renderSuperVisualization(container, sourceText, vizMode);
  } else if (activeAlgo === 'columnar') {
    renderColumnarVisualization(container, sourceText, vizMode, isAutoDerived);
  } else if (activeAlgo === 'playfair') {
    renderPlayfairVisualization(container, sourceText, vizMode);
  }
}

// State tab aktif di visualisasi Super Enkripsi ('all', '1', '2', '3')
let superActiveTab = 'all';

// Visualisasi Lengkap 3 Lapis Super Enkripsi (Pipeline Interaktif)
function renderSuperVisualization(container, text, mode) {
  const kP = $('keyPf').value.trim() || 'KRIPTOGRAFI';
  const kC = Math.max(1, parseInt($('keyCol').value, 10) || 1);
  const kR = Math.max(1, parseInt($('keyRail').value, 10) || 1);

  if (!text) {
    container.innerHTML = '<span class="text-muted">Ketik teks di atas untuk melihat visualisasi Super Enkripsi.</span>';
    return;
  }

  let s1_name = '', s2_name = '', s3_name = '';
  let s1_algo = '', s2_algo = '', s3_algo = '';
  let s1_keyText = '', s2_keyText = '', s3_keyText = '';
  let s1_in = text, s1_out = '', s2_in = '', s2_out = '', s3_in = '', s3_out = '';
  let s1_keyVal, s2_keyVal, s3_keyVal;

  try {
    if (mode === 'encrypt') {
      // ENKRIPSI: Playfair (Lapis 1) -> Columnar (Lapis 2) -> Rail Fence (Lapis 3)
      s1_name = 'Playfair Cipher (Substitusi Matriks 5×5)';
      s1_algo = 'playfair';
      s1_keyVal = kP;
      s1_keyText = `Key: "${kP}"`;
      s1_in = text;
      s1_out = encryptPlayfair(s1_in, kP);

      s2_name = 'Columnar Transposition (Transposisi Kolom)';
      s2_algo = 'columnar';
      s2_keyVal = kC;
      s2_keyText = `Key: ${kC} kolom`;
      s2_in = s1_out;
      s2_out = encryptColumnarTransposition(s2_in.replace(/\s+/g, ''), kC);

      s3_name = 'Rail Fence Cipher (Transposisi Rel Zig-Zag)';
      s3_algo = 'rail';
      s3_keyVal = kR;
      s3_keyText = `Key: ${kR} rel`;
      s3_in = s2_out;
      s3_out = encryptRailFence(s3_in, kR);
    } else {
      // DEKRIPSI: Rail Fence (Lapis 1) -> Columnar (Lapis 2) -> Playfair (Lapis 3)
      s1_name = 'Rail Fence Cipher (Dekripsi Rel Zig-Zag)';
      s1_algo = 'rail';
      s1_keyVal = kR;
      s1_keyText = `Key: ${kR} rel`;
      s1_in = text;
      s1_out = decryptRailFence(s1_in, kR);

      s2_name = 'Columnar Transposition (Dekripsi Matriks Kolom)';
      s2_algo = 'columnar';
      s2_keyVal = kC;
      s2_keyText = `Key: ${kC} kolom`;
      s2_in = s1_out;
      s2_out = decryptColumnarTransposition(s2_in.replace(/\s+/g, ''), kC);

      s3_name = 'Playfair Cipher (Dekripsi Matriks 5×5)';
      s3_algo = 'playfair';
      s3_keyVal = kP;
      s3_keyText = `Key: "${kP}"`;
      s3_in = s2_out;
      let clean = s3_in.toUpperCase().replace(/\s+/g, '').replace(/J/g, 'I');
      if (clean.length % 2 !== 0) clean += 'X';
      s3_out = decryptPlayfair(clean, kP);
    }
  } catch (err) {
    console.warn('Super calculation:', err);
  }

  const layers = [
    { num: '1', name: s1_name, algo: s1_algo, in: s1_in, out: s1_out, keyText: s1_keyText, keyVal: s1_keyVal },
    { num: '2', name: s2_name, algo: s2_algo, in: s2_in, out: s2_out, keyText: s2_keyText, keyVal: s2_keyVal },
    { num: '3', name: s3_name, algo: s3_algo, in: s3_in, out: s3_out, keyText: s3_keyText, keyVal: s3_keyVal }
  ];

  const trunc = (str, len = 14) => (!str ? '' : (str.length > len ? str.slice(0, len) + '…' : str));

  let html = `
    <div class="super-viz-container">
      <!-- 1. Pipeline Flow Tracker (Diagram Alur 3 Lapis) -->
      <div class="super-flow-tracker">
        <div class="super-flow-step flow-input" data-stagetab="all" title="Klik untuk lihat semua">
          <span class="flow-pill-tag">${mode === 'encrypt' ? 'INPUT' : 'CIPHER'}</span>
          <strong class="flow-algo-name">Awal</strong>
          <span class="flow-code" title="${text}">${trunc(text, 12)}</span>
        </div>
        <span class="flow-arrow">➔</span>
        <div class="super-flow-step flow-lapis ${superActiveTab === '1' ? 'selected' : ''}" data-stagetab="1">
          <span class="flow-pill-tag tag-purple">LAPIS 1</span>
          <strong class="flow-algo-name">${mode === 'encrypt' ? 'Playfair' : 'Rail Fence'}</strong>
          <span class="flow-code" title="${s1_out}">${trunc(s1_out, 12)}</span>
        </div>
        <span class="flow-arrow">➔</span>
        <div class="super-flow-step flow-lapis ${superActiveTab === '2' ? 'selected' : ''}" data-stagetab="2">
          <span class="flow-pill-tag tag-cyan">LAPIS 2</span>
          <strong class="flow-algo-name">Columnar</strong>
          <span class="flow-code" title="${s2_out}">${trunc(s2_out, 12)}</span>
        </div>
        <span class="flow-arrow">➔</span>
        <div class="super-flow-step flow-lapis ${superActiveTab === '3' ? 'selected' : ''}" data-stagetab="3">
          <span class="flow-pill-tag tag-pink">LAPIS 3</span>
          <strong class="flow-algo-name">${mode === 'encrypt' ? 'Rail Fence' : 'Playfair'}</strong>
          <span class="flow-code" title="${s3_out}">${trunc(s3_out, 12)}</span>
        </div>
      </div>

      <!-- 2. Navigasi Pilihan Lapis -->
      <div class="super-layer-nav">
        <button type="button" class="super-nav-btn ${superActiveTab === 'all' ? 'active' : ''}" data-stagetab="all">
          <svg class="ui-icon" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
          Semua Lapis (1, 2, 3)
        </button>
        <button type="button" class="super-nav-btn ${superActiveTab === '1' ? 'active' : ''}" data-stagetab="1">
          1. ${mode === 'encrypt' ? 'Playfair' : 'Rail Fence'}
        </button>
        <button type="button" class="super-nav-btn ${superActiveTab === '2' ? 'active' : ''}" data-stagetab="2">
          2. Columnar
        </button>
        <button type="button" class="super-nav-btn ${superActiveTab === '3' ? 'active' : ''}" data-stagetab="3">
          3. ${mode === 'encrypt' ? 'Rail Fence' : 'Playfair'}
        </button>
      </div>

      <!-- 3. Wadah Kartu Lapis -->
      <div class="super-layers-deck">
  `;

  const activeLayers = superActiveTab === 'all' ? layers : layers.filter(l => l.num === superActiveTab);

  activeLayers.forEach((l, idx) => {
    html += `
      <div class="super-card-layer layer-theme-${l.algo}">
        <div class="super-card-header">
          <div class="super-card-title-group">
            <span class="super-card-num num-${l.algo}">${l.num}</span>
            <div>
              <h4>${l.name}</h4>
              <span class="super-card-key">${l.keyText}</span>
            </div>
          </div>
          <div class="super-card-io">
            <span class="io-badge">IN: <code title="${l.in}">${trunc(l.in, 16)}</code></span>
            <span class="io-arrow">➔</span>
            <span class="io-badge io-out">OUT: <code title="${l.out}">${trunc(l.out, 16)}</code></span>
          </div>
        </div>
        <div class="super-card-body" id="superContent_${l.num}"></div>
      </div>
    `;

    if (superActiveTab === 'all' && idx < activeLayers.length - 1) {
      const nextNum = parseInt(l.num) + 1;
      html += `
        <div class="super-arrow-connector">
          <svg class="ui-icon connector-icon" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>
          <span>Hasil Lapis ${l.num} ("${trunc(l.out, 14)}") diteruskan ke masukan Lapis ${nextNum}</span>
        </div>
      `;
    }
  });

  html += `
      </div>
    </div>
  `;

  container.innerHTML = html;

  // Render sub-visualisasi masing-masing lapis
  activeLayers.forEach(l => {
    const subContainer = $(`superContent_${l.num}`);
    if (subContainer) {
      if (l.algo === 'playfair') {
        renderPlayfairVisualization(subContainer, l.in, mode, l.keyVal);
      } else if (l.algo === 'columnar') {
        renderColumnarVisualization(subContainer, l.in, mode, false, l.keyVal);
      } else if (l.algo === 'rail') {
        renderRailVisualization(subContainer, l.in, mode, l.keyVal);
      }
    }
  });

  // Pasang listener pada tombol tab dan flow-tracker
  container.querySelectorAll('[data-stagetab]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      superActiveTab = btn.dataset.stagetab;
      renderSuperVisualization(container, text, mode);
    });
  });
}

// 1. Visualisasi Columnar Transposition (Sesuai Materi Kuliah Slide 31 & 32)
function renderColumnarVisualization(container, text, mode, isAutoDerived, overrideKey) {
  const key = overrideKey !== undefined ? overrideKey : Math.max(1, parseInt($('keyCol').value, 10) || 1);
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

// 2. Visualisasi Rail Fence Cipher (Enkripsi & Dekripsi Interaktif)
function renderRailVisualization(container, text, mode, overrideKey) {
  const cleanText = (text || '').replace(/\s+/g, '');
  const N = cleanText.length;
  if (!N) {
    return container.innerHTML = '<span class="text-muted">Ketik teks di atas untuk melihat visualisasi.</span>';
  }

  const key = overrideKey !== undefined ? overrideKey : Math.max(1, parseInt($('keyRail').value, 10) || 1);
  const pattern = createRailFencePattern(N, key);
  const chars = Array.from(cleanText);

  // Palet tema per rel untuk visual tracing
  const railThemes = ['#ffaec0', '#9fe2f7', '#d5c2f8', '#ffe699', '#bceecf', '#ffd4b8'];

  let html = '<div style="display:flex; flex-direction:column; gap:10px; width:100%;">';

  if (mode === 'encrypt') {
    // ==========================================
    // MODE ENKRIPSI
    // 1. Plainteks ditulis zig-zag kolom demi kolom
    // 2. Cipherteks dibaca baris per rel dari atas ke bawah
    // ==========================================
    const rails = Array.from({ length: key }, () => []);
    chars.forEach((c, i) => rails[pattern[i]].push(c));

    // Panel Ringkasan Pembacaan per Rel
    html += `
      <div class="rail-summary-card">
        <div class="rail-summary-title">
          <svg class="ui-icon" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
          <span>Enkripsi: Karakter plainteks (${N} huruf, spasi diabaikan) ditulis zig-zag lalu dibaca per baris rel</span>
        </div>
        <div class="rail-parts-container">
    `;

    for (let r = 0; r < key; r++) {
      const bg = railThemes[r % railThemes.length];
      html += `
        <div class="rail-part-badge">
          <span class="rail-part-tag" style="background:${bg};">Rel ${r + 1} (${rails[r].length} huruf)</span>
          <span class="rail-part-chars">${rails[r].join(' ') || '—'}</span>
        </div>
      `;
    }

    const cipherResult = rails.map(rl => rl.join('')).join('');
    html += `
        </div>
        <div style="font-size:12px; font-weight:700; color:var(--text-muted); margin-top:2px;">
          Cipherteks hasil pembacaan baris: <strong style="color:var(--text-main); font-family:'Fredoka','JetBrains Mono',monospace;">${cipherResult}</strong>
        </div>
      </div>
    `;

    // Grid Zig-Zag
    html += '<div style="overflow-x:auto; padding:4px 0;"><div style="display:inline-flex; flex-direction:column; gap:6px;">';
    for (let r = 0; r < key; r++) {
      const bg = railThemes[r % railThemes.length];
      html += `<div class="rail-row"><span class="rail-label" style="background:${bg};">R${r + 1}</span>`;
      for (let i = 0; i < N; i++) {
        if (pattern[i] === r) {
          html += `<span class="rail-cell filled" style="background:${bg} !important;" title="Langkah #${i + 1}: Karakter '${chars[i]}' pada Rel ${r + 1}"><small class="cell-sub-idx">${i + 1}</small>${chars[i]}</span>`;
        } else {
          html += `<span class="rail-cell empty">·</span>`;
        }
      }
      html += '</div>';
    }
    html += '</div></div>';

  } else {
    // ==========================================
    // MODE DEKRIPSI
    // 1. Hitung kuota karakter untuk tiap rel berdasarkan pola zig-zag
    // 2. Potong cipherteks berurutan sesuai kuota per rel
    // 3. Alokasikan potongan kembali ke posisi rel di grid zig-zag
    // 4. Baca lintasan zig-zag dari kiri ke kanan -> Plainteks
    // ==========================================
    const counts = new Array(key).fill(0);
    pattern.forEach(r => counts[r]++);

    // Potong cipherteks berurutan untuk tiap rel
    const railChunks = [];
    let cur = 0;
    for (let r = 0; r < key; r++) {
      railChunks.push(chars.slice(cur, cur + counts[r]));
      cur += counts[r];
    }

    // Panel Langkah 1 & 2: Pemotongan Cipherteks per Rel
    html += `
      <div class="rail-summary-card">
        <div class="rail-summary-title">
          <svg class="ui-icon" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          <span>Langkah 1 & 2: Cipherteks (${N} huruf, spasi diabaikan) dipotong sesuai kuota zig-zag tiap rel</span>
        </div>
        <div class="rail-parts-container">
    `;

    for (let r = 0; r < key; r++) {
      const bg = railThemes[r % railThemes.length];
      html += `
        <div class="rail-part-badge">
          <span class="rail-part-tag" style="background:${bg};">Potongan Rel ${r + 1} (${counts[r]} huruf)</span>
          <span class="rail-part-chars">${railChunks[r].join(' ') || '—'}</span>
        </div>
      `;
    }

    html += `
        </div>
      </div>
    `;

    // Langkah 3: Penempatan karakter kembali ke grid rel zig-zag
    const reconstructedChars = new Array(N);

    let gridRowsHtml = '';
    for (let r = 0; r < key; r++) {
      const bg = railThemes[r % railThemes.length];
      gridRowsHtml += `<div class="rail-row"><span class="rail-label" style="background:${bg};">R${r + 1}</span>`;

      let railCursor = 0;
      for (let i = 0; i < N; i++) {
        if (pattern[i] === r) {
          const ch = railChunks[r][railCursor++];
          reconstructedChars[i] = ch;
          gridRowsHtml += `<span class="rail-cell filled" style="background:${bg} !important;" title="Langkah #${i + 1}: Karakter '${ch}' dialokasikan ke Rel ${r + 1}"><small class="cell-sub-idx">${i + 1}</small>${ch}</span>`;
        } else {
          gridRowsHtml += `<span class="rail-cell empty">·</span>`;
        }
      }
      gridRowsHtml += '</div>';
    }

    html += '<div style="overflow-x:auto; padding:4px 0;"><div style="display:inline-flex; flex-direction:column; gap:6px;">' + gridRowsHtml + '</div></div>';

    // Langkah 4: Pita Rekonstruksi Plainteks
    const recoveredPlain = reconstructedChars.join('');
    html += `
      <div class="rail-recon-box">
        <span class="rail-recon-badge">Langkah 4</span>
        <span>Pembacaan zig-zag dari kiri ke kanan (1 ➔ 2 ➔ 3 ➔ ...):</span>
        <strong style="font-family:'Fredoka','JetBrains Mono',monospace; font-size:14px; color:var(--border-color); background:#ffffff; padding:2px 8px; border-radius:6px; border:1px solid var(--border-color);">${recoveredPlain}</strong>
      </div>
    `;
  }

  html += '</div>';
  container.innerHTML = html;
}

// 3. Visualisasi Playfair Cipher
function renderPlayfairVisualization(container, text, mode, overrideKey) {
  const matrix = createMatrix(overrideKey !== undefined ? overrideKey : ($('keyPf').value || 'KRIPTOGRAFI'));
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
      } else if (activeAlgo === 'columnar' || activeAlgo === 'rail') {
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
