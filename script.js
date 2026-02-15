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
    html += `<path d="${d}" fill="none" stroke="rgba(255,255,255,0.07)" stroke-width="1"/>`;
  }

  // Axis lines
  for (let i = 0; i < 5; i++) {
    const v = vertex(i, R);
    html += `<line x1="${cx}" y1="${cy}" x2="${v.x.toFixed(1)}" y2="${v.y.toFixed(1)}" stroke="rgba(255,255,255,0.07)" stroke-width="1"/>`;
  }

  // Data polygon
  const pts = Array.from({length:5}, (_, i) => {
    const val = counts[i];
    const r = R * val / max;
    return vertex(i, r);
  });
  const fill = pts.map((p,i) => (i===0?'M':'L')+p.x.toFixed(1)+','+p.y.toFixed(1)).join(' ')+'Z';
  html += `<path d="${fill}" fill="rgba(61,220,132,0.18)" stroke="var(--accent)" stroke-width="2" stroke-linejoin="round"/>`;

  // Data dots
  for (let i = 0; i < 5; i++) {
    const p = pts[i];
    html += `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="5" fill="${colors[i]}" stroke="#0a0a0a" stroke-width="1.5"/>`;
  }

  // Labels
  for (let i = 0; i < 5; i++) {
    const v = vertex(i, R + 20);
    html += `<text x="${v.x.toFixed(1)}" y="${v.y.toFixed(1)}" text-anchor="middle" dominant-baseline="middle"
      fill="${colors[i]}" font-size="16" font-weight="700" font-family="var(--serif)">${labels[i]}</text>`;
    html += `<text x="${v.x.toFixed(1)}" y="${(v.y + 16).toFixed(1)}" text-anchor="middle"
      fill="rgba(255,255,255,0.45)" font-size="10">${counts[i]}</text>`;
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
    html += `<text x="${padL-4}" y="${y.toFixed(1)}" text-anchor="end" dominant-baseline="middle" fill="rgba(255,255,255,0.3)" font-size="9">${pct}</text>`;
    html += `<line x1="${padL}" y1="${y.toFixed(1)}" x2="${W-padR}" y2="${y.toFixed(1)}" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>`;
  }

  // Bars
  const barW = bw * 0.65;
  for (let i = 0; i < n; i++) {
    const item = flowItems[i];
    const x = padL + i * bw + bw * 0.175;
    const barH = maxH * item.score / 100;
    const y = padT + maxH - barH;
    const color = item.isNow ? '#ffffff' : (item.score > 0 ? elemColors[item.elem] : '#333');
    const opacity = item.isNow ? 1 : 0.8;

    // Bar
    html += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${barW.toFixed(1)}" height="${barH.toFixed(1)}"
      fill="${color}" opacity="${opacity}" rx="3"/>`;

    // NOW label
    if (item.isNow) {
      html += `<text x="${(x + barW/2).toFixed(1)}" y="${(y - 8).toFixed(1)}" text-anchor="middle"
        fill="#ffffff" font-size="9" font-weight="700">NOW</text>`;
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
      fill="rgba(255,255,255,0.5)" font-size="${n > 15 ? 7 : 9}">${item.label}</text>`;
    if (item.sublabel && n <= 12) {
      html += `<text x="${(x + barW/2).toFixed(1)}" y="${(H - padB + 22).toFixed(1)}" text-anchor="middle"
        fill="rgba(255,255,255,0.25)" font-size="7">${item.sublabel}</text>`;
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

      // Switch sections
      document.getElementById('formSection').style.display = 'none';
      document.getElementById('resultSection').style.display = 'block';

      // Reset tab to overview
      switchTab('overview');

      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch(e) {
      console.error(e);
      showToast('분석 중 오류가 발생했습니다. 입력값을 확인해주세요.');
    }

    btn.disabled = false;
    btn.innerHTML = '사주 분석 시작 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>';
  }, 600);
}

function switchTab(tabId) {
  document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tb').forEach(b => b.classList.remove('active'));
  const pane = document.getElementById('tab' + tabId.charAt(0).toUpperCase() + tabId.slice(1));
  if (pane) pane.classList.add('active');
  document.querySelector(`.tb[data-tab="${tabId}"]`)?.classList.add('active');

  // Re-render flow chart if switching to flow
  if (tabId === 'flow' && state.pillars) {
    const activePeriod = document.querySelector('.ft.active')?.dataset.p || 'today';
    renderFlowTab(activePeriod);
  }
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

  // Main tabs
  document.getElementById('tabBar')?.addEventListener('click', e => {
    const btn = e.target.closest('.tb');
    if (btn) switchTab(btn.dataset.tab);
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
