'use strict';

/* ── 메이저 아르카나 22장 ── */
const TAROT_MAJOR = [
  { num:0,  name:'바보',          en:'The Fool',           sym:'🌟', color:'#eab308',
    upright:'새로운 시작, 순수함, 모험, 자유, 가능성',
    reversed:'경솔함, 무모한 위험, 방황, 무책임',
    detail:'순수한 잠재력을 상징합니다. 두려움 없이 새 여정을 시작하는 것을 뜻하며 무한한 가능성을 품고 있습니다. 지금 이 순간이야말로 과감히 도약할 때입니다.' },
  { num:1,  name:'마법사',        en:'The Magician',       sym:'✨', color:'#ef4444',
    upright:'의지력, 창의성, 기술, 자원 활용, 집중력',
    reversed:'교묘함, 의지 부족, 재능 낭비, 속임수',
    detail:'모든 원소를 통달한 자입니다. 당신에게 필요한 모든 도구가 이미 갖춰져 있음을 의미합니다. 의지와 집중으로 목표를 이루어낼 수 있습니다.' },
  { num:2,  name:'여사제',        en:'The High Priestess', sym:'🌙', color:'#818cf8',
    upright:'직관, 내면의 지혜, 신비, 잠재의식',
    reversed:'비밀, 표면만 보기, 직관 무시',
    detail:'깊은 직관과 내면의 지혜를 상징합니다. 아직 드러나지 않은 것들에 귀를 기울이세요. 조용히 기다리며 내면의 목소리를 따르는 것이 중요합니다.' },
  { num:3,  name:'여제',          en:'The Empress',        sym:'🌺', color:'#4ade80',
    upright:'풍요, 창조, 자연, 모성, 아름다움',
    reversed:'창의성 결핍, 의존, 과보호',
    detail:'풍요로움과 창조적 에너지를 의미합니다. 자연과의 연결, 감각적 즐거움을 상징하며 풍성한 결실을 맺는 시기입니다.' },
  { num:4,  name:'황제',          en:'The Emperor',        sym:'👑', color:'#ef4444',
    upright:'권위, 구조, 리더십, 안정감, 부성',
    reversed:'지배, 경직성, 과도한 통제, 독재',
    detail:'안정적인 구조와 권위를 상징합니다. 명확한 경계와 규칙을 통해 성취를 이루어 냅니다. 체계를 세우고 주도적으로 이끌어나갈 때입니다.' },
  { num:5,  name:'사제',          en:'The Hierophant',     sym:'⛪', color:'#a855f7',
    upright:'전통, 가르침, 신앙, 관습, 공동체',
    reversed:'관습 도전, 개인주의, 자유',
    detail:'전통적인 가치와 교육을 상징합니다. 확립된 지혜와 영적 안내를 의미하며, 검증된 방식과 멘토의 조언을 따르는 것이 유익합니다.' },
  { num:6,  name:'연인들',        en:'The Lovers',         sym:'❤️', color:'#ef4444',
    upright:'사랑, 조화, 가치관 일치, 선택',
    reversed:'불일치, 잘못된 선택, 관계의 불균형',
    detail:'사랑과 조화로운 관계를 상징합니다. 중요한 선택의 기로에 서 있음을 의미하기도 합니다. 마음과 가치관에 솔직해지는 것이 중요합니다.' },
  { num:7,  name:'전차',          en:'The Chariot',        sym:'🏆', color:'#eab308',
    upright:'의지력, 승리, 단호함, 통제, 성공',
    reversed:'방향 상실, 통제력 상실, 자기 훈련 부족',
    detail:'의지와 자기 통제를 통한 승리를 의미합니다. 목표를 향해 밀어붙이는 결단력을 상징합니다. 반드시 해낼 수 있다는 자신감으로 전진하세요.' },
  { num:8,  name:'힘',            en:'Strength',           sym:'🦁', color:'#fb923c',
    upright:'내면의 강함, 용기, 인내, 연민',
    reversed:'자기 의심, 내면의 힘 부족, 취약함',
    detail:'부드러운 방식으로 강력한 힘을 발휘하는 것을 상징합니다. 인내와 연민으로 이겨냅니다. 두려움에 맞서되 온화하게 접근하세요.' },
  { num:9,  name:'은둔자',        en:'The Hermit',         sym:'🔦', color:'#9ca3af',
    upright:'내면 성찰, 고독, 지혜, 안내, 명상',
    reversed:'고립, 외로움, 사회 회피',
    detail:'혼자만의 시간을 통해 내면의 지혜를 찾는 것을 의미합니다. 내적 성찰의 시기입니다. 잠시 물러서서 자신만의 진실을 발견하세요.' },
  { num:10, name:'운명의 바퀴',   en:'Wheel of Fortune',   sym:'🌀', color:'#3ddc84',
    upright:'변화, 행운, 운명, 전환점, 기회',
    reversed:'나쁜 운, 저항, 불운',
    detail:'삶의 주기적 변화를 상징합니다. 지금이 전환점일 수 있으며, 변화를 받아들이세요. 행운의 기운이 돌아오고 있으니 기회를 놓치지 마세요.' },
  { num:11, name:'정의',          en:'Justice',            sym:'⚖️', color:'#60a5fa',
    upright:'공정, 진실, 인과응보, 법',
    reversed:'불공정, 불성실, 책임 회피',
    detail:'공정함과 진실을 상징합니다. 행동과 결과의 균형을 의미하며, 진실을 직면하세요. 올바른 판단과 책임감이 요구되는 시기입니다.' },
  { num:12, name:'매달린 남자',   en:'The Hanged Man',     sym:'🔄', color:'#818cf8',
    upright:'일시정지, 새로운 관점, 희생, 내려놓기',
    reversed:'저항, 순교자 콤플렉스, 교착 상태',
    detail:'다른 관점에서 바라보는 것을 의미합니다. 잠시 멈추고 상황을 재평가하세요. 내려놓음으로써 오히려 더 많은 것을 얻을 수 있습니다.' },
  { num:13, name:'죽음',          en:'Death',              sym:'🌑', color:'#6b7280',
    upright:'변화, 종말과 시작, 변환, 전환',
    reversed:'변화 저항, 정체, 과거에 집착',
    detail:'실제 죽음이 아닌 변화와 새로운 시작을 의미합니다. 낡은 것이 끝나고 새것이 시작됩니다. 두려움 없이 변화를 받아들일 준비를 하세요.' },
  { num:14, name:'절제',          en:'Temperance',         sym:'🌊', color:'#60a5fa',
    upright:'균형, 조화, 인내, 중용, 목적의식',
    reversed:'불균형, 과잉, 자기 치유 필요',
    detail:'균형과 조화를 상징합니다. 극단을 피하고 중용의 길을 걸으며 내면의 평화를 찾으세요. 인내와 절제가 최선의 결과를 이끌어냅니다.' },
  { num:15, name:'악마',          en:'The Devil',          sym:'⛓️', color:'#ef4444',
    upright:'집착, 중독, 물질주의, 그림자 자아',
    reversed:'해방, 자유, 속박에서 벗어남',
    detail:'우리를 묶고 있는 것들을 상징합니다. 두려움, 집착, 중독에서 벗어날 때가 되었습니다. 자신을 옭아매는 패턴을 인식하고 의식적으로 해방되세요.' },
  { num:16, name:'탑',            en:'The Tower',          sym:'⚡', color:'#ef4444',
    upright:'갑작스런 변화, 혼란, 계시, 깨달음',
    reversed:'개인적 전환, 변화 두려움, 재앙 회피',
    detail:'갑작스럽고 혼란스러운 변화를 의미합니다. 하지만 무너지는 것은 잘못 세워진 것들입니다. 이 격변은 더 진실한 토대를 쌓기 위한 과정입니다.' },
  { num:17, name:'별',            en:'The Star',           sym:'⭐', color:'#60a5fa',
    upright:'희망, 영감, 고요함, 재생, 긍정',
    reversed:'절망, 자기 신뢰 부족, 희망 상실',
    detail:'희망과 영감을 상징합니다. 어려운 시간 후에 평화와 재생이 찾아옵니다. 우주가 당신을 지지하고 있음을 믿으세요.' },
  { num:18, name:'달',            en:'The Moon',           sym:'🌙', color:'#818cf8',
    upright:'환상, 두려움, 잠재의식, 직관, 불확실성',
    reversed:'혼란 해소, 두려움 극복, 명확함',
    detail:'잠재의식과 직관을 상징합니다. 보이는 것이 전부가 아닐 수 있으니 직관을 믿으세요. 불확실성 속에서도 내면의 길을 따르세요.' },
  { num:19, name:'태양',          en:'The Sun',            sym:'☀️', color:'#eab308',
    upright:'긍정, 성공, 활력, 기쁨, 자신감',
    reversed:'낙관주의 결핍, 우울, 부정적 시각',
    detail:'가장 긍정적인 카드 중 하나입니다. 성공, 기쁨, 활력이 넘치는 시기임을 의미합니다. 빛나는 에너지로 주변에 온기를 전파하세요.' },
  { num:20, name:'심판',          en:'Judgement',          sym:'📯', color:'#fb923c',
    upright:'반성, 부활, 내면의 부름, 재생',
    reversed:'자기 비판, 의심, 부름 무시',
    detail:'과거를 돌아보고 더 높은 부름에 응답하는 것을 의미합니다. 새로운 변화를 준비하세요. 삶의 전환점에서 더 높은 소명을 받아들일 때입니다.' },
  { num:21, name:'세계',          en:'The World',          sym:'🌍', color:'#3ddc84',
    upright:'완성, 통합, 성취, 여행, 완전함',
    reversed:'미완성, 지름길 찾기, 완성 지연',
    detail:'완성과 성취를 의미하며 하나의 주기가 끝났습니다. 새로운 사이클을 맞이할 준비를 하세요. 당신의 노력이 마침내 결실을 맺고 있습니다.' },
];

/* ── 스프레드 설정 (위치 레이블 + 컨텍스트) ── */
const SPREAD_CONFIG = {
  1: {
    title: '오늘의 한 장',
    positions: [
      { label: '오늘의 메시지', context: '지금 이 순간 당신에게 가장 필요한 핵심 에너지입니다.' }
    ]
  },
  3: {
    title: '과거·현재·미래',
    positions: [
      { label: '과거',   context: '현재 상황에 영향을 미친 과거의 경험이나 에너지입니다.' },
      { label: '현재',   context: '지금 이 순간의 상황과 주요 에너지를 나타냅니다.' },
      { label: '미래',   context: '현재의 흐름이 이어질 때 나타날 가능성 있는 결과입니다.' }
    ]
  },
  7: {
    title: '말굽 스프레드',
    positions: [
      { label: '과거',        context: '현재 상황의 바탕이 된 과거의 경험과 사건입니다.' },
      { label: '현재',        context: '지금 이 순간 당신이 처한 현실적인 상황입니다.' },
      { label: '숨겨진 영향', context: '표면 아래에서 조용히 작용하는 무의식적 힘입니다.' },
      { label: '장애물',      context: '앞으로 나아가는 데 있어 반드시 극복해야 할 도전입니다.' },
      { label: '타인의 태도', context: '주변 사람들이 당신의 상황을 바라보는 시각입니다.' },
      { label: '조언',        context: '최선의 결과를 위해 취해야 할 행동 방향입니다.' },
      { label: '결과',        context: '현재의 경로를 따를 때 예상되는 최종 결과입니다.' }
    ]
  },
  10: {
    title: '켈틱 십자가',
    positions: [
      { label: '현재 상황',    context: '지금 당신이 처한 핵심 상황이자 리딩의 중심입니다.' },
      { label: '도전·장애',    context: '현재 상황을 가로지르는 주요 도전과 장애 에너지입니다.' },
      { label: '잠재의식·뿌리', context: '의식하지 못하지만 깊이 작용하는 내면의 근원입니다.' },
      { label: '최근 과거',    context: '최근에 지나간 사건이나 현재 상황에 영향을 준 경험입니다.' },
      { label: '가능성·목표',  context: '현재 상황에서 가능한 최상의 결과이자 의식적 목표입니다.' },
      { label: '가까운 미래',  context: '곧 닥쳐올 상황이나 다음 단계의 흐름입니다.' },
      { label: '내면의 자세',  context: '상황에 대한 당신 자신의 내면적 태도와 입장입니다.' },
      { label: '외부 영향',    context: '주변 환경, 타인, 상황이 당신에게 미치는 영향입니다.' },
      { label: '희망과 두려움', context: '당신이 가장 바라거나 가장 두려워하는 것입니다.' },
      { label: '최종 결과',    context: '모든 에너지가 통합된 후 나타나는 최종 결과입니다.' }
    ]
  }
};

/* ── State ── */
let state = {
  spread: 1,
  question: '',
  drawn: [],        // { card, reversed, revealed }
  revealIdx: 0,
  phase: 'input',
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

const $ = id => document.getElementById(id);

function showToast(msg) {
  const t = $('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}

/* ── Phase management ── */
function showPhase(name) {
  ['phaseDeck', 'phaseSpread', 'phaseMeaning'].forEach(p => {
    const el = $(p);
    if (el) el.style.display = (p === 'phase' + name.charAt(0).toUpperCase() + name.slice(1)) ? '' : 'none';
  });
  state.phase = name;
}

/* ── Card Art Config ── */
const ROMAN = ['0','I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII','XIV','XV','XVI','XVII','XVIII','XIX','XX','XXI'];
const CARD_GRADIENTS = [
  'linear-gradient(160deg,#1a1200 0%,#2d2000 40%,#3d2c00 100%)',  // 0 Fool
  'linear-gradient(160deg,#1a0000 0%,#2d0a0a 40%,#3d1010 100%)',  // 1 Magician
  'linear-gradient(160deg,#0a0018 0%,#150030 40%,#1e0042 100%)',  // 2 Priestess
  'linear-gradient(160deg,#001a08 0%,#002d12 40%,#003d18 100%)',  // 3 Empress
  'linear-gradient(160deg,#1a0000 0%,#3d0a0a 40%,#500000 100%)',  // 4 Emperor
  'linear-gradient(160deg,#14001a 0%,#22003d 40%,#300050 100%)',  // 5 Hierophant
  'linear-gradient(160deg,#1a0008 0%,#3d0015 40%,#500020 100%)',  // 6 Lovers
  'linear-gradient(160deg,#1a1200 0%,#3d2800 40%,#503200 100%)',  // 7 Chariot
  'linear-gradient(160deg,#1a0a00 0%,#3d1800 40%,#502000 100%)',  // 8 Strength
  'linear-gradient(160deg,#0f0f0f 0%,#1a1a1a 40%,#222222 100%)',  // 9 Hermit
  'linear-gradient(160deg,#001a12 0%,#003d28 40%,#005035 100%)',  // 10 Wheel
  'linear-gradient(160deg,#001530 0%,#002d5a 40%,#003d78 100%)',  // 11 Justice
  'linear-gradient(160deg,#0a0018 0%,#18003a 40%,#220050 100%)',  // 12 Hanged
  'linear-gradient(160deg,#050508 0%,#0d0d14 40%,#121218 100%)',  // 13 Death
  'linear-gradient(160deg,#001530 0%,#003060 40%,#004080 100%)',  // 14 Temperance
  'linear-gradient(160deg,#1a0000 0%,#380000 40%,#500000 100%)',  // 15 Devil
  'linear-gradient(160deg,#1a0500 0%,#380a00 40%,#501000 100%)',  // 16 Tower
  'linear-gradient(160deg,#001224 0%,#002a50 40%,#003568 100%)',  // 17 Star
  'linear-gradient(160deg,#0a0018 0%,#160030 40%,#200045 100%)',  // 18 Moon
  'linear-gradient(160deg,#1a1400 0%,#3a2c00 40%,#503c00 100%)',  // 19 Sun
  'linear-gradient(160deg,#1a0800 0%,#381400 40%,#502000 100%)',  // 20 Judgement
  'linear-gradient(160deg,#001a0d 0%,#003820 40%,#005030 100%)',  // 21 World
];

/* ── Card HTML ── */
function buildCardHTML(cardData, pos, idx) {
  const { card, reversed } = cardData;
  const grad = CARD_GRADIENTS[card.num] || CARD_GRADIENTS[0];
  const roman = ROMAN[card.num];
  return `
    <div class="tarot-slot">
      <span class="tarot-slot-label">${pos.label}</span>
      <div class="tarot-card-wrap" data-idx="${idx}" id="tc${idx}">
        <div class="tarot-card-inner">
          <div class="tarot-card-face tarot-card-back-face">
            <div class="card-back-pattern"></div>
            <div class="card-back-center">✦</div>
            <div class="tarot-back-sigil">◈</div>
          </div>
          <div class="tarot-card-face tarot-card-front-face" style="background:${grad}">
            <div class="card-art-frame"></div>
            <div class="card-face-art" style="${reversed ? 'transform:rotate(180deg)' : ''}">
              <span class="card-roman">${roman}</span>
              <span class="card-art-sym" style="filter:drop-shadow(0 0 20px ${card.color}88)">${card.sym}</span>
              <div>
                <div class="card-art-name" style="color:${card.color}">${card.name}</div>
                <div class="card-art-en">${card.en}</div>
              </div>
            </div>
            <div class="card-color-bar" style="background:${card.color}"></div>
            ${reversed ? '<div class="tarot-reversed-badge">역</div>' : ''}
          </div>
        </div>
      </div>
    </div>`;
}

/* ── Meaning item HTML ── */
function buildMeaningHTML(cardData, pos, animDelay) {
  const { card, reversed } = cardData;
  const keywords = (reversed ? card.reversed : card.upright).split(', ');
  return `
    <div class="card-meaning-item" style="animation-delay:${animDelay}ms">
      <div class="cmi-header">
        <span class="cmi-sym">${card.sym}</span>
        <div class="cmi-names">
          <div class="cmi-name-kr" style="color:${card.color}">${card.name}${reversed ? ' <span style="color:#ef4444;font-size:11px">(역방향)</span>' : ''}</div>
          <div class="cmi-name-en">${card.en}</div>
        </div>
        <span class="cmi-position">${pos.label}</span>
      </div>
      <p class="cmi-context">${pos.context}</p>
      <div class="cmi-keyword-row">
        ${keywords.map(k => `<span class="cmi-keyword${reversed ? ' reversed-kw' : ''}">${k.trim()}</span>`).join('')}
      </div>
      <p class="cmi-detail">${card.detail}</p>
    </div>`;
}

/* ── Overall reading synthesis ── */
function generateOverallReading(drawn, config, question) {
  const positions = config.positions;
  const uprightCount  = drawn.filter(d => !d.reversed).length;
  const reversedCount = drawn.length - uprightCount;

  let reading = '';

  if (question) {
    reading += `<strong>"${question}"</strong>에 대한 카드의 메시지입니다.<br><br>`;
  }

  const ratio = uprightCount / drawn.length;
  const energyWord = ratio >= 0.65 ? '긍정적이고 순조로운' :
                     ratio <= 0.35 ? '내면을 돌아보게 하는 도전적인' : '복잡하고 섬세한';

  reading += `이번 리딩의 전체 에너지는 <strong>${energyWord}</strong> 흐름을 나타냅니다. `;

  // First card insight
  if (drawn.length >= 1) {
    const c = drawn[0];
    reading += `${positions[0].label} 자리의 <strong>${c.card.name}</strong>은 ${
      c.reversed ? '역방향으로, ' + c.card.reversed + '의 에너지가 작용하고 있음을 보여줍니다.' :
                   c.card.upright + '의 기운을 전합니다.'
    } `;
  }

  // Last card (outcome) insight
  if (drawn.length >= 3) {
    const outcome = drawn[drawn.length - 1];
    const outPos  = positions[drawn.length - 1];
    reading += `${outPos.label}을 나타내는 <strong>${outcome.card.name}</strong> 카드는 ${
      outcome.reversed ? '역방향으로, ' + outcome.card.reversed + '의 에너지를 시사합니다.' :
                         outcome.card.upright + '의 방향을 가리킵니다.'
    } `;
  }

  // Special card mention
  const highCards = ['세계','태양','별','심판','바보','마법사','여사제'];
  const featured  = drawn.find(d => highCards.includes(d.card.name));
  if (featured) {
    reading += `특히 <strong>${featured.card.name}</strong>의 등장은 주목할 만합니다. ${featured.card.detail} `;
  }

  // Closing advice
  if (ratio >= 0.65) {
    reading += '순방향 카드가 우세하여 상황이 긍정적으로 흘러가고 있습니다. 현재의 방향을 믿고 자신감 있게 나아가세요.';
  } else if (ratio <= 0.35) {
    reading += '역방향 카드가 많아 내면의 걸림돌과 마주할 때입니다. 서두르지 말고 자신을 돌아보며 충분히 성찰하세요.';
  } else {
    reading += '순방향과 역방향이 균형을 이루며 상황의 복잡함을 보여줍니다. 신중하게 판단하며 한 걸음씩 나아가세요.';
  }

  return reading;
}

/* ── Draw cards ── */
function drawCards() {
  const pool = shuffle(TAROT_MAJOR);
  state.drawn = pool.slice(0, state.spread).map(card => ({
    card,
    reversed: Math.random() < 0.3,
    revealed: false,
  }));
  state.revealIdx = 0;
}

/* ── Render spread ── */
function renderSpread() {
  const config = SPREAD_CONFIG[state.spread];
  const spread = $('cardSpread');
  spread.className = `card-spread-grid spread-${state.spread}`;
  spread.innerHTML = state.drawn.map((d, i) => buildCardHTML(d, config.positions[i], i)).join('');
  $('spreadHint').textContent = '카드를 한 장씩 클릭하여 공개하세요';
  showPhase('spread');

  spread.addEventListener('click', e => {
    const wrap = e.target.closest('.tarot-card-wrap');
    if (!wrap) return;
    const idx = parseInt(wrap.dataset.idx);
    if (state.drawn[idx].revealed) return;
    state.drawn[idx].revealed = true;
    wrap.classList.add('revealed');
    state.revealIdx++;
    if (state.revealIdx >= state.spread) {
      $('spreadHint').textContent = '모든 카드가 공개되었습니다 — 스크롤하여 해석을 확인하세요';
      setTimeout(renderMeaning, 1000);
    }
  });
}

/* ── Render meaning ── */
function renderMeaning() {
  const config  = SPREAD_CONFIG[state.spread];
  const panel   = $('meaningPanel');
  const overall = $('overallReading');

  panel.innerHTML = state.drawn.map((d, i) =>
    buildMeaningHTML(d, config.positions[i], i * 80)
  ).join('');

  if (state.spread > 1) {
    const synopsis = generateOverallReading(state.drawn, config, state.question);
    overall.innerHTML = `
      <h3 class="overall-title">✦ 종합 해석</h3>
      <p class="overall-text">${synopsis}</p>`;
    overall.style.display = '';
  } else {
    overall.style.display = 'none';
  }

  $('meaningTitle').textContent = config.title + ' 리딩 결과';
  $('meaningQuestion').textContent = state.question ? `질문: ${state.question}` : '';
  showPhase('meaning');

  setTimeout(() => {
    $('phaseMeaning').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 200);
}

/* ── Reset ── */
function reset() {
  state.drawn = [];
  state.revealIdx = 0;
  state.question = '';
  const qi = $('questionInput');
  if (qi) qi.value = '';

  const intro = document.querySelector('.tarot-intro');
  const qwrap = document.querySelector('.tarot-question-wrap');
  if (intro) intro.style.display = '';
  if (qwrap) qwrap.style.display = '';

  $('phaseDeck').style.display    = 'none';
  $('phaseSpread').style.display  = 'none';
  $('phaseMeaning').style.display = 'none';
  state.phase = 'input';

  setTimeout(() => {
    const intro2 = document.querySelector('.tarot-intro');
    if (intro2) intro2.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 100);
}

/* ── Init ── */
document.addEventListener('DOMContentLoaded', () => {
  $('phaseDeck').style.display    = 'none';
  $('phaseSpread').style.display  = 'none';
  $('phaseMeaning').style.display = 'none';

  $('spreadSelector').addEventListener('click', e => {
    const btn = e.target.closest('.spread-btn');
    if (!btn) return;
    document.querySelectorAll('.spread-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.spread = parseInt(btn.dataset.spread);
  });

  $('drawBtn').addEventListener('click', () => {
    state.question = $('questionInput').value.trim();
    drawCards();
    document.querySelector('.tarot-question-wrap').style.display = 'none';
    document.querySelector('.tarot-intro').style.display = 'none';
    showPhase('deck');
    setTimeout(() => {
      $('phaseDeck').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  });

  $('deckStack').addEventListener('click', () => {
    renderSpread();
    showToast('카드를 한 장씩 클릭하여 공개하세요 ✨');
  });

  $('againBtn').addEventListener('click', reset);
});
