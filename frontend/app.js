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

// Klik Kartu Showcase
document.querySelectorAll('.show-card').forEach((card) => {
  card.addEventListener('click', () => {
    document.querySelectorAll('.show-card').forEach(c => c.classList.remove('active'));
    card.classList.add('active');
    switchAlgorithm(card.dataset.algo);
  });
});

$('btnSuper').addEventListener('click', () => {
  document.querySelectorAll('.show-card').forEach(c => c.classList.remove('active'));
  switchAlgorithm('super');
});

function switchAlgorithm(algo) {
  activeAlgo = algo;
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

  renderInteractiveVisualization();
  $('workspaceArea').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Render Visualisasi Interaktif
function renderInteractiveVisualization() {
  const text = $('inputText').value || '';
  const container = $('vizContent');
  if (!text) return container.innerHTML = '<span class="text-muted">Ketik teks di atas untuk melihat visualisasi.</span>';

  if (activeAlgo === 'rail' || activeAlgo === 'super') {
    const key = Math.max(1, parseInt($('keyRail').value, 10) || 1);
    const chars = Array.from(text);
    const pattern = createRailFencePattern(chars.length, key);
    let html = '';
    for (let r = 0; r < key; r++) {
      html += `<div class="rail-row"><span class="rail-label">R${r + 1}</span>` +
        chars.map((c, i) => pattern[i] === r 
          ? `<span class="rail-cell filled" title="Karakter '${c}' di Rel ${r + 1}">${c === ' ' ? '·' : c}</span>`
          : `<span class="rail-cell empty"></span>`
        ).join('') + '</div>';
    }
    container.innerHTML = html;
  } else if (activeAlgo === 'columnar') {
    const key = Math.max(1, parseInt($('keyCol').value, 10) || 1);
    const chars = Array.from(text);
    let html = '<div style="display:flex; flex-direction:column; gap:6px;">';
    for (let i = 0; i < chars.length; i += key) {
      html += '<div style="display:flex; gap:6px;">';
      for (let c = 0; c < key; c++) {
        const ch = chars[i + c];
        html += `<span class="rail-cell ${ch !== undefined ? 'filled' : 'empty'}" style="${ch !== undefined ? 'background:var(--pastel-cyan); color:var(--border-color);' : ''}">${ch === ' ' ? '·' : (ch || '')}</span>`;
      }
      html += '</div>';
    }
    container.innerHTML = html + '</div>';
  } else if (activeAlgo === 'playfair') {
    const matrix = createMatrix($('keyPf').value || 'KRIPTOGRAFI');
    container.innerHTML = `<div style="display:inline-grid; grid-template-columns:repeat(5, 38px); gap:6px;">` +
      matrix.flat().map(c => `<span class="rail-cell filled" style="background:var(--pastel-purple); color:var(--border-color);">${c}</span>`).join('') +
      `</div>`;
  }
}

// Enkripsi
$('btnEncrypt').addEventListener('click', () => {
  const text = $('inputText').value;
  if (!text) return alert('Input teks masih kosong!');
  const kR = parseInt($('keyRail').value, 10) || 1;
  const kC = parseInt($('keyCol').value, 10) || 1;
  const kP = $('keyPf').value.trim() || 'K';

  let res = text;
  try {
    if (activeAlgo === 'rail') res = encryptRailFence(res, kR);
    else if (activeAlgo === 'columnar') res = encryptColumnarTransposition(res, kC);
    else if (activeAlgo === 'playfair') res = encryptPlayfair(res, kP);
    else if (activeAlgo === 'super') res = encryptRailFence(encryptColumnarTransposition(encryptPlayfair(res, kP), kC), kR);

    animateText($('outputText'), res, () => $('valBox').style.display = 'none');
  } catch (e) { alert('Error: ' + e.message); }
});

let isQuickTesting = false;

// Fungsi Dekripsi Fleksibel (Bisa dari Input Atas maupun Kotak Output)
function performDecryption() {
  const inputVal = $('inputText').value.trim();
  const outputVal = $('outputText').value.trim();

  let cipher = '';
  // Jika dalam mode uji bolak-balik, prioritaskan output
  if (isQuickTesting) {
    cipher = outputVal;
  } else if (inputVal) {
    cipher = $('inputText').value;
  } else if (outputVal) {
    cipher = $('outputText').value;
  } else {
    return alert('Silakan masukkan cipherteks pada kotak Input atau Output!');
  }

  const kR = parseInt($('keyRail').value, 10) || 1;
  const kC = parseInt($('keyCol').value, 10) || 1;
  const kP = $('keyPf').value.trim() || 'K';

  let res = cipher;
  try {
    if (activeAlgo === 'rail') res = decryptRailFence(res, kR);
    else if (activeAlgo === 'columnar') res = decryptColumnarTransposition(res, kC);
    else if (activeAlgo === 'playfair') res = decryptPlayfair(res, kP);
    else if (activeAlgo === 'super') res = decryptPlayfair(decryptColumnarTransposition(decryptRailFence(res, kR), kC), kP);

    animateText($('outputText'), res, () => {
      if (isQuickTesting) {
        let target = $('inputText').value;
        if (activeAlgo === 'playfair' || activeAlgo === 'super') target = target.toUpperCase().replace(/\s+/g, '').replace(/J/g, 'I');
        const isMatch = res === target || res === $('inputText').value;
        $('valBox').style.display = 'flex';
        $('valBox').className = `val-box ${isMatch ? 'val-ok' : 'val-fail'}`;
        $('valIcon').innerHTML = isMatch 
          ? `<svg class="ui-icon val-svg" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`
          : `<svg class="ui-icon val-svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
        $('valTitle').textContent = isMatch ? 'Hasil Dekripsi VALID & 100% Identik' : 'Hasil Berbeda';
        $('valDesc').textContent = isMatch ? 'Seluruh pesan awal berhasil dipulihkan secara sempurna.' : 'Terdapat perbedaan karakter.';
        isQuickTesting = false;
      } else {
        $('valBox').style.display = 'flex';
        $('valBox').className = 'val-box val-ok';
        $('valIcon').innerHTML = `<svg class="ui-icon val-svg" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
        $('valTitle').textContent = 'Dekripsi Selesai';
        $('valDesc').textContent = 'Pesan telah berhasil didekripsi menjadi plainteks di kotak output.';
      }
    });
  } catch (e) { alert('Error: ' + e.message); }
}

// Event Listener Tombol Dekripsi (Atas & Bawah)
$('btnDecrypt').addEventListener('click', performDecryption);
if ($('btnDecryptTop')) $('btnDecryptTop').addEventListener('click', performDecryption);

// Uji Bolak-Balik
$('btnQuickTest').addEventListener('click', () => {
  const text = $('inputText').value;
  if (!text) return alert('Input teks masih kosong!');
  isQuickTesting = true;
  $('btnEncrypt').click();
  setTimeout(() => performDecryption(), 450);
});

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
