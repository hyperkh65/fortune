'use strict';

/* ── 호흡 패턴 정의 (초 단위) ── */
const PATTERNS = {
  breath: [
    { phase: '들이쉬기',  dur: 4, anim: 'in'  },
    { phase: '내쉬기',    dur: 4, anim: 'out' },
  ],
  box: [
    { phase: '들이쉬기',  dur: 4, anim: 'in'       },
    { phase: '멈추기',    dur: 4, anim: 'holdFull' },
    { phase: '내쉬기',    dur: 4, anim: 'out'      },
    { phase: '멈추기',    dur: 4, anim: 'holdEmpty'},
  ],
  '478': [
    { phase: '들이쉬기',  dur: 4, anim: 'in'       },
    { phase: '멈추기',    dur: 7, anim: 'holdFull' },
    { phase: '내쉬기',    dur: 8, anim: 'out'      },
  ],
  open: [],
};

const CIRCUMFERENCE = 2 * Math.PI * 44; // r=44

/* ── State ── */
let state = {
  type: 'breath',
  totalSec: 600,
  remainSec: 600,
  running: false,
  intervalId: null,
  breathIntervalId: null,
  breathStepIdx: 0,
  breathStepRemain: 0,
  stats: { sessions: 0, totalMin: 0 },
};

/* ── DOM ── */
const $ = id => document.getElementById(id);

/* ── Storage ── */
function loadStats() {
  try {
    const today = new Date().toDateString();
    const saved = JSON.parse(localStorage.getItem('medStats') || '{}');
    if (saved.date === today) {
      state.stats = { sessions: saved.sessions || 0, totalMin: saved.totalMin || 0 };
    }
  } catch (_) {}
  updateStatDisplay();
}

function saveStats() {
  try {
    localStorage.setItem('medStats', JSON.stringify({
      date: new Date().toDateString(),
      sessions: state.stats.sessions,
      totalMin: state.stats.totalMin,
    }));
  } catch (_) {}
}

function updateStatDisplay() {
  $('statSessions').textContent = state.stats.sessions;
  $('statMinutes').textContent  = state.stats.totalMin;
}

/* ── Time formatting ── */
function fmt(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

/* ── Ring progress ── */
function updateRing() {
  const pct = state.remainSec / state.totalSec;
  const offset = CIRCUMFERENCE * (1 - pct);
  $('ringFill').style.strokeDashoffset = offset;
  $('timeDisplay').textContent = fmt(state.remainSec);
}

/* ── Breathing animation ── */
function applyBreathAnim(anim, dur) {
  const ring = $('breathRing');
  const core = $('breathCore');
  ring.style.animation = 'none';
  core.style.animation = 'none';
  void ring.offsetWidth; // reflow

  const durS = `${dur}s`;
  if (anim === 'in') {
    ring.style.animation = `breathIn ${durS} ease-in-out forwards`;
    core.style.animation = `breathIn ${durS} ease-in-out forwards`;
  } else if (anim === 'out') {
    ring.style.animation = `breathOut ${durS} ease-in-out forwards`;
    core.style.animation = `breathOut ${durS} ease-in-out forwards`;
  } else if (anim === 'holdFull') {
    ring.style.animation = `breathHold ${durS} linear forwards`;
    core.style.animation = `breathHold ${durS} linear forwards`;
  } else if (anim === 'holdEmpty') {
    ring.style.animation = `breathHoldSmall ${durS} linear forwards`;
    core.style.animation = `breathHoldSmall ${durS} linear forwards`;
  }
}

/* ── Start breathing cycle ── */
function startBreathCycle() {
  const pattern = PATTERNS[state.type];
  if (!pattern.length) {
    $('breathText').textContent = '자유롭게 호흡하세요';
    $('phaseLabel').textContent  = '명상 중';
    return;
  }

  function runStep() {
    const step = pattern[state.breathStepIdx % pattern.length];
    $('breathText').textContent = step.phase;
    $('phaseLabel').textContent  = step.phase;
    applyBreathAnim(step.anim, step.dur);
    state.breathStepIdx++;
    state.breathIntervalId = setTimeout(runStep, step.dur * 1000);
  }

  state.breathStepIdx = 0;
  runStep();
}

function stopBreathCycle() {
  clearTimeout(state.breathIntervalId);
  $('breathText').textContent = '';
  $('phaseLabel').textContent  = '완료';
  const ring = $('breathRing');
  const core = $('breathCore');
  ring.style.animation = 'none';
  core.style.animation = 'none';
}

/* ── Main timer ── */
function startTimer() {
  if (state.running) return;
  state.running = true;
  $('startBtn').textContent = '⏸';
  $('startBtn').title = '일시정지';
  $('startBtn').classList.add('running');

  startBreathCycle();

  state.intervalId = setInterval(() => {
    state.remainSec--;
    updateRing();

    if (state.remainSec <= 0) {
      finishSession();
    }
  }, 1000);
}

function pauseTimer() {
  if (!state.running) return;
  state.running = false;
  clearInterval(state.intervalId);
  clearTimeout(state.breathIntervalId);
  $('startBtn').textContent = '▶';
  $('startBtn').title = '재개';
  $('startBtn').classList.remove('running');
  $('phaseLabel').textContent = '일시정지';
  $('breathText').textContent = '일시정지됨';
}

function resetTimer() {
  pauseTimer();
  state.remainSec = state.totalSec;
  updateRing();
  $('phaseLabel').textContent  = '준비';
  $('breathText').textContent = '시작 버튼을 눌러 명상을 시작하세요';
  $('startBtn').textContent = '▶';
  const ring = $('breathRing');
  const core = $('breathCore');
  ring.style.animation = 'none';
  core.style.animation = 'none';
}

function finishSession() {
  pauseTimer();
  const minDone = Math.round((state.totalSec - state.remainSec) / 60) || 1;
  state.stats.sessions++;
  state.stats.totalMin += minDone;
  saveStats();
  updateStatDisplay();
  showToast(`명상 완료! ${minDone}분 명상하셨습니다 🧘`);
  resetTimer();
}

/* ── Toast ── */
function showToast(msg) {
  const t = $('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

/* ── Init ── */
document.addEventListener('DOMContentLoaded', () => {
  loadStats();
  updateRing();

  // Type selector
  $('typeGrid').addEventListener('click', e => {
    const btn = e.target.closest('.med-type-btn');
    if (!btn || state.running) return;
    document.querySelectorAll('.med-type-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.type = btn.dataset.type;
  });

  // Duration selector
  $('durRow').addEventListener('click', e => {
    const btn = e.target.closest('.med-dur-btn');
    if (!btn || state.running) return;
    document.querySelectorAll('.med-dur-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.totalSec   = parseInt(btn.dataset.min) * 60;
    state.remainSec  = state.totalSec;
    updateRing();
  });

  // Start / pause
  $('startBtn').addEventListener('click', () => {
    if (state.remainSec <= 0) { resetTimer(); return; }
    if (state.running) pauseTimer();
    else startTimer();
  });

  // Reset
  $('resetBtn').addEventListener('click', resetTimer);

  // Skip (finish)
  $('skipBtn').addEventListener('click', () => {
    if (state.running || state.remainSec < state.totalSec) finishSession();
  });
});
