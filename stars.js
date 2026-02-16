'use strict';
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    const canvas = document.getElementById('starsBg');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let stars = [], W, H;

    // Star color palette: warm whites + subtle gold tones
    const STAR_COLORS = [
      [255, 248, 235], // warm white
      [255, 240, 200], // warm yellow-white
      [240, 234, 216], // cream
      [255, 220, 150], // gold-white
      [200, 180, 140], // dim gold
    ];

    function resize() {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
      stars = [];
      const n = Math.floor((W * H) / 7000);
      for (let i = 0; i < n; i++) {
        const c = STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)];
        stars.push({
          x: Math.random() * W, y: Math.random() * H,
          r: Math.random() * 1.4 + 0.2,
          a: Math.random() * 0.8 + 0.1,
          da: (Math.random() - 0.5) * 0.005,
          speed: Math.random() * 0.03,
          cr: c[0], cg: c[1], cb: c[2],
        });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      for (const s of stars) {
        s.a += s.da;
        if (s.a > 0.9 || s.a < 0.05) s.da = -s.da;
        s.y -= s.speed;
        if (s.y < -2) s.y = H + 2;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${s.cr},${s.cg},${s.cb},${s.a.toFixed(2)})`;
        ctx.fill();
      }
      requestAnimationFrame(draw);
    }

    window.addEventListener('resize', resize);
    resize();
    draw();
  });
})();
