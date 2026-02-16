/* ======================================================
   AI Fortune — Saju Engine + UI
   ====================================================== */
'use strict';

/* ──────────────────────────────────────
   SAJU DATA TABLES
────────────────────────────────────── */
const STEMS   = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
const BRANCHES= ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
const STEMS_KOR   = ['갑','을','병','정','무','기','경','신','임','계'];
const BRANCHES_KOR= ['자','축','인','묘','진','사','오','미','신','유','술','해'];

/* 오행: 0=木 1=火 2=土 3=金 4=水 */
const STEM_ELEM  = [0,0,1,1,2,2,3,3,4,4];
const BRANCH_ELEM= [4,2,0,0,2,1,1,2,3,3,2,4];
// 子丑寅卯辰巳午未申酉戌亥

const ELEM_COLOR = ['var(--wood)','var(--fire)','var(--earth)','var(--metal)','var(--water)'];
const ELEM_NAME  = ['木','火','土','金','水'];
const ELEM_KOR   = ['목(木)','화(火)','토(土)','금(金)','수(水)'];
const ELEM_NATURE= ['나무','불','흙','쇠','물'];
const ELEM_SEASON= ['봄','여름','환절기','가을','겨울'];
const ELEM_DIR   = ['동쪽','남쪽','중앙','서쪽','북쪽'];
const ELEM_COLOR_NAME=['초록','붉은','황금','흰색','검정'];

/* 십성 (Ten Gods): row=일간 elem, col=target elem */
const SIPSUNG_TABLE = [
  // 木=0 火=1 土=2 金=3 水=4
  ['비견·겁재','식신·상관','편재·정재','편관·정관','편인·정인'], // 木일간
  ['편인·정인','비견·겁재','식신·상관','편재·정재','편관·정관'], // 火일간
  ['편관·정관','편인·정인','비견·겁재','식신·상관','편재·정재'], // 土일간
  ['편재·정재','편관·정관','편인·정인','비견·겁재','식신·상관'], // 金일간
  ['식신·상관','편재·정재','편관·정관','편인·정인','비견·겁재'], // 水일간
];
const SIPSUNG_SIMPLE = ['비겁','식상','재성','관성','인성'];
const SIPSUNG_DESC   = [
  '비겁 — 나와 같은 오행. 경쟁·형제·독립심',
  '식상 — 내가 생하는 오행. 표현·창의·말재주',
  '재성 — 내가 극하는 오행. 재물·여자(남성 기준)·실용',
  '관성 — 나를 극하는 오행. 직업·남자(여성 기준)·규율',
  '인성 — 나를 생하는 오행. 학문·어머니·보호',
];

/* ──────────────────────────────────────
   FORTUNE FLOW MATRIX
   fortune[dayMasterElem][periodElem] = base score 0-100
────────────────────────────────────── */
const FORTUNE_MATRIX = [
  [55, 70, 60, 30, 78], // 木일간
  [78, 55, 70, 60, 30], // 火일간
  [30, 78, 55, 70, 60], // 土일간
  [60, 30, 78, 55, 70], // 金일간
  [70, 60, 30, 78, 55], // 水일간
];

/* 오행 상생상극 */
const GENERATES = [1,2,3,4,0]; // 木生火, 火生土, 土生金, 金生水, 水生木
const CONTROLS  = [2,3,4,0,1]; // 木克土, 火克金, 土克水, 金克木, 水克火

/* ──────────────────────────────────────
   LOCATIONS (KST 대비 동경시 보정, 단위:분)
────────────────────────────────────── */
const LOCATIONS = [
  {n:'서울',  o:-32}, {n:'인천',  o:-32}, {n:'수원',  o:-32},
  {n:'고양',  o:-32}, {n:'성남',  o:-32}, {n:'부천',  o:-33},
  {n:'부산',  o:-30}, {n:'울산',  o:-30}, {n:'대구',  o:-32},
  {n:'대전',  o:-34}, {n:'광주',  o:-36}, {n:'창원',  o:-31},
  {n:'청주',  o:-33}, {n:'전주',  o:-35}, {n:'천안',  o:-33},
  {n:'제주',  o:-34}, {n:'목포',  o:-37}, {n:'포항',  o:-29},
  {n:'강릉',  o:-29}, {n:'춘천',  o:-31}, {n:'원주',  o:-32},
  {n:'해외 (보정 없음)', o:0},
];

/* ──────────────────────────────────────
   SAJU CALCULATION ENGINE
────────────────────────────────────── */

function daysSinceEpoch(y, m, d) {
  // Jan 1, 1900 = epoch day 0 = 甲戌 (stem=0, branch=10)
  const epoch = Date.UTC(1900, 0, 1);
  const target = Date.UTC(y, m - 1, d);
  return Math.floor((target - epoch) / 86400000);
}

function getYearPillar(year) {
  // 1984=甲子 (stem=0, branch=0)
  const s = ((year - 1984) % 10 + 10) % 10;
  const b = ((year - 1984) % 12 + 12) % 12;
  return { s, b };
}

function getMonthBranch(year, month, day) {
  // Approximate solar term dates (절입일)
  // Returns branch index for the 절기 month
  const terms = [
    { m:1,  d:6,  b:1  }, // 소한 → 丑월
    { m:2,  d:4,  b:2  }, // 입춘 → 寅월
    { m:3,  d:6,  b:3  }, // 경칩 → 卯월
    { m:4,  d:5,  b:4  }, // 청명 → 辰월
    { m:5,  d:6,  b:5  }, // 입하 → 巳월
    { m:6,  d:6,  b:6  }, // 망종 → 午월
    { m:7,  d:7,  b:7  }, // 소서 → 未월
    { m:8,  d:7,  b:8  }, // 입추 → 申월
    { m:9,  d:8,  b:9  }, // 백로 → 酉월
    { m:10, d:8,  b:10 }, // 한로 → 戌월
    { m:11, d:7,  b:11 }, // 입동 → 亥월
    { m:12, d:7,  b:0  }, // 대설 → 子월
  ];
  let branch = 1; // default 丑月 (before 소한)
  for (const t of terms) {
    if (month > t.m || (month === t.m && day >= t.d)) {
      branch = t.b;
    }
  }
  return branch;
}

function getMonthPillar(year, month, day) {
  const b = getMonthBranch(year, month, day);
  const yearStem = getYearPillar(year).s;
  // 월간 = 년간 기준 寅월 시작 천간 공식
  // 甲己년: 丙인(2), 乙庚년: 戊인(4), 丙辛년: 庚인(6), 丁壬년: 壬인(8), 戊癸년: 甲인(0)
  const base = [2, 4, 6, 8, 0][yearStem % 5];
  const offset = (b - 2 + 12) % 12; // offset from 寅月
  const s = (base + offset) % 10;
  return { s, b };
}

function getDayPillar(year, month, day) {
  const days = daysSinceEpoch(year, month, day);
  // Jan 1, 1900 = 甲戌 = stem 0, branch 10
  const s = ((days + 0) % 10 + 10) % 10;
  const b = ((days + 10) % 12 + 12) % 12;
  return { s, b };
}

function getHourBranch(hour) {
  if (hour === 23) return 0; // 子시
  return Math.floor((hour + 1) / 2) % 12;
}

function getHourPillar(dayStem, hour) {
  const b = getHourBranch(hour);
  // 甲己일: 子시 甲子(0), 乙庚일: 丙子(2), 丙辛일: 戊子(4), 丁壬일: 庚子(6), 戊癸일: 壬子(8)
  const base = [0, 2, 4, 6, 8][dayStem % 5];
  const s = (base + b) % 10;
  return { s, b };
}

function calcSaju(y, m, d, hour, minute, locOffset) {
  // Apply location time correction (minutes)
  let totalMin = hour * 60 + minute + locOffset;
  // Wrap around day
  let adjDay = d, adjMonth = m, adjYear = y;
  if (totalMin < 0) {
    totalMin += 1440;
    const prev = new Date(Date.UTC(y, m - 1, d - 1));
    adjDay = prev.getUTCDate();
    adjMonth = prev.getUTCMonth() + 1;
    adjYear = prev.getUTCFullYear();
  } else if (totalMin >= 1440) {
    totalMin -= 1440;
    const next = new Date(Date.UTC(y, m - 1, d + 1));
    adjDay = next.getUTCDate();
    adjMonth = next.getUTCMonth() + 1;
    adjYear = next.getUTCFullYear();
  }
  const adjHour = Math.floor(totalMin / 60);

  const yearP  = getYearPillar(adjYear);
  const monthP = getMonthPillar(adjYear, adjMonth, adjDay);
  const dayP   = getDayPillar(adjYear, adjMonth, adjDay);
  const hourP  = getHourPillar(dayP.s, adjHour);

  return { year: yearP, month: monthP, day: dayP, hour: hourP,
           adjYear, adjMonth, adjDay, adjHour };
}

function calcOhaeng(pillars) {
  const counts = [0,0,0,0,0]; // 木火土金水
  for (const p of [pillars.year, pillars.month, pillars.day, pillars.hour]) {
    counts[STEM_ELEM[p.s]]++;
    counts[BRANCH_ELEM[p.b]]++;
  }
  return counts; // total 8 chars
}

function calcBodyStrength(pillars, ohaeng) {
  // 일간 (day master element)
  const dm = STEM_ELEM[pillars.day.s];
  // 비겁+인성 count supports body
  const support = ohaeng[dm] + ohaeng[(dm + 4) % 5]; // same + generates-me
  // Exclude day stem itself (already counted in ohaeng[dm])
  // Body is strong if support >= 3/7 remaining (excluding day stem)
  const supportExSelf = support - 1; // exclude day stem itself
  return supportExSelf >= 3; // 신강
}

function calcYongsin(pillars, ohaeng) {
  const dm = STEM_ELEM[pillars.day.s];
  const isStrong = calcBodyStrength(pillars, ohaeng);
  let yongsin, gishin;
  if (isStrong) {
    // 신강: 설기(식상), 재성, 관성이 용신 (가장 약한 것)
    // 용신 = element that drains or controls day master
    yongsin = GENERATES[dm]; // 식상 (내가 생하는)
    gishin  = GENERATES[(dm + 4) % 5]; // 인성 (나를 생하는) → 더 강해짐 = 기신
  } else {
    // 신약: 인성, 비겁이 용신
    yongsin = (dm + 4) % 5; // 인성 (나를 생하는)
    gishin  = CONTROLS[dm]; // 관성 (나를 극하는) = 기신
  }
  return { dm, isStrong, yongsin, gishin };
}

/* ──────────────────────────────────────
   FORTUNE FLOW CALCULATION
────────────────────────────────────── */
function getFortuneScore(dmElem, periodElem, yongsin, gishin) {
  let score = FORTUNE_MATRIX[dmElem][periodElem];
  if (periodElem === yongsin) score = Math.min(100, score + 22);
  if (periodElem === gishin)  score = Math.max(5,  score - 22);
  return Math.round(score);
}

function buildFlowData(pillars, analysis, period) {
  const { dm, yongsin, gishin } = analysis;
  const now = new Date();
  const items = [];

  if (period === 'today') {
    // 12 two-hour periods (시진)
    const shiNames = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
    const shiTimes = ['23:00','01:00','03:00','05:00','07:00','09:00','11:00','13:00','15:00','17:00','19:00','21:00'];
    const curH = now.getHours();
    const curShi = getHourBranch(curH);
    for (let i = 0; i < 12; i++) {
      const elem = BRANCH_ELEM[i];
      const score = getFortuneScore(dm, elem, yongsin, gishin);
      const isNow = i === curShi;
      items.push({ label: shiNames[i], sublabel: shiTimes[i], elem, score, isNow });
    }
  } else if (period === 'week') {
    // 7 days
    const days7 = ['일','월','화','수','목','금','토'];
    for (let i = 0; i < 7; i++) {
      const d = new Date(now); d.setDate(now.getDate() - now.getDay() + i);
      const dp = getDayPillar(d.getFullYear(), d.getMonth()+1, d.getDate());
      const elem = STEM_ELEM[dp.s];
      const score = getFortuneScore(dm, elem, yongsin, gishin);
      const isNow = d.toDateString() === now.toDateString();
      items.push({ label: days7[i], sublabel:`${d.getMonth()+1}/${d.getDate()}`, elem, score, isNow });
    }
  } else if (period === 'month') {
    // 30 days of current month
    const daysInMonth = new Date(now.getFullYear(), now.getMonth()+1, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      const dp = getDayPillar(now.getFullYear(), now.getMonth()+1, day);
      const elem = STEM_ELEM[dp.s];
      const score = getFortuneScore(dm, elem, yongsin, gishin);
      const isNow = day === now.getDate();
      items.push({ label:`${day}`, sublabel:'', elem, score, isNow });
    }
  } else { // year — 12 months
    for (let mo = 1; mo <= 12; mo++) {
      const mp = getMonthPillar(now.getFullYear(), mo, 1);
      const elem = BRANCH_ELEM[mp.b];
      const score = getFortuneScore(dm, elem, yongsin, gishin);
      const isNow = mo === now.getMonth()+1;
      items.push({ label:`${mo}월`, sublabel:'', elem, score, isNow });
    }
  }
  return items;
}

/* ──────────────────────────────────────
   ILGAN PERSONALITY DATA
────────────────────────────────────── */
const ILGAN_DATA = [
  { // 0: 甲木
    title:'대나무처럼 곧은 기상의 리더',
    sub:'甲木(갑목)은 하늘을 향해 뻗어나가는 큰 나무의 기운입니다. 강한 생명력과 성장 지향적 마인드로 어떤 환경에서도 포기하지 않습니다.',
    strengths:['강한 추진력과 리더십','확고한 원칙과 정직함','성장을 향한 끊임없는 의지','긍정적·진취적 사고방식'],
    weaknesses:['고집이 세고 유연성 부족','인정욕구가 강해 스트레스','때로 무모한 도전','주변과의 마찰'],
    careers:['경영자','정치가','교육자','법조인','의사','개척자'],
    compat:['庚','辛','壬','癸'],
    compatName:['경(庚)','신(辛)','임(壬)','계(癸)'],
  },
  { // 1: 乙木
    title:'바람에 흔들려도 뿌리는 깊은 내유외강',
    sub:'乙木(을목)은 유연하게 환경에 적응하는 풀·덩굴의 기운입니다. 겉으로는 부드럽지만 속으로는 강인한 생명력을 지닙니다.',
    strengths:['탁월한 적응력과 유연성','섬세한 감수성과 공감 능력','끈질긴 생존력','예술적 감각'],
    weaknesses:['우유부단해 보일 수 있음','의존심이 강해질 수 있음','스트레스에 민감','감정 기복'],
    careers:['예술가','디자이너','상담사','의료인','농업·원예','문학가'],
    compat:['丙','丁','庚','辛'],
    compatName:['병(丙)','정(丁)','경(庚)','신(辛)'],
  },
  { // 2: 丙火
    title:'태양처럼 모든 것을 비추는 카리스마',
    sub:'丙火(병화)는 뜨겁게 타오르는 태양의 기운입니다. 밝고 따뜻한 성격으로 주위를 활기차게 만들며, 타고난 사교성을 지닙니다.',
    strengths:['넘치는 에너지와 열정','탁월한 사교성과 리더십','밝고 긍정적인 마인드','직관력과 판단력'],
    weaknesses:['감정 기복이 심함','지나친 자신감으로 실수','집중력 산만','충동적 결정'],
    careers:['연예인','방송인','세일즈','경영자','정치인','교사'],
    compat:['壬','癸','甲','乙'],
    compatName:['임(壬)','계(癸)','갑(甲)','을(乙)'],
  },
  { // 3: 丁火
    title:'촛불처럼 지속되는 섬세한 열정',
    sub:'丁火(정화)는 따뜻하고 부드럽게 빛나는 촛불의 기운입니다. 예술적 감수성과 섬세한 감성으로 깊은 인간관계를 맺습니다.',
    strengths:['예술적 감각과 섬세함','강한 직관력','따뜻한 배려심','끈기 있는 집중력'],
    weaknesses:['감정 과몰입','예민하고 상처받기 쉬움','지나친 완벽주의','내성적 성향'],
    careers:['예술가','음악가','작가','교사','요리사','상담사'],
    compat:['壬','甲','乙','己'],
    compatName:['임(壬)','갑(甲)','을(乙)','기(己)'],
  },
  { // 4: 戊土
    title:'큰 산처럼 묵직한 포용력의 소유자',
    sub:'戊土(무토)는 거대한 산과 대지의 기운입니다. 신뢰감 있고 포용력이 뛰어나며, 어떤 상황에서도 중심을 잡는 안정감을 줍니다.',
    strengths:['탁월한 포용력과 인내심','강한 책임감','현실적·실용적 판단','신뢰감 있는 성격'],
    weaknesses:['변화에 느린 적응','보수적 사고','고집스러움','행동이 느림'],
    careers:['부동산','금융·보험','농업','건축','공무원','경영자'],
    compat:['甲','乙','丙','丁'],
    compatName:['갑(甲)','을(乙)','병(丙)','정(丁)'],
  },
  { // 5: 己土
    title:'전답처럼 성실하게 결실을 맺는 실력자',
    sub:'己土(기토)는 만물을 품어 키우는 전답·논밭의 기운입니다. 꼼꼼함과 성실함으로 맡은 일을 반드시 완성시키는 능력을 지닙니다.',
    strengths:['놀라운 꼼꼼함과 성실함','강한 책임감','탁월한 실행력','조화로운 대인관계'],
    weaknesses:['우유부단한 면','과도한 걱정과 불안','소심한 면모','변화 회피'],
    careers:['교육자','회계사','행정가','연구원','의료인','요리사'],
    compat:['甲','丙','庚','壬'],
    compatName:['갑(甲)','병(丙)','경(庚)','임(壬)'],
  },
  { // 6: 庚金
    title:'강철처럼 단단한 원칙주의 결단력',
    sub:'庚金(경금)은 단단하고 날카로운 금속·칼날의 기운입니다. 원칙에 충실하고 결단력이 강하며, 불의에 타협하지 않는 기질을 지닙니다.',
    strengths:['강한 결단력과 실행력','원칙과 정의감','솔직한 성격','탁월한 리더십'],
    weaknesses:['냉정하고 직설적','융통성 부족','지나친 고집','감정 표현 어려움'],
    careers:['법조인','군인·경찰','외과의','엔지니어','운동선수','경영자'],
    compat:['甲','乙','丁','壬'],
    compatName:['갑(甲)','을(乙)','정(丁)','임(壬)'],
  },
  { // 7: 辛金
    title:'보석처럼 빛나는 완벽주의 심미가',
    sub:'辛金(신금)은 정교하게 다듬어진 보석·귀금속의 기운입니다. 뛰어난 심미안과 완벽주의적 성향으로 고품격 결과물을 만들어냅니다.',
    strengths:['탁월한 심미안','완벽주의적 집중력','섬세한 감각','고귀한 품격'],
    weaknesses:['완벽주의로 인한 스트레스','지나치게 예민','인정받지 못하면 침체','비판에 민감'],
    careers:['보석·패션 디자이너','작가','방송인','금융','뷰티','예술가'],
    compat:['甲','乙','丙','壬'],
    compatName:['갑(甲)','을(乙)','병(丙)','임(壬)'],
  },
  { // 8: 壬水
    title:'바다처럼 광활한 지혜와 포용',
    sub:'壬水(임수)는 넓고 깊은 강·바다의 기운입니다. 탁월한 지적 능력과 적응력으로 어떤 환경에서도 길을 찾아가는 지혜를 지닙니다.',
    strengths:['탁월한 지혜와 통찰력','강한 적응력','폭넓은 포용력','창의적 사고'],
    weaknesses:['중심이 흐릴 수 있음','지나친 감성','결단력 부족','끈기 약화'],
    careers:['철학자','연구원','교수','외교관','작가','IT·데이터'],
    compat:['丙','丁','戊','己'],
    compatName:['병(丙)','정(丁)','무(戊)','기(己)'],
  },
  { // 9: 癸水
    title:'빗물처럼 스며드는 직관과 감수성',
    sub:'癸水(계수)는 이슬·빗물·안개처럼 섬세하게 스며드는 기운입니다. 강한 직관력과 감수성으로 보이지 않는 것을 꿰뚫어 봅니다.',
    strengths:['뛰어난 직관과 감수성','섬세한 감정 공감','창의적 상상력','영적 감각'],
    weaknesses:['우유부단','감정 기복 심함','현실 도피 경향','지나친 내성적 성향'],
    careers:['상담가','의료인','점술·명리학','예술가','연구원','교육자'],
    compat:['丙','丁','戊','甲'],
    compatName:['병(丙)','정(丁)','무(戊)','갑(甲)'],
  },
];

/* ──────────────────────────────────────
   LUCKY ITEMS (based on yongsin element)
────────────────────────────────────── */
const LUCKY_DATA = [
  { icon:'🌿', label:'행운의 색',  vals:['초록','청록','연두','에메랄드'] },
  { icon:'🔢', label:'행운의 숫자', vals:['3','4','3과 8','6과 9','1과 6'] },
  { icon:'🧭', label:'행운의 방향', vals:['동쪽','남쪽','중앙','서쪽','북쪽'] },
  { icon:'💎', label:'행운의 돌',   vals:['에메랄드','루비','황수정','백수정','흑진주'] },
  { icon:'🌱', label:'행운의 계절', vals:['봄','여름','환절기','가을','겨울'] },
];

/* ──────────────────────────────────────
   OVERVIEW TEXT DATA
────────────────────────────────────── */
function buildOverviewText(pillars, analysis) {
  const { dm, isStrong, yongsin, gishin } = analysis;
  const dmName = STEMS[pillars.day.s] + '(' + STEMS_KOR[pillars.day.s] + ')';
  const dmElem = ELEM_KOR[dm];
  const yName  = ELEM_NAME[yongsin] + '(' + ELEM_KOR[yongsin] + ')';
  const gName  = ELEM_NAME[gishin]  + '(' + ELEM_KOR[gishin]  + ')';
  const strength = isStrong ? '신강(身强)' : '신약(身弱)';

  const headlines = [
    `일간 ${dmName}(${dmElem}) 사주, ${strength}한 명조`,
    `${ELEM_NATURE[dm]}의 기운을 타고난 ${isStrong?'강인한':'섬세한'} 영혼`,
    `${dmName}일간 — ${ILGAN_DATA[pillars.day.s].title}`,
  ];
  const headline = headlines[Math.abs(pillars.day.s + pillars.year.s) % headlines.length];

  const bullets = [];
  bullets.push(
    `일간(日干)은 ${dmName}으로 ${dmElem}의 기운입니다. ` +
    `사주 전체적으로 ${strength}한 기운을 지닙니다.`
  );
  bullets.push(
    `용신(用神)은 ${yName}으로, ${ELEM_SEASON[yongsin]}과 ${ELEM_DIR[yongsin]}에서 에너지가 강해집니다. ` +
    `${ELEM_COLOR_NAME[yongsin]} 계열 색상이 행운을 가져옵니다.`
  );
  bullets.push(
    `기신(忌神)은 ${gName}으로, 이 기운이 강한 시기에는 신중한 판단이 필요합니다. ` +
    `충동적 결정을 피하고 계획적으로 행동하세요.`
  );
  bullets.push(
    `오행 중 ` + (
      analysis.ohaeng.indexOf(Math.max(...analysis.ohaeng)) === dm
        ? `${dmElem} 기운이 가장 강해 자기중심적 힘이 넘칩니다.`
        : `${ELEM_KOR[analysis.ohaeng.indexOf(Math.max(...analysis.ohaeng))]} 기운이 가장 강하게 작용합니다.`
    )
  );
  return { headline, bullets };
}

/* ──────────────────────────────────────
   DEEP ANALYSIS TEXT
────────────────────────────────────── */
function buildDeepText(pillars, analysis, period) {
  const { dm, yongsin, gishin } = analysis;
  const now = new Date();

  if (period === 'daeun') {
    const age10 = Math.floor((now.getFullYear() - analysis.birthYear) / 10) * 10;
    const futurePillar = getDayPillar(now.getFullYear(), now.getMonth()+1, now.getDate());
    const fElem = STEM_ELEM[futurePillar.s];
    const score = getFortuneScore(dm, fElem, yongsin, gishin);
    return {
      title:`현재 대운 분석 (${age10}대)`,
      pillarStr:`${STEMS[futurePillar.s]}${BRANCHES[futurePillar.b]}`,
      pillarElem: fElem,
      text:`현재 ${age10}대 대운은 전반적으로 ${score >= 65 ? '길(吉)한' : score >= 45 ? '평범한' : '주의가 필요한'} 흐름입니다. ` +
           `${ELEM_NAME[fElem]}(${ELEM_KOR[fElem]})의 기운이 강하게 작용하며, ` +
           `${score >= 65 ? '용신의 기운이 들어와 발전과 성취의 시기입니다.' : score >= 45 ? '안정적이나 큰 변화를 조심하세요.' : '기신의 기운이 강하니 무리한 도전보다 내실을 다지세요.'}`
    };
  } else if (period === 'seun') {
    const yearP = getYearPillar(now.getFullYear());
    const fElem = STEM_ELEM[yearP.s];
    const score = getFortuneScore(dm, fElem, yongsin, gishin);
    return {
      title:`${now.getFullYear()}년 세운 분석`,
      pillarStr:`${STEMS[yearP.s]}${BRANCHES[yearP.b]}`,
      pillarElem: fElem,
      text:`${now.getFullYear()}년은 ${STEMS[yearP.s]}${BRANCHES[yearP.b]}년으로 ${ELEM_NAME[fElem]}의 해입니다. ` +
           `${score >= 65 ? '올해는 용신 기운이 돕는 좋은 한 해입니다. 새로운 도전과 확장의 시기로 적극 활용하세요.' :
             score >= 45 ? '올해는 평이한 흐름입니다. 꾸준한 노력이 결실을 맺는 해입니다.' :
             '올해는 기신의 기운이 강한 해입니다. 건강과 재물에 유의하고 무리한 확장은 자제하세요.'}`
    };
  } else if (period === 'wolun') {
    const mp = getMonthPillar(now.getFullYear(), now.getMonth()+1, now.getDate());
    const fElem = BRANCH_ELEM[mp.b];
    const score = getFortuneScore(dm, fElem, yongsin, gishin);
    const monthNames = ['','1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];
    return {
      title:`${monthNames[now.getMonth()+1]} 월운 분석`,
      pillarStr:`${STEMS[mp.s]}${BRANCHES[mp.b]}`,
      pillarElem: fElem,
      text:`이번 달 ${monthNames[now.getMonth()+1]}은 ${STEMS[mp.s]}${BRANCHES[mp.b]}월로 ${ELEM_NAME[fElem]}의 달입니다. ` +
           `${score >= 65 ? '이달은 기운이 좋아 추진하던 일에 좋은 소식이 올 수 있습니다.' :
             score >= 45 ? '이달은 무난한 흐름입니다. 평상심을 유지하며 차분하게 진행하세요.' :
             '이달은 조심스러운 달입니다. 큰 결정은 다음 달로 미루는 것이 좋습니다.'}`
    };
  } else { // ilun
    const dp = getDayPillar(now.getFullYear(), now.getMonth()+1, now.getDate());
    const fElem = STEM_ELEM[dp.s];
    const score = getFortuneScore(dm, fElem, yongsin, gishin);
    const d = now;
    return {
      title:`오늘 (${d.getFullYear()}.${d.getMonth()+1}.${d.getDate()}) 일운`,
      pillarStr:`${STEMS[dp.s]}${BRANCHES[dp.b]}`,
      pillarElem: fElem,
      text:`오늘은 ${STEMS[dp.s]}${BRANCHES[dp.b]}일로 ${ELEM_NAME[fElem]}의 기운이 흐릅니다. ` +
           `${score >= 70 ? '오늘은 무엇을 해도 잘 풀리는 좋은 날입니다. 중요한 미팅, 계약, 새로운 시작에 좋습니다.' :
             score >= 50 ? '오늘은 무난한 날입니다. 평소 하던 일을 꾸준히 진행하세요.' :
             '오늘은 기운이 약한 날입니다. 무리하지 말고 충분한 휴식을 취하세요.'}`
    };
  }
}

/* ──────────────────────────────────────
   SVG CHARTS
────────────────────────────────────── */
function renderRadarChart(counts) {
  const svg = document.getElementById('radarSvg');
  if (!svg) return;
  const cx = 150, cy = 150, R = 110;
  const max = 8; // max possible (all 8 chars same element)
  const labels = ['木','火','土','金','水'];
  const colors = ['var(--wood)','var(--fire)','var(--earth)','var(--metal)','var(--water)'];

  // Pentagon vertices (top=木, clockwise)
  function vertex(i, r) {
    const angle = (i * 72 - 90) * Math.PI / 180;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  }

  let html = '';

  // Grid pentagons
  for (let level = 1; level <= 4; level++) {
    const r = R * level / 4;
    const pts = Array.from({length:5}, (_,i) => vertex(i, r));
    const d = pts.map((p,i) => (i===0?'M':'L')+p.x.toFixed(1)+','+p.y.toFixed(1)).join(' ')+'Z';
    html += `<path d="${d}" fill="none" stroke="rgba(0,0,80,0.1)" stroke-width="1"/>`;
  }

  // Axis lines
  for (let i = 0; i < 5; i++) {
    const v = vertex(i, R);
    html += `<line x1="${cx}" y1="${cy}" x2="${v.x.toFixed(1)}" y2="${v.y.toFixed(1)}" stroke="rgba(0,0,80,0.1)" stroke-width="1"/>`;
  }

  // Data polygon
  const pts = Array.from({length:5}, (_, i) => {
    const val = counts[i];
    const r = R * val / max;
    return vertex(i, r);
  });
  const fill = pts.map((p,i) => (i===0?'M':'L')+p.x.toFixed(1)+','+p.y.toFixed(1)).join(' ')+'Z';
  html += `<path d="${fill}" fill="rgba(79,70,229,0.12)" stroke="var(--accent)" stroke-width="2" stroke-linejoin="round"/>`;

  // Data dots
  for (let i = 0; i < 5; i++) {
    const p = pts[i];
    html += `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="5" fill="${colors[i]}" stroke="#ffffff" stroke-width="1.5"/>`;
  }

  // Labels
  for (let i = 0; i < 5; i++) {
    const v = vertex(i, R + 20);
    html += `<text x="${v.x.toFixed(1)}" y="${v.y.toFixed(1)}" text-anchor="middle" dominant-baseline="middle"
      fill="${colors[i]}" font-size="16" font-weight="700" font-family="var(--serif)">${labels[i]}</text>`;
    html += `<text x="${v.x.toFixed(1)}" y="${(v.y + 16).toFixed(1)}" text-anchor="middle"
      fill="rgba(0,0,80,0.45)" font-size="10">${counts[i]}</text>`;
  }

  svg.innerHTML = html;
}

function renderFlowChart(flowItems, analysis) {
  const svg = document.getElementById('flowSvg');
  if (!svg) return;

  const W = 600, H = 220;
  const padL = 28, padR = 12, padT = 30, padB = 40;
  const n = flowItems.length;
  const bw = (W - padL - padR) / n;
  const maxH = H - padT - padB;

  const elemColors = ['#4ade80','#ef4444','#eab308','#9ca3af','#6b7280'];
  const { yongsin, gishin } = analysis;

  let html = '';

  // Y axis labels
  for (let pct of [0, 25, 50, 75, 100]) {
    const y = padT + maxH * (1 - pct/100);
    html += `<text x="${padL-4}" y="${y.toFixed(1)}" text-anchor="end" dominant-baseline="middle" fill="rgba(0,0,80,0.35)" font-size="9">${pct}</text>`;
    html += `<line x1="${padL}" y1="${y.toFixed(1)}" x2="${W-padR}" y2="${y.toFixed(1)}" stroke="rgba(0,0,80,0.07)" stroke-width="1"/>`;
  }

  // Bars
  const barW = bw * 0.65;
  for (let i = 0; i < n; i++) {
    const item = flowItems[i];
    const x = padL + i * bw + bw * 0.175;
    const barH = maxH * item.score / 100;
    const y = padT + maxH - barH;
    const color = item.isNow ? 'var(--accent)' : (item.score > 0 ? elemColors[item.elem] : '#94a3b8');
    const opacity = item.isNow ? 1 : 0.8;

    // Bar
    html += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${barW.toFixed(1)}" height="${barH.toFixed(1)}"
      fill="${color}" opacity="${opacity}" rx="3"/>`;

    // NOW label
    if (item.isNow) {
      html += `<text x="${(x + barW/2).toFixed(1)}" y="${(y - 8).toFixed(1)}" text-anchor="middle"
        fill="var(--accent)" font-size="9" font-weight="700">NOW</text>`;
    }

    // ★ for yongsin, ！for gishin
    if (item.elem === yongsin && !item.isNow) {
      html += `<text x="${(x + barW/2).toFixed(1)}" y="${(y - 6).toFixed(1)}" text-anchor="middle"
        fill="${elemColors[yongsin]}" font-size="11">★</text>`;
    }
    if (item.elem === gishin && item.score < 50 && !item.isNow) {
      html += `<text x="${(x + barW/2).toFixed(1)}" y="${(y - 6).toFixed(1)}" text-anchor="middle"
        fill="#ef4444" font-size="11">！</text>`;
    }

    // X label
    html += `<text x="${(x + barW/2).toFixed(1)}" y="${(H - padB + 10).toFixed(1)}" text-anchor="middle"
      fill="rgba(0,0,80,0.5)" font-size="${n > 15 ? 7 : 9}">${item.label}</text>`;
    if (item.sublabel && n <= 12) {
      html += `<text x="${(x + barW/2).toFixed(1)}" y="${(H - padB + 22).toFixed(1)}" text-anchor="middle"
        fill="rgba(0,0,80,0.3)" font-size="7">${item.sublabel}</text>`;
    }
  }

  svg.innerHTML = html;
}

/* ──────────────────────────────────────
   UI RENDERERS
────────────────────────────────────── */
function renderPillars(pillars) {
  const track = document.getElementById('pillarsTrack');
  if (!track) return;
  const names = ['시주 (時柱)','일주 (日柱)','월주 (月柱)','년주 (年柱)'];
  const pList = [pillars.hour, pillars.day, pillars.month, pillars.year];
  const elemC = ['var(--wood)','var(--fire)','var(--earth)','var(--metal)','var(--water)'];

  track.innerHTML = pList.map((p, i) => {
    const sElem = STEM_ELEM[p.s];
    const bElem = BRANCH_ELEM[p.b];
    const kor = `${STEMS_KOR[p.s]} ${BRANCHES_KOR[p.b]}`;
    return `<div class="pillar-card" data-elem="${sElem}">
      <div class="pillar-label">${names[i]}</div>
      <div class="pillar-chars">
        <div class="pillar-stem" style="color:${elemC[sElem]}">${STEMS[p.s]}</div>
        <div class="pillar-branch" style="color:${elemC[bElem]}">${BRANCHES[p.b]}</div>
      </div>
      <div class="pillar-kor">${kor}</div>
    </div>`;
  }).join('');
}

function renderStrengthRow(analysis) {
  const el = document.getElementById('strengthRow');
  if (!el) return;
  const { isStrong, dm } = analysis;
  const color = isStrong ? 'var(--fire)' : 'var(--water)';
  const borderColor = isStrong ? 'rgba(239,68,68,0.35)' : 'rgba(107,114,128,0.35)';
  el.innerHTML = `
    <span class="strength-badge" style="color:${color};border-color:${borderColor}">
      ${isStrong ? '🔥 신강(身强) — 사주의 힘이 강합니다' : '💧 신약(身弱) — 사주의 힘이 약합니다'}
    </span>
    <span class="strength-badge" style="color:var(--earth);border-color:rgba(234,179,8,0.35)">
      일간 ${STEMS[state.pillars.day.s]}(${STEMS_KOR[state.pillars.day.s]}) — ${ELEM_KOR[dm]}
    </span>`;
}

function renderOverview(pillars, analysis) {
  analysis.ohaeng = state.ohaeng;
  const ov = buildOverviewText(pillars, analysis);
  const head = document.getElementById('ovHeadline');
  const bullets = document.getElementById('ovBullets');
  if (head) head.textContent = ov.headline;
  if (bullets) bullets.innerHTML = ov.bullets.map(b => `<li>${b}</li>`).join('');
}

function renderYongsin(analysis) {
  const el = document.getElementById('yongRow');
  if (!el) return;
  const { yongsin, gishin } = analysis;
  const ec = ['var(--wood)','var(--fire)','var(--earth)','var(--metal)','var(--water)'];
  el.innerHTML = `
    <div class="yong-card">
      <div class="yong-label">용신 (用神) — 도움이 되는 기운</div>
      <div class="yong-elem" style="color:${ec[yongsin]}">${ELEM_NAME[yongsin]}</div>
      <div class="yong-name" style="color:${ec[yongsin]}">${ELEM_KOR[yongsin]}</div>
      <div class="yong-desc">${ELEM_SEASON[yongsin]} · ${ELEM_DIR[yongsin]} · ${ELEM_COLOR_NAME[yongsin]} 계열이 유리합니다</div>
    </div>
    <div class="yong-card">
      <div class="yong-label">기신 (忌神) — 주의해야 할 기운</div>
      <div class="yong-elem" style="color:${ec[gishin]};opacity:0.7">${ELEM_NAME[gishin]}</div>
      <div class="yong-name" style="color:${ec[gishin]};opacity:0.7">${ELEM_KOR[gishin]}</div>
      <div class="yong-desc">이 기운이 강한 시기에는 중요한 결정을 신중히 하세요</div>
    </div>`;
}

function renderSipsung(pillars, analysis) {
  const grid = document.getElementById('sipsungGrid');
  if (!grid) return;
  const { dm } = analysis;
  const ec = ['var(--wood)','var(--fire)','var(--earth)','var(--metal)','var(--water)'];
  // Show all 7 non-day-master characters
  const chars = [
    { label:'년간', stem:pillars.year.s,  branch:-1 },
    { label:'년지', stem:-1, branch:pillars.year.b  },
    { label:'월간', stem:pillars.month.s, branch:-1 },
    { label:'월지', stem:-1, branch:pillars.month.b },
    { label:'시간', stem:pillars.hour.s,  branch:-1 },
    { label:'시지', stem:-1, branch:pillars.hour.b  },
  ];
  grid.innerHTML = chars.map(c => {
    const elem = c.stem >= 0 ? STEM_ELEM[c.stem] : BRANCH_ELEM[c.branch];
    const char = c.stem >= 0 ? STEMS[c.stem] : BRANCHES[c.branch];
    const korChar = c.stem >= 0 ? STEMS_KOR[c.stem] : BRANCHES_KOR[c.branch];
    const ss = SIPSUNG_TABLE[dm][elem];
    return `<div class="sipsung-card">
      <div class="ss-name">${c.label}</div>
      <div class="ss-char" style="color:${ec[elem]}">${char}</div>
      <div class="ss-meaning">${ss}</div>
    </div>`;
  }).join('');
}

function renderOhaeng(ohaeng) {
  const barCol = document.getElementById('ohaengBarCol');
  const descGrid = document.getElementById('ohaengDescGrid');
  const max = Math.max(...ohaeng, 1);
  const ec = ['var(--wood)','var(--fire)','var(--earth)','var(--metal)','var(--water)'];
  const names = ['木(목)','火(화)','土(토)','金(금)','水(수)'];
  const natures = ['나무','불','흙','쇠','물'];

  if (barCol) {
    barCol.innerHTML = ohaeng.map((cnt, i) => `
      <div class="oh-bar-row">
        <div class="oh-bar-label" style="color:${ec[i]}">${ELEM_NAME[i]}</div>
        <div class="oh-bar-track">
          <div class="oh-bar-fill" style="width:${cnt/8*100}%;background:${ec[i]}"></div>
        </div>
        <div class="oh-bar-count" style="color:${ec[i]}">${cnt}</div>
      </div>`).join('');
  }

  if (descGrid) {
    descGrid.innerHTML = ohaeng.map((cnt, i) => `
      <div class="oh-desc-card">
        <div class="oh-desc-sym" style="color:${ec[i]}">${ELEM_NAME[i]}</div>
        <div class="oh-desc-cnt" style="color:${ec[i]}">${cnt}<span style="font-size:14px;opacity:0.5">/8</span></div>
        <div class="oh-desc-name">${natures[i]} · ${ELEM_KOR[i]}</div>
      </div>`).join('');
  }

  setTimeout(() => renderRadarChart(ohaeng), 50);
}

function renderFlowTab(period) {
  const flow = buildFlowData(state.pillars, state.analysis, period);
  renderFlowChart(flow, state.analysis);
}

function renderDeepCard(period) {
  const card = document.getElementById('deepCard');
  if (!card) return;
  const info = buildDeepText(state.pillars, state.analysis, period);
  const ec = ['var(--wood)','var(--fire)','var(--earth)','var(--metal)','var(--water)'];
  card.innerHTML = `
    <h4>${info.title}</h4>
    <div class="deep-pillar-row">
      <span class="dp-pill" style="border-color:${ec[info.pillarElem]};color:${ec[info.pillarElem]}">
        <span class="dp-char">${info.pillarStr[0]}</span>
        <span class="dp-char">${info.pillarStr[1]}</span>
        ${ELEM_KOR[info.pillarElem]}
      </span>
    </div>
    <p>${info.text}</p>`;
}

function renderLucky(yongsin) {
  const sec = document.getElementById('luckySection');
  if (!sec) return;
  sec.innerHTML = `<h3 class="lucky-title">✦ 행운 키워드</h3><div class="lucky-grid">` +
    LUCKY_DATA.map(ld => `
      <div class="lucky-item">
        <div class="lucky-icon">${ld.icon}</div>
        <div class="lucky-label">${ld.label}</div>
        <div class="lucky-val">${ld.vals[yongsin]}</div>
      </div>`).join('') +
    `</div>`;
}

function renderPersonality(dayS) {
  const content = document.getElementById('personalityContent');
  if (!content) return;
  const d = ILGAN_DATA[dayS];
  const ec = ELEM_COLOR[STEM_ELEM[dayS]];
  const compat = d.compat.map((c, i) => `
    <span class="compat-pill">
      <span class="compat-ch" style="color:${ec}">${c}</span>
      <span class="compat-nm">${d.compatName[i]}</span>
    </span>`).join('');

  content.innerHTML = `
    <div class="pers-hero">
      <div class="pers-char-big" style="color:${ec}">${STEMS[dayS]}</div>
      <div class="pers-info">
        <div class="pers-title">${d.title}</div>
        <div class="pers-sub">${d.sub}</div>
      </div>
    </div>
    <div class="pers-grid">
      <div class="pers-block">
        <div class="pers-block-title">강점</div>
        <ul>${d.strengths.map(s=>`<li>${s}</li>`).join('')}</ul>
      </div>
      <div class="pers-block">
        <div class="pers-block-title">약점</div>
        <ul>${d.weaknesses.map(s=>`<li>${s}</li>`).join('')}</ul>
      </div>
    </div>
    <div class="pers-career">
      <div class="pers-block-title">어울리는 직업</div>
      <div class="pers-career-tags">${d.careers.map(c=>`<span class="career-tag">${c}</span>`).join('')}</div>
    </div>
    <div class="pers-compat">
      <div class="pers-block-title">궁합이 좋은 일간</div>
      <div class="compat-chars">${compat}</div>
    </div>`;
}

/* ──────────────────────────────────────
   STARS BACKGROUND
────────────────────────────────────── */
function initStars() {
  const canvas = document.getElementById('starsBg');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let stars = [];
  let W, H;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    stars = [];
    const n = Math.floor((W * H) / 8000);
    for (let i = 0; i < n; i++) {
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.5 + 0.3,
        a: Math.random(),
        da: (Math.random() - 0.5) * 0.006,
        speed: Math.random() * 0.04,
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    for (const s of stars) {
      s.a += s.da;
      if (s.a > 1 || s.a < 0.1) s.da = -s.da;
      s.y -= s.speed;
      if (s.y < -2) s.y = H + 2;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI*2);
      ctx.fillStyle = `rgba(255,255,255,${s.a.toFixed(2)})`;
      ctx.fill();
    }
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  resize();
  draw();
}

/* ──────────────────────────────────────
   TOOLTIP
────────────────────────────────────── */
function initTooltips() {
  const tip = document.getElementById('tooltip');
  if (!tip) return;
  document.querySelectorAll('[data-tip]').forEach(el => {
    el.addEventListener('mouseenter', e => {
      tip.textContent = el.dataset.tip;
      tip.classList.add('show');
    });
    el.addEventListener('mousemove', e => {
      tip.style.left = `${e.clientX + 12}px`;
      tip.style.top  = `${e.clientY - 8}px`;
    });
    el.addEventListener('mouseleave', () => tip.classList.remove('show'));
  });
}

/* ──────────────────────────────────────
   FORM INITIALIZATION
────────────────────────────────────── */
function populateForm() {
  // Year
  const yearSel = document.getElementById('yearSel');
  for (let y = 2005; y >= 1930; y--) {
    const opt = document.createElement('option');
    opt.value = y; opt.textContent = `${y}년`;
    yearSel.appendChild(opt);
  }
  yearSel.value = 1990;

  // Month
  const monthSel = document.getElementById('monthSel');
  for (let m = 1; m <= 12; m++) {
    const opt = document.createElement('option');
    opt.value = m; opt.textContent = `${m}월`;
    monthSel.appendChild(opt);
  }

  // Day
  populateDays();
  monthSel.addEventListener('change', populateDays);
  yearSel.addEventListener('change', populateDays);

  // Hour
  const hourSel = document.getElementById('hourSel');
  for (let h = 0; h < 24; h++) {
    const opt = document.createElement('option');
    opt.value = h; opt.textContent = `${h}시`;
    hourSel.appendChild(opt);
  }
  hourSel.value = 12;

  // Minute
  const minSel = document.getElementById('minSel');
  for (let min = 0; min < 60; min += 10) {
    const opt = document.createElement('option');
    opt.value = min; opt.textContent = `${min}분`;
    minSel.appendChild(opt);
  }

  // Location
  const locSel = document.getElementById('locSel');
  LOCATIONS.forEach((loc, i) => {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = `${loc.n} (${loc.o >= 0 ? '+' : ''}${loc.o}분)`;
    locSel.appendChild(opt);
  });
  locSel.addEventListener('change', () => {
    const loc = LOCATIONS[locSel.value];
    const el = document.getElementById('offsetTxt');
    if (el) el.textContent = `${loc.o >= 0 ? '+' : ''}${loc.o}분`;
  });

  // Toggle groups
  document.querySelectorAll('.toggle-wrap').forEach(wrap => {
    wrap.querySelectorAll('.tog-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        wrap.querySelectorAll('.tog-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        if (wrap.id === 'calBtns') {
          const note = document.getElementById('lunarNote');
          if (note) note.style.display = btn.dataset.v === 'lunar' ? 'block' : 'none';
        }
      });
    });
  });
}

function populateDays() {
  const y = +document.getElementById('yearSel').value;
  const m = +document.getElementById('monthSel').value;
  const daysSel = document.getElementById('daySel');
  const prev = +daysSel.value;
  const maxD = new Date(y, m, 0).getDate();
  daysSel.innerHTML = '';
  for (let d = 1; d <= maxD; d++) {
    const opt = document.createElement('option');
    opt.value = d; opt.textContent = `${d}일`;
    daysSel.appendChild(opt);
  }
  daysSel.value = Math.min(prev || 1, maxD);
}

/* ──────────────────────────────────────
   TOAST
────────────────────────────────────── */
function showToast(msg, ms=2500) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._t);
  t._t = setTimeout(() => t.classList.remove('show'), ms);
}

/* ──────────────────────────────────────
   APP STATE & EVENTS
────────────────────────────────────── */
let state = {};

function runAnalysis() {
  const name    = document.getElementById('nameInput').value.trim();
  const year    = +document.getElementById('yearSel').value;
  const month   = +document.getElementById('monthSel').value;
  const day     = +document.getElementById('daySel').value;
  const hour    = +document.getElementById('hourSel').value;
  const minute  = +document.getElementById('minSel').value;
  const locIdx  = +document.getElementById('locSel').value;
  const gender  = document.querySelector('#genderBtns .tog-btn.active')?.dataset.v || 'male';

  if (!name) { showToast('이름을 입력해 주세요'); return; }

  const btn = document.getElementById('analyzeBtn');
  btn.disabled = true;
  btn.innerHTML = '<span style="opacity:0.7">분석 중...</span>';

  setTimeout(() => {
    try {
      const locOffset = LOCATIONS[locIdx].o;
      const pillars   = calcSaju(year, month, day, hour, minute, locOffset);
      const ohaeng    = calcOhaeng(pillars);
      const analysis  = calcYongsin(pillars, ohaeng);
      analysis.birthYear = year;

      state = { name, gender, year, month, day, pillars, ohaeng, analysis };

      // Render result header
      const gKor = gender === 'male' ? '남성' : '여성';
      document.getElementById('resUser').innerHTML =
        `<strong>${name}</strong> · ${year}.${String(month).padStart(2,'0')}.${String(day).padStart(2,'0')} · ${gKor}`;

      // Render all tabs
      renderPillars(pillars);
      renderStrengthRow(analysis);
      renderOverview(pillars, analysis);
      renderYongsin(analysis);
      renderSipsung(pillars, analysis);

      renderOhaeng(ohaeng);

      renderFlowTab('today');
      renderDeepCard('seun');
      renderLucky(analysis.yongsin);

      renderPersonality(pillars.day.s);
      renderPersonalityScores(pillars, analysis);
      renderDetail(pillars, analysis);
      renderOhaengDetail(ohaeng);
      renderYearlySection(pillars, analysis, year);

      document.getElementById('formSection').style.display = 'none';
      document.getElementById('resultSection').style.display = 'block';
      initSajuToc();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch(e) {
      console.error(e);
      showToast('분석 중 오류가 발생했습니다. 입력값을 확인해주세요.');
    }

    btn.disabled = false;
    btn.innerHTML = '사주 분석 시작 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>';
  }, 600);
}

/* ──────────────────────────────────────
   DETAIL TAB — 세부 분석 (연애·재물·건강·인간관계)
────────────────────────────────────── */
const LOVE_DATA = [
  { // 甲木
    love:'甲木 일간은 솔직하고 진취적인 연애를 합니다. 상대방에게 먼저 다가가는 적극성을 지니며, 한번 좋아하면 깊게 빠져듭니다. 강한 자존심이 있어 관계에서 리더십을 발휘하고 싶어하는 편입니다. 상대방이 자신의 의견을 무시하면 크게 상처받습니다. 이상적인 파트너는 자신을 인정해주고 성장을 함께하는 사람입니다.',
    marriage:'결혼 후에도 독립적인 성향을 유지하려 합니다. 가정에서 가장 역할을 충실히 수행하지만, 자신만의 공간과 활동이 필요합니다. 배우자와의 조화를 위해 유연성을 키우는 것이 중요합니다.',
    wealth:'재물운은 안정적이나 큰 부는 스스로 개척해야 합니다. 초년에는 고생이 있을 수 있으나 중년 이후 본격적인 재물 축적이 시작됩니다. 부동산이나 사업 투자가 유리하며, 조급함을 버리고 장기적 안목을 유지하세요.',
    career:'사업, 경영, 정치, 법조, 교육 분야에서 두각을 나타냅니다. 독립적으로 일하는 것을 선호하며 창업 운도 있습니다. 조직에서는 빠르게 승진하지만 윗사람과의 마찰에 주의하세요.',
    health:'간(肝)과 담(膽) 관련 질환에 주의가 필요합니다. 과도한 스트레스는 눈, 근육, 신경에 영향을 줄 수 있습니다. 규칙적인 운동과 충분한 수면이 건강을 지키는 열쇠입니다.',
    relation:'주위에 사람이 많이 따르지만 자신의 뜻을 관철하려다 오해를 살 수 있습니다. 경청과 배려를 생활화하면 넓고 깊은 인간관계를 유지할 수 있습니다.',
  },
  { // 乙木
    love:'乙木 일간은 감성적이고 섬세한 연애를 합니다. 직접적으로 감정을 표현하기보다 분위기와 행동으로 애정을 전합니다. 상대방의 감정 변화에 민감하게 반응하며 배려심이 깊습니다. 집착하는 경향이 있을 수 있으니 적절한 거리감 유지가 중요합니다.',
    marriage:'가정을 소중히 여기고 안정적인 결혼생활을 추구합니다. 배우자와의 감정적 교류를 매우 중시합니다. 다소 의존적인 경향이 있으므로 자신의 주체성을 키워나가는 것이 필요합니다.',
    wealth:'꾸준한 노력으로 안정적인 재물을 쌓아갑니다. 큰 모험보다 안정적인 저축과 투자가 적합합니다. 다른 사람을 위해 지출하는 경향이 있으니 재정 계획을 철저히 세우세요.',
    career:'예술, 디자인, 상담, 의료, 교육 분야에서 능력을 발휘합니다. 협력 관계에서 빛을 발하며 팀 내 조화를 이끌어냅니다. 자신의 능력을 과소평가하지 말고 적극적으로 어필하세요.',
    health:'폐(肺)와 피부 건강에 신경 쓰세요. 스트레스 관리가 특히 중요하며, 호흡기 관련 질환에도 주의가 필요합니다. 명상이나 요가 같은 마음을 안정시키는 활동이 도움이 됩니다.',
    relation:'온화한 성격으로 대인관계가 원만합니다. 깊은 친밀감을 형성하지만 상처를 주는 말에 오래 상처받을 수 있습니다. 자신의 감정을 솔직하게 표현하는 연습을 하세요.',
  },
  { // 丙火
    love:'丙火 일간은 열정적이고 화려한 연애를 즐깁니다. 적극적으로 감정을 표현하며 상대방을 밝게 만들어줍니다. 연애에 쉽게 불타오르지만 식을 수도 빠를 수 있으니 지속적인 관계 유지에 신경 써야 합니다.',
    marriage:'결혼 후에도 활기찬 에너지로 가정을 이끕니다. 집안 분위기를 밝게 만드는 역할을 합니다. 배우자의 의견을 충분히 수렴하는 노력이 필요하며, 충동적 결정을 자제해야 합니다.',
    wealth:'사업 수완이 좋고 재물 운이 활발합니다. 다양한 수입원을 가질 수 있지만 지출도 많은 편입니다. 장기 계획보다 단기 이익을 추구하는 경향이 있으니 재정 관리에 주의하세요.',
    career:'방송, 연예, 세일즈, 마케팅, 경영 분야에서 탁월한 능력을 발휘합니다. 사람들을 이끄는 카리스마가 있으며 리더십이 뛰어납니다.',
    health:'심장(心臟)과 혈관 건강에 특히 주의가 필요합니다. 과로와 스트레스는 심혈관 질환의 위험을 높입니다. 규칙적인 유산소 운동과 혈압 관리가 중요합니다.',
    relation:'누구와도 쉽게 어울리는 사교성을 지녔습니다. 많은 친구를 두고 있으며 모임에서 분위기 메이커 역할을 합니다. 깊은 신뢰 관계를 구축하기 위해서는 말보다 실천이 더 중요합니다.',
  },
  { // 丁火
    love:'丁火 일간은 섬세하고 감성적인 연애를 합니다. 한 사람에게 깊이 헌신하는 타입으로, 상대방을 진심으로 아끼고 세심하게 배려합니다. 상처받으면 오래 상처가 남을 수 있으므로 솔직한 소통이 중요합니다.',
    marriage:'따뜻하고 안정적인 가정을 꿈꿉니다. 가족에 대한 헌신과 배려가 뛰어나지만, 지나친 희생으로 본인이 소진될 수 있습니다. 자신의 욕구도 적절히 표현하는 것이 건강한 관계를 유지하는 비결입니다.',
    wealth:'꾸준하고 성실한 노력으로 재물을 쌓습니다. 큰 투기보다 안정적인 투자가 맞습니다. 타인을 위한 지출이 많은 편이므로 재정 계획을 세워 자신의 미래도 준비하세요.',
    career:'예술, 음악, 문학, 상담, 교육 분야에서 빛을 발합니다. 섬세한 감각과 창의성이 작업의 질을 높입니다. 완벽주의 경향으로 마감 스트레스에 주의가 필요합니다.',
    health:'심장과 소장(小腸) 기능에 주의하세요. 감정적 스트레스가 신체에 바로 영향을 미치므로 정서적 안정이 건강의 핵심입니다. 규칙적인 생활 습관과 충분한 수면이 필수입니다.',
    relation:'깊고 의미 있는 관계를 추구합니다. 넓은 인맥보다 소수의 진실한 관계를 선호하며, 한번 맺은 인연은 오래 지속됩니다.',
  },
  { // 戊土
    love:'戊土 일간은 신중하고 책임감 있는 연애를 합니다. 쉽게 감정을 표현하지 않지만 한번 사랑에 빠지면 충실하고 한결같습니다. 안정과 신뢰를 중시하며 갑작스러운 변화를 싫어합니다.',
    marriage:'가정의 안정과 화목을 가장 중시합니다. 가장으로서의 책임을 성실히 이행합니다. 다소 고집스러운 면이 있으므로 배우자의 의견을 경청하는 태도가 필요합니다.',
    wealth:'부동산, 금융, 안정적인 사업에서 재물을 쌓습니다. 급진적인 투자보다 장기적이고 안정적인 방식을 선호합니다. 중년 이후 재물이 크게 발전할 수 있는 구조입니다.',
    career:'부동산, 건축, 금융, 농업, 공무원 분야에서 탁월합니다. 꾸준하고 성실한 업무 처리로 신뢰를 쌓습니다. 리더십보다는 실무 능력이 강점입니다.',
    health:'비위(脾胃) — 소화기 계통에 주의가 필요합니다. 과식이나 불규칙한 식사는 건강을 해칩니다. 과도한 걱정과 스트레스도 소화기에 영향을 줄 수 있으니 마음의 여유를 가지세요.',
    relation:'믿음직하고 듬직한 성격으로 주위에서 신뢰를 받습니다. 인간관계를 신중하게 맺지만 한번 맺으면 깊고 오래갑니다.',
  },
  { // 己土
    love:'己土 일간은 성실하고 현실적인 연애를 합니다. 상대방을 세심하게 배려하며 관계의 지속성을 중시합니다. 감정 표현이 다소 서툴지만 행동으로 사랑을 보여주는 타입입니다.',
    marriage:'가정을 꼼꼼하게 관리하는 능력이 뛰어납니다. 작은 것 하나도 소홀히 하지 않는 세심함으로 가족을 돌봅니다. 지나친 걱정과 불안을 버리고 신뢰를 키워나가는 것이 중요합니다.',
    wealth:'꼼꼼한 재정 관리로 안정적인 부를 쌓습니다. 큰 수익보다는 안정적인 수입을 선호하며, 저축을 잘합니다. 과도한 걱정으로 좋은 기회를 놓치지 않도록 적절한 결단력을 키우세요.',
    career:'교육, 회계, 행정, 의료, 연구 분야에서 두각을 나타냅니다. 세밀하고 정확한 업무 처리가 강점입니다. 꾸준한 노력으로 전문성을 쌓아가는 타입입니다.',
    health:'소화기 및 비장(脾臟) 기능에 주의하세요. 지나친 걱정과 불안은 소화기 문제를 유발합니다. 규칙적인 식사와 가벼운 운동으로 건강을 유지하세요.',
    relation:'성실하고 신뢰할 수 있는 사람으로 평가받습니다. 조화를 중시하여 갈등을 피하려 하지만, 자신의 의견도 적절히 표현하는 것이 좋습니다.',
  },
  { // 庚金
    love:'庚金 일간은 솔직하고 원칙적인 연애를 합니다. 감정을 직접적으로 표현하며 상대방에게도 솔직함을 기대합니다. 강한 자존심으로 먼저 사과하기를 어려워하므로 유연성을 키우는 것이 필요합니다.',
    marriage:'가정에서도 원칙과 규율을 중시합니다. 공정한 관계를 원하며 상호 존중을 가장 중요하게 여깁니다. 부드러운 감정 표현을 연습하면 더욱 풍성한 가정생활이 가능합니다.',
    wealth:'원칙적인 방식으로 재물을 쌓습니다. 부정한 방법에는 절대 타협하지 않으며, 실력과 성실함으로 성공을 이룹니다. 투자 시 리스크 관리에 철저하며 안정성을 선호합니다.',
    career:'법조, 군경, 의학, 엔지니어링, 금속·제조업에서 탁월합니다. 강한 리더십과 결단력이 강점입니다. 유연성을 높이면 더 넓은 분야에서 활약할 수 있습니다.',
    health:'폐(肺)와 대장(大腸) 건강에 특히 주의하세요. 건조한 환경과 차가운 음식은 피하는 것이 좋습니다. 규칙적인 호흡 운동과 따뜻한 음식 섭취가 건강을 지킵니다.',
    relation:'정의롭고 공정한 사람으로 인정받습니다. 불의를 보면 참지 못하는 성격으로 때로 갈등을 유발할 수 있습니다. 상대의 입장을 먼저 이해하는 노력이 관계를 원활하게 합니다.',
  },
  { // 辛金
    love:'辛金 일간은 세련되고 낭만적인 연애를 합니다. 완벽한 사랑을 꿈꾸며 상대방에 대한 기준이 높습니다. 감정 표현이 섬세하고 아름다운 방식으로 나타나며, 상처받으면 내면 깊이 품는 경향이 있습니다.',
    marriage:'미적 감각이 뛰어난 가정환경을 만드는 것을 좋아합니다. 완벽주의적 성향으로 가족에게 높은 기대를 할 수 있으니 현실적인 조율이 필요합니다.',
    wealth:'심미적 가치가 있는 분야 — 보석, 패션, 예술품 등에서 재물 운이 강합니다. 섬세한 안목으로 좋은 투자 기회를 포착할 수 있습니다. 감정적 소비를 자제하고 계획적인 지출이 중요합니다.',
    career:'보석·패션 디자인, 미용, 방송, 금융, 문학, 예술 분야에서 두각을 나타냅니다. 완벽한 결과물을 만들어내는 능력이 전문성의 핵심입니다.',
    health:'폐와 피부, 대장 건강에 주의하세요. 완벽주의로 인한 스트레스가 피부 트러블을 유발할 수 있습니다. 스트레스 해소법을 찾고 자신에게 너그러워지는 것이 중요합니다.',
    relation:'품격 있고 매력적인 성격으로 인기가 많습니다. 비판에 민감한 편이므로, 건설적인 피드백과 단순한 비판을 구분하는 능력을 키우세요.',
  },
  { // 壬水
    love:'壬水 일간은 자유롭고 깊이 있는 연애를 즐깁니다. 지적인 교류를 즐기며 상대방과 함께 성장하는 관계를 원합니다. 자유로운 영혼으로 구속받기를 싫어하며, 상대방의 개성도 존중합니다.',
    marriage:'결혼 후에도 독립적인 공간과 시간이 필요합니다. 배우자와의 지적 교류를 매우 중요하게 여깁니다. 감정 표현을 더 솔직하게 하면 더욱 깊은 유대감을 형성할 수 있습니다.',
    wealth:'지식, 기술, 정보 관련 분야에서 재물 운이 강합니다. 창의적인 발상으로 새로운 사업 기회를 포착합니다. 경제적 계획을 세우고 실행하는 능력을 더 키우면 재물이 늘어납니다.',
    career:'연구, 교육, IT, 철학, 금융, 외교 분야에서 빛을 발합니다. 넓은 시야와 통찰력이 강점이며, 복잡한 문제를 해결하는 능력이 뛰어납니다.',
    health:'신장(腎臟)과 방광 기능에 주의하세요. 지나친 음주와 차가운 음식은 피하는 것이 좋습니다. 충분한 수분 섭취와 따뜻한 환경 유지가 건강에 도움이 됩니다.',
    relation:'넓고 다양한 인간관계를 맺습니다. 누구와도 잘 어울리는 사교성이 있지만, 깊은 관계를 유지하기 위한 꾸준한 노력이 필요합니다.',
  },
  { // 癸水
    love:'癸水 일간은 감수성이 풍부하고 직관적인 연애를 합니다. 상대방의 감정을 예리하게 포착하며 깊은 교감을 원합니다. 감정 기복이 있을 수 있으므로 안정적인 소통이 관계를 발전시킵니다.',
    marriage:'정서적으로 안정된 가정을 원합니다. 배우자와의 깊은 감정적 유대를 중시하며, 서로를 진심으로 이해하는 관계를 꿈꿉니다. 현실적인 판단력도 함께 키워나가는 것이 좋습니다.',
    wealth:'창의적이고 직관적인 분야에서 재물 운이 있습니다. 예술, 상담, 영적 분야 등에서 수익을 올릴 수 있습니다. 현실적인 재정 계획을 세우는 것이 장기적인 부의 축적에 도움이 됩니다.',
    career:'상담, 의료, 예술, 영적 분야, 교육, 연구에서 두각을 나타냅니다. 강한 직관력과 공감 능력이 최대 강점입니다. 현실적인 판단력을 보완하면 더 넓은 분야에서 활약할 수 있습니다.',
    health:'신장, 생식기, 면역 계통에 특히 주의하세요. 감정적 스트레스가 건강에 직접적인 영향을 줍니다. 충분한 수면과 정서적 안정이 건강을 지키는 핵심입니다.',
    relation:'공감 능력이 뛰어나 사람들의 마음을 쉽게 이해합니다. 감정이입이 너무 강해 타인의 감정에 지나치게 영향받을 수 있으니 경계 설정이 필요합니다.',
  },
];


/* ──────────────────────────────────────
   DETAIL SECTIONS RENDERER (Scroll-based)
────────────────────────────────────── */
function renderDetail(pillars, analysis) {
  const dayS = pillars.day.s;
  const d    = LOVE_DATA[dayS];
  const ec   = ELEM_COLOR[STEM_ELEM[dayS]];
  const ilganName = STEMS[dayS] + '(' + STEMS_KOR[dayS] + ')';
  const badge = `<div class="detail-ilgan-badge" style="color:${ec};border-color:${ec}44">${ilganName} 일간</div>`;

  // Love Section
  const loveEl = document.getElementById('loveSection');
  if (loveEl) loveEl.innerHTML = `
    ${badge}
    <div class="domain-card">
      <div class="domain-card-head"><div class="domain-card-icon" style="background:rgba(239,68,68,0.1)">💕</div>연애 스타일</div>
      <div class="domain-card-body">${d.love}</div>
    </div>
    <div class="domain-card">
      <div class="domain-card-head"><div class="domain-card-icon" style="background:rgba(239,68,68,0.1)">💍</div>결혼·부부생활</div>
      <div class="domain-card-body">${d.marriage}</div>
    </div>
    <div class="domain-card" style="background:linear-gradient(135deg,rgba(239,68,68,0.06),rgba(168,85,247,0.06));border-color:rgba(239,68,68,0.2)">
      <div class="domain-card-head" style="color:#f87171">⚡ 이상형 키워드</div>
      <div class="domain-card-body">${getLoveIdeal(dayS, analysis)}</div>
    </div>`;

  // Money Section
  const moneyEl = document.getElementById('moneySection');
  if (moneyEl) moneyEl.innerHTML = `
    ${badge}
    <div class="domain-card">
      <div class="domain-card-head"><div class="domain-card-icon" style="background:rgba(244,208,63,0.1)">💰</div>재물운 분석</div>
      <div class="domain-card-body">${d.wealth}</div>
    </div>
    <div class="domain-card">
      <div class="domain-card-head"><div class="domain-card-icon" style="background:rgba(244,208,63,0.1)">🏢</div>적합한 직업군</div>
      <div class="domain-card-body">${d.career}</div>
    </div>
    <div class="domain-card" style="background:linear-gradient(135deg,rgba(244,208,63,0.06),rgba(52,211,153,0.06));border-color:rgba(244,208,63,0.2)">
      <div class="domain-card-head" style="color:#fbbf24">📈 재물 운세 흐름</div>
      <div class="domain-card-body">${getMoneyFlow(dayS, analysis)}</div>
    </div>`;

  // Health Section
  const healthEl = document.getElementById('healthSection');
  if (healthEl) healthEl.innerHTML = `
    ${badge}
    <div class="domain-card">
      <div class="domain-card-head"><div class="domain-card-icon" style="background:rgba(52,211,153,0.1)">🫀</div>건강 취약 부위</div>
      <div class="domain-card-body">${d.health}</div>
    </div>
    <div class="domain-card" style="background:linear-gradient(135deg,rgba(52,211,153,0.06),rgba(96,165,250,0.06));border-color:rgba(52,211,153,0.2)">
      <div class="domain-card-head" style="color:#34d399">🌿 오행 건강 조언</div>
      <div class="domain-card-body">${getHealthAdvice(dayS, analysis)}</div>
    </div>
    ${renderOhaengHealthGrid(analysis)}`;

  // Relations Section
  const relEl = document.getElementById('relationsSection');
  if (relEl) relEl.innerHTML = `
    ${badge}
    <div class="domain-card">
      <div class="domain-card-head"><div class="domain-card-icon" style="background:rgba(96,165,250,0.1)">🤝</div>대인관계 특성</div>
      <div class="domain-card-body">${d.relation}</div>
    </div>
    <div class="rel-grid">
      <div class="rel-card">
        <div class="rel-card-title">👨‍👩‍👧 부모·가족 관계</div>
        <div class="rel-card-body">${getFamilyRelation(dayS, analysis)}</div>
      </div>
      <div class="rel-card">
        <div class="rel-card-title">👥 친구·동료 관계</div>
        <div class="rel-card-body">${getFriendRelation(dayS, analysis)}</div>
      </div>
      <div class="rel-card">
        <div class="rel-card-title">⭐ 귀인 방향</div>
        <div class="rel-card-body">${getGuirenInfo(analysis)}</div>
      </div>
      <div class="rel-card">
        <div class="rel-card-title">⚠️ 주의할 관계</div>
        <div class="rel-card-body">${getWarningRelation(dayS, analysis)}</div>
      </div>
    </div>`;
}

/* ── 보조 함수들 ── */
function getLoveIdeal(dayS, analysis) {
  const elem = STEM_ELEM[dayS];
  const gender = ''; // state.gender
  const ideals = [
    '지적이고 창의적이며 자신의 성장을 응원해주는 파트너. <strong>木·水 오행</strong> 기운을 가진 분과 잘 맞습니다. 동방(東方)이나 북방(北方) 출신과의 인연이 강합니다.',
    '따뜻하고 감성적이며 정서적 지지를 아끼지 않는 파트너. <strong>火·木 오행</strong> 기운의 분과 궁합이 좋습니다. 연애보다 우정이 먼저인 관계에서 사랑이 피어납니다.',
    '안정적이고 신뢰할 수 있으며 현실감각이 있는 파트너. <strong>土·火 오행</strong>이 강한 분과 잘 맞습니다. 비슷한 가치관과 생활방식을 가진 사람과의 인연이 오래갑니다.',
    '원칙과 정의감이 있으며 자신을 믿어주는 파트너. <strong>金·土 오행</strong> 기운이 강한 분과 좋은 궁합을 보입니다. 이성적이고 성숙한 사람과의 만남이 오래 지속됩니다.',
    '자유롭고 지적이며 넓은 시야를 가진 파트너. <strong>水·金 오행</strong>이 강한 분과 궁합이 맞습니다. 독립적인 개성을 인정해주는 사람과의 관계에서 사랑이 깊어집니다.',
  ];
  return ideals[elem];
}

function getMoneyFlow(dayS, analysis) {
  const elem = STEM_ELEM[dayS];
  const yong = analysis.yongsin;
  const isShin = analysis.isBodyStrong;
  const flows = [
    `초년(20대)에는 도전과 시행착오가 있지만, <strong>중년(40대) 이후</strong> 본격적인 재물 운이 열립니다. 土·金 운이 오는 시기에 재물이 쌓입니다. 부동산·사업 투자에 유리합니다.`,
    `재물을 쓰는 능력이 탁월하여 돈이 잘 돌고 다시 들어오는 순환형입니다. <strong>土·金 운</strong>에 수익이 증가합니다. 재물을 모으는 것보다 불리는 데 강점을 보입니다.`,
    `꾸준하고 안정적인 재물 흐름입니다. <strong>木 운</strong>이 오면 소비가 늘고, <strong>金 운</strong>이 오면 수익이 좋아집니다. 부동산·토지 투자에 특히 유리한 사주입니다.`,
    `40대 이후 대운이 강해지며 재물이 크게 쌓이는 구조입니다. <strong>木·水 운</strong>에 수익이 증가합니다. 원칙과 규율 있는 재정 관리로 큰 부를 이룰 수 있습니다.`,
    `지식·기술·정보 분야에서 수익이 창출됩니다. <strong>木·火 운</strong>에 수입이 늘어납니다. 투자보다 자신의 전문성 향상이 재물 증가의 핵심입니다.`,
  ];
  return flows[elem];
}

function getHealthAdvice(dayS, analysis) {
  const elem = STEM_ELEM[dayS];
  const advices = [
    `<strong>木 오행</strong>이 강한 분은 간·담·눈·근육·신경을 주의하세요. 신맛 음식(식초·레몬·사과)이 도움이 되며, 스트레칭과 유산소 운동이 필수입니다. 봄철(3~5월) 건강 변화에 주의하세요.`,
    `<strong>火 오행</strong>이 강한 분은 심장·혈관·소장을 챙기세요. 쓴맛 음식(여주·쑥·커피)이 적당히 도움이 됩니다. 여름(6~8월)에 과로를 삼가고 규칙적인 유산소 운동을 하세요.`,
    `<strong>土 오행</strong>이 강한 분은 비장·위장·소화기를 관리하세요. 단맛 음식은 적당히만 드세요. 불규칙한 식사와 과로가 건강의 최대 적입니다. 환절기 건강 관리에 특히 신경 쓰세요.`,
    `<strong>金 오행</strong>이 강한 분은 폐·대장·피부·호흡기를 챙기세요. 매운맛 음식을 적당히 섭취하고 건조한 환경을 피하세요. 가을(9~11월)에 감기·피부 트러블에 주의하세요.`,
    `<strong>水 오행</strong>이 강한 분은 신장·방광·생식기·뼈를 관리하세요. 짠맛 음식은 적당히, 충분한 수분 섭취가 중요합니다. 겨울(12~2월) 건강 변화를 주의하고 몸을 따뜻하게 유지하세요.`,
  ];
  return advices[elem];
}

function renderOhaengHealthGrid(analysis) {
  // Simple table showing organ-element mapping
  return `
    <div class="domain-card" style="margin-top:12px">
      <div class="domain-card-head" style="color:#60a5fa">🩺 오행별 주요 관장 부위</div>
      <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-top:10px;text-align:center">
        <div style="background:rgba(52,211,153,0.08);border-radius:8px;padding:10px 6px">
          <div style="color:#34d399;font-weight:700;font-size:16px;margin-bottom:4px">木</div>
          <div style="font-size:11px;color:#9ca3af">간·담·눈<br>근육·신경</div>
        </div>
        <div style="background:rgba(239,68,68,0.08);border-radius:8px;padding:10px 6px">
          <div style="color:#ef4444;font-weight:700;font-size:16px;margin-bottom:4px">火</div>
          <div style="font-size:11px;color:#9ca3af">심장·혈관<br>소장·혀</div>
        </div>
        <div style="background:rgba(234,179,8,0.08);border-radius:8px;padding:10px 6px">
          <div style="color:#eab308;font-weight:700;font-size:16px;margin-bottom:4px">土</div>
          <div style="font-size:11px;color:#9ca3af">비장·위장<br>소화기·입</div>
        </div>
        <div style="background:rgba(148,163,184,0.08);border-radius:8px;padding:10px 6px">
          <div style="color:#94a3b8;font-weight:700;font-size:16px;margin-bottom:4px">金</div>
          <div style="font-size:11px;color:#9ca3af">폐·대장<br>피부·코</div>
        </div>
        <div style="background:rgba(96,165,250,0.08);border-radius:8px;padding:10px 6px">
          <div style="color:#60a5fa;font-weight:700;font-size:16px;margin-bottom:4px">水</div>
          <div style="font-size:11px;color:#9ca3af">신장·방광<br>뼈·귀</div>
        </div>
      </div>
    </div>`;
}

function getFamilyRelation(dayS, analysis) {
  const elem = STEM_ELEM[dayS];
  const data = [
    '부모와의 관계는 良好하나 독립심이 강해 일찍 자신의 길을 개척합니다. 부모의 도움보다 스스로 이루는 것에 더 큰 보람을 느낍니다.',
    '가족에 대한 애정이 깊고 부모와의 유대가 강합니다. 가족을 위해 자신을 희생하는 경향이 있으니 자신의 삶도 소중히 여기세요.',
    '안정적인 가정환경에서 자라거나 그러한 환경을 만들려 합니다. 부모에게 효심이 깊으나 지나친 기대감이 스트레스가 될 수 있습니다.',
    '부모와 원칙적인 관계를 유지합니다. 가족에게 엄격한 잣대를 적용하는 경향이 있으나 진심으로 아끼고 책임감이 강합니다.',
    '가족 사이에서 정서적 지지자 역할을 합니다. 가족의 감정적 문제를 잘 파악하며, 때로는 감정의 무게가 부담이 될 수 있습니다.',
  ];
  return data[elem];
}

function getFriendRelation(dayS, analysis) {
  const elem = STEM_ELEM[dayS];
  const data = [
    '의리 있고 진취적인 친구 관계. 경쟁 관계에서도 우정을 유지하는 능력이 있습니다. 주도적으로 모임을 이끌지만 독단적 결정을 주의하세요.',
    '따뜻하고 포용력 있는 친구 관계. 친구들의 고민을 잘 들어주고 위로해줍니다. 에너지 소진에 주의하고 나를 위한 시간도 필요합니다.',
    '신뢰할 수 있는 든든한 친구. 오래된 인연을 소중히 여기며 한번 맺은 우정은 깊고 오래갑니다. 새로운 만남에는 다소 느리게 마음을 엽니다.',
    '정의롭고 공정한 친구 관계. 불의를 보면 나서는 타입으로 신뢰도가 높습니다. 비판적인 시각이 간혹 오해를 살 수 있으니 표현에 주의하세요.',
    '지적 교류를 즐기는 넓은 인간관계. 다양한 분야의 사람들과 친분을 맺지만 깊은 관계는 소수로 유지합니다.',
  ];
  return data[elem];
}

function getGuirenInfo(analysis) {
  const yong = analysis.yongsin;
  const dirs = ['동쪽', '남쪽', '중앙', '서쪽', '북쪽'];
  const colors = ['초록색', '붉은색', '황토색', '흰색', '검정·남색'];
  const dir = dirs[yong] || '동쪽';
  const col = colors[yong] || '초록색';
  return `귀인의 방향은 <strong>${dir}</strong>입니다. <strong>${col}</strong> 계열 옷이나 소품이 귀인을 불러옵니다. 생기(生氣) 방향으로 중요한 약속이나 사업 미팅을 잡으면 좋은 결과가 따릅니다. 봄·여름 인연이 특히 강합니다.`;
}

function getWarningRelation(dayS, analysis) {
  const elem = STEM_ELEM[dayS];
  const data = [
    '자신의 원칙을 강요하거나 상대의 자존심을 무시하는 사람과의 갈등이 생길 수 있습니다. 金(금) 기운이 강한 사람과의 관계에서 마찰이 잦습니다.',
    '冷정하고 비판적인 사람, 혹은 지나치게 현실적인 사람과 충돌할 수 있습니다. 水(수) 기운이 강한 사람에게 상처받을 수 있으니 주의하세요.',
    '변화를 강요하거나 기존 가치관을 흔드는 사람과 갈등이 생깁니다. 木(목) 기운이 강한 사람과의 관계에서 스트레스를 받을 수 있습니다.',
    '규칙을 무시하거나 원칙 없이 행동하는 사람을 참기 어렵습니다. 火(화) 기운이 강한 즉흥적인 사람과의 관계에 주의가 필요합니다.',
    '감정적으로 지나치게 의존하거나 집착하는 사람과의 관계가 부담이 됩니다. 土(토) 기운이 강한 고집스러운 사람과 갈등이 생길 수 있습니다.',
  ];
  return data[elem];
}

/* ── 오행 상세 카드 렌더 ── */
function renderOhaengDetail(ohaeng) {
  const container = document.getElementById('ohaengDetailGrid');
  if (!container) return;

  const OHAENG_FULL = [
    {
      elem: '木', color: 'var(--wood)', bgColor: 'rgba(52,211,153,0.08)',
      kor: '목', season: '봄', dir: '동쪽', color_name: '초록색',
      organ: '간(肝) · 담(膽)', sense: '눈 · 시각', flavor: '신맛',
      trait: '인(仁) — 어짊, 성장, 발전, 창의',
      job: '교육, 의료, 식물·농업, 문화예술',
      personality: '진취적, 직관적, 이상주의적',
      lucky_item: '나무 소품, 초록색 계열, 꽃',
    },
    {
      elem: '火', color: 'var(--fire)', bgColor: 'rgba(239,68,68,0.08)',
      kor: '화', season: '여름', dir: '남쪽', color_name: '붉은색',
      organ: '심장(心) · 소장(小腸)', sense: '혀 · 미각', flavor: '쓴맛',
      trait: '예(禮) — 예의, 명예, 열정, 표현',
      job: '방송, 마케팅, 연예, 정치, 리더십',
      personality: '열정적, 표현력, 카리스마',
      lucky_item: '붉은색 계열, 촛불, 태양 이미지',
    },
    {
      elem: '土', color: 'var(--earth)', bgColor: 'rgba(234,179,8,0.08)',
      kor: '토', season: '환절기', dir: '중앙', color_name: '황토색',
      organ: '비장(脾) · 위장(胃)', sense: '입 · 미각', flavor: '단맛',
      trait: '신(信) — 믿음, 안정, 중용, 포용',
      job: '부동산, 금융, 농업, 공무원, 건축',
      personality: '신중, 안정적, 책임감',
      lucky_item: '황토·노란색, 도자기, 돌',
    },
    {
      elem: '金', color: 'var(--metal)', bgColor: 'rgba(148,163,184,0.08)',
      kor: '금', season: '가을', dir: '서쪽', color_name: '흰색',
      organ: '폐(肺) · 대장(大腸)', sense: '코 · 후각', flavor: '매운맛',
      trait: '의(義) — 의리, 정의, 원칙, 결단',
      job: '법조, 군경, 의학, 금속·제조, 금융',
      personality: '결단력, 원칙적, 정의감',
      lucky_item: '금·은색, 금속 소품, 흰색 계열',
    },
    {
      elem: '水', color: 'var(--water)', bgColor: 'rgba(96,165,250,0.08)',
      kor: '수', season: '겨울', dir: '북쪽', color_name: '검정·남색',
      organ: '신장(腎) · 방광(膀胱)', sense: '귀 · 청각', flavor: '짠맛',
      trait: '지(智) — 지혜, 통찰, 유연성, 적응',
      job: '연구, IT, 철학, 금융, 외교',
      personality: '직관적, 지혜롭, 유연성',
      lucky_item: '검정·남색, 물 관련 소품, 원석',
    },
  ];

  container.innerHTML = OHAENG_FULL.map((o, i) => `
    <div class="oh-detail-card" style="border-color:${o.color}33;background:${o.bgColor}">
      <div class="oh-detail-elem" style="color:${o.color}">${o.elem}(${o.kor})</div>
      <div class="oh-detail-name">내 사주에 ${ohaeng[i]}개</div>
      <div class="oh-detail-list">
        <div>🌸 <b>계절</b>: ${o.season}</div>
        <div>🧭 <b>방향</b>: ${o.dir}</div>
        <div>🎨 <b>색상</b>: ${o.color_name}</div>
        <div>🫀 <b>장기</b>: ${o.organ}</div>
        <div>👅 <b>맛</b>: ${o.flavor}</div>
        <div>✨ <b>덕목</b>: ${o.trait.split('—')[0].trim()}</div>
        <div>💼 <b>직업</b>: ${o.job}</div>
        <div>🍀 <b>행운 아이템</b>: ${o.lucky_item}</div>
      </div>
    </div>`).join('');

  // Ohaeng relations (상생상극)
  const relEl = document.getElementById('ohaengRelations');
  if (relEl) {
    const weakElem = ohaeng.indexOf(Math.min(...ohaeng));
    const strongElem = ohaeng.indexOf(Math.max(...ohaeng));
    const weakName = ELEM_NAME[weakElem] + '(' + ELEM_KOR[weakElem].split('(')[0] + ')';
    const strongName = ELEM_NAME[strongElem] + '(' + ELEM_KOR[strongElem].split('(')[0] + ')';
    relEl.innerHTML = `
      <div class="domain-card" style="background:linear-gradient(135deg,rgba(52,211,153,0.05),rgba(96,165,250,0.05));border-color:rgba(52,211,153,0.2)">
        <div class="domain-card-head" style="color:#34d399">🔄 오행 상생상극 관계</div>
        <div class="domain-card-body">
          <p>당신의 사주에서 <strong style="color:${ELEM_COLOR[strongElem]}">${strongName}</strong>이 가장 강하고,
          <strong style="color:${ELEM_COLOR[weakElem]}">${weakName}</strong>이 가장 부족합니다.</p>
          <p style="margin-top:8px"><b>상생(相生) — 서로를 돕는 관계</b><br>
          木→火→土→金→水→木 (나무는 불을 낳고, 불은 흙을 만들고, 흙은 금을 품고, 금은 물을 낳고, 물은 나무를 키운다)</p>
          <p style="margin-top:8px"><b>상극(相剋) — 서로를 견제하는 관계</b><br>
          木→土, 土→水, 水→火, 火→金, 金→木 (나무는 흙을 제압하고, 흙은 물을 막고...)</p>
          <p style="margin-top:8px">부족한 <strong style="color:${ELEM_COLOR[weakElem]}">${weakName}</strong>을 보완하는 음식·색상·방향을 생활에 활용하면 균형 잡힌 삶에 도움이 됩니다.</p>
        </div>
      </div>`;
  }
}

/* ── 성격 점수 렌더 ── */
function renderPersonalityScores(pillars, analysis) {
  const container = document.getElementById('personalityScores');
  if (!container) return;
  const dayS = pillars.day.s;
  const elem = STEM_ELEM[dayS];
  const isShin = analysis.isBodyStrong;

  // Scores based on element + body strength
  const scoreMap = [
    { label:'리더십',  scores:[85,60,70,90,65] },
    { label:'창의성',  scores:[80,70,60,55,85] },
    { label:'사교성',  scores:[70,85,60,65,75] },
    { label:'인내력',  scores:[65,55,85,80,70] },
    { label:'직관력',  scores:[60,75,55,65,90] },
    { label:'실행력',  scores:[90,80,65,75,60] },
  ];

  const html = scoreMap.map(s => {
    let val = s.scores[elem];
    if (isShin) val = Math.min(100, val + 8);
    return `
      <div class="score-row">
        <span class="score-label">${s.label}</span>
        <div class="score-track"><div class="score-fill" style="width:0%" data-val="${val}"></div></div>
        <span class="score-val">${val}</span>
      </div>`;
  }).join('');

  container.innerHTML = `
    <div class="domain-card">
      <div class="domain-card-head" style="color:#60a5fa">🎯 기질 점수</div>
      ${html}
    </div>`;

  // Animate bars
  requestAnimationFrame(() => {
    container.querySelectorAll('.score-fill').forEach(el => {
      setTimeout(() => { el.style.width = el.dataset.val + '%'; }, 100);
    });
  });
}

/* ── 연도별 운세 렌더 ── */
function renderYearlySection(pillars, analysis, birthYear) {
  const container = document.getElementById('yearlySection');
  if (!container) return;

  const curYear = new Date().getFullYear();
  const years = [];
  for (let y = curYear; y < curYear + 10; y++) years.push(y);

  const dayMasterElem = STEM_ELEM[pillars.day.s];
  const yong = analysis.yongsin;

  const YEAR_STEMS  = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
  const YEAR_BRANCHES = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
  const YEAR_THEMES = [
    '새로운 시작, 도전의 해',
    '안정 속 성장의 해',
    '변화와 발전의 해',
    '관계와 협력의 해',
    '토대를 다지는 해',
    '내면 성찰의 해',
    '결실과 수확의 해',
    '정리와 마무리의 해',
    '지식과 탐구의 해',
    '창의와 표현의 해',
  ];

  const html = years.map((y, idx) => {
    const stemIdx  = ((y - 1984) % 10 + 10) % 10;
    const branchIdx= ((y - 1984) % 12 + 12) % 12;
    const yearElem = STEM_ELEM[stemIdx];
    const score    = FORTUNE_MATRIX[dayMasterElem][yearElem];
    const isGood   = yearElem === yong;
    const isBad    = yearElem === CONTROLS[yong];
    const grade    = score >= 75 ? '대길' : score >= 60 ? '길' : score >= 45 ? '중' : score >= 30 ? '흉' : '대흉';
    const gradeColor = score >= 75 ? '#34d399' : score >= 60 ? '#60a5fa' : score >= 45 ? '#eab308' : '#f87171';
    const age = y - birthYear;

    return `
      <div style="display:flex;align-items:center;gap:12px;padding:14px 16px;
        background:${isGood ? 'rgba(52,211,153,0.07)' : isBad ? 'rgba(239,68,68,0.05)' : 'var(--bg-card)'};
        border:1px solid ${isGood ? 'rgba(52,211,153,0.25)' : isBad ? 'rgba(239,68,68,0.2)' : 'var(--border)'};
        border-radius:12px;margin-bottom:10px">
        <div style="text-align:center;min-width:64px">
          <div style="font-size:18px;font-weight:800;color:var(--txt)">${y}</div>
          <div style="font-size:11px;color:var(--txt-muted)">${YEAR_STEMS[stemIdx]}${YEAR_BRANCHES[branchIdx]}년 · ${age}세</div>
        </div>
        <div style="flex:1">
          <div style="font-size:13px;font-weight:600;color:var(--txt);margin-bottom:4px">
            ${YEAR_THEMES[idx % 10]}
            ${isGood ? ' ⭐ 용신운' : isBad ? ' ⚠️ 기신운' : ''}
          </div>
          <div style="font-size:12px;color:var(--txt-muted)">${getYearlyAdvice(dayMasterElem, yearElem, isGood, isBad)}</div>
        </div>
        <div style="text-align:center;min-width:44px">
          <div style="font-size:13px;font-weight:800;color:${gradeColor}">${grade}</div>
          <div style="font-size:11px;color:var(--txt-muted)">${score}점</div>
        </div>
      </div>`;
  }).join('');

  container.innerHTML = html;
}

function getYearlyAdvice(dayElem, yearElem, isGood, isBad) {
  if (isGood) return '귀인의 도움과 좋은 기회가 따르는 해입니다. 중요한 결정과 투자, 새로운 시작에 좋은 시기입니다.';
  if (isBad)  return '신중한 결정이 필요한 해입니다. 무리한 투자와 모험은 자제하고 현상 유지에 집중하세요.';
  const combos = {
    '00': '내적 성장에 집중하는 해. 자기계발과 관계 개선에 좋습니다.',
    '01': '창의적 표현과 소통이 활발한 해입니다.',
    '10': '새로운 인연과 기회가 찾아오는 해입니다.',
    '11': '안정적인 발전이 가능한 해입니다.',
    '20': '재물 관리와 건강에 집중해야 할 해입니다.',
    '22': '인내와 노력이 결실을 맺는 해입니다.',
  };
  return combos[`${dayElem}${yearElem}`] || '균형 잡힌 전진이 필요한 해입니다. 작은 성취를 쌓아가세요.';
}

/* ──────────────────────────────────────
   SCROLL-BASED TOC
────────────────────────────────────── */
function initSajuToc() {
  const toc = document.getElementById('sajuToc');
  if (!toc) return;

  // Click → scroll to section
  toc.addEventListener('click', e => {
    const btn = e.target.closest('.saju-toc-btn');
    if (!btn) return;
    const target = document.getElementById(btn.dataset.target);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  // IntersectionObserver to highlight active TOC button
  const sections = document.querySelectorAll('.saju-section');
  if (!sections.length) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        document.querySelectorAll('.saju-toc-btn').forEach(b => {
          b.classList.toggle('active', b.dataset.target === id);
        });
      }
    });
  }, { rootMargin: '-20% 0px -60% 0px', threshold: 0 });

  sections.forEach(s => obs.observe(s));
}

/* ──────────────────────────────────────
   INIT
────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initStars();
  populateForm();
  initTooltips();

  document.getElementById('analyzeBtn')?.addEventListener('click', runAnalysis);

  document.getElementById('backBtn')?.addEventListener('click', () => {
    document.getElementById('resultSection').style.display = 'none';
    document.getElementById('formSection').style.display = '';
    window.scrollTo({ top: 0 });
  });

  // Flow sub-tabs
  document.getElementById('flowTabs')?.addEventListener('click', e => {
    const btn = e.target.closest('.ft');
    if (!btn) return;
    document.querySelectorAll('.ft').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    if (state.pillars) renderFlowTab(btn.dataset.p);
  });

  // Deep analysis tabs
  document.getElementById('deepTabBar')?.addEventListener('click', e => {
    const btn = e.target.closest('.dtb');
    if (!btn) return;
    document.querySelectorAll('.dtb').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    if (state.pillars) renderDeepCard(btn.dataset.d);
  });
});
