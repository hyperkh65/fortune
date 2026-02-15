'use strict';

/* ── 요가 포즈 데이터 ── */
const POSES = [
  {
    name: '산 자세', sanskrit: 'Tadasana', icon: '🏔️',
    level: 'beginner', benefits: ['flexibility','balance','stress'],
    videoFile: 'tadasana.mp4',
    desc: '모든 서 있는 자세의 기본이 되는 포즈입니다. 바른 자세와 신체 정렬을 익히고 마음의 안정을 찾습니다.',
    steps: [
      '두 발을 모으거나 엉덩이 너비로 벌리고 섭니다.',
      '발바닥 전체를 고르게 바닥에 붙이고 무게를 균등하게 분산합니다.',
      '허벅지 근육을 위로 끌어올리고 꼬리뼈를 살짝 당깁니다.',
      '가슴을 열고 어깨를 뒤로 당겨 등을 펴세요.',
      '정수리를 하늘 방향으로 길게 뻗으며 5~10회 호흡합니다.',
    ],
    hold: '30~60초', repeat: '3~5회',
  },
  {
    name: '하향 개 자세', sanskrit: 'Adho Mukha Svanasana', icon: '🐕',
    level: 'beginner', benefits: ['flexibility','strength','stress'],
    videoFile: 'adho-mukha-svanasana.mp4',
    desc: '전신을 늘려주는 대표적인 요가 포즈입니다. 허리·어깨·햄스트링을 동시에 스트레칭하고 상체 근력을 키웁니다.',
    steps: [
      '네 발 기기 자세에서 시작합니다 (손목은 어깨 아래, 무릎은 엉덩이 아래).',
      '발가락을 구부리고 무릎을 바닥에서 들어 엉덩이를 위로 밀어올립니다.',
      '팔을 곧게 펴고 등을 길게 뻗어 역 V 자 모양을 만듭니다.',
      '뒤꿈치를 바닥 방향으로 누르고 무릎은 살짝 구부려도 됩니다.',
      '5~8회 깊게 호흡하며 자세를 유지합니다.',
    ],
    hold: '30~60초', repeat: '3~5회',
  },
  {
    name: '전사 I', sanskrit: 'Virabhadrasana I', icon: '⚔️',
    level: 'beginner', benefits: ['strength','balance'],
    videoFile: 'virabhadrasana-i.mp4',
    desc: '전신 근력과 집중력을 키우는 포즈입니다. 하체를 강화하고 가슴과 어깨를 열어줍니다.',
    steps: [
      '산 자세에서 시작하여 오른발을 앞으로 크게 내딛습니다.',
      '뒷발은 45° 각도로 바깥쪽으로 돌립니다.',
      '앞 무릎을 90° 굽혀 발목 위에 위치시킵니다.',
      '팔을 위로 들어 올리고 손바닥을 마주보게 합니다.',
      '시선을 앞 또는 위를 향해 5~8회 호흡 후 반대쪽도 반복합니다.',
    ],
    hold: '30~45초', repeat: '좌우 각 3회',
  },
  {
    name: '전사 II', sanskrit: 'Virabhadrasana II', icon: '🏹',
    level: 'beginner', benefits: ['strength','flexibility'],
    videoFile: 'virabhadrasana-ii.mp4',
    desc: '다리와 코어를 강화하고 집중력을 높이는 강력한 서 있는 자세입니다.',
    steps: [
      '두 발을 어깨 너비의 2배 정도 벌리고 섭니다.',
      '오른발을 90° 오른쪽으로 돌리고 왼발은 약간 안쪽으로 돌립니다.',
      '오른 무릎을 90° 굽히고 발목 위에 위치시킵니다.',
      '팔을 양쪽으로 평행하게 뻗고 시선은 오른손 방향을 바라봅니다.',
      '어깨를 이완하고 5~8회 호흡 후 반대쪽을 반복합니다.',
    ],
    hold: '30~45초', repeat: '좌우 각 3회',
  },
  {
    name: '나무 자세', sanskrit: 'Vrksasana', icon: '🌳',
    level: 'beginner', benefits: ['balance','strength'],
    videoFile: 'vrksasana.mp4',
    desc: '균형 감각과 집중력을 기르는 대표적인 한 발 균형 자세입니다. 하체와 코어를 강화합니다.',
    steps: [
      '산 자세에서 시작하여 체중을 왼발로 옮깁니다.',
      '오른발을 들어 올려 발바닥을 왼쪽 허벅지 안쪽에 붙입니다.',
      '두 손을 가슴 앞에서 합장하거나 위로 들어올립니다.',
      '시선을 멀리 고정된 한 점에 집중합니다.',
      '5~10회 호흡 후 발을 바꿔 반대쪽을 반복합니다.',
    ],
    hold: '30~60초', repeat: '좌우 각 3회',
  },
  {
    name: '아이 자세', sanskrit: 'Balasana', icon: '🌙',
    level: 'beginner', benefits: ['stress','flexibility'],
    videoFile: 'balasana.mp4',
    desc: '깊은 이완과 스트레스 해소에 최적인 휴식 자세입니다. 등과 어깨의 긴장을 풀어줍니다.',
    steps: [
      '무릎을 꿇고 앉은 자세에서 시작합니다.',
      '무릎을 엉덩이 너비로 벌리거나 모읍니다.',
      '상체를 앞으로 숙여 이마를 바닥에 닿게 합니다.',
      '팔을 앞으로 뻗거나 몸 옆으로 놓습니다.',
      '눈을 감고 깊게 호흡하며 충분한 시간 동안 이완합니다.',
    ],
    hold: '1~3분', repeat: '필요시 반복',
  },
  {
    name: '코브라 자세', sanskrit: 'Bhujangasana', icon: '🐍',
    level: 'beginner', benefits: ['flexibility','strength'],
    videoFile: 'bhujangasana.mp4',
    desc: '등 근육을 강화하고 가슴을 열어주는 후굴 자세입니다. 척추를 유연하게 만들어 줍니다.',
    steps: [
      '엎드린 자세에서 손을 어깨 옆 바닥에 놓습니다.',
      '팔꿈치를 몸에 붙이고 발등을 바닥에 밀어 넣습니다.',
      '숨을 들이쉬며 가슴과 머리를 바닥에서 들어올립니다.',
      '팔꿈치를 약간 굽혀 상체만 들어올리고 하복부는 바닥에 붙입니다.',
      '3~5회 호흡 후 천천히 내려옵니다.',
    ],
    hold: '15~30초', repeat: '3~5회',
  },
  {
    name: '다리 자세', sanskrit: 'Setu Bandhasana', icon: '🌉',
    level: 'beginner', benefits: ['strength','flexibility'],
    videoFile: 'setu-bandhasana.mp4',
    desc: '엉덩이와 허리 근육을 강화하고 척추와 가슴을 펴주는 후굴 자세입니다.',
    steps: [
      '등을 대고 누운 자세에서 무릎을 구부려 발바닥을 바닥에 놓습니다.',
      '발은 엉덩이 너비로 벌리고 발꿈치가 무릎 아래에 오도록 합니다.',
      '숨을 들이쉬며 엉덩이를 천천히 들어올립니다.',
      '손을 등 아래로 깍지끼고 어깨를 모읍니다 (선택사항).',
      '5~8회 호흡 후 척추를 위에서부터 하나씩 내려놓습니다.',
    ],
    hold: '30~60초', repeat: '3~5회',
  },
  {
    name: '앉아서 전굴', sanskrit: 'Paschimottanasana', icon: '🙏',
    level: 'middle', benefits: ['flexibility','stress'],
    videoFile: 'paschimottanasana.mp4',
    desc: '햄스트링과 등 전체를 깊게 스트레칭하는 전굴 자세입니다. 마음을 가라앉히는 효과가 있습니다.',
    steps: [
      '다리를 앞으로 펴고 바닥에 앉습니다.',
      '발끝을 몸 쪽으로 당기고 허벅지를 바닥으로 누릅니다.',
      '숨을 들이쉬며 척추를 길게 뻗습니다.',
      '내쉬면서 상체를 앞으로 천천히 기울입니다.',
      '두 손으로 발이나 발목을 잡고 5~10회 깊게 호흡합니다.',
    ],
    hold: '30~60초', repeat: '3회',
  },
  {
    name: '앉아서 비틀기', sanskrit: 'Ardha Matsyendrasana', icon: '🌀',
    level: 'middle', benefits: ['flexibility','stress'],
    videoFile: 'ardha-matsyendrasana.mp4',
    desc: '척추를 비틀어 소화기관을 자극하고 등과 어깨의 긴장을 풀어주는 자세입니다.',
    steps: [
      '다리를 앞으로 펴고 앉습니다.',
      '오른 무릎을 굽혀 발을 왼쪽 허벅지 바깥쪽 바닥에 놓습니다.',
      '왼팔로 오른 무릎을 감싸 안고 오른손을 뒤쪽 바닥에 댑니다.',
      '숨을 들이쉬며 척추를 세우고 내쉬면서 오른쪽으로 비틉니다.',
      '5~8회 호흡 후 반대쪽을 반복합니다.',
    ],
    hold: '30~60초', repeat: '좌우 각 3회',
  },
  {
    name: '삼각 자세', sanskrit: 'Trikonasana', icon: '🔺',
    level: 'middle', benefits: ['flexibility','strength','balance'],
    videoFile: 'trikonasana.mp4',
    desc: '전신을 스트레칭하고 허벅지와 코어를 강화하는 서 있는 자세입니다.',
    steps: [
      '두 발을 어깨 너비 2배로 벌리고 오른발을 90° 오른쪽으로 돌립니다.',
      '팔을 양쪽으로 어깨 높이로 펼칩니다.',
      '숨을 내쉬며 오른쪽으로 몸을 기울여 오른손으로 발목이나 바닥을 짚습니다.',
      '왼팔을 하늘로 뻗고 시선을 왼손 방향으로 향합니다.',
      '5~8회 호흡 후 반대쪽을 반복합니다.',
    ],
    hold: '30~45초', repeat: '좌우 각 3회',
  },
  {
    name: '독수리 자세', sanskrit: 'Garudasana', icon: '🦅',
    level: 'middle', benefits: ['balance','strength'],
    videoFile: 'garudasana.mp4',
    desc: '집중력과 균형 감각을 극한으로 키우는 서 있는 자세입니다. 어깨와 허벅지를 깊게 스트레칭합니다.',
    steps: [
      '산 자세에서 시작하여 무릎을 약간 굽힙니다.',
      '오른 다리를 들어 왼 다리에 감아 발끝을 왼 종아리 뒤에 걸칩니다.',
      '두 팔을 앞으로 뻗어 오른팔을 왼팔 위로 감아 손바닥을 마주보게 합니다.',
      '팔을 얼굴 높이로 들어올리고 무릎을 조금 더 굽힙니다.',
      '5~8회 호흡 후 반대쪽을 반복합니다.',
    ],
    hold: '30~45초', repeat: '좌우 각 3회',
  },
  {
    name: '활 자세', sanskrit: 'Dhanurasana', icon: '🏹',
    level: 'advanced', benefits: ['strength','flexibility'],
    videoFile: 'dhanurasana.mp4',
    desc: '전신을 강하게 후굴하여 척추 유연성과 등 근력을 키우는 고급 자세입니다.',
    steps: [
      '엎드린 자세에서 이마를 바닥에 대고 시작합니다.',
      '무릎을 굽혀 발목을 손으로 잡습니다.',
      '숨을 들이쉬며 발을 차면서 상체와 하체를 동시에 들어올립니다.',
      '몸이 활 모양이 되도록 가슴과 넓적다리를 바닥에서 최대한 올립니다.',
      '3~5회 호흡 후 천천히 내려와 아이 자세로 휴식합니다.',
    ],
    hold: '15~30초', repeat: '3회',
  },
  {
    name: '반달 자세', sanskrit: 'Ardha Chandrasana', icon: '🌙',
    level: 'advanced', benefits: ['balance','strength','flexibility'],
    videoFile: 'ardha-chandrasana.mp4',
    desc: '한 발로 균형을 잡으며 몸 전체를 옆으로 펴는 고급 균형 자세입니다.',
    steps: [
      '전사 II 자세에서 시작하여 앞쪽 무릎 위로 상체를 기울입니다.',
      '앞쪽 손을 발 앞 바닥에 놓고 체중을 앞발로 옮깁니다.',
      '뒷발을 들어 올려 바닥과 평행이 되도록 뻗습니다.',
      '위쪽 팔을 하늘로 뻗고 가슴을 옆으로 열어 상체를 회전합니다.',
      '시선은 위 손 방향으로 향하며 5~8회 호흡합니다.',
    ],
    hold: '20~30초', repeat: '좌우 각 2~3회',
  },
  {
    name: '물구나무서기 준비', sanskrit: 'Dolphin Pose', icon: '🐬',
    level: 'advanced', benefits: ['strength','balance'],
    videoFile: 'dolphin-pose.mp4',
    desc: '물구나무서기의 준비 단계로 어깨·코어·등 근력을 집중적으로 강화합니다.',
    steps: [
      '전완을 바닥에 대고 엎드립니다 (팔꿈치는 어깨 아래).',
      '발가락을 구부리고 무릎을 들어 돌고래 자세를 취합니다.',
      '엉덩이를 최대한 위로 올려 역 V 자를 만듭니다.',
      '어깨를 귀에서 멀리 밀어내리고 코어를 수축합니다.',
      '5~10회 호흡 후 아이 자세로 휴식합니다.',
    ],
    hold: '30~60초', repeat: '3~5회',
  },
  {
    name: '사체 자세', sanskrit: 'Savasana', icon: '☁️',
    level: 'beginner', benefits: ['stress'],
    videoFile: 'savasana.mp4',
    desc: '모든 요가 세션의 마무리 자세입니다. 전신을 이완하고 명상을 통해 연습의 효과를 통합합니다.',
    steps: [
      '등을 대고 편안하게 눕습니다.',
      '발을 자연스럽게 벌리고 손은 손바닥이 위를 향하게 옆에 놓습니다.',
      '눈을 감고 전신의 힘을 완전히 뺍니다.',
      '자연스러운 호흡을 유지하며 몸의 감각에 집중합니다.',
      '5~15분 동안 충분히 이완합니다.',
    ],
    hold: '5~15분', repeat: '1회',
  },
];

/* ── State ── */
let activeLevel   = 'all';
let activeBenefit = 'all';
let expandedCard  = null;

/* ── DOM ── */
const $ = id => document.getElementById(id);

const LEVEL_MAP = { beginner: '초급', middle: '중급', advanced: '고급' };

function buildCard(pose) {
  const levelKor = LEVEL_MAP[pose.level] || pose.level;
  const tags = pose.benefits.map(b => {
    const labels = { flexibility:'유연성', strength:'근력', balance:'균형', stress:'스트레스 해소' };
    return `<span class="yoga-benefit-tag">${labels[b] || b}</span>`;
  }).join('');
  const steps = pose.steps.map((s, i) =>
    `<div class="yoga-step">
       <span class="yoga-step-num">${i+1}</span>
       <span>${s}</span>
     </div>`
  ).join('');

  const videoId = pose.sanskrit.toLowerCase().replace(/\s+/g, '-');
  const videoSection = pose.videoFile
    ? `<div class="yoga-video-wrap">
        <button class="yoga-video-toggle" onclick="toggleVideo(this, 'vid-${videoId}')">
          ▶ 동영상 재생
        </button>
        <div class="yoga-video-box" id="vid-${videoId}" style="display:none">
          <video class="yoga-video-player" controls preload="none">
            <source src="videos/${pose.videoFile}" type="video/mp4">
            <p class="yoga-no-video">📁 videos/${pose.videoFile} 파일을 업로드해주세요</p>
          </video>
        </div>
      </div>`
    : '';

  const card = document.createElement('div');
  card.className = 'yoga-pose-card';
  card.dataset.level   = pose.level;
  card.dataset.benefit = pose.benefits.join(',');
  card.innerHTML = `
    <div class="yoga-card-top">
      <div class="yoga-pose-icon">${pose.icon}</div>
      <div class="yoga-pose-info">
        <div class="yoga-pose-name">${pose.name}</div>
        <div class="yoga-pose-sanskrit">${pose.sanskrit}</div>
        <span class="yoga-level-badge level-${pose.level}">${levelKor}</span>
      </div>
    </div>
    <div class="yoga-benefit-tags">${tags}</div>
    <div class="yoga-expand-body">
      <p class="yoga-expand-desc">${pose.desc}</p>
      <p class="yoga-steps-title">▸ 단계별 방법</p>
      <div class="yoga-steps">${steps}</div>
      <div class="yoga-duration-info">
        <div class="yoga-dur-item">유지 시간 <span class="yoga-dur-val">${pose.hold}</span></div>
        <div class="yoga-dur-item">반복 <span class="yoga-dur-val">${pose.repeat}</span></div>
      </div>
      ${videoSection}
    </div>`;

  card.addEventListener('click', e => {
    if (e.target.closest('.yoga-video-toggle, .yoga-video-player, .yoga-video-box')) return;
    const isOpen = card.classList.contains('expanded');
    if (expandedCard && expandedCard !== card) {
      expandedCard.classList.remove('expanded');
    }
    card.classList.toggle('expanded', !isOpen);
    expandedCard = isOpen ? null : card;
    if (!isOpen) card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });

  return card;
}

function toggleVideo(btn, videoBoxId) {
  const box = document.getElementById(videoBoxId);
  if (!box) return;
  const isHidden = box.style.display === 'none';
  box.style.display = isHidden ? 'block' : 'none';
  btn.textContent = isHidden ? '✕ 동영상 닫기' : '▶ 동영상 재생';
  const video = box.querySelector('video');
  if (video) {
    if (isHidden) {
      video.play().catch(() => {});
    } else {
      video.pause();
      video.currentTime = 0;
    }
  }
}

function renderGrid() {
  const grid = $('yogaGrid');
  grid.innerHTML = '';
  expandedCard = null;

  const filtered = POSES.filter(p => {
    const levelOk   = activeLevel   === 'all' || p.level === activeLevel;
    const benefitOk = activeBenefit === 'all' || p.benefits.includes(activeBenefit);
    return levelOk && benefitOk;
  });

  if (filtered.length === 0) {
    grid.innerHTML = '<p style="color:var(--txt-muted);font-size:14px;text-align:center;grid-column:1/-1;padding:40px 0">해당하는 포즈가 없습니다</p>';
    return;
  }

  filtered.forEach(p => grid.appendChild(buildCard(p)));
}

/* ── Init ── */
document.addEventListener('DOMContentLoaded', () => {
  renderGrid();

  $('levelFilter').addEventListener('click', e => {
    const btn = e.target.closest('.yoga-filter-btn');
    if (!btn) return;
    document.querySelectorAll('#levelFilter .yoga-filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeLevel = btn.dataset.level;
    renderGrid();
  });

  $('benefitFilter').addEventListener('click', e => {
    const btn = e.target.closest('.yoga-filter-btn');
    if (!btn) return;
    document.querySelectorAll('#benefitFilter .yoga-filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeBenefit = btn.dataset.benefit;
    renderGrid();
  });
});
