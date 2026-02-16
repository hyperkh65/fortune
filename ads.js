'use strict';
/* ════════════════════════════════════════════
   2days 웰니스 — AdSense Revenue Engine
   Strategy: Pre-result modal + Sticky banner
   + In-content placements
════════════════════════════════════════════ */

/* ── Pre-result countdown modal ────────────────── */
function showPreResultAd(callback, duration) {
  duration = duration || 5;
  var modal = document.getElementById('adResultModal');
  if (!modal) { callback(); return; }

  var skipBtn   = document.getElementById('adSkipBtn');
  var counter   = document.getElementById('adCountdown');
  var statusEl  = document.getElementById('adStatusText');
  var progressEl= document.getElementById('adProgressBar');

  modal.classList.add('visible');
  document.body.style.overflow = 'hidden';

  var remaining = duration;
  if (skipBtn)  { skipBtn.disabled = true; skipBtn.textContent = '잠시만요... (' + remaining + '초)'; }
  if (counter)  counter.textContent = remaining;
  if (statusEl) statusEl.textContent = '분석 중...';

  var interval = setInterval(function() {
    remaining--;
    if (counter) counter.textContent = remaining;
    if (progressEl) progressEl.style.width = ((duration - remaining) / duration * 100) + '%';

    if (remaining <= 0) {
      clearInterval(interval);
      if (skipBtn) {
        skipBtn.disabled = false;
        skipBtn.textContent = '✦ 결과 확인하기';
        skipBtn.classList.add('ready');
      }
      if (statusEl) statusEl.textContent = '분석 완료! 결과를 확인하세요.';
    } else {
      if (skipBtn) skipBtn.textContent = '잠시만요... (' + remaining + '초)';
    }
  }, 1000);

  if (skipBtn) {
    skipBtn.onclick = function() {
      if (skipBtn.disabled) return;
      clearInterval(interval);
      modal.classList.remove('visible');
      document.body.style.overflow = '';
      callback();
    };
  }
}

/* ── Button interceptors (capture phase — fires before page scripts) ── */
document.addEventListener('DOMContentLoaded', function() {

  /* === 사주 분석 버튼 === */
  var analyzeBtn = document.getElementById('analyzeBtn');
  if (analyzeBtn) {
    var _sajuAdShown = false;
    analyzeBtn.addEventListener('click', function sajuCapture(e) {
      if (_sajuAdShown) return;          // flag=true → returns early → bubble runs
      e.stopImmediatePropagation();
      _sajuAdShown = true;
      showPreResultAd(function() {
        // Keep flag=true so capture returns early on the re-click below
        analyzeBtn.click();              // bubble handler runs (capture skipped)
        setTimeout(function() { _sajuAdShown = false; }, 100); // reset for next analyze
      }, 5);
    }, true);
  }

  /* === 타로 카드 뽑기 버튼 === */
  var drawBtn = document.getElementById('drawBtn');
  if (drawBtn) {
    var _tarotAdShown = false;
    drawBtn.addEventListener('click', function tarotCapture(e) {
      if (_tarotAdShown) return;
      e.stopImmediatePropagation();
      _tarotAdShown = true;
      showPreResultAd(function() {
        drawBtn.click();
        setTimeout(function() { _tarotAdShown = false; }, 100);
      }, 5);
    }, true);
  }

  /* === 운세 띠 버튼 (첫 번째 선택만) === */
  var zodiacBtns = document.querySelectorAll('.zodiac-btn');
  if (zodiacBtns.length) {
    var _fortuneAdShown = false;
    zodiacBtns.forEach(function(btn) {
      btn.addEventListener('click', function zodiacCapture(e) {
        if (_fortuneAdShown) return;
        var resultEl = document.getElementById('fortuneResult');
        var isHidden = !resultEl || !resultEl.classList.contains('visible');
        if (!isHidden) return;           // result already showing — no modal
        e.stopImmediatePropagation();
        _fortuneAdShown = true;
        var self = this;
        showPreResultAd(function() {
          self.click();                  // re-click
        }, 4);
      }, true);
    });
  }

  /* === 꿈 해몽 검색 버튼 === */
  var dreamSearchBtn = document.getElementById('searchBtn') || document.querySelector('.dream-search-btn');
  if (dreamSearchBtn) {
    var _dreamAdShown = false;
    dreamSearchBtn.addEventListener('click', function dreamCapture(e) {
      if (_dreamAdShown) return;
      var input = document.getElementById('dreamInput') || document.querySelector('.dream-input');
      if (!input || !input.value.trim()) return; // no query — don't block
      e.stopImmediatePropagation();
      _dreamAdShown = true;
      showPreResultAd(function() {
        dreamSearchBtn.click();
        setTimeout(function() { _dreamAdShown = false; }, 100);
      }, 4);
    }, true);
  }
});

/* ── Expose globally ── */
window.ADS = { showPreResultAd: showPreResultAd };
