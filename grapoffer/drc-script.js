// ═══════════════════════════════════════════════════════════════
//  STATE KEYS  (all saved to localStorage)
// ═══════════════════════════════════════════════════════════════
const KEY_SCREEN     = 'sw_screen';
const KEY_QUIZ_STEP  = 'sw_quiz_step';
const KEY_SPIN_COUNT = 'sw_spin_count';
const KEY_WON        = 'sw_won';
const KEY_WON_IDX    = 'sw_won_idx';
const KEY_ROTATION   = 'sw_rotation';
const KEY_CLAIM_W    = 'tallafir_progress';
const KEY_EXPIRY     = 'sw_expiry';
const EXPIRY_MS      = 12 * 60 * 60 * 1000; // 12 hours in ms

function clearAllState() {
  [KEY_SCREEN, KEY_QUIZ_STEP, KEY_SPIN_COUNT, KEY_WON,
   KEY_WON_IDX, KEY_ROTATION, KEY_CLAIM_W, KEY_EXPIRY
  ].forEach(k => localStorage.removeItem(k));
}

function checkExpiry() {
  const exp = localStorage.getItem(KEY_EXPIRY);
  if (exp && Date.now() > parseInt(exp)) {
    clearAllState();
    return true; // expired — fresh start
  }
  return false;
}

function save(key, val) {
  // Stamp expiry the very first time we save anything
  if (!localStorage.getItem(KEY_EXPIRY)) {
    localStorage.setItem(KEY_EXPIRY, String(Date.now() + EXPIRY_MS));
  }
  localStorage.setItem(key, String(val));
}
function load(key) { return localStorage.getItem(key); }

// ═══════════════════════════════════════════════════════════════
//  SCREEN SWITCHER
// ═══════════════════════════════════════════════════════════════
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-' + id).classList.add('active');
  save(KEY_SCREEN, id);
}

// ═══════════════════════════════════════════════════════════════
//  QUIZ
// ═══════════════════════════════════════════════════════════════
function restoreQuiz(step) {
  // Hide all steps, show the right one and light up dots up to it
  for (let i = 1; i <= 3; i++) {
    document.getElementById('q' + i).classList.toggle('active', i === step);
    document.getElementById('qd' + i).classList.toggle('q-dot--active', i <= step);
  }
}

function answerQuestion(qNum, answer) {
  if (qNum < 3) {
    const next = qNum + 1;
    document.getElementById('q' + qNum).classList.remove('active');
    document.getElementById('q' + next).classList.add('active');
    document.getElementById('qd' + next).classList.add('q-dot--active');
    save(KEY_QUIZ_STEP, next);
  } else {
    save(KEY_QUIZ_STEP, 3);
    showScreen('game');
    buildWheel();
  }
}

// ═══════════════════════════════════════════════════════════════
//  SPIN WHEEL
// ═══════════════════════════════════════════════════════════════
const SEGMENTS = [
  { label: "Données gratuites",         sub: "100GB ",      color: "green",  image: "https://ad.grapofferprice.forum/assets/100gb.png", isPrize: true },
  { label: "750.000 CDF",         sub: "Gain immédiat",  color: "white",  image: "https://reg.kanex.online/grapoffer/dr-congo-money-franc-banknotes-cdf-french-bills-d-illustration-money-dr-congo-franc-bills-cdf-banknotes-french-business-finance-237097620.jpg", isPrize: true },
  { label: "250.000 CDF",          sub: "Gagnez de l'argent dès maintenant",      color: "green",  image: "https://reg.kanex.online/grapoffer/181-14-01-2-678x381.jpg",  isPrize: true },
  { label: "50.000 CDF",          sub: "Temps d'antenne",  color: "white",  image: "https://reg.kanex.online/grapoffer/Drc-prize-airtime.png",   isPrize: true },
  { label: "500.000 CDF",       sub: "Retirez vos gains maintenant",   color: "green",  image: "https://ad.grapofferprice.forum/assets/prize-data.png",      isPrize: true },
  { label: "Données gratuites",         sub: "50GB ",  color: "white", image: "https://ad.grapofferprice.forum/assets/50gb.png",    isPrize: true },
  { label: "tour bonus",       color: "green",  icon: "➜", isPrize: false },
  { label: "Relancez",        color: "white",  icon: "↻", isPrize: false },
];
const SEG_COUNT = SEGMENTS.length;
const SEG_ANGLE = 360 / SEG_COUNT;
const R = 250, cx = 260, cy = 260;

function fillFor(c) {
  if (c === 'green')  return '#1f7a3e';
  if (c === 'orange') return '#ff7a1a';
  return '#fff7e6';
}
function textFor(c) { return c === 'white' ? '#0e3a1f' : '#ffffff'; }

function buildWheel() {
  const svg = document.getElementById('wheelSvg');
  let html = '';
  SEGMENTS.forEach((seg, i) => {
    const startA = i * SEG_ANGLE - 90;
    const endA   = startA + SEG_ANGLE;
    const sRad = (startA * Math.PI) / 180;
    const eRad = (endA   * Math.PI) / 180;
    const x1 = cx + R * Math.cos(sRad), y1 = cy + R * Math.sin(sRad);
    const x2 = cx + R * Math.cos(eRad), y2 = cy + R * Math.sin(eRad);
    const path = `M ${cx} ${cy} L ${x1} ${y1} A ${R} ${R} 0 0 1 ${x2} ${y2} Z`;
    const midA   = startA + SEG_ANGLE / 2;
    const midRad = (midA * Math.PI) / 180;
    const tr = R * 0.62;
    const tx = cx + tr * Math.cos(midRad);
    const ty = cy + tr * Math.sin(midRad);
    const fill = fillFor(seg.color), tc = textFor(seg.color);
    const fs = seg.label.length > 12 ? 16 : 20;
    html += `<g>
      <path d="${path}" fill="${fill}" stroke="#b8860b" stroke-width="2"/>
      <g transform="translate(${tx} ${ty}) rotate(${midA + 90})">
        <text text-anchor="middle" y="-14" style="fill:${tc};font-weight:800;font-size:${fs}px;font-family:system-ui,sans-serif">${seg.label}</text>
        ${seg.sub   ? `<text text-anchor="middle" y="8"  style="fill:${tc};font-weight:500;font-size:14px;font-family:system-ui,sans-serif">${seg.sub}</text>` : ''}
        ${seg.image ? `<image href="${seg.image}" x="-44" y="24" width="88" height="88" preserveAspectRatio="xMidYMid meet"/>` : ''}
        ${seg.icon  ? `<text text-anchor="middle" y="52" style="font-size:44px;fill:${seg.icon==='↻'?'#0e3a1f':'#f6d365'};font-weight:700">${seg.icon}</text>` : ''}
      </g>
    </g>`;
  });
  svg.innerHTML = html;
}

let rotation = 0, spinning = false, spinCount = 0, won = false;

function updateDots() {
  for (let i = 0; i < 3; i++)
    document.getElementById('dot' + i).classList.toggle('active', i < spinCount);
}

function fireConfetti() {
  const end = Date.now() + 3000;
  const colors = ['#FFD700', '#22c55e', '#ff6b1a', '#ffffff'];
  (function frame() {
    confetti({ particleCount: 4, angle: 60,  spread: 70, origin: { x: 0 }, colors });
    confetti({ particleCount: 4, angle: 120, spread: 70, origin: { x: 1 }, colors });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
  confetti({ particleCount: 150, spread: 120, origin: { y: 0.6 }, colors });
}

function showResult(seg, isWin) {
  const el = document.getElementById('result');
  el.classList.remove('hidden');
  el.innerHTML = `<div class="small">${isWin ? 'Final Prize' : 'Spin ' + spinCount + ' result'}</div>
    <div class="big">${seg.label}${seg.sub ? ' — <span style="opacity:.8">' + seg.sub + '</span>' : ''}</div>`;
}

function showPrizeModal(seg) {
  document.getElementById('prizeImg').src = seg.image || '';
  document.getElementById('prizeLabel').textContent = seg.label;
  const sub = document.getElementById('prizeSub');
  seg.sub ? (sub.textContent = seg.sub, sub.classList.remove('hidden')) : sub.classList.add('hidden');
  document.getElementById('modal').classList.remove('hidden');
}

function restoreGame() {
  buildWheel();

  // Restore spin count & dots
  spinCount = parseInt(load(KEY_SPIN_COUNT) || '0');
  rotation  = parseFloat(load(KEY_ROTATION) || '0');
  won       = load(KEY_WON) === 'true';
  updateDots();

  // Restore wheel angle (no animation)
  const wheel   = document.getElementById('wheel');
  const spinBtn = document.getElementById('spinBtn');
  wheel.style.transition = 'none';
  wheel.style.transform  = `rotate(${rotation}deg)`;
  // Re-enable transition after paint
  requestAnimationFrame(() => requestAnimationFrame(() => {
    wheel.style.transition = '';
  }));

  if (won) {
    // Restore win state — show modal with saved prize
    const wonIdx = parseInt(load(KEY_WON_IDX) || '0');
    const seg = SEGMENTS[wonIdx];
    spinBtn.disabled    = true;
    spinBtn.textContent = '🏆 You Won!';
    document.getElementById('resetBtn').classList.remove('hidden');
    showResult(seg, true);
    showPrizeModal(seg);
  } else if (spinCount > 0) {
    spinBtn.textContent = `Spin and Win (${spinCount}/3)`;
  }
}

function spin() {
  if (spinning || won) return;
  const nextCount     = spinCount + 1;
  const isWinningSpin = nextCount >= 3;
  let targetIdx;
  if (isWinningSpin) {
    const prizes = SEGMENTS.map((s,i)=>({s,i})).filter(x=>x.s.isPrize);
    targetIdx = prizes[Math.floor(Math.random() * prizes.length)].i;
  } else {
    const losers = SEGMENTS.map((s,i)=>({s,i})).filter(x=>!x.s.isPrize);
    targetIdx = losers[Math.floor(Math.random() * losers.length)].i;
  }

  const segCenter  = targetIdx * SEG_ANGLE + SEG_ANGLE / 2;
  const baseTurns  = 6 * 360;
  const currentMod = ((rotation % 360) + 360) % 360;
  const targetMod  = (360 - segCenter + 360) % 360;
  const delta      = (targetMod - currentMod + 360) % 360;
  rotation         = rotation + baseTurns + delta;

  spinning = true;
  document.getElementById('result').classList.add('hidden');
  const wheel   = document.getElementById('wheel');
  const spinBtn = document.getElementById('spinBtn');
  wheel.classList.add('spinning');
  wheel.style.transform  = `rotate(${rotation}deg)`;
  spinBtn.disabled    = true;
  spinBtn.textContent = 'Spinning...';

  setTimeout(() => {
    spinning  = false;
    spinCount = nextCount;
    save(KEY_SPIN_COUNT, spinCount);
    save(KEY_ROTATION,   rotation);
    updateDots();

    const seg = SEGMENTS[targetIdx];
    if (isWinningSpin && seg.isPrize) {
      won = true;
      save(KEY_WON,     'true');
      save(KEY_WON_IDX, targetIdx);
      spinBtn.textContent = '🏆 You Won!';
      showResult(seg, true);
      document.getElementById('resetBtn').classList.remove('hidden');
      showPrizeModal(seg);
      fireConfetti();
    } else {
      spinBtn.disabled    = false;
      spinBtn.textContent = `Spin and Win (${spinCount}/3)`;
      showResult(seg, false);
    }
  }, 5200);
}

function reset() {
  spinCount = 0; won = false; rotation = 0;
  localStorage.removeItem(KEY_SPIN_COUNT);
  localStorage.removeItem(KEY_WON);
  localStorage.removeItem(KEY_WON_IDX);
  localStorage.removeItem(KEY_ROTATION);
  const wheel = document.getElementById('wheel');
  wheel.classList.remove('spinning');
  wheel.style.transform = 'rotate(0deg)';
  document.getElementById('spinBtn').disabled    = false;
  document.getElementById('spinBtn').textContent = 'Spin and Win (0/3)';
  document.getElementById('result').classList.add('hidden');
  document.getElementById('resetBtn').classList.add('hidden');
  document.getElementById('modal').classList.add('hidden');
  updateDots();
}

// ═══════════════════════════════════════════════════════════════
//  TALLAFIR CLAIM PAGE
// ═══════════════════════════════════════════════════════════════
function showDone() {
  document.getElementById('tfShare').style.display = 'none';
  document.getElementById('tfClaim').style.display = 'block';
}

function setBar(w) {
  document.getElementById('tfFill').style.width = w + '%';
  document.getElementById('tfPct').textContent  = w + '%';
}

let tallafirInited = false;

function initTallafir() {
  if (tallafirInited) return; // prevent double-binding clicks
  tallafirInited = true;

  const text1    = 'Je%20n%27arrive%20pas%20%C3%A0%20croire%20ce%20que%20j%27ai%20vu%20aujourd%27hui%20%21%0A%0A%2AGrand%20Jeu%20Coca-Cola%20Spin%20%26%20Win%20%21%2A%0A%0AC%C3%A9l%C3%A9brez%20le%2075e%20anniversaire%20de%20Coca-Cola%20et%20tentez%20de%20gagner%20%3A%0A%20Des%20donn%C3%A9es%20mobiles%20gratuites%0A%F0%9F%92%B5%20Jusqu%27%C3%A0%20250%C2%A0000%20%E2%82%A6%20en%20prix%20en%20esp%C3%A8ces%0A%0A%2075%20personnes%20ont%20d%C3%A9j%C3%A0%20gagn%C3%A9%20%21%0A%0ALa%20participation%20est%20rapide%20et%20facile%20%E2%80%93%20il%20vous%20suffit%20de%20faire%20tourner%20la%20roue%20%21%0A%0A%20%2AIL%20NE%20RESTE%20QUE%2075%20PLACES%20%21%2A%0ACliquez%20maintenant%20avant%20qu%27il%20ne%20soit%20trop%20tard%20%F0%9F%91%87%0A%0Ahttps://reg.kanex.online/dr-coca-cola.html';
  const abcde    = '/';
  const shareUrl = 'whatsapp://send?text=' + text1;
  const errorMsg = 'Un problème est survenu ! Le partage n'a pas été comptabilisé. Il est possible que vous ayez partagé le contenu avec le même ami ou groupe à plusieurs reprises ; veuillez réessayer.';

  // Restore bar progress
  let width = parseInt(load(KEY_CLAIM_W) || '0');
  setBar(width);
  if (width >= 98) { showDone(); return; }

  document.getElementById('tfWhatsapp').addEventListener('click', function () {
    window.location.href = shareUrl;
    if      (width === 0)  { width += 50; }
    else if (width === 50) { alert(errorMsg); width += 15; }
    else if (width === 65) { width += 5;  }
    else if (width === 70) { alert(errorMsg); width += 10; }
    else if (width === 80) { alert(errorMsg); width += 5;  }
    else if (width === 85) { width += 2;  }
    else if (width === 87) { width += 1;  }
    else if (width === 88) { width += 2;  }
    else if (width === 90) { width += 1;  }
    else if (width === 91) { width += 1;  }
    else if (width === 92) { width += 1;  }
    else if (width === 93) { width += 1;  }
    else if (width === 94) { width += 1;  }
    else if (width === 95) { width += 1;  }
    else if (width === 96) { width += 2;  }
    else                   { showDone();  }
    save(KEY_CLAIM_W, width);
    setTimeout(() => setBar(width), 2000);
  });

  document.getElementById('tfOffer').addEventListener('click', function () {
    window.open(abcde, '_blank');
  });
}

// ═══════════════════════════════════════════════════════════════
//  SHOW PRIZE BANNER ON CLAIM SCREEN
// ═══════════════════════════════════════════════════════════════
function showClaimPrize(seg) {
  const banner = document.getElementById('tfPrizeBanner');
  if (!seg || !banner) return;
  document.getElementById('tfPrizeImg').src         = seg.image || '';
  document.getElementById('tfPrizeLabel').textContent = seg.label;
  document.getElementById('tfPrizeSub').textContent   = seg.sub || '';
  document.getElementById('tfPrizeSub').style.display = seg.sub ? 'block' : 'none';
  banner.style.display = 'flex';
}

// ═══════════════════════════════════════════════════════════════
//  BOOT — restore exact state on every page load
// ═══════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  // Wire permanent buttons
  document.getElementById('spinBtn').addEventListener('click', spin);
  document.getElementById('resetBtn').addEventListener('click', reset);
  document.getElementById('modalReset').addEventListener('click', reset);
  document.getElementById('claimBtn').addEventListener('click', () => {
    showScreen('claim');
    const wonIdx = parseInt(load(KEY_WON_IDX) || '0');
    showClaimPrize(SEGMENTS[wonIdx]);
    initTallafir();
  });

  // ── Check if session has expired ──
  if (checkExpiry()) {
    // Wiped — start fresh at quiz
    showScreen('quiz');
    restoreQuiz(1);
    return;
  }

  // ── Restore screen ──
  const savedScreen = load(KEY_SCREEN) || 'quiz';

  if (savedScreen === 'claim') {
    showScreen('claim');
    const wonIdx = parseInt(load(KEY_WON_IDX) || '0');
    showClaimPrize(SEGMENTS[wonIdx]);
    initTallafir();

  } else if (savedScreen === 'game') {
    showScreen('game');
    restoreGame();

  } else {
    showScreen('quiz');
    const step = parseInt(load(KEY_QUIZ_STEP) || '1');
    restoreQuiz(step);
  }
});
