'use strict';

/* ══════════════════════════════════════════════
   실제 라이더-웨이트 타로 카드 이미지 (Public Domain)
   Wikimedia Commons RWS deck
══════════════════════════════════════════════ */
const RWS_IMG_BASE = 'https://upload.wikimedia.org/wikipedia/commons/';

const TAROT_MAJOR = [
  { num:0,  name:'바보',         en:'The Fool',           img:'9/90/RWS_Tarot_00_Fool.jpg',
    upright:'새로운 시작, 순수함, 모험, 자유, 가능성',
    reversed:'경솔함, 무모한 위험, 방황, 무책임',
    detail:'순수한 잠재력을 상징합니다. 두려움 없이 새 여정을 시작하는 것을 뜻하며 무한한 가능성을 품고 있습니다. 지금 이 순간이야말로 과감히 도약할 때입니다.' },
  { num:1,  name:'마법사',       en:'The Magician',       img:'d/de/RWS_Tarot_01_Magician.jpg',
    upright:'의지력, 창의성, 기술, 자원 활용, 집중력',
    reversed:'교묘함, 의지 부족, 재능 낭비, 속임수',
    detail:'모든 원소를 통달한 자입니다. 당신에게 필요한 모든 도구가 이미 갖춰져 있음을 의미합니다. 의지와 집중으로 목표를 이루어낼 수 있습니다.' },
  { num:2,  name:'여사제',       en:'The High Priestess', img:'8/88/RWS_Tarot_02_High_Priestess.jpg',
    upright:'직관, 내면의 지혜, 신비, 잠재의식',
    reversed:'비밀, 표면만 보기, 직관 무시',
    detail:'깊은 직관과 내면의 지혜를 상징합니다. 아직 드러나지 않은 것들에 귀를 기울이세요. 조용히 기다리며 내면의 목소리를 따르는 것이 중요합니다.' },
  { num:3,  name:'여제',         en:'The Empress',        img:'d/d2/RWS_Tarot_03_Empress.jpg',
    upright:'풍요, 창조, 자연, 모성, 아름다움',
    reversed:'창의성 결핍, 의존, 과보호',
    detail:'풍요로움과 창조적 에너지를 의미합니다. 자연과의 연결, 감각적 즐거움을 상징하며 풍성한 결실을 맺는 시기입니다.' },
  { num:4,  name:'황제',         en:'The Emperor',        img:'c/c3/RWS_Tarot_04_Emperor.jpg',
    upright:'권위, 구조, 리더십, 안정감, 부성',
    reversed:'지배, 경직성, 과도한 통제, 독재',
    detail:'안정적인 구조와 권위를 상징합니다. 명확한 경계와 규칙을 통해 성취를 이루어 냅니다. 체계를 세우고 주도적으로 이끌어나갈 때입니다.' },
  { num:5,  name:'사제',         en:'The Hierophant',     img:'8/8d/RWS_Tarot_05_Hierophant.jpg',
    upright:'전통, 가르침, 신앙, 관습, 공동체',
    reversed:'관습 도전, 개인주의, 자유',
    detail:'전통적인 가치와 교육을 상징합니다. 확립된 지혜와 영적 안내를 의미하며, 검증된 방식과 멘토의 조언을 따르는 것이 유익합니다.' },
  { num:6,  name:'연인들',       en:'The Lovers',         img:'3/3a/TheLovers.jpg',
    upright:'사랑, 조화, 가치관 일치, 선택',
    reversed:'불일치, 잘못된 선택, 관계의 불균형',
    detail:'사랑과 조화로운 관계를 상징합니다. 중요한 선택의 기로에 서 있음을 의미하기도 합니다. 마음과 가치관에 솔직해지는 것이 중요합니다.' },
  { num:7,  name:'전차',         en:'The Chariot',        img:'9/9b/RWS_Tarot_07_Chariot.jpg',
    upright:'의지력, 승리, 단호함, 통제, 성공',
    reversed:'방향 상실, 통제력 상실, 자기 훈련 부족',
    detail:'의지와 자기 통제를 통한 승리를 의미합니다. 목표를 향해 밀어붙이는 결단력을 상징합니다. 반드시 해낼 수 있다는 자신감으로 전진하세요.' },
  { num:8,  name:'힘',           en:'Strength',           img:'f/f5/RWS_Tarot_08_Strength.jpg',
    upright:'내면의 강함, 용기, 인내, 연민',
    reversed:'자기 의심, 내면의 힘 부족, 취약함',
    detail:'부드러운 방식으로 강력한 힘을 발휘하는 것을 상징합니다. 인내와 연민으로 이겨냅니다. 두려움에 맞서되 온화하게 접근하세요.' },
  { num:9,  name:'은둔자',       en:'The Hermit',         img:'4/4d/RWS_Tarot_09_Hermit.jpg',
    upright:'내면 성찰, 고독, 지혜, 안내, 명상',
    reversed:'고립, 외로움, 사회 회피',
    detail:'혼자만의 시간을 통해 내면의 지혜를 찾는 것을 의미합니다. 내적 성찰의 시기입니다. 잠시 물러서서 자신만의 진실을 발견하세요.' },
  { num:10, name:'운명의 바퀴',  en:'Wheel of Fortune',   img:'3/3c/RWS_Tarot_10_Wheel_of_Fortune.jpg',
    upright:'변화, 행운, 운명, 전환점, 기회',
    reversed:'나쁜 운, 저항, 불운',
    detail:'삶의 주기적 변화를 상징합니다. 지금이 전환점일 수 있으며, 변화를 받아들이세요. 행운의 기운이 돌아오고 있으니 기회를 놓치지 마세요.' },
  { num:11, name:'정의',         en:'Justice',            img:'e/e0/RWS_Tarot_11_Justice.jpg',
    upright:'공정, 진실, 인과응보, 법',
    reversed:'불공정, 불성실, 책임 회피',
    detail:'공정함과 진실을 상징합니다. 행동과 결과의 균형을 의미하며, 진실을 직면하세요. 올바른 판단과 책임감이 요구되는 시기입니다.' },
  { num:12, name:'매달린 남자',  en:'The Hanged Man',     img:'2/2b/RWS_Tarot_12_Hanged_Man.jpg',
    upright:'일시정지, 새로운 관점, 희생, 내려놓기',
    reversed:'저항, 순교자 콤플렉스, 교착 상태',
    detail:'다른 관점에서 바라보는 것을 의미합니다. 잠시 멈추고 상황을 재평가하세요. 내려놓음으로써 오히려 더 많은 것을 얻을 수 있습니다.' },
  { num:13, name:'죽음',         en:'Death',              img:'d/d7/RWS_Tarot_13_Death.jpg',
    upright:'변화, 종말과 시작, 변환, 전환',
    reversed:'변화 저항, 정체, 과거에 집착',
    detail:'실제 죽음이 아닌 변화와 새로운 시작을 의미합니다. 낡은 것이 끝나고 새것이 시작됩니다. 두려움 없이 변화를 받아들일 준비를 하세요.' },
  { num:14, name:'절제',         en:'Temperance',         img:'f/f8/RWS_Tarot_14_Temperance.jpg',
    upright:'균형, 조화, 인내, 중용, 목적의식',
    reversed:'불균형, 과잉, 자기 치유 필요',
    detail:'균형과 조화를 상징합니다. 극단을 피하고 중용의 길을 걸으며 내면의 평화를 찾으세요. 인내와 절제가 최선의 결과를 이끌어냅니다.' },
  { num:15, name:'악마',         en:'The Devil',          img:'5/55/RWS_Tarot_15_Devil.jpg',
    upright:'집착, 중독, 물질주의, 그림자 자아',
    reversed:'해방, 자유, 속박에서 벗어남',
    detail:'우리를 묶고 있는 것들을 상징합니다. 두려움, 집착, 중독에서 벗어날 때가 되었습니다. 자신을 옭아매는 패턴을 인식하고 의식적으로 해방되세요.' },
  { num:16, name:'탑',           en:'The Tower',          img:'5/53/RWS_Tarot_16_Tower.jpg',
    upright:'갑작스런 변화, 혼란, 계시, 깨달음',
    reversed:'개인적 전환, 변화 두려움, 재앙 회피',
    detail:'갑작스럽고 혼란스러운 변화를 의미합니다. 하지만 무너지는 것은 잘못 세워진 것들입니다. 이 격변은 더 진실한 토대를 쌓기 위한 과정입니다.' },
  { num:17, name:'별',           en:'The Star',           img:'d/db/RWS_Tarot_17_Star.jpg',
    upright:'희망, 영감, 고요함, 재생, 긍정',
    reversed:'절망, 자기 신뢰 부족, 희망 상실',
    detail:'희망과 영감을 상징합니다. 어려운 시간 후에 평화와 재생이 찾아옵니다. 우주가 당신을 지지하고 있음을 믿으세요.' },
  { num:18, name:'달',           en:'The Moon',           img:'7/7f/RWS_Tarot_18_Moon.jpg',
    upright:'환상, 두려움, 잠재의식, 직관, 불확실성',
    reversed:'혼란 해소, 두려움 극복, 명확함',
    detail:'잠재의식과 직관을 상징합니다. 보이는 것이 전부가 아닐 수 있으니 직관을 믿으세요. 불확실성 속에서도 내면의 길을 따르세요.' },
  { num:19, name:'태양',         en:'The Sun',            img:'1/17/RWS_Tarot_19_Sun.jpg',
    upright:'긍정, 성공, 활력, 기쁨, 자신감',
    reversed:'낙관주의 결핍, 우울, 부정적 시각',
    detail:'가장 긍정적인 카드 중 하나입니다. 성공, 기쁨, 활력이 넘치는 시기임을 의미합니다. 빛나는 에너지로 주변에 온기를 전파하세요.' },
  { num:20, name:'심판',         en:'Judgement',          img:'d/dd/RWS_Tarot_20_Judgement.jpg',
    upright:'반성, 부활, 내면의 부름, 재생',
    reversed:'자기 비판, 의심, 부름 무시',
    detail:'과거를 돌아보고 더 높은 부름에 응답하는 것을 의미합니다. 새로운 변화를 준비하세요. 삶의 전환점에서 더 높은 소명을 받아들일 때입니다.' },
  { num:21, name:'세계',         en:'The World',          img:'f/ff/RWS_Tarot_21_World.jpg',
    upright:'완성, 통합, 성취, 여행, 완전함',
    reversed:'미완성, 지름길 찾기, 완성 지연',
    detail:'완성과 성취를 의미하며 하나의 주기가 끝났습니다. 새로운 사이클을 맞이할 준비를 하세요. 당신의 노력이 마침내 결실을 맺고 있습니다.' },
];

/* ── 스프레드 설정 ── */
const SPREAD_CONFIG = {
  1: {
    title: '오늘의 한 장',
    positions: [{ label:'오늘의 메시지', context:'지금 이 순간 당신에게 가장 필요한 핵심 에너지입니다.' }],
  },
  3: {
    title: '과거·현재·미래',
    positions: [
      { label:'과거', context:'현재 상황에 영향을 미치고 있는 과거의 에너지입니다.' },
      { label:'현재', context:'지금 이 순간의 에너지와 상황을 나타냅니다.' },
      { label:'미래', context:'현재 흐름이 지속될 때 나타날 가능성을 보여줍니다.' },
    ],
  },
  7: {
    title: '말굽 스프레드',
    positions: [
      { label:'과거', context:'이 상황의 뿌리와 배경입니다.' },
      { label:'현재', context:'현재의 에너지와 도전을 나타냅니다.' },
      { label:'숨겨진 영향', context:'표면 아래 작용하는 보이지 않는 영향입니다.' },
      { label:'장애물', context:'극복해야 할 걸림돌이나 도전을 의미합니다.' },
      { label:'외부 환경', context:'외부에서 작용하는 에너지와 사람들입니다.' },
      { label:'희망/두려움', context:'당신이 바라거나 두려워하는 결과입니다.' },
      { label:'결과', context:'이 상황의 가장 가능성 높은 결론입니다.' },
    ],
  },
  10: {
    title: '켈틱 십자가',
    positions: [
      { label:'현재 상황', context:'현재 질문의 핵심 에너지입니다.' },
      { label:'장애물/도움', context:'현재를 가로막거나 돕는 에너지입니다.' },
      { label:'의식적 목표', context:'의식적으로 원하는 것을 나타냅니다.' },
      { label:'무의식적 기반', context:'인식하지 못한 심층의 영향입니다.' },
      { label:'최근 과거', context:'현재 상황으로 이어진 최근의 영향입니다.' },
      { label:'가까운 미래', context:'곧 다가올 변화나 영향입니다.' },
      { label:'자신의 태도', context:'이 상황에 대한 당신의 자세와 접근입니다.' },
      { label:'외부 환경', context:'주변 환경과 다른 사람들의 영향입니다.' },
      { label:'희망/두려움', context:'당신이 바라거나 두려워하는 것입니다.' },
      { label:'최종 결과', context:'이 상황의 최종 결론과 결과입니다.' },
    ],
  },
};

/* ── App State ── */
let state = {
  spreadCount: 1,
  question: '',
  deck: [],          // shuffled indices
  selectedCards: [], // { cardIndex, isReversed, positionIdx }
  totalNeeded: 1,
};

/* ── Utilities ── */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._t);
  t._t = setTimeout(() => t.classList.remove('show'), 2500);
}

function cardImgUrl(card) {
  return RWS_IMG_BASE + card.img;
}

/* ── Phase management ── */
function showPhase(phaseId) {
  ['phaseIntro', 'phaseFan', 'phaseMeaning'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = id === phaseId ? 'block' : 'none';
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ── Build horizontal row of cards ── */
function buildFan(needed) {
  const wrap = document.getElementById('fanCardsWrap');
  if (!wrap) return;
  wrap.innerHTML = '';

  const TOTAL_CARDS = 22;
  state.deck = shuffle([...Array(TOTAL_CARDS).keys()]);

  for (let i = 0; i < TOTAL_CARDS; i++) {
    const card = document.createElement('div');
    card.className = 'fan-card';
    card.dataset.idx     = i;
    card.dataset.cardIdx = state.deck[i];

    // Start translated down (fly-in from below)
    card.style.opacity   = '0';
    card.style.transform = 'translateY(50px) scale(0.85)';

    card.addEventListener('click', () => onCardClick(card, i));
    wrap.appendChild(card);
  }

  // Staggered fly-in
  requestAnimationFrame(() => {
    wrap.querySelectorAll('.fan-card').forEach((c, i) => {
      setTimeout(() => {
        c.style.transition = 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s ease';
        c.style.opacity    = '1';
        c.style.transform  = 'translateY(0) scale(1)';
      }, i * 28 + 60);
    });
  });

  updateCounts();
}

function updateCounts() {
  const el = document.getElementById('remainCount');
  const se = document.getElementById('selectedCount');
  if (el) el.textContent = state.totalNeeded - state.selectedCards.length;
  if (se) se.textContent = state.selectedCards.length;
  const hint = document.getElementById('fanHint');
  if (hint) {
    const rem = state.totalNeeded - state.selectedCards.length;
    hint.textContent = rem > 0
      ? `직관을 따라 카드를 선택하세요 (${rem}장 더 선택)`
      : '모든 카드를 선택했습니다. 리딩을 확인하세요!';
  }
}

function onCardClick(card, idx) {
  if (card.classList.contains('selected') || card.classList.contains('dimmed')) return;
  if (state.selectedCards.length >= state.totalNeeded) return;

  const cardIdx  = parseInt(card.dataset.cardIdx);
  const isRev    = Math.random() < 0.3; // 30% reversed
  const posIdx   = state.selectedCards.length;

  state.selectedCards.push({ cardIdx, isReversed: isRev, positionIdx: posIdx });

  card.classList.add('selected');

  // Flash effect
  card.style.transition = 'all 0.2s ease';
  card.style.boxShadow = '0 0 40px rgba(168,85,247,0.9)';
  setTimeout(() => { card.style.boxShadow = ''; }, 400);

  updateCounts();

  if (state.selectedCards.length >= state.totalNeeded) {
    // Dim unselected
    document.querySelectorAll('.fan-card:not(.selected)').forEach(c => c.classList.add('dimmed'));
    setTimeout(() => showMeaning(), 700);
  }
}

/* ── Render reading results ── */
function showMeaning() {
  showPhase('phaseMeaning');

  const config = SPREAD_CONFIG[state.spreadCount];
  document.getElementById('meaningTitle').textContent = config.title + ' 리딩';
  const qEl = document.getElementById('meaningQuestion');
  if (qEl) qEl.textContent = state.question ? `"${state.question}"` : '';

  const panel = document.getElementById('meaningPanel');
  if (!panel) return;
  panel.innerHTML = '';

  state.selectedCards.forEach((sel, i) => {
    const card = TAROT_MAJOR[sel.cardIdx];
    const pos  = config.positions[i];
    const imgUrl = cardImgUrl(card);

    const div = document.createElement('div');
    div.className = 'card-meaning-card';
    div.style.animationDelay = `${i * 0.1}s`;
    div.innerHTML = `
      <div class="cmc-header">
        <div class="cmc-img ${sel.isReversed ? 'rev' : ''}">
          <img src="${imgUrl}" alt="${card.name}" loading="lazy"
               onerror="this.style.display='none';this.parentNode.innerHTML='<div style=\\'width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#a855f7;font-size:22px\\'>✦</div>'" />
        </div>
        <div class="cmc-meta">
          <div class="cmc-pos">${pos.label}</div>
          <div class="cmc-name">${card.num}. ${card.name}</div>
          <div class="cmc-en">${card.en}</div>
          <div class="cmc-orientation ${sel.isReversed ? 'reversed' : 'upright'}">
            ${sel.isReversed ? '⬇ 역방향' : '⬆ 정방향'}
          </div>
        </div>
      </div>
      <div class="cmc-keywords">
        ${sel.isReversed ? card.reversed : card.upright}
      </div>
      <div style="font-size:11px;color:var(--txt-muted);margin-bottom:8px">${pos.context}</div>
      <div class="cmc-detail">${card.detail}</div>`;
    panel.appendChild(div);
  });

  // Overall reading
  const orEl = document.getElementById('overallReading');
  if (orEl) {
    orEl.innerHTML = `
      <div class="or-title">✦ 종합 해석</div>
      <div class="or-body">${buildOverallReading()}</div>`;
  }
}

function buildOverallReading() {
  const cards = state.selectedCards.map(s => TAROT_MAJOR[s.cardIdx]);
  const revCount = state.selectedCards.filter(s => s.isReversed).length;
  const majorCards = cards.map(c => c.name).join(', ');

  const themes = {
    긍정: ['태양','별','세계','마법사','힘','전차','운명의 바퀴'],
    도전: ['탑','악마','죽음','달','매달린 남자'],
    성장: ['은둔자','절제','정의','여사제','여제'],
    새출발: ['바보','황제','사제','연인들','심판'],
  };

  let tone = '균형 잡힌';
  if (cards.some(c => themes.긍정.includes(c.name))) tone = '긍정적이고 희망적인';
  if (cards.some(c => themes.도전.includes(c.name))) tone = '도전을 통해 성장하는';
  if (cards.every(c => themes.긍정.includes(c.name))) tone = '매우 긍정적이고 강력한';

  const revMsg = revCount > 0
    ? `${revCount}장의 역방향 카드가 나타나 내면을 돌아볼 것을 권하고 있습니다.`
    : '모든 카드가 정방향으로 나타나 에너지의 흐름이 원활합니다.';

  return `오늘 당신의 리딩은 <strong>${tone}</strong> 에너지를 보여줍니다. 
${cards.length}장의 카드(${majorCards})가 당신의 현재 상황을 다각도로 비추고 있습니다.<br><br>
${revMsg}<br><br>
카드들이 전하는 메시지는: 현재 당신이 걷고 있는 길에서 내면의 목소리에 귀를 기울이고, 
각 상황을 통해 더 깊은 자신을 발견하세요. 
${state.question ? `"${state.question}"에 대한 답은 이미 당신 안에 있습니다.` : '오늘 하루도 당신의 직관과 함께하세요.'}`;
}

/* ── Init ── */
document.addEventListener('DOMContentLoaded', () => {
  // Spread selector
  document.getElementById('spreadSelector')?.addEventListener('click', e => {
    const btn = e.target.closest('.spread-btn');
    if (!btn) return;
    document.querySelectorAll('.spread-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.spreadCount = parseInt(btn.dataset.spread);
  });

  // Draw button
  document.getElementById('drawBtn')?.addEventListener('click', () => {
    state.question     = document.getElementById('questionInput')?.value.trim() || '';
    state.totalNeeded  = state.spreadCount;
    state.selectedCards= [];

    showPhase('phaseFan');
    buildFan(state.totalNeeded);
  });

  // Again button
  document.getElementById('againBtn')?.addEventListener('click', () => {
    state.selectedCards = [];
    showPhase('phaseIntro');
    const q = document.getElementById('questionInput');
    if (q) q.value = '';
    document.querySelectorAll('.spread-btn').forEach((b,i) => b.classList.toggle('active', i===0));
    state.spreadCount = 1;
  });
});
