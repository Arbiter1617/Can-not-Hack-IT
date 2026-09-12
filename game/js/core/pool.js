'use strict';
// ═══════════════════════════════════════════════════════════════════
// BULLET POOL  (fixed-size, no splice → O(1) spawn/expire)
// ═══════════════════════════════════════════════════════════════════
class BulletPool {
  constructor(cap = 900) {
    this.list = Array.from({ length: cap }, () => this._blank());
  }

  _blank() {
    return {
      active: false, x: 0, y: 0, vx: 0, vy: 0, r: 6,
      color: '#fff', life: 8,
      grazed: false, hit: false,
      trail: [], age: 0,
      bounceX: false, bounceY: false, bndRef: null,
      growNear: false, baseR: 6, baseVx: 0, baseVy: 0,
    };
  }

  spawn(o) {
    const b = this.list.find(b => !b.active);
    if (!b) return null;
    Object.assign(b, this._blank(), {
      active: true, ...o,
      trail: [], age: 0, grazed: false, hit: false,
      baseR:  o.r  || 6,
      baseVx: o.vx || 0,
      baseVy: o.vy || 0,
    });
    return b;
  }

  // Returns true if a hit occurred this frame
  update(dt, hx, hy, clock, iframed, cfg) {
    let gotHit = false;
    const W = canvas.width, H = canvas.height;

    for (const b of this.list) {
      if (!b.active) continue;
      b.age  += dt;
      b.life -= dt;

      // Trail history
      b.trail.push({ x: b.x, y: b.y });
      if (b.trail.length > 9) b.trail.shift();

      // Optional bounce off boundary walls
      if (b.bounceX && b.bndRef) {
        if (b.x - b.r < b.bndRef.x || b.x + b.r > b.bndRef.x + b.bndRef.w) b.vx *= -1;
      }
      if (b.bounceY && b.bndRef) {
        if (b.y - b.r < b.bndRef.y || b.y + b.r > b.bndRef.y + b.bndRef.h) b.vy *= -1;
      }

      // Optional growth + slow near boundary (used by Shooter Hell)
      if (b.growNear && b.bndRef) {
        const d = Math.min(
          b.x - b.bndRef.x, b.bndRef.x + b.bndRef.w - b.x,
          b.y - b.bndRef.y, b.bndRef.y + b.bndRef.h - b.y
        );
        if (d < 90) {
          const t = 1 - clamp(d / 90, 0, 1);
          b.r  = b.baseR  * (1 + t * 0.5);
          b.vx = b.baseVx * (1 - t * 0.45);
          b.vy = b.baseVy * (1 - t * 0.45);
        }
      }

      b.x += b.vx * dt;
      b.y += b.vy * dt;

      // Expire off-screen or time-out
      if (b.life <= 0 || b.x < -80 || b.x > W + 80 || b.y < -80 || b.y > H + 80) {
        b.active = false; continue;
      }

      if (iframed) continue;

      const dx = b.x - hx, dy = b.y - hy, dist = Math.hypot(dx, dy);

      // Graze — bullet EDGE enters the graze ring (dist is centre-to-centre,
      // so subtract bullet radius to get closest edge distance)
      if (!b.grazed && dist - b.r < GRAZE_R && dist - b.r >= HEART_R) {
        b.grazed = true;
        if (cfg.grazeGain > 0) clock.add(cfg.grazeGain, hx, hy - 24);
      }
      // Hit — bullet EDGE overlaps the lethal hitbox
      if (!b.hit && dist - b.r < HEART_R) {
        b.hit = true; b.active = false;
        clock.subtract(cfg.hitPenalty, hx, hy - 24);
        gotHit = true;
      }
    }
    return gotHit;
  }

  draw(ctx) {
    for (const b of this.list) {
      if (!b.active) continue;
      // Fading trail
      for (let i = 0; i < b.trail.length; i++) {
        ctx.globalAlpha = (i / b.trail.length) * 0.28;
        ctx.fillStyle   = b.color;
        ctx.beginPath();
        ctx.arc(b.trail[i].x, b.trail[i].y, b.r * (i / b.trail.length) * 0.7, 0, TWO_PI);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.shadowBlur  = 12;
      ctx.shadowColor = b.color;
      ctx.fillStyle   = b.color;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, TWO_PI);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
    ctx.globalAlpha = 1;
  }

  clear() { for (const b of this.list) b.active = false; }
}
