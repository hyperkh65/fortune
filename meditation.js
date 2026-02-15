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

/* ══════════════════════════════
   Web Audio Sound Engine
══════════════════════════════ */
class SoundEngine {
  constructor() {
    this.ctx         = null;
    this.masterGain  = null;
    this.activeNodes = [];
    this._timers     = [];
    this.theme       = null;
  }

  /* Resume/create AudioContext */
  async _boot() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') await this.ctx.resume();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0;
    this.masterGain.connect(this.ctx.destination);
  }

  async start(theme, volume) {
    this.stop();
    if (theme === 'none') return;
    await this._boot();
    this.theme = theme;
    const fn = this[`_play_${theme}`];
    if (fn) fn.call(this);
    // Fade in
    this.masterGain.gain.setTargetAtTime(volume, this.ctx.currentTime, 0.4);
  }

  setVolume(vol) {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(vol, this.ctx.currentTime, 0.1);
    }
  }

  stop() {
    this._timers.forEach(t => clearTimeout(t));
    this._timers = [];
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.3);
    }
    setTimeout(() => {
      this.activeNodes.forEach(n => {
        try { n.stop(); } catch (_) {}
        try { n.disconnect(); } catch (_) {}
      });
      this.activeNodes = [];
      if (this.masterGain) { try { this.masterGain.disconnect(); } catch (_) {} this.masterGain = null; }
    }, 500);
    this.theme = null;
  }

  /* ── Helpers ── */
  _noiseBuffer(type) {
    const sr  = this.ctx.sampleRate;
    const len = sr * 3;
    const buf = this.ctx.createBuffer(1, len, sr);
    const d   = buf.getChannelData(0);
    let b0=0, b1=0, b2=0, b3=0, b4=0, b5=0, b6=0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      if (type === 'white') {
        d[i] = w;
      } else if (type === 'pink') {
        b0 = 0.99886*b0 + w*0.0555179; b1 = 0.99332*b1 + w*0.0750759;
        b2 = 0.96900*b2 + w*0.1538520; b3 = 0.86650*b3 + w*0.3104856;
        b4 = 0.55000*b4 + w*0.5329522; b5 = -0.7616*b5 - w*0.0168980;
        d[i] = (b0+b1+b2+b3+b4+b5+b6+w*0.5362)*0.11; b6 = w*0.115926;
      } else { // brown
        b0 = (b0 + 0.02*w) / 1.02;
        d[i] = b0 * 3.5;
      }
    }
    return buf;
  }

  _noise(type) {
    const src = this.ctx.createBufferSource();
    src.buffer = this._noiseBuffer(type);
    src.loop   = true;
    this.activeNodes.push(src);
    return src;
  }

  _osc(freq, type = 'sine') {
    const o = this.ctx.createOscillator();
    o.type = type; o.frequency.value = freq;
    this.activeNodes.push(o);
    return o;
  }

  _gain(v) {
    const g = this.ctx.createGain(); g.gain.value = v; return g;
  }

  _filter(type, freq, Q = 1) {
    const f = this.ctx.createBiquadFilter();
    f.type = type; f.frequency.value = freq; f.Q.value = Q; return f;
  }

  _delay(fn, ms) {
    const id = setTimeout(fn, ms);
    this._timers.push(id);
  }

  /* ══ OCEAN ══ */
  _play_ocean() {
    // Primary wave: brown noise + slow LFO
    const n1  = this._noise('brown');
    const lp1 = this._filter('lowpass', 350);
    const g1  = this._gain(0.9);
    const lfo1 = this._osc(0.07);
    const lfoG1 = this._gain(0.4);
    lfo1.connect(lfoG1); lfoG1.connect(g1.gain);
    n1.connect(lp1); lp1.connect(g1); g1.connect(this.masterGain);
    n1.start(); lfo1.start();

    // Secondary deeper wave
    const n2  = this._noise('brown');
    const lp2 = this._filter('lowpass', 200);
    const g2  = this._gain(0.5);
    const lfo2 = this._osc(0.11);
    const lfoG2 = this._gain(0.3);
    lfo2.connect(lfoG2); lfoG2.connect(g2.gain);
    n2.connect(lp2); lp2.connect(g2); g2.connect(this.masterGain);
    n2.start(); lfo2.start();

    // Surf foam (highpass)
    const n3  = this._noise('white');
    const hp  = this._filter('highpass', 2000);
    const g3  = this._gain(0.04);
    n3.connect(hp); hp.connect(g3); g3.connect(this.masterGain);
    n3.start();
  }

  /* ══ FOREST ══ */
  _play_forest() {
    // Ambient leaves/breeze
    const n1 = this._noise('pink');
    const bp = this._filter('bandpass', 900, 0.6);
    const g1 = this._gain(0.18);
    n1.connect(bp); bp.connect(g1); g1.connect(this.masterGain); n1.start();

    const n2 = this._noise('pink');
    const hp = this._filter('highpass', 3000);
    const g2 = this._gain(0.06);
    const lfo = this._osc(0.18);
    const lfoG = this._gain(0.05);
    lfo.connect(lfoG); lfoG.connect(g2.gain);
    n2.connect(hp); hp.connect(g2); g2.connect(this.masterGain);
    n2.start(); lfo.start();

    // Bird chirps
    const chirp = (freq, dur) => {
      const now = this.ctx.currentTime;
      const o   = this.ctx.createOscillator();
      o.type = 'sine';
      o.frequency.setValueAtTime(freq, now);
      o.frequency.linearRampToValueAtTime(freq * 1.35, now + dur * 0.4);
      o.frequency.linearRampToValueAtTime(freq * 1.15, now + dur);
      const env = this.ctx.createGain();
      env.gain.setValueAtTime(0, now);
      env.gain.linearRampToValueAtTime(0.14, now + 0.03);
      env.gain.exponentialRampToValueAtTime(0.001, now + dur + 0.02);
      o.connect(env); env.connect(this.masterGain);
      o.start(now); o.stop(now + dur + 0.05);
    };

    const scheduleBirds = () => {
      const f = 2000 + Math.random() * 1200;
      chirp(f, 0.12 + Math.random() * 0.1);
      if (Math.random() > 0.45) {
        this._delay(() => chirp(f * 1.05, 0.1), 100 + Math.random() * 100);
      }
      this._delay(scheduleBirds, 2000 + Math.random() * 5000);
    };
    this._delay(scheduleBirds, 500);
  }

  /* ══ RAIN ══ */
  _play_rain() {
    // Main rain body
    const n1 = this._noise('white');
    const bp = this._filter('bandpass', 1400, 1.5);
    const g1 = this._gain(0.55);
    n1.connect(bp); bp.connect(g1); g1.connect(this.masterGain); n1.start();

    // Fine drizzle (high)
    const n2 = this._noise('white');
    const hp = this._filter('highpass', 4000);
    const g2 = this._gain(0.22);
    const lfo = this._osc(4.0);
    const lfoG = this._gain(0.15);
    lfo.connect(lfoG); lfoG.connect(g2.gain);
    n2.connect(hp); hp.connect(g2); g2.connect(this.masterGain);
    n2.start(); lfo.start();

    // Thunder rumble
    const n3 = this._noise('brown');
    const lp = this._filter('lowpass', 90);
    const g3 = this._gain(0.3);
    n3.connect(lp); lp.connect(g3); g3.connect(this.masterGain); n3.start();
  }

  /* ══ TEMPLE ══ */
  _play_temple() {
    // Singing bowl harmonics (432Hz fundamental)
    const freqs = [432, 540, 648, 864];
    const vols  = [0.13, 0.08, 0.06, 0.04];

    freqs.forEach((freq, i) => {
      const osc = this._osc(freq, 'sine');
      const env = this.ctx.createGain();
      env.gain.value = 0;
      osc.connect(env); env.connect(this.masterGain); osc.start();

      const ring = () => {
        const now = this.ctx.currentTime;
        env.gain.cancelScheduledValues(now);
        env.gain.setValueAtTime(0, now);
        env.gain.linearRampToValueAtTime(vols[i], now + 0.06);
        env.gain.exponentialRampToValueAtTime(0.0001, now + 9);
        this._delay(ring, 11000 + i * 1500 + Math.random() * 3000);
      };
      this._delay(ring, i * 2000);
    });

    // Soft background drone (OM)
    const drone = this._osc(108, 'sine');
    const dg   = this._gain(0.04);
    const lfo  = this._osc(0.08);
    const lfoG = this._gain(0.025);
    lfo.connect(lfoG); lfoG.connect(dg.gain);
    drone.connect(dg); dg.connect(this.masterGain);
    drone.start(); lfo.start();
  }

  /* ══ FIREPLACE ══ */
  _play_fire() {
    // Main fire body (pink noise, low pass)
    const n1 = this._noise('pink');
    const lp = this._filter('lowpass', 700);
    const g1 = this._gain(0.55);
    const lfo = this._osc(0.7);
    const lfoG = this._gain(0.22);
    lfo.connect(lfoG); lfoG.connect(g1.gain);
    n1.connect(lp); lp.connect(g1); g1.connect(this.masterGain);
    n1.start(); lfo.start();

    // Crackle
    const crackle = () => {
      const now = this.ctx.currentTime;
      const len  = Math.floor(this.ctx.sampleRate * 0.06);
      const buf  = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const d    = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) {
        d[i] = Math.random() < 0.08 ? (Math.random() * 2 - 1) * 0.9 : 0;
      }
      const src = this.ctx.createBufferSource();
      src.buffer = buf;
      const cg = this.ctx.createGain();
      cg.gain.setValueAtTime(0.6, now);
      cg.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
      src.connect(cg); cg.connect(this.masterGain);
      src.start(now);
      this._delay(crackle, 150 + Math.random() * 700);
    };
    this._delay(crackle, 300);
  }

  /* ══ WIND ══ */
  _play_wind() {
    const n1  = this._noise('pink');
    const bp  = this._filter('bandpass', 600, 0.7);
    const g1  = this._gain(0.65);

    const lfoFreq  = this._osc(0.04);
    const lfoFG    = this._gain(350);
    lfoFreq.connect(lfoFG); lfoFG.connect(bp.frequency);

    const lfoAmp   = this._osc(0.13);
    const lfoAmpG  = this._gain(0.28);
    lfoAmp.connect(lfoAmpG); lfoAmpG.connect(g1.gain);

    n1.connect(bp); bp.connect(g1); g1.connect(this.masterGain);
    n1.start(); lfoFreq.start(); lfoAmp.start();

    // High whistle
    const n2 = this._noise('white');
    const hp = this._filter('highpass', 2500);
    const g2 = this._gain(0.09);
    n2.connect(hp); hp.connect(g2); g2.connect(this.masterGain); n2.start();
  }

  /* ══ HEALING / 432Hz binaural ══ */
  _play_healing() {
    try {
      const merger = this.ctx.createChannelMerger(2);
      merger.connect(this.masterGain);

      // Left: 432 Hz
      const l = this._osc(432);
      const lg = this._gain(0.3);
      l.connect(lg); lg.connect(merger, 0, 0);
      l.start();

      // Right: 440 Hz  (diff = 8 Hz theta binaural beat)
      const r = this._osc(440);
      const rg = this._gain(0.3);
      r.connect(rg); rg.connect(merger, 0, 1);
      r.start();
    } catch (_) {
      // Fallback mono
      const o = this._osc(432);
      const g = this._gain(0.3);
      o.connect(g); g.connect(this.masterGain); o.start();
    }

    // Soft harmonic pads
    [216, 324, 648].forEach((freq, i) => {
      const o  = this._osc(freq, 'sine');
      const g  = this._gain(0.04 - i * 0.008);
      const lfo  = this._osc(0.05 + i * 0.03);
      const lfoG = this._gain(0.02);
      lfo.connect(lfoG); lfoG.connect(g.gain);
      o.connect(g); g.connect(this.masterGain);
      o.start(); lfo.start();
    });
  }

  /* ══ WHITE NOISE ══ */
  _play_white() {
    const n = this._noise('white');
    const g = this._gain(0.45);
    n.connect(g); g.connect(this.masterGain); n.start();
  }
}

/* ── SoundEngine instance ── */
const soundEngine = new SoundEngine();
let currentSound  = 'none';

/* ── State ── */
let state = {
  type: 'breath',
  totalSec: 600,
  remainSec: 600,
  running: false,
  intervalId: null,
  breathIntervalId: null,
  breathStepIdx: 0,
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
  const pct    = state.remainSec / state.totalSec;
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

/* ── Breath cycle ── */
function startBreathCycle() {
  const pattern = PATTERNS[state.type];
  if (!pattern.length) {
    $('breathText').textContent = '자유롭게 호흡하세요';
    $('phaseLabel').textContent = '명상 중';
    return;
  }

  function runStep() {
    const step = pattern[state.breathStepIdx % pattern.length];
    $('breathText').textContent = step.phase;
    $('phaseLabel').textContent = step.phase;
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
  $('phaseLabel').textContent = '완료';
  $('breathRing').style.animation = 'none';
  $('breathCore').style.animation = 'none';
}

/* ── Main timer ── */
function startTimer() {
  if (state.running) return;
  state.running = true;
  $('startBtn').textContent = '⏸';
  $('startBtn').title = '일시정지';
  $('startBtn').classList.add('running');

  startBreathCycle();

  // Start sound
  const vol = parseFloat($('volumeSlider').value);
  soundEngine.start(currentSound, vol);

  state.intervalId = setInterval(() => {
    state.remainSec--;
    updateRing();
    if (state.remainSec <= 0) finishSession();
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
  soundEngine.stop();
}

function resetTimer() {
  pauseTimer();
  state.remainSec = state.totalSec;
  updateRing();
  $('phaseLabel').textContent = '준비';
  $('breathText').textContent = '시작 버튼을 눌러 명상을 시작하세요';
  $('startBtn').textContent = '▶';
  $('breathRing').style.animation = 'none';
  $('breathCore').style.animation = 'none';
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

  // Breathing type
  $('typeGrid').addEventListener('click', e => {
    const btn = e.target.closest('.med-type-btn');
    if (!btn || state.running) return;
    document.querySelectorAll('.med-type-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.type = btn.dataset.type;
  });

  // Duration
  $('durRow').addEventListener('click', e => {
    const btn = e.target.closest('.med-dur-btn');
    if (!btn || state.running) return;
    document.querySelectorAll('.med-dur-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.totalSec  = parseInt(btn.dataset.min) * 60;
    state.remainSec = state.totalSec;
    updateRing();
  });

  // Sound theme
  $('soundGrid').addEventListener('click', e => {
    const btn = e.target.closest('.med-sound-btn');
    if (!btn) return;
    document.querySelectorAll('.med-sound-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentSound = btn.dataset.sound;
    if (state.running) {
      const vol = parseFloat($('volumeSlider').value);
      soundEngine.start(currentSound, vol);
    }
  });

  // Volume
  $('volumeSlider').addEventListener('input', e => {
    soundEngine.setVolume(parseFloat(e.target.value));
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
