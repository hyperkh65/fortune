'use strict';

/* ── 메이저 아르카나 22장 ── */
const TAROT_MAJOR = [
  { num:0,  name:'바보',          en:'The Fool',           sym:'🌟', color:'#eab308',
    upright:'새로운 시작, 순수함, 모험, 자유, 가능성',
    reversed:'경솔함, 무모한 위험, 방황, 무책임',
    detail:'순수한 잠재력을 상징합니다. 두려움 없이 새 여정을 시작하는 것을 뜻하며 무한한 가능성을 품고 있습니다.' },
  { num:1,  name:'마법사',        en:'The Magician',       sym:'✨', color:'#ef4444',
    upright:'의지력, 창의성, 기술, 자원 활용, 집중력',
    reversed:'교묘함, 의지 부족, 재능 낭비, 속임수',
    detail:'모든 원소를 통달한 자입니다. 당신에게 필요한 모든 도구가 이미 갖춰져 있음을 의미합니다.' },
  { num:2,  name:'여사제',        en:'The High Priestess', sym:'🌙', color:'#818cf8',
    upright:'직관, 내면의 지혜, 신비, 잠재의식',
    reversed:'비밀, 표면만 보기, 직관 무시',
    detail:'깊은 직관과 내면의 지혜를 상징합니다. 아직 드러나지 않은 것들에 귀를 기울이세요.' },
  { num:3,  name:'여제',          en:'The Empress',        sym:'🌺', color:'#4ade80',
    upright:'풍요, 창조, 자연, 모성, 아름다움',
    reversed:'창의성 결핍, 의존, 과보호',
    detail:'풍요로움과 창조적 에너지를 의미합니다. 자연과의 연결, 감각적 즐거움을 상징합니다.' },
  { num:4,  name:'황제',          en:'The Emperor',        sym:'👑', color:'#ef4444',
    upright:'권위, 구조, 리더십, 안정감, 부성',
    reversed:'지배, 경직성, 과도한 통제, 독재',
    detail:'안정적인 구조와 권위를 상징합니다. 명확한 경계와 규칙을 통해 성취를 이루어 냅니다.' },
  { num:5,  name:'사제',          en:'The Hierophant',     sym:'⛪', color:'#a855f7',
    upright:'전통, 가르침, 신앙, 관습, 공동체',
    reversed:'관습 도전, 개인주의, 자유',
    detail:'전통적인 가치와 교육을 상징합니다. 확립된 지혜와 영적 안내를 의미합니다.' },
  { num:6,  name:'연인들',        en:'The Lovers',         sym:'❤️', color:'#ef4444',
    upright:'사랑, 조화, 가치관 일치, 선택',
    reversed:'불일치, 잘못된 선택, 관계의 불균형',
    detail:'사랑과 조화로운 관계를 상징합니다. 중요한 선택의 기로에 서 있음을 의미하기도 합니다.' },
  { num:7,  name:'전차',          en:'The Chariot',        sym:'🏆', color:'#eab308',
    upright:'의지력, 승리, 단호함, 통제, 성공',
    reversed:'방향 상실, 통제력 상실, 자기 훈련 부족',
    detail:'의지와 자기 통제를 통한 승리를 의미합니다. 목표를 향해 밀어붙이는 결단력을 상징합니다.' },
  { num:8,  name:'힘',            en:'Strength',           sym:'🦁', color:'#fb923c',
    upright:'내면의 강함, 용기, 인내, 연민',
    reversed:'자기 의심, 내면의 힘 부족, 취약함',
    detail:'부드러운 방식으로 강력한 힘을 발휘하는 것을 상징합니다. 인내와 연민으로 이겨냅니다.' },
  { num:9,  name:'은둔자',        en:'The Hermit',         sym:'🔦', color:'#9ca3af',
    upright:'내면 성찰, 고독, 지혜, 안내, 명상',
    reversed:'고립, 외로움, 사회 회피',
    detail:'혼자만의 시간을 통해 내면의 지혜를 찾는 것을 의미합니다. 내적 성찰의 시기입니다.' },
  { num:10, name:'운명의 바퀴',   en:'Wheel of Fortune',   sym:'🌀', color:'#3ddc84',
    upright:'변화, 행운, 운명, 전환점, 기회',
    reversed:'나쁜 운, 저항, 불운',
    detail:'삶의 주기적 변화를 상징합니다. 지금이 전환점일 수 있으며, 변화를 받아들이세요.' },
  { num:11, name:'정의',          en:'Justice',            sym:'⚖️', color:'#60a5fa',
    upright:'공정, 진실, 인과응보, 법',
    reversed:'불공정, 불성실, 책임 회피',
    detail:'공정함과 진실을 상징합니다. 행동과 결과의 균형을 의미하며, 진실을 직면하세요.' },
  { num:12, name:'매달린 남자',   en:'The Hanged Man',     sym:'🔄', color:'#818cf8',
    upright:'일시정지, 새로운 관점, 희생, 내려놓기',
    reversed:'저항, 순교자 콤플렉스, 교착 상태',
    detail:'다른 관점에서 바라보는 것을 의미합니다. 잠시 멈추고 상황을 재평가하세요.' },
  { num:13, name:'죽음',          en:'Death',              sym:'🌑', color:'#6b7280',
    upright:'변화, 종말과 시작, 변환, 전환',
    reversed:'변화 저항, 정체, 과거에 집착',
    detail:'실제 죽음이 아닌 변화와 새로운 시작을 의미합니다. 낡은 것이 끝나고 새것이 시작됩니다.' },
  { num:14, name:'절제',          en:'Temperance',         sym:'🌊', color:'#60a5fa',
    upright:'균형, 조화, 인내, 중용, 목적의식',
    reversed:'불균형, 과잉, 자기 치유 필요',
    detail:'균형과 조화를 상징합니다. 극단을 피하고 중용의 길을 걸으며 내면의 평화를 찾으세요.' },
  { num:15, name:'악마',          en:'The Devil',          sym:'⛓️', color:'#ef4444',
    upright:'집착, 중독, 물질주의, 그림자 자아',
    reversed:'해방, 자유, 속박에서 벗어남',
    detail:'우리를 묶고 있는 것들을 상징합니다. 두려움, 집착, 중독에서 벗어날 때가 되었습니다.' },
  { num:16, name:'탑',            en:'The Tower',          sym:'⚡', color:'#ef4444',
    upright:'갑작스런 변화, 혼란, 계시, 깨달음',
    reversed:'개인적 전환, 변화 두려움, 재앙 회피',
    detail:'갑작스럽고 혼란스러운 변화를 의미합니다. 하지만 무너지는 것은 잘못 세워진 것들입니다.' },
  { num:17, name:'별',            en:'The Star',           sym:'⭐', color:'#60a5fa',
    upright:'희망, 영감, 고요함, 재생, 긍정',
    reversed:'절망, 자기 신뢰 부족, 희망 상실',
    detail:'희망과 영감을 상징합니다. 어려운 시간 후에 평화와 재생이 찾아옵니다.' },
  { num:18, name:'달',            en:'The Moon',           sym:'🌙', color:'#818cf8',
    upright:'환상, 두려움, 잠재의식, 직관, 불확실성',
    reversed:'혼란 해소, 두려움 극복, 명확함',
    detail:'잠재의식과 직관을 상징합니다. 보이는 것이 전부가 아닐 수 있으니 직관을 믿으세요.' },
  { num:19, name:'태양',          en:'The Sun',            sym:'☀️', color:'#eab308',
    upright:'긍정, 성공, 활력, 기쁨, 자신감',
    reversed:'낙관주의 결핍, 우울, 부정적 시각',
    detail:'가장 긍정적인 카드 중 하나입니다. 성공, 기쁨, 활력이 넘치는 시기임을 의미합니다.' },
  { num:20, name:'심판',          en:'Judgement',          sym:'📯', color:'#fb923c',
    upright:'반성, 부활, 내면의 부름, 재생',
    reversed:'자기 비판, 의심, 부름 무시',
    detail:'과거를 돌아보고 더 높은 부름에 응답하는 것을 의미합니다. 새로운 변화를 준비하세요.' },
  { num:21, name:'세계',          en:'The World',          sym:'🌍', color:'#3ddc84',
    upright:'완성, 통합, 성취, 여행, 완전함',
    reversed:'미완성, 지름길 찾기, 완성 지연',
    detail:'완성과 성취를 의미하며 하나의 주기가 끝났습니다. 새로운 사이클을 맞이할 준비를 하세요.' },
];

const SPREAD_LABELS = {
  1: ['오늘의 메시지'],
  3: ['과거', '현재', '미래'],
  5: ['현재 상황', '도전 과제', '과거의 영향', '미래의 가능성', '최종 결과'],
};

/* ── State ── */
let state = {
  spread: 1,
  drawn: [],       // { card, reversed, revealed }
  revealIdx: 0,
  phase: 'input',  // 'input' | 'deck' | 'spread' | 'meaning'
};

/* ── Shuffle utility ── */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ── DOM helpers ── */
const $ = id => document.getElementById(id);

function showPhase(name) {
  ['phaseDeck', 'phaseSpread', 'phaseMeaning'].forEach(p => {
    $(p).style.display = (p === 'phase' + name.charAt(0).toUpperCase() + name.slice(1)) ? '' : 'none';
  });
  state.phase = name;
}

function showToast(msg) {
  const t = $('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}

/* ── Build card HTML ── */
function buildCardHTML(cardData, label, idx) {
  const { card, reversed } = cardData;
  const bg = card.color + '22';
  return `
    <div class="tarot-slot">
      <span class="tarot-slot-label">${label}</span>
      <div class="tarot-card-wrap" data-idx="${idx}" id="tc${idx}">
        <div class="tarot-card-inner">
          <div class="tarot-card-face tarot-card-back-face">
            <div class="tarot-back-pattern">✦</div>
          </div>
          <div class="tarot-card-face tarot-card-front-face"
               style="background:linear-gradient(160deg,#141416 0%,${bg} 100%);border:1px solid ${card.color}44;">
            <span class="tarot-card-num">${String(card.num).padStart(2,'0')}</span>
            <span class="tarot-card-sym" style="${reversed ? 'transform:rotate(180deg)' : ''}">${card.sym}</span>
            <span class="tarot-card-name-kr" style="color:${card.color}">${card.name}</span>
            <span class="tarot-card-name-en">${card.en}</span>
            ${reversed ? '<span class="tarot-reversed-label">역방향</span>' : ''}
          </div>
        </div>
      </div>
    </div>`;
}

/* ── Build meaning HTML ── */
function buildMeaningHTML(cardData, label) {
  const { card, reversed } = cardData;
  const keywords = (reversed ? card.reversed : card.upright).split(', ');
  return `
    <div class="card-meaning-item">
      <div class="cmi-header">
        <span class="cmi-sym">${card.sym}</span>
        <div class="cmi-names">
          <div class="cmi-name-kr" style="color:${card.color}">${card.name} ${reversed ? '(역방향)' : ''}</div>
          <div class="cmi-name-en">${card.en}</div>
        </div>
        <span class="cmi-position">${label}</span>
      </div>
      <div class="cmi-keyword-row">
        ${keywords.map(k => `<span class="cmi-keyword${reversed ? ' reversed-kw' : ''}">${k.trim()}</span>`).join('')}
      </div>
      <p class="cmi-detail">${card.detail}</p>
    </div>`;
}

/* ── Draw cards ── */
function drawCards() {
  const pool = shuffle(TAROT_MAJOR);
  state.drawn = pool.slice(0, state.spread).map(card => ({
    card,
    reversed: Math.random() < 0.35,
    revealed: false,
  }));
  state.revealIdx = 0;
}

/* ── Render spread phase ── */
function renderSpread() {
  const labels = SPREAD_LABELS[state.spread];
  const spread = $('cardSpread');
  spread.innerHTML = state.drawn.map((d, i) => buildCardHTML(d, labels[i], i)).join('');
  showPhase('spread');

  // Click to reveal
  spread.addEventListener('click', e => {
    const wrap = e.target.closest('.tarot-card-wrap');
    if (!wrap) return;
    const idx = parseInt(wrap.dataset.idx);
    if (state.drawn[idx].revealed) return;
    state.drawn[idx].revealed = true;
    wrap.classList.add('revealed');
    state.revealIdx++;
    if (state.revealIdx >= state.spread) {
      setTimeout(renderMeaning, 900);
    }
  });
}

/* ── Render meaning phase ── */
function renderMeaning() {
  const labels = SPREAD_LABELS[state.spread];
  const panel = $('meaningPanel');
  panel.innerHTML = state.drawn.map((d, i) => buildMeaningHTML(d, labels[i])).join('');
  showPhase('meaning');
}

/* ── Reset ── */
function reset() {
  state.drawn = [];
  state.revealIdx = 0;
  $('questionInput').value = '';
  showPhase('input');
  // Re-show question wrap & draw btn
  document.querySelector('.tarot-question-wrap').style.display = '';
  document.querySelector('.tarot-intro').style.display = '';
  $('drawBtn').disabled = false;
}

/* ── Spread selector ── */
document.addEventListener('DOMContentLoaded', () => {
  $('spreadSelector').addEventListener('click', e => {
    const btn = e.target.closest('.spread-btn');
    if (!btn) return;
    document.querySelectorAll('.spread-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.spread = parseInt(btn.dataset.spread);
  });

  $('drawBtn').addEventListener('click', () => {
    drawCards();
    document.querySelector('.tarot-question-wrap').style.display = 'none';
    document.querySelector('.tarot-intro').style.display = 'none';
    showPhase('deck');
  });

  // Deck click → reveal spread
  $('deckStack').addEventListener('click', () => {
    renderSpread();
    showToast('카드를 클릭하여 한 장씩 공개하세요');
  });

  $('againBtn').addEventListener('click', reset);

  // Hide all phases initially
  showPhase('input');
  // phaseInput doesn't exist as an element, so just hide the others
  $('phaseDeck').style.display    = 'none';
  $('phaseSpread').style.display  = 'none';
  $('phaseMeaning').style.display = 'none';
});
