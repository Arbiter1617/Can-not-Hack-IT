'use strict';
// ═══════════════════════════════════════════════════════════════════
// HELL 1 — DODGE HELL
// Red heart · Largest square boundary · All 6 patterns randomised
// Timer economy: graze +1s · hit −6s · iframes on hit
// ═══════════════════════════════════════════════════════════════════
class DodgeHell extends HellBase {
  constructor(dir) {
    super(dir);
    this.fireTimer = 0;
    this.spiralAng = 0;
    this._deferred = []; // pending setTimeout handles
  }

  // ── Hell identity ─────────────────────────────────────────────────
  get heartColor() { return '#ff3333'; }
  get cfg()        { return { grazeGain: 1, hitPenalty: 6 }; }

  get boundary() {
    const W = canvas.width, H = canvas.height;
    const sz = Math.min(W, H) * 0.88;
    return { x: (W - sz) / 2, y: (H - sz) / 2, w: sz, h: sz };
  }

  // Fire rate speeds up gradually with score (caps at ~2× around score 24000)
  get _fireRate() { return 0.82 - clamp(score / 24000, 0, 1) * 0.42; }

  // Shortcut so patterns don't call this.boundary twice
  get _b() { return this.boundary; }

  // ── Lifecycle ─────────────────────────────────────────────────────
  enter() {
    this.fireTimer = 0;
    this.spiralAng = 0;
    this._deferred = [];
  }

  exit() {
    super.exit();
    for (const d of this._deferred) clearTimeout(d.id);
    this._deferred = [];
  }

  // Schedule a spawn after `ms` ms; auto-cancels if hell exits
  _defer(ms, fn) {
    const id = setTimeout(() => {
      if (this.dir.currentHell !== this) return;
      fn();
    }, ms);
    this._deferred.push({ id });
  }

  // ── Update ────────────────────────────────────────────────────────
  update(dt) {
    this.spiralAng += dt * 1.9;
    this.fireTimer += dt;

    if (this.fireTimer >= this._fireRate) {
      this.fireTimer = 0;

      // Wall+Gap fires at ~8% rate — rarer, has its own long indicator
      if (Math.random() < 0.08) {
        this._wallGap();
      } else {
        // Randomly pick from the other 5 patterns (can overlap simultaneously)
        const fast = [
          this._spread, this._ring, this._cross,
          this._spiral, this._aimed,
        ];
        fast[Math.floor(Math.random() * fast.length)].call(this);
      }
    }
  }

  // ── Draw ──────────────────────────────────────────────────────────
  draw(ctx) {
    const b = this._b;
    ctx.strokeStyle = 'rgba(255,50,50,0.12)';
    ctx.lineWidth   = 1;
    ctx.strokeRect(b.x, b.y, b.w, b.h);
  }

  // ══════════════════════════════════════════════════════════════════
  // PATTERN A — Spread Shot
  // Fan of 7 bullets from a random edge, aimed at boundary centre
  // ══════════════════════════════════════════════════════════════════
  _spread() {
    const b    = this._b;
    const side = ['L','R','T','B'][Math.floor(Math.random() * 4)];
    let sx, sy;
    if (side === 'L') { sx = b.x;       sy = rnd(b.y, b.y + b.h); }
    if (side === 'R') { sx = b.x + b.w; sy = rnd(b.y, b.y + b.h); }
    if (side === 'T') { sy = b.y;       sx = rnd(b.x, b.x + b.w); }
    if (side === 'B') { sy = b.y + b.h; sx = rnd(b.x, b.x + b.w); }

    this.indicators.add(sx, sy);
    this._defer(700, () => {
      const cx  = b.x + b.w / 2, cy = b.y + b.h / 2;
      const ang = Math.atan2(cy - sy, cx - sx);
      const spd = 155 + clamp(score / 300, 0, 75);
      const n   = 7, spread = Math.PI / 4.5;
      for (let i = 0; i < n; i++) {
        const a = ang - spread / 2 + (spread / (n - 1)) * i;
        this.pool.spawn({ x: sx, y: sy,
          vx: Math.cos(a) * spd, vy: Math.sin(a) * spd,
          r: 7, color: '#ff6655', life: 6 });
      }
    });
  }

  // ══════════════════════════════════════════════════════════════════
  // PATTERN B — Ring Burst
  // 12 bullets expand in a full circle from a random interior point
  // ══════════════════════════════════════════════════════════════════
  _ring() {
    const b  = this._b;
    const cx = b.x + b.w * rnd(0.2, 0.8);
    const cy = b.y + b.h * rnd(0.2, 0.8);
    this.indicators.add(cx, cy, 0.6);
    this._defer(600, () => {
      const n   = 12;
      const spd = 138 + clamp(score / 400, 0, 60);
      for (let i = 0; i < n; i++) {
        const a = (TWO_PI * i) / n;
        this.pool.spawn({ x: cx, y: cy,
          vx: Math.cos(a) * spd, vy: Math.sin(a) * spd,
          r: 6, color: '#ff88bb', life: 6 });
      }
    });
  }

  // ══════════════════════════════════════════════════════════════════
  // PATTERN C — Cross (row with gap)
  // Dense horizontal row firing up AND down, gap at a random position
  // ══════════════════════════════════════════════════════════════════
  _cross() {
    const b    = this._b;
    const spd  = 150 + clamp(score / 350, 0, 70);
    const gap  = 55 + Math.random() * 35;
    const midX = b.x + b.w / 2;
    const rowY = b.y + b.h * rnd(0.25, 0.75);
    const step = 32;
    const cols = Math.floor(b.w / step);

    for (let i = 0; i < cols; i++) {
      const bx = b.x + i * step + step / 2;
      if (Math.abs(bx - midX) < gap / 2) continue;
      this.indicators.add(bx, rowY, 0.7);
    }
    this._defer(700, () => {
      for (let i = 0; i < cols; i++) {
        const bx = b.x + i * step + step / 2;
        if (Math.abs(bx - midX) < gap / 2) continue;
        this.pool.spawn({ x: bx, y: rowY, vx: 0, vy:  spd, r: 8, color: '#88aaff', life: 6 });
        this.pool.spawn({ x: bx, y: rowY, vx: 0, vy: -spd, r: 8, color: '#88aaff', life: 6 });
      }
    });
  }

  // ══════════════════════════════════════════════════════════════════
  // PATTERN D — Spiral
  // 3-armed rotating spiral emitting from the boundary centre
  // ══════════════════════════════════════════════════════════════════
  _spiral() {
    const b   = this._b;
    const cx  = b.x + b.w / 2, cy = b.y + b.h / 2;
    const spd = 170 + clamp(score / 300, 0, 80);
    for (let i = 0; i < 3; i++) {
      const a = this.spiralAng + (TWO_PI * i) / 3;
      this.pool.spawn({ x: cx, y: cy,
        vx: Math.cos(a) * spd, vy: Math.sin(a) * spd,
        r: 6, color: '#ffcc44', life: 5 });
    }
  }

  // ══════════════════════════════════════════════════════════════════
  // PATTERN E — Aimed Shot
  // Single large bullet fired from a random edge directly at the heart
  // ══════════════════════════════════════════════════════════════════
  _aimed() {
    const b    = this._b;
    const hx   = this.dir.hx, hy = this.dir.hy;
    const side = ['L','R','T','B'][Math.floor(Math.random() * 4)];
    let sx, sy;
    if (side === 'L') { sx = b.x;       sy = rnd(b.y, b.y + b.h); }
    if (side === 'R') { sx = b.x + b.w; sy = rnd(b.y, b.y + b.h); }
    if (side === 'T') { sy = b.y;       sx = rnd(b.x, b.x + b.w); }
    if (side === 'B') { sy = b.y + b.h; sx = rnd(b.x, b.x + b.w); }

    this.indicators.add(sx, sy);
    this._defer(700, () => {
      const a   = Math.atan2(hy - sy, hx - sx);
      const spd = 195 + clamp(score / 250, 0, 85);
      this.pool.spawn({ x: sx, y: sy,
        vx: Math.cos(a) * spd, vy: Math.sin(a) * spd,
        r: 8, color: '#ff4400', life: 6 });
    });
  }

  // ══════════════════════════════════════════════════════════════════
  // PATTERN F — Wall + Gap
  // Near-full wall from top or bottom; 2 adjacent gaps at random position.
  // 1.5 s indicator so the player has time to see and move to the gap.
  // ══════════════════════════════════════════════════════════════════
  _wallGap() {
    const b       = this._b;
    const fromTop = Math.random() > 0.5;
    const spd     = 148 + clamp(score / 350, 0, 60);
    const step    = 28;
    const cols    = Math.floor(b.w / step);
    // Always 2 adjacent gaps — cluster anywhere across the full width
    const gapStart = Math.floor(Math.random() * (cols - 2));
    const gaps     = new Set([gapStart, gapStart + 1]);
    const wallY    = fromTop ? b.y : b.y + b.h;
    const vyDir    = fromTop ? spd : -spd;

    for (let i = 0; i < cols; i++) {
      if (gaps.has(i)) continue;
      this.indicators.add(b.x + i * step + step / 2, wallY, 1.5);
    }
    this._defer(1500, () => {
      for (let i = 0; i < cols; i++) {
        if (gaps.has(i)) continue;
        this.pool.spawn({
          x: b.x + i * step + step / 2, y: wallY,
          vx: 0, vy: vyDir,
          r: step / 2 - 2, color: '#aa44ff', life: 6,
        });
      }
    });
  }
}
