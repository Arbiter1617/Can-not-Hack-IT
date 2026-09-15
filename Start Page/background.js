/* ==========================================================================
   Infinite Heart — ambient bullet-hell background
   Purely decorative. Runs behind the UI on every page.
   A circular "no-spawn zone" keeps bullets away from the centered content
   (the stopwatch on the main menu, or the title/list on subpages).
   ========================================================================== */

(function () {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let w, h, cx, cy;
  const NO_SPAWN_RADIUS = 260;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    cx = w / 2;
    cy = h / 2;
  }
  window.addEventListener('resize', resize);
  resize();

  const NEON = '#29e2ff';

  // --- small drifting bullets (dots) ---
  const bullets = [];
  const MAX_BULLETS = 46;

  function farEnoughFromCenter(x, y) {
    return Math.hypot(x - cx, y - cy) > NO_SPAWN_RADIUS;
  }

  function spawnBullet() {
    // spawn from an edge, drifting across the screen
    const edge = Math.floor(Math.random() * 4);
    let x, y;
    if (edge === 0) { x = -10; y = Math.random() * h; }
    else if (edge === 1) { x = w + 10; y = Math.random() * h; }
    else if (edge === 2) { x = Math.random() * w; y = -10; }
    else { x = Math.random() * w; y = h + 10; }

    const targetX = Math.random() * w;
    const targetY = Math.random() * h;
    const angle = Math.atan2(targetY - y, targetX - x);
    const speed = 0.6 + Math.random() * 1.4;

    return {
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      r: 2 + Math.random() * 2.5,
      alpha: 0.5 + Math.random() * 0.5,
      type: Math.random() < 0.18 ? 'knife' : 'dot',
      rot: angle
    };
  }

  for (let i = 0; i < MAX_BULLETS; i++) bullets.push(spawnBullet());

  // --- sparse radial explosions ---
  const bursts = [];
  function maybeSpawnBurst() {
    if (Math.random() < 0.006 && bursts.length < 3) {
      let x, y, tries = 0;
      do {
        x = Math.random() * w;
        y = Math.random() * h;
        tries++;
      } while (!farEnoughFromCenter(x, y) && tries < 12);

      bursts.push({ x, y, radius: 0, maxRadius: 60 + Math.random() * 60, alpha: 0.8 });
    }
  }

  function drawKnife(b) {
    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.rotate(b.rot + Math.PI / 2);
    ctx.strokeStyle = NEON;
    ctx.globalAlpha = b.alpha;
    ctx.lineWidth = 1.4;
    ctx.shadowColor = NEON;
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.moveTo(0, -9);
    ctx.lineTo(0, 9);
    ctx.moveTo(-3, 5);
    ctx.lineTo(0, 9);
    ctx.lineTo(3, 5);
    ctx.stroke();
    ctx.restore();
  }

  function drawDot(b) {
    ctx.beginPath();
    ctx.globalAlpha = b.alpha;
    ctx.fillStyle = NEON;
    ctx.shadowColor = NEON;
    ctx.shadowBlur = 8;
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fill();
  }

  function step() {
    ctx.clearRect(0, 0, w, h);

    // bullets
    for (let i = 0; i < bullets.length; i++) {
      const b = bullets[i];
      b.x += b.vx;
      b.y += b.vy;

      // gently steer away from the no-spawn zone if drifting through it
      const d = Math.hypot(b.x - cx, b.y - cy);
      if (d < NO_SPAWN_RADIUS) {
        const push = (NO_SPAWN_RADIUS - d) / NO_SPAWN_RADIUS;
        const away = Math.atan2(b.y - cy, b.x - cx);
        b.x += Math.cos(away) * push * 2.2;
        b.y += Math.sin(away) * push * 2.2;
      }

      if (b.type === 'knife') drawKnife(b);
      else drawDot(b);

      if (b.x < -40 || b.x > w + 40 || b.y < -40 || b.y > h + 40) {
        bullets[i] = spawnBullet();
      }
    }

    // bursts
    maybeSpawnBurst();
    for (let i = bursts.length - 1; i >= 0; i--) {
      const burst = bursts[i];
      burst.radius += 2.2;
      burst.alpha -= 0.014;
      if (burst.alpha <= 0) { bursts.splice(i, 1); continue; }

      ctx.beginPath();
      ctx.strokeStyle = NEON;
      ctx.globalAlpha = burst.alpha;
      ctx.lineWidth = 2;
      ctx.shadowColor = NEON;
      ctx.shadowBlur = 12;
      ctx.arc(burst.x, burst.y, burst.radius, 0, Math.PI * 2);
      ctx.stroke();

      // radial spokes
      for (let s = 0; s < 8; s++) {
        const a = (s / 8) * Math.PI * 2;
        const r1 = burst.radius * 0.4;
        const r2 = burst.radius;
        ctx.beginPath();
        ctx.moveTo(burst.x + Math.cos(a) * r1, burst.y + Math.sin(a) * r1);
        ctx.lineTo(burst.x + Math.cos(a) * r2, burst.y + Math.sin(a) * r2);
        ctx.stroke();
      }
      if (burst.radius >= burst.maxRadius) burst.alpha -= 0.05;
    }

    ctx.globalAlpha = 1;
    requestAnimationFrame(step);
  }

  requestAnimationFrame(step);

  // expose the no-spawn radius in case a page wants to align it with its UI
  window.__infiniteHeartNoSpawnRadius = NO_SPAWN_RADIUS;
})();
