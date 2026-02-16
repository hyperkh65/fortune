'use strict';

/* ================================================================
   오늘의 운세 — Fortune Calculation Engine
   fortune.js
   Deterministic fortune: same zodiac + same date = same result.
================================================================ */

// ── 12 Korean Zodiac Signs (띠) ──────────────────────────────────
const ZODIAC = [
  { id: 'rat',    name: '쥐',   emoji: '🐭', years: [1948,1960,1972,1984,1996,2008,2020], offset: 0  },
  { id: 'ox',     name: '소',   emoji: '🐄', years: [1949,1961,1973,1985,1997,2009,2021], offset: 7  },
  { id: 'tiger',  name: '호랑이',emoji: '🐯', years: [1950,1962,1974,1986,1998,2010,2022], offset: 14 },
  { id: 'rabbit', name: '토끼', emoji: '🐰', years: [1951,1963,1975,1987,1999,2011,2023], offset: 21 },
  { id: 'dragon', name: '용',   emoji: '🐉', years: [1952,1964,1976,1988,2000,2012,2024], offset: 28 },
  { id: 'snake',  name: '뱀',   emoji: '🐍', years: [1953,1965,1977,1989,2001,2013,2025], offset: 35 },
  { id: 'horse',  name: '말',   emoji: '🐴', years: [1954,1966,1978,1990,2002,2014,2026], offset: 42 },
  { id: 'goat',   name: '양',   emoji: '🐑', years: [1955,1967,1979,1991,2003,2015,2027], offset: 49 },
  { id: 'monkey', name: '원숭이',emoji: '🐵', years: [1956,1968,1980,1992,2004,2016,2028], offset: 56 },
  { id: 'rooster',name: '닭',   emoji: '🐔', years: [1957,1969,1981,1993,2005,2017,2029], offset: 63 },
  { id: 'dog',    name: '개',   emoji: '🐶', years: [1958,1970,1982,1994,2006,2018,2030], offset: 70 },
  { id: 'pig',    name: '돼지', emoji: '🐷', years: [1959,1971,1983,1995,2007,2019,2031], offset: 77 },
];

// ── Lucky Colors ─────────────────────────────────────────────────
const LUCKY_COLORS = [
  { name: '보라색',  hex: '#8b5cf6', shadow: 'rgba(139,92,246,0.6)'  },
  { name: '금색',    hex: '#f4d03f', shadow: 'rgba(244,208,63,0.6)'  },
  { name: '붉은색',  hex: '#ef4444', shadow: 'rgba(239,68,68,0.6)'   },
  { name: '하늘색',  hex: '#38bdf8', shadow: 'rgba(56,189,248,0.6)'  },
  { name: '초록색',  hex: '#4ade80', shadow: 'rgba(74,222,128,0.6)'  },
  { name: '주황색',  hex: '#fb923c', shadow: 'rgba(251,146,60,0.6)'  },
  { name: '흰색',    hex: '#e8e0ff', shadow: 'rgba(232,224,255,0.4)' },
  { name: '분홍색',  hex: '#f472b6', shadow: 'rgba(244,114,182,0.6)' },
  { name: '남색',    hex: '#6366f1', shadow: 'rgba(99,102,241,0.6)'  },
  { name: '갈색',    hex: '#a16207', shadow: 'rgba(161,98,7,0.6)'    },
  { name: '은색',    hex: '#94a3b8', shadow: 'rgba(148,163,184,0.6)' },
  { name: '청록색',  hex: '#2dd4bf', shadow: 'rgba(45,212,191,0.6)'  },
];

// ── Lucky Directions ─────────────────────────────────────────────
const DIRECTIONS = ['동쪽', '서쪽', '남쪽', '북쪽', '동남쪽', '동북쪽', '서남쪽', '서북쪽', '중앙'];

// ── Day-of-week Korean names ──────────────────────────────────────
const DAY_KR = ['일', '월', '화', '수', '목', '금', '토'];

// ── Day symbols (moon phases / celestial symbols) ────────────────
const DAY_SYMBOLS = ['🌑','🌒','🌓','🌔','🌕','🌖','🌗','🌘'];

// ── 30+ Korean advice strings per category ───────────────────────
const ADVICE_POOL = {
  love: [
    '진심을 담은 한 마디가 큰 변화를 만듭니다.',
    '상대의 마음에 귀 기울이는 하루가 되세요.',
    '작은 배려가 관계를 깊게 합니다.',
    '새로운 인연이 예상치 못한 곳에서 찾아올 수 있습니다.',
    '오해가 있다면 솔직한 대화로 풀어가세요.',
    '혼자만의 시간도 사랑을 키우는 밑거름입니다.',
    '감사의 말을 아끼지 마세요.',
    '첫 인상보다 지속적인 관심이 중요합니다.',
    '마음을 열고 다가가면 좋은 결과가 있습니다.',
    '과거에 얽매이지 말고 현재에 집중하세요.',
    '연인과의 특별한 계획이 좋은 기억을 만들 것입니다.',
    '상대의 작은 노력을 인정해 주세요.',
    '감정 표현을 조금 더 솔직하게 해보세요.',
    '새로운 만남에 마음을 열어두세요.',
    '진정한 행복은 함께할 때 빛납니다.',
    '오늘은 먼저 연락을 해보는 것이 좋습니다.',
    '자신을 사랑해야 남도 사랑할 수 있습니다.',
    '기다림도 사랑의 한 형태입니다.',
    '상대에게 당신의 진심을 보여주세요.',
    '인연은 억지로 만드는 것이 아닙니다.',
    '지금 이 순간을 소중히 여기세요.',
    '마음속 이야기를 용기 내어 전해보세요.',
    '두려움보다 설렘에 집중하세요.',
    '관계는 서로의 노력으로 성장합니다.',
    '작은 약속도 소중히 지켜주세요.',
    '사랑은 완벽함이 아닌 온전함을 원합니다.',
    '오늘의 친절이 내일의 인연이 됩니다.',
    '즐거운 추억 만들기에 집중해 보세요.',
    '상대의 꿈을 응원해주세요.',
    '사랑받고 싶다면 먼저 사랑을 주세요.',
  ],
  money: [
    '충동적인 지출을 삼가고 계획적으로 관리하세요.',
    '작은 저축이 큰 부를 만드는 첫걸음입니다.',
    '예상치 못한 수입이 생길 수 있는 날입니다.',
    '투자보다 현금 보유가 유리한 시기입니다.',
    '공동 투자나 동업은 신중하게 검토하세요.',
    '지출 내역을 꼼꼼히 확인해 보는 것이 좋습니다.',
    '가까운 사람과의 금전 거래는 피하세요.',
    '새로운 수익 창출 방법을 고민해보세요.',
    '절약이 최고의 투자입니다.',
    '오늘은 큰 금액의 결정은 미루는 것이 좋습니다.',
    '기회가 보이면 망설이지 말고 도전하세요.',
    '재테크 공부를 시작하기 좋은 날입니다.',
    '불필요한 구독 서비스를 정리해 보세요.',
    '뜻밖의 선물이나 이득이 생길 수 있습니다.',
    '재정 계획을 새롭게 세워보는 것이 좋습니다.',
    '지인의 금전 부탁에 신중하게 대응하세요.',
    '중고 거래나 절약 방법을 찾아보세요.',
    '수입보다 지출에 더 신경 쓰는 날입니다.',
    '장기적인 관점으로 재정을 관리하세요.',
    '오늘의 작은 선택이 미래의 큰 차이를 만듭니다.',
    '정당한 방법으로 얻는 수익이 오래갑니다.',
    '고수익 고위험 투자는 지금 시기에 맞지 않습니다.',
    '협력과 나눔이 더 큰 풍요를 불러옵니다.',
    '낭비하는 습관을 점검해 볼 때입니다.',
    '부업이나 추가 수입 방법을 모색해 보세요.',
    '경제적 기초를 탄탄히 다져두세요.',
    '마음의 여유가 재정의 여유를 만듭니다.',
    '비상금 통장을 만들어 두는 것이 좋습니다.',
    '타인의 재정 조언은 참고만 하세요.',
    '이익보다 신뢰를 쌓는 것이 우선입니다.',
  ],
  health: [
    '충분한 수분 섭취로 몸의 균형을 유지하세요.',
    '무리한 운동보다 가벼운 스트레칭이 도움됩니다.',
    '충분한 수면이 오늘의 건강을 좌우합니다.',
    '식사를 거르지 말고 규칙적으로 드세요.',
    '마음의 평화가 몸의 건강으로 이어집니다.',
    '소화기 건강에 특별히 주의하세요.',
    '허리와 어깨 스트레칭을 꼭 챙기세요.',
    '오래 앉아 있는 것을 피하고 자주 일어나세요.',
    '과음이나 과식은 피하는 것이 좋습니다.',
    '자연 속 산책이 에너지를 회복시킵니다.',
    '스트레스 해소 방법을 찾아보세요.',
    '눈의 피로를 풀어주는 시간을 가지세요.',
    '감기나 독감에 주의하는 하루입니다.',
    '영양 균형이 잡힌 식사가 중요합니다.',
    '무리하지 않고 적당히 쉬어가세요.',
    '긍정적인 생각이 면역력을 높입니다.',
    '정기 건강검진을 고려해 보세요.',
    '피로가 쌓이지 않도록 관리하세요.',
    '요가나 명상으로 심신을 안정시키세요.',
    '오늘은 몸이 원하는 대로 따르세요.',
    '과로를 삼가고 적절한 휴식을 취하세요.',
    '편식 없는 균형 잡힌 식단을 유지하세요.',
    '체온 관리에 신경 쓰는 날입니다.',
    '좋아하는 활동으로 기분 전환을 해보세요.',
    '주변 환경 정리가 마음의 정리가 됩니다.',
    '숙면을 위해 취침 전 핸드폰을 멀리 하세요.',
    '작은 운동이라도 꾸준히 실천하세요.',
    '정신 건강도 신체 건강만큼 중요합니다.',
    '물 한 잔의 여유가 하루를 바꿉니다.',
    '자신의 몸 상태에 귀 기울이세요.',
  ],
  career: [
    '적극적인 자세가 좋은 기회를 만들어 줍니다.',
    '동료와의 협력이 큰 성과를 냅니다.',
    '새로운 프로젝트에 도전할 좋은 타이밍입니다.',
    '꼼꼼한 마무리가 신뢰를 쌓습니다.',
    '상사나 선배의 조언에 귀를 기울이세요.',
    '서두르지 말고 단계적으로 나아가세요.',
    '창의적인 아이디어가 빛나는 날입니다.',
    '인내심을 갖고 결과를 기다리세요.',
    '자신의 강점을 적극 활용해 보세요.',
    '팀워크가 개인 역량보다 중요한 시기입니다.',
    '작은 성취도 크게 인정해 주세요.',
    '직장 내 인간관계에 더 신경 쓰세요.',
    '중요한 결정은 충분히 검토 후 내리세요.',
    '새로운 기술이나 지식 습득이 유리합니다.',
    '오늘의 노력이 내일의 성공을 만듭니다.',
    '불필요한 갈등은 피하고 화합을 추구하세요.',
    '네트워킹이 중요한 성과를 가져올 수 있습니다.',
    '멘토에게 조언을 구해보는 것도 좋습니다.',
    '완벽보다 완성을 목표로 하세요.',
    '업무 우선순위를 명확히 정해두세요.',
    '자신감을 갖고 발언하면 인정받을 수 있습니다.',
    '피드백을 두려워하지 말고 성장의 발판으로 삼으세요.',
    '오늘은 집중력이 높은 시간을 잘 활용하세요.',
    '전문성을 키우는 것이 장기적으로 유리합니다.',
    '예상치 못한 기회가 찾아올 수 있습니다.',
    '스스로의 가치를 낮게 평가하지 마세요.',
    '꾸준한 노력이 결국 빛을 발합니다.',
    '목표를 명확히 설정하고 집중하세요.',
    '다양한 관점을 수용하는 유연성이 필요합니다.',
    '오늘 한 가지 성과를 이루는 것을 목표로 하세요.',
  ],
  study: [
    '집중력이 높아지는 좋은 날입니다.',
    '어려운 내용에 도전해 보는 것이 좋습니다.',
    '반복 학습이 기억력을 강화합니다.',
    '스터디 그룹 활동이 효과적인 날입니다.',
    '잠깐의 휴식이 집중력을 회복시킵니다.',
    '새로운 학습법을 시도해 보세요.',
    '기초부터 탄탄히 다지는 것이 중요합니다.',
    '오늘 배운 것을 정리해 두면 도움이 됩니다.',
    '책 한 권을 완독해 보는 것을 목표로 하세요.',
    '질문하는 것을 두려워하지 마세요.',
    '시험이 있다면 요약 정리가 효과적입니다.',
    '몰입하는 공부 시간을 확보하세요.',
    '인터넷 강의나 새로운 교재를 활용해 보세요.',
    '학습 계획을 세우면 더 효율적입니다.',
    '지식의 즐거움을 느끼는 하루가 되세요.',
    '오늘 배운 것을 실생활에 적용해 보세요.',
    '목표를 작게 나누면 성취감이 높아집니다.',
    '꾸준한 독서가 사고력을 키웁니다.',
    '외국어 공부에 도전해보기 좋은 날입니다.',
    '복습이 새로운 학습보다 중요할 수 있습니다.',
    '좋아하는 과목부터 시작해 동력을 키우세요.',
    '학습 환경을 정리하면 집중이 잘 됩니다.',
    '암기보다 이해 중심의 공부가 효과적입니다.',
    '멀리 보는 시야로 공부의 목적을 상기하세요.',
    '하루 한 가지 새로운 것을 배우는 것이 목표입니다.',
    '지식은 나눌수록 더 깊어집니다.',
    '집중이 어렵다면 짧은 공부 간격을 활용하세요.',
    '관심 분야를 깊이 파고드는 날입니다.',
    '긍정적인 마음으로 배움에 임하세요.',
    '오늘의 공부가 미래의 나를 만듭니다.',
  ],
};

// ── Daily inspirational quotes ────────────────────────────────────
const DAILY_QUOTES = [
  '하늘은 스스로 돕는 자를 돕는다.',
  '천 리 길도 한 걸음부터 시작됩니다.',
  '지금 이 순간이 가장 중요한 시간입니다.',
  '작은 씨앗이 큰 나무가 됩니다.',
  '어제보다 오늘, 오늘보다 내일이 더 빛날 것입니다.',
  '흔들리지 않는 뿌리가 하늘 높이 자랍니다.',
  '당신의 가능성은 무한합니다.',
  '모든 시작은 용기에서 비롯됩니다.',
  '물이 바위를 뚫는 것은 힘이 아닌 꾸준함입니다.',
  '빛은 어둠이 있어야 빛납니다.',
  '오늘의 나는 어제의 나보다 한 걸음 앞에 있습니다.',
  '기회는 준비된 자에게 찾아옵니다.',
  '별은 어두울수록 더 밝게 빛납니다.',
  '인생은 속도가 아닌 방향입니다.',
  '봄꽃이 피기 전 추위를 견뎌야 합니다.',
  '오늘의 작은 노력이 내일의 기적이 됩니다.',
  '마음이 가는 곳에 길이 생깁니다.',
  '지혜로운 자는 역경 속에서 기회를 봅니다.',
  '당신이 있는 곳에서 꽃을 피우세요.',
  '두려움은 도전의 시작점입니다.',
];

// ── Overall fortune labels by score range ────────────────────────
const OVERALL_LABELS = [
  { min: 80, text: '오늘은 매우 길한 날입니다. 자신감을 가지고 원하는 것에 도전하세요.' },
  { min: 65, text: '대체로 좋은 기운이 흐릅니다. 적극적으로 움직이면 좋은 결과가 있습니다.' },
  { min: 50, text: '평온한 하루입니다. 무리하지 말고 차분하게 임하세요.' },
  { min: 35, text: '조심스러운 날입니다. 중요한 결정은 신중하게 내리세요.' },
  { min:  0, text: '오늘은 쉬어가는 날로 삼으세요. 내실을 다지는 것이 좋습니다.' },
];

/* ================================================================
   SEEDED PSEUDO-RANDOM NUMBER GENERATOR
   LCG (Linear Congruential Generator) — deterministic
================================================================ */

/**
 * Returns a pseudo-random float in [0, 1) given an integer seed.
 * Each call advances the state and returns the next value.
 * We use a closure-based state so each fortune calculation
 * gets its own private sequence.
 */
function createRng(seed) {
  // Ensure seed is a positive integer
  let state = (seed >>> 0) || 1;
  return function next() {
    // LCG parameters from Numerical Recipes
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

/** Convert a date to an integer seed: YYYYMMDD */
function dateSeed(date) {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  return y * 10000 + m * 100 + d;
}

/** Blend two consecutive day seeds for smooth day-to-day transitions */
function blendedDaySeed(zodiacOffset, date) {
  const base = dateSeed(date);
  return base * 97 + zodiacOffset * 1000003;
}

/* ================================================================
   FORTUNE CALCULATION
================================================================ */

/**
 * Calculate fortune for a zodiac sign on a given date.
 * Returns scores in range 0–100, plus lucky items.
 */
function calcFortune(zodiacId, date) {
  const zodiac = ZODIAC.find(z => z.id === zodiacId);
  if (!zodiac) return null;

  const seed = blendedDaySeed(zodiac.offset, date);
  const rng  = createRng(seed);

  // --- Smooth day-to-day variation using multiple sine waves ---
  const ds   = dateSeed(date);
  const zo   = zodiac.offset;

  // Base score: composite of slow and fast cycles per zodiac
  function waveScore(phaseShift) {
    const t = ds / 365.25; // year fraction position
    const s1 = Math.sin((t * 13.7 + phaseShift * 0.3) * Math.PI * 2) * 18;
    const s2 = Math.sin((t * 7.3  + phaseShift * 0.7) * Math.PI * 2) * 12;
    const s3 = Math.sin((t * 3.1  + phaseShift * 1.1) * Math.PI * 2) * 8;
    const noise = (rng() - 0.5) * 14;
    return 58 + s1 + s2 + s3 + noise;
  }

  const rng2 = createRng(seed + 1);
  const rng3 = createRng(seed + 2);
  const rng4 = createRng(seed + 3);
  const rng5 = createRng(seed + 4);
  const rng6 = createRng(seed + 5);

  function clamp(v) { return Math.max(10, Math.min(97, Math.round(v))); }

  const overall = clamp(waveScore(zo));
  const love    = clamp(58 + Math.sin((ds * 0.031 + zo * 0.11) * Math.PI) * 22 + (rng2() - 0.5) * 20);
  const money   = clamp(55 + Math.sin((ds * 0.023 + zo * 0.17) * Math.PI) * 20 + (rng3() - 0.5) * 20);
  const health  = clamp(62 + Math.sin((ds * 0.041 + zo * 0.09) * Math.PI) * 18 + (rng4() - 0.5) * 16);
  const career  = clamp(56 + Math.sin((ds * 0.019 + zo * 0.13) * Math.PI) * 24 + (rng5() - 0.5) * 18);
  const study   = clamp(54 + Math.sin((ds * 0.027 + zo * 0.21) * Math.PI) * 22 + (rng6() - 0.5) * 20);

  // Lucky items — seeded so same day+zodiac always gives same results
  const rngL  = createRng(seed + 99);
  const colorIdx  = Math.floor(rngL() * LUCKY_COLORS.length);
  const numA  = Math.floor(rngL() * 9) + 1;
  const numB  = Math.floor(rngL() * 9) + 1;
  const dirIdx = Math.floor(rngL() * DIRECTIONS.length);

  // Advice text — pick one per category
  const rngA   = createRng(seed + 200);
  const advice = {
    love:   ADVICE_POOL.love[Math.floor(rngA() * ADVICE_POOL.love.length)],
    money:  ADVICE_POOL.money[Math.floor(rngA() * ADVICE_POOL.money.length)],
    health: ADVICE_POOL.health[Math.floor(rngA() * ADVICE_POOL.health.length)],
    career: ADVICE_POOL.career[Math.floor(rngA() * ADVICE_POOL.career.length)],
    study:  ADVICE_POOL.study[Math.floor(rngA() * ADVICE_POOL.study.length)],
  };

  // Daily quote
  const rngQ = createRng(seed + 300);
  const quote = DAILY_QUOTES[Math.floor(rngQ() * DAILY_QUOTES.length)];

  return {
    zodiac,
    overall, love, money, health, career, study,
    lucky_color:     LUCKY_COLORS[colorIdx],
    lucky_number:    numA === numB ? `${numA}, ${numA + 3}` : `${numA}, ${numB}`,
    lucky_direction: DIRECTIONS[dirIdx],
    advice,
    quote,
  };
}

/** Get star count (1–5) from a score 0–100 */
function scoreToStars(score) {
  if (score >= 85) return 5;
  if (score >= 70) return 4;
  if (score >= 55) return 3;
  if (score >= 40) return 2;
  return 1;
}

/** Get overall label text from score */
function getOverallLabel(score) {
  for (const entry of OVERALL_LABELS) {
    if (score >= entry.min) return entry.text;
  }
  return OVERALL_LABELS[OVERALL_LABELS.length - 1].text;
}

/* ================================================================
   WEEKLY FORTUNE
================================================================ */

/** Return array of 7 fortune objects for Mon→Sun of the current week */
function getWeeklyFortune(zodiacId) {
  const today = new Date();
  const todayIdx = today.getDay(); // 0=Sun
  const results = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - todayIdx + i); // Sun=0 … Sat=6
    const f = calcFortune(zodiacId, d);
    results.push({
      date:    d,
      dayName: DAY_KR[d.getDay()] + '요일',
      dayNum:  d.getDate(),
      overall: f ? f.overall : 50,
      isToday: d.toDateString() === today.toDateString(),
    });
  }
  return results;
}

/* ================================================================
   LUNAR DATE APPROXIMATION
   (Simple Metonic-cycle approximation — not a full astronomical calc)
================================================================ */
function getLunarDate(date) {
  // Days since a known new moon (Jan 1, 2000 was approx lunar 25th, 11th month)
  const knownNewMoon = new Date(2000, 0, 6); // Jan 6, 2000 = New Moon
  const msPerDay     = 86400000;
  const lunarMonth   = 29.53058867;

  const daysSince = (date - knownNewMoon) / msPerDay;
  const lunarDayF = ((daysSince % lunarMonth) + lunarMonth) % lunarMonth;
  const lunarDay  = Math.floor(lunarDayF) + 1;

  // Approximate lunar month by cycling
  const totalMonths  = Math.floor(daysSince / lunarMonth);
  const lunarMonth12 = ((totalMonths % 12) + 12) % 12 + 1;

  const monthNames = ['정월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];
  const dayDesc    = lunarDay <= 10 ? `초${lunarDay}일` : `${lunarDay}일`;

  return `음력 ${monthNames[lunarMonth12 - 1]} ${dayDesc}`;
}

/* ================================================================
   UI RENDER FUNCTIONS
================================================================ */

function renderZodiacGrid() {
  const grid = document.getElementById('zodiacGrid');
  if (!grid) return;
  grid.innerHTML = '';
  ZODIAC.forEach(z => {
    const btn = document.createElement('button');
    btn.className = 'zodiac-btn';
    btn.dataset.id = z.id;
    btn.setAttribute('aria-label', z.name + ' 띠 선택');
    btn.innerHTML = `
      <span class="zodiac-emoji">${z.emoji}</span>
      <span class="zodiac-name">${z.name}</span>
    `;
    btn.addEventListener('click', () => selectZodiac(z.id));
    grid.appendChild(btn);
  });
}

function renderDateDisplay() {
  const today = new Date();
  const weekDays = ['일요일','월요일','화요일','수요일','목요일','금요일','토요일'];
  const months   = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];

  const solarStr = `${today.getFullYear()}년 ${months[today.getMonth()]} ${today.getDate()}일 ${weekDays[today.getDay()]}`;
  const lunarStr  = getLunarDate(today);

  const solarEl  = document.getElementById('solarDate');
  const lunarEl  = document.getElementById('lunarDate');
  const symbolEl = document.getElementById('daySymbol');

  if (solarEl)  solarEl.textContent  = solarStr;
  if (lunarEl)  lunarEl.textContent  = lunarStr;

  // Moon phase symbol based on lunar day
  const msPerDay    = 86400000;
  const lunarMonth  = 29.53058867;
  const knownNewMoon= new Date(2000, 0, 6);
  const daysSince   = (today - knownNewMoon) / msPerDay;
  const lunarDayF   = ((daysSince % lunarMonth) + lunarMonth) % lunarMonth;
  const phaseIdx    = Math.floor((lunarDayF / lunarMonth) * DAY_SYMBOLS.length);
  if (symbolEl) symbolEl.textContent = DAY_SYMBOLS[phaseIdx];
}

function renderFortune(zodiacId) {
  const today   = new Date();
  const fortune = calcFortune(zodiacId, today);
  if (!fortune) return;

  // Update zodiac display
  const emojiEl = document.getElementById('resultEmoji');
  const nameEl  = document.getElementById('resultName');
  if (emojiEl) emojiEl.textContent = fortune.zodiac.emoji;
  if (nameEl)  nameEl.textContent  = fortune.zodiac.name + '띠';

  // Star rating
  const stars = scoreToStars(fortune.overall);
  const starEls = document.querySelectorAll('#starRating .star');
  starEls.forEach((el, i) => {
    if (i < stars) {
      el.classList.add('lit');
    } else {
      el.classList.remove('lit');
    }
  });

  // Overall percentage
  const pctEl = document.getElementById('overallPct');
  if (pctEl) pctEl.textContent = fortune.overall + '%';

  // Overall label
  const labelEl = document.getElementById('overallLabel');
  if (labelEl) labelEl.textContent = getOverallLabel(fortune.overall);

  // Categories
  const categories = [
    { key: 'love',   label: '애정운', icon: '💕', score: fortune.love,   barClass: 'bar-love',   text: fortune.advice.love   },
    { key: 'money',  label: '재물운', icon: '💰', score: fortune.money,  barClass: 'bar-money',  text: fortune.advice.money  },
    { key: 'health', label: '건강운', icon: '💪', score: fortune.health, barClass: 'bar-health', text: fortune.advice.health },
    { key: 'career', label: '직업운', icon: '💼', score: fortune.career, barClass: 'bar-career', text: fortune.advice.career },
    { key: 'study',  label: '학업운', icon: '📚', score: fortune.study,  barClass: 'bar-study',  text: fortune.advice.study  },
  ];

  const catList = document.getElementById('categoryList');
  if (catList) {
    catList.innerHTML = '';
    categories.forEach(cat => {
      const row = document.createElement('div');
      row.className = 'category-row';
      row.innerHTML = `
        <div class="category-top">
          <span class="category-name">
            <span class="category-icon">${cat.icon}</span>
            ${cat.label}
          </span>
          <span class="category-pct">${cat.score}%</span>
        </div>
        <div class="category-bar-track">
          <div class="category-bar-fill ${cat.barClass}" data-width="${cat.score}" style="width:0%"></div>
        </div>
        <p class="category-text">${cat.text}</p>
      `;
      catList.appendChild(row);
    });
    // Animate bars after a tick
    requestAnimationFrame(() => {
      setTimeout(() => {
        catList.querySelectorAll('.category-bar-fill').forEach(bar => {
          bar.style.width = bar.dataset.width + '%';
        });
      }, 80);
    });
  }

  // Lucky items
  const luckyGrid = document.getElementById('luckyGrid');
  if (luckyGrid) {
    const { lucky_color, lucky_number, lucky_direction } = fortune;
    luckyGrid.innerHTML = `
      <div class="lucky-item-fortune">
        <div class="lucky-item-icon">🎨</div>
        <div class="lucky-item-label">행운의 색</div>
        <div class="lucky-item-val">
          <span class="lucky-color-dot" style="background:${lucky_color.hex};box-shadow:0 0 8px ${lucky_color.shadow}"></span>${lucky_color.name}
        </div>
      </div>
      <div class="lucky-item-fortune">
        <div class="lucky-item-icon">🔢</div>
        <div class="lucky-item-label">행운의 숫자</div>
        <div class="lucky-item-val">${lucky_number}</div>
      </div>
      <div class="lucky-item-fortune">
        <div class="lucky-item-icon">🧭</div>
        <div class="lucky-item-label">행운의 방향</div>
        <div class="lucky-item-val">${lucky_direction}</div>
      </div>
      <div class="lucky-item-fortune">
        <div class="lucky-item-icon">⭐</div>
        <div class="lucky-item-label">오늘의 별자리</div>
        <div class="lucky-item-val">${scoreToStars(fortune.overall)}성</div>
      </div>
    `;
  }

  // Daily message
  const quoteEl  = document.getElementById('messageQuote');
  const adviceEl = document.getElementById('messageAdvice');

  // Pick a second advice to use as the message body
  const rngM = createRng(blendedDaySeed(fortune.zodiac.offset, today) + 500);
  const categories2 = ['love','money','health','career','study'];
  const chosenCat = categories2[Math.floor(rngM() * categories2.length)];
  const msgAdvice = ADVICE_POOL[chosenCat][Math.floor(rngM() * ADVICE_POOL[chosenCat].length)];

  if (quoteEl)  quoteEl.textContent  = `"${fortune.quote}"`;
  if (adviceEl) adviceEl.textContent = msgAdvice;

  // Advice list (3 items)
  const adviceList = document.getElementById('adviceList');
  if (adviceList) {
    const rngAL = createRng(blendedDaySeed(fortune.zodiac.offset, today) + 600);
    const adviceItems = [
      { icon: '🌅', cat: 'career' },
      { icon: '🌿', cat: 'health' },
      { icon: '💡', cat: 'study'  },
    ];
    adviceList.innerHTML = '';
    adviceItems.forEach(item => {
      const pool = ADVICE_POOL[item.cat];
      const text = pool[Math.floor(rngAL() * pool.length)];
      const el = document.createElement('div');
      el.className = 'advice-item';
      el.innerHTML = `<span class="advice-item-icon">${item.icon}</span><span>${text}</span>`;
      adviceList.appendChild(el);
    });
  }
}

function renderWeekly(zodiacId) {
  const weeklyGrid = document.getElementById('weeklyGrid');
  if (!weeklyGrid) return;

  const weekly = getWeeklyFortune(zodiacId);
  weeklyGrid.innerHTML = '';

  weekly.forEach(day => {
    const stars = scoreToStars(day.overall);
    const starStr = '★'.repeat(stars) + '☆'.repeat(5 - stars);
    const el = document.createElement('div');
    el.className = 'weekly-day' + (day.isToday ? ' today' : '');
    el.innerHTML = `
      <span class="weekly-day-name">${DAY_KR[day.date.getDay()]}</span>
      <span class="weekly-date-num">${day.dayNum}</span>
      <span class="weekly-mini-stars">${starStr}</span>
      <span class="weekly-mini-pct">${day.overall}%</span>
    `;
    weeklyGrid.appendChild(el);
  });
}

/* ================================================================
   ZODIAC SELECTION & STATE
================================================================ */

function selectZodiac(zodiacId) {
  // Highlight selected button
  document.querySelectorAll('.zodiac-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.id === zodiacId);
  });

  // Persist selection
  try {
    localStorage.setItem('fortune_zodiac', zodiacId);
  } catch (e) { /* ignore */ }

  // Show result section
  const prompt = document.getElementById('selectPrompt');
  const result = document.getElementById('fortuneResult');
  if (prompt) prompt.style.display = 'none';
  if (result) {
    result.classList.add('visible');
    // Re-trigger animation
    result.style.animation = 'none';
    result.offsetHeight; // reflow
    result.style.animation = '';
  }

  renderFortune(zodiacId);
  renderWeekly(zodiacId);
}

function loadSavedZodiac() {
  try {
    const saved = localStorage.getItem('fortune_zodiac');
    if (saved && ZODIAC.find(z => z.id === saved)) {
      return saved;
    }
  } catch (e) { /* ignore */ }
  return null;
}

/* ================================================================
   TOAST HELPER
================================================================ */
function showToast(msg, duration) {
  duration = duration || 2200;
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), duration);
}

/* ================================================================
   INIT
================================================================ */
document.addEventListener('DOMContentLoaded', function () {
  renderDateDisplay();
  renderZodiacGrid();

  const saved = loadSavedZodiac();
  if (saved) {
    // Restore last selection
    selectZodiac(saved);
    showToast(ZODIAC.find(z => z.id === saved).name + '띠 운세를 불러왔습니다 ✨');
  }
});
