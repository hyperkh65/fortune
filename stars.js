'use strict';
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    const canvas = document.getElementById('starsBg');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let stars = [], W, H;

    function resize() {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
      stars = [];
      const n = Math.floor((W * H) / 8000);
      for (let i = 0; i < n; i++) {
        stars.push({
          x: Math.random() * W, y: Math.random() * H,
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
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${s.a.toFixed(2)})`;
        ctx.fill();
      }
      requestAnimationFrame(draw);
    }

    window.addEventListener('resize', resize);
    resize();
    draw();
  });
})();
