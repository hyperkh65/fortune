/* ===================================================
   AI Fortune - Main Script
   =================================================== */

/* ---------- Stars ---------- */
(function initStars() {
  const container = document.getElementById('starsContainer');
  if (!container) return;
  const count = window.innerWidth < 600 ? 80 : 150;
  for (let i = 0; i < count; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    const size = Math.random() * 2.5 + 0.5;
    star.style.cssText = [
      `width:${size}px`,
      `height:${size}px`,
      `top:${Math.random() * 100}%`,
      `left:${Math.random() * 100}%`,
      `--dur:${(Math.random() * 4 + 2).toFixed(1)}s`,
      `--delay:${(Math.random() * 4).toFixed(1)}s`,
      `opacity:${Math.random() * 0.6 + 0.2}`
    ].join(';');
    container.appendChild(star);
  }
})();

/* ---------- Tarot Data ---------- */
const TAROT_DECK = [
  { emoji: '🌟', name: '별', meaning: '희망과 새로운 시작' },
  { emoji: '☀️', name: '태양', meaning: '성공과 활력' },
  { emoji: '🌙', name: '달', meaning: '직관과 신비' },
  { emoji: '⚡', name: '탑', meaning: '변화와 각성' },
  { emoji: '🌈', name: '세계', meaning: '완성과 성취' },
  { emoji: '❤️', name: '연인', meaning: '사랑과 선택' },
  { emoji: '⚖️', name: '정의', meaning: '균형과 진실' },
  { emoji: '🔮', name: '고위 여사제', meaning: '지혜와 내면' },
  { emoji: '🦁', name: '힘', meaning: '용기와 인내' },
  { emoji: '🎭', name: '광대', meaning: '자유와 모험' },
  { emoji: '🚀', name: '전차', meaning: '의지와 승리' },
  { emoji: '🌀', name: '운명의 수레바퀴', meaning: '기회와 전환' },
  { emoji: '🕊️', name: '절제', meaning: '조화와 인내' },
  { emoji: '👑', name: '황제', meaning: '권위와 안정' },
  { emoji: '🌺', name: '여황제', meaning: '풍요와 창조' },
  { emoji: '🏔️', name: '은둔자', meaning: '탐구와 성찰' },
  { emoji: '💀', name: '죽음', meaning: '변환과 재탄생' },
  { emoji: '😈', name: '악마', meaning: '속박과 해방' },
  { emoji: '🧙', name: '마법사', meaning: '의지와 능력' },
  { emoji: '🌊', name: '달과 바다', meaning: '감정과 잠재의식' }
];

/* ---------- Fortune Data ---------- */
const LUCKY_COLORS = ['빨강', '파랑', '초록', '노랑', '보라', '주황', '흰색', '금색', '은색', '분홍'];
const LUCKY_DIRECTIONS = ['동쪽', '서쪽', '남쪽', '북쪽', '북동쪽', '남서쪽', '북서쪽', '남동쪽'];
const LUCKY_STONES = ['자수정', '수정', '루비', '에메랄드', '사파이어', '오팔', '진주', '터콰이즈', '가넷', '문스톤'];

const FORTUNE_MESSAGES = [
  '오늘은 새로운 기회가 찾아올 날입니다. 주변을 잘 살펴보세요.',
  '긍정적인 에너지가 가득한 하루가 될 것입니다. 자신감을 갖고 행동하세요.',
  '인내심을 갖고 기다리면 좋은 결과가 따라올 것입니다.',
  '사람들과의 교류에서 귀중한 인연이 만들어질 수 있습니다.',
  '오늘의 직감을 믿으세요. 올바른 방향을 가리키고 있습니다.',
  '작은 것에서 행복을 찾는 날입니다. 주변의 소중함을 느껴보세요.',
  '예상치 못한 좋은 소식이 들려올 수 있습니다. 기대해 보세요.',
  '창의적인 아이디어가 빛을 발하는 날입니다. 과감히 표현해 보세요.',
  '오래된 인연이 다시 이어질 가능성이 있습니다. 열린 마음을 가져요.',
  '오늘 내린 결정이 미래에 큰 도움이 될 것입니다. 신중하게 판단하세요.',
];

const DETAIL_FORTUNES = [
  '오늘은 긍정적인 기운이 당신을 감싸고 있습니다. 새로운 도전을 두려워하지 마세요. 특히 오후 시간대에 중요한 결정을 내릴 기회가 올 수 있으니 준비해 두시길 바랍니다. 주변 사람들과의 대화에서 뜻밖의 힌트를 얻을 수도 있습니다.',
  '우주의 에너지가 오늘 당신에게 집중되고 있습니다. 오랫동안 고민하던 문제에 대한 해답이 갑자기 떠오를 수 있습니다. 감사한 마음으로 하루를 시작하면 더 큰 행운이 따릅니다. 저녁 시간에는 소중한 사람과 시간을 보내보세요.',
  '인내와 노력이 드디어 결실을 맺을 시기가 다가오고 있습니다. 그동안의 수고가 헛되지 않았음을 곧 알게 될 것입니다. 오늘은 특히 재정적인 면에서 신중한 판단이 필요합니다. 충동적인 소비는 자제하는 것이 현명합니다.',
  '당신의 직관이 평소보다 강해진 날입니다. 내면의 목소리에 귀를 기울이면 올바른 선택을 할 수 있습니다. 새로운 만남이나 모임에서 인생의 중요한 사람을 만날 수도 있습니다. 밝은 표정으로 사람들을 대하세요.',
  '창의성과 영감이 넘치는 하루입니다. 예술적 활동이나 취미 활동에 몰입해 보세요. 오늘 시작하는 프로젝트는 좋은 결과로 이어질 가능성이 높습니다. 아이디어가 떠오르면 즉시 메모해 두는 것이 좋습니다.',
];

/* ---------- Utility ---------- */
function seededRandom(seed) {
  let s = seed;
  return function () {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function getBirthSeed(birthStr) {
  if (!birthStr) return Date.now();
  const d = new Date(birthStr);
  return (d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate()) + new Date().toISOString().slice(0, 10).replace(/-/g, '') * 1;
}

function showToast(msg, duration = 2500) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toast.classList.remove('show'), duration);
}

/* ---------- Navigation ---------- */
function scrollToFortune() {
  const el = document.getElementById('fortune');
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ---------- Gender ---------- */
function selectGender(btn) {
  document.querySelectorAll('.gender-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

/* ---------- Fortune Generation ---------- */
let currentFortune = null;

function generateFortune() {
  const name = document.getElementById('nameInput').value.trim();
  const birth = document.getElementById('birthInput').value;

  if (!name) {
    showToast('이름을 입력해 주세요.');
    document.getElementById('nameInput').focus();
    return;
  }
  if (!birth) {
    showToast('생년월일을 입력해 주세요.');
    document.getElementById('birthInput').focus();
    return;
  }

  const btn = document.getElementById('fortuneBtn');
  const btnText = btn.querySelector('.btn-text');
  const btnLoading = btn.querySelector('.btn-loading');

  btn.disabled = true;
  btnText.style.display = 'none';
  btnLoading.style.display = 'inline-flex';

  setTimeout(() => {
    const rng = seededRandom(getBirthSeed(birth));
    const scores = {
      love:   Math.floor(rng() * 40 + 55),
      money:  Math.floor(rng() * 40 + 55),
      health: Math.floor(rng() * 40 + 55),
      luck:   Math.floor(rng() * 40 + 55),
    };
    scores.overall = Math.round((scores.love + scores.money + scores.health + scores.luck) / 4);

    currentFortune = {
      name,
      birth,
      scores,
      message: FORTUNE_MESSAGES[Math.floor(rng() * FORTUNE_MESSAGES.length)],
      detail:  DETAIL_FORTUNES[Math.floor(rng() * DETAIL_FORTUNES.length)],
      luckyColor:     LUCKY_COLORS[Math.floor(rng() * LUCKY_COLORS.length)],
      luckyNumber:    Math.floor(rng() * 9 + 1),
      luckyDirection: LUCKY_DIRECTIONS[Math.floor(rng() * LUCKY_DIRECTIONS.length)],
      luckyStone:     LUCKY_STONES[Math.floor(rng() * LUCKY_STONES.length)],
    };

    btn.disabled = false;
    btnText.style.display = 'inline';
    btnLoading.style.display = 'none';

    renderFortuneResult(currentFortune);
  }, 1800);
}

function renderFortuneResult(fortune) {
  const today = new Date();
  const dateStr = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`;

  document.getElementById('fortuneName').textContent = `${fortune.name}님의 오늘 운세`;
  document.getElementById('fortuneDate').textContent = dateStr;
  document.getElementById('fortuneMessage').textContent = fortune.message;
  document.getElementById('detailText').textContent = fortune.detail;

  document.getElementById('loveScore').textContent   = fortune.scores.love;
  document.getElementById('moneyScore').textContent  = fortune.scores.money;
  document.getElementById('healthScore').textContent = fortune.scores.health;
  document.getElementById('luckScore').textContent   = fortune.scores.luck;

  document.getElementById('luckyColorVal').textContent     = fortune.luckyColor;
  document.getElementById('luckyNumberVal').textContent    = fortune.luckyNumber;
  document.getElementById('luckyDirection').textContent    = fortune.luckyDirection;
  document.getElementById('luckyStone').textContent        = fortune.luckyStone;

  document.getElementById('fortuneFormCard').style.display = 'none';
  const resultEl = document.getElementById('fortuneResult');
  resultEl.style.display = 'block';

  // Animate score ring
  requestAnimationFrame(() => {
    const circumference = 339.3;
    const offset = circumference - (fortune.scores.overall / 100) * circumference;
    const fill = document.getElementById('scoreFill');
    if (fill) {
      // Inject gradient def if not present
      const svg = fill.closest('svg');
      if (svg && !svg.querySelector('defs')) {
        svg.insertAdjacentHTML('afterbegin',
          `<defs><linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#f5c518"/>
            <stop offset="100%" stop-color="#e040fb"/>
          </linearGradient></defs>`
        );
      }
      fill.style.strokeDashoffset = offset;
    }

    // Count up score number
    const scoreEl = document.getElementById('overallScore');
    let current = 0;
    const target = fortune.scores.overall;
    const step = Math.ceil(target / 40);
    const counter = setInterval(() => {
      current = Math.min(current + step, target);
      if (scoreEl) scoreEl.textContent = current;
      if (current >= target) clearInterval(counter);
    }, 35);

    // Animate category bars
    setTimeout(() => {
      setBar('loveBar',   fortune.scores.love);
      setBar('moneyBar',  fortune.scores.money);
      setBar('healthBar', fortune.scores.health);
      setBar('luckBar',   fortune.scores.luck);
    }, 300);
  });

  resultEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function setBar(id, score) {
  const el = document.getElementById(id);
  if (el) el.style.width = `${score}%`;
}

function resetFortune() {
  document.getElementById('fortuneFormCard').style.display = 'block';
  document.getElementById('fortuneResult').style.display = 'none';
  document.getElementById('nameInput').value = '';
  document.getElementById('birthInput').value = '';
  document.querySelectorAll('.gender-btn').forEach((b, i) => {
    b.classList.toggle('active', i === 0);
  });
  currentFortune = null;
  document.getElementById('fortune').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ---------- Share ---------- */
function shareKakao() {
  const url = window.location.href;
  const text = currentFortune
    ? `${currentFortune.name}님의 오늘 운세: ${currentFortune.scores.overall}점! AI Fortune에서 당신의 운세도 확인해보세요.`
    : 'AI Fortune에서 오늘의 운세를 확인해보세요!';

  if (window.Kakao && window.Kakao.isInitialized && window.Kakao.isInitialized()) {
    window.Kakao.Link.sendDefault({
      objectType: 'feed',
      content: {
        title: 'AI Fortune ✨ 오늘의 운세',
        description: text,
        imageUrl: 'https://aifortune.live/og-image.jpg',
        link: { mobileWebUrl: url, webUrl: url }
      }
    });
  } else {
    const kakaoLink = `https://story.kakao.com/share?url=${encodeURIComponent(url)}`;
    window.open(kakaoLink, '_blank', 'noopener,noreferrer');
  }
}

function shareInstagram() {
  copyLink();
  showToast('링크가 복사되었습니다. 인스타그램에 붙여넣기 해주세요! 📸', 3000);
}

function copyLink() {
  const url = window.location.href;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url).then(() => {
      showToast('링크가 클립보드에 복사되었습니다! 🔗');
    }).catch(() => fallbackCopy(url));
  } else {
    fallbackCopy(url);
  }
}

function fallbackCopy(text) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0;';
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand('copy');
    showToast('링크가 클립보드에 복사되었습니다! 🔗');
  } catch {
    showToast('링크 복사에 실패했습니다. 직접 복사해 주세요.');
  }
  document.body.removeChild(ta);
}

/* ---------- Tarot ---------- */
let selectedCards = [];
let tarotShuffled = [];

function initTarot() {
  // Shuffle deck
  tarotShuffled = [...TAROT_DECK].sort(() => Math.random() - 0.5).slice(0, 9);

  const container = document.getElementById('tarotCards');
  if (!container) return;
  container.innerHTML = '';
  selectedCards = [];

  tarotShuffled.forEach((card, idx) => {
    const cardEl = document.createElement('div');
    cardEl.className = 'tarot-card';
    cardEl.dataset.idx = idx;
    cardEl.innerHTML = `
      <div class="tarot-card-inner">
        <div class="tarot-back"></div>
        <div class="tarot-face">
          <div class="tarot-face-emoji">${card.emoji}</div>
          <div class="tarot-face-name">${card.name}</div>
          <div class="tarot-face-meaning">${card.meaning}</div>
        </div>
      </div>`;
    cardEl.addEventListener('click', () => onTarotClick(cardEl, idx));
    container.appendChild(cardEl);
  });

  document.getElementById('tarotBtn').style.display = 'none';
  document.querySelector('.tarot-hint').textContent = '카드를 클릭하여 선택하세요 (3장)';
}

function onTarotClick(cardEl, idx) {
  if (cardEl.classList.contains('flipped')) return;

  if (cardEl.classList.contains('selected')) {
    cardEl.classList.remove('selected');
    selectedCards = selectedCards.filter(i => i !== idx);
  } else {
    if (selectedCards.length >= 3) {
      showToast('3장의 카드만 선택할 수 있습니다.');
      return;
    }
    cardEl.classList.add('selected');
    selectedCards.push(idx);
  }

  const hint = document.querySelector('.tarot-hint');
  const remaining = 3 - selectedCards.length;
  if (remaining > 0) {
    hint.textContent = `${remaining}장 더 선택하세요`;
  } else {
    hint.textContent = '카드 공개 버튼을 눌러주세요!';
  }

  const btn = document.getElementById('tarotBtn');
  btn.style.display = selectedCards.length === 3 ? 'block' : 'none';
}

function revealTarot() {
  if (selectedCards.length !== 3) {
    showToast('카드 3장을 선택해 주세요.');
    return;
  }

  const cards = document.querySelectorAll('.tarot-card');
  selectedCards.forEach((idx, order) => {
    setTimeout(() => {
      const card = cards[idx];
      if (card) card.classList.add('flipped');
    }, order * 400);
  });

  document.getElementById('tarotBtn').style.display = 'none';
  document.querySelector('.tarot-hint').textContent = '카드가 당신의 운명을 말해줍니다';

  setTimeout(() => {
    const resetBtn = document.createElement('button');
    resetBtn.className = 'btn-tarot';
    resetBtn.style.marginTop = '20px';
    resetBtn.textContent = '🔄 다시 뽑기';
    resetBtn.onclick = initTarot;
    const existing = document.querySelector('.tarot-section .btn-retry-tarot');
    if (!existing) {
      resetBtn.classList.add('btn-retry-tarot');
      document.querySelector('.tarot-section .container').appendChild(resetBtn);
    }
  }, selectedCards.length * 400 + 600);
}

/* ---------- Media Section (Instagram param) ---------- */
function handleMediaParam() {
  const params = new URLSearchParams(window.location.search);
  const mediaId = params.get('media_id');
  const username = params.get('username');

  if (!mediaId) return;

  const section = document.getElementById('mediaSection');
  if (section) section.style.display = 'block';

  if (username) {
    const usernameEl = document.getElementById('mediaUsername');
    if (usernameEl) usernameEl.textContent = `@${username}`;
    const avatarEl = document.getElementById('mediaAvatar');
    if (avatarEl) avatarEl.textContent = username.charAt(0).toUpperCase();
  }

  // Embed image if media URL param provided
  const mediaUrl = params.get('media_url');
  if (mediaUrl) {
    const wrap = document.getElementById('mediaImageWrap');
    if (wrap) {
      const img = document.createElement('img');
      img.src = decodeURIComponent(mediaUrl);
      img.alt = 'Instagram media';
      img.style.cssText = 'width:100%;height:auto;display:block;border-radius:12px;';
      wrap.innerHTML = '';
      wrap.appendChild(img);
    }
  }
}

/* ---------- Crystal Ball Interaction ---------- */
function initCrystalBall() {
  const ball = document.getElementById('crystalBall');
  if (!ball) return;
  ball.style.cursor = 'pointer';
  ball.addEventListener('click', () => {
    ball.style.animation = 'none';
    ball.style.transform = 'scale(1.08)';
    ball.style.filter = 'drop-shadow(0 0 60px rgba(168,85,247,0.9))';
    setTimeout(() => {
      ball.style.transform = '';
      ball.style.filter = '';
      ball.style.animation = 'float 4s ease-in-out infinite';
      scrollToFortune();
    }, 500);
  });
}

/* ---------- Init ---------- */
document.addEventListener('DOMContentLoaded', () => {
  initTarot();
  handleMediaParam();
  initCrystalBall();

  // Set default birth date max to today
  const birthInput = document.getElementById('birthInput');
  if (birthInput) {
    birthInput.max = new Date().toISOString().split('T')[0];
  }
});
