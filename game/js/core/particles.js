'use strict';
// ═══════════════════════════════════════════════════════════════════
// PARTICLES  (burst effect on hit / death)
// ═══════════════════════════════════════════════════════════════════
class Particles {
  constructor() { this.list = []; }

  burst(x, y, color, n = 14, spd = 180) {
    for (let i = 0; i < n; i++) {
      const a = rnd(0, TWO_PI), s = spd * rnd(0.4, 1.1);
      this.list.push({
        x, y,
        vx: Math.cos(a) * s, vy: Math.sin(a) * s,
        r: rnd(2, 4), color, life: rnd(0.5, 1),
      });
    }
  }

  update(dt) {
    for (const p of this.list) {
      p.x += p.vx * dt; p.y += p.vy * dt;
      p.vx *= 0.91;     p.vy *= 0.91;
      p.life -= dt;
    }
    this.list = this.list.filter(p => p.life > 0);
  }

  draw(ctx) {
    for (const p of this.list) {
      ctx.globalAlpha = clamp(p.life, 0, 1);
      ctx.fillStyle   = p.color;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, TWO_PI); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
}
