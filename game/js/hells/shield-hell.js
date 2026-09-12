'use strict';
// ═══════════════════════════════════════════════════════════════════
// HELL 2 — SHIELD HELL
//
// Green heart · Locked to centre · WASD controls arc shield (not heart)
// Arrows fly in from 4 sides; correct shield direction blocks them.
// Yellow arrows fake-out: mid-flight they reverse & change side.
// Timer economy: graze gives nothing · hit −4s
// ═══════════════════════════════════════════════════════════════════
class ShieldHell extends HellBase {
  constructor(dir) {
    super(dir);
    this.shieldDir  = 'W';   // active shield side: W A S D
    this.spawnTimer = 0;
    this._deferred  = [];
    this.SHIELD_R   = 42;    // radius at which shield intercepts arrows
  }

  // ── Hell identity ─────────────────────────────────────────────────
  get heartColor()   { return '#33ff77'; }
  get heartMovable() { return false; }   // WASD moves shield, not heart
  get cfg()          { return { grazeGain: 0, hitPenalty: 1 }; }

  get boundary() {
    const W = canvas.width, H = canvas.height;
    const sz = Math.min(W, H) * 0.88;
    return { x: (W - sz) / 2, y: (H - sz) / 2, w: sz, h: sz };
  }

  // Arrows spawn faster as score climbs
  get _spawnRate() { return 1.8 - clamp(score / 15000, 0, 1) * 0.9; }

  // ── Lifecycle ─────────────────────────────────────────────────────
  enter() {
    this.spawnTimer = 0;
    this.shieldDir  = 'W';
    this._deferred  = [];
    // Snap heart to dead centre immediately
    this.dir.hx = canvas.width  / 2;
    this.dir.hy = canvas.height / 2;
  }

  exit() {
    super.exit();
    for (const d of this._deferred) clearTimeout(d.id);
    this._deferred = [];
  }

  _defer(ms, fn) {
    const id = setTimeout(() => {
      if (this.dir.currentHell !== this) return;
      fn();
    }, ms);
    this._deferred.push({ id });
  }

  // ── Update ────────────────────────────────────────────────────────
  update(dt) {
    // Keep heart locked to centre every frame
    this.dir.hx = canvas.width  / 2;
    this.dir.hy = canvas.height / 2;

    // WASD → shield direction (director skips movement because heartMovable = false)
    if (Keys['KeyW'] || Keys['ArrowUp'])    this.shieldDir = 'W';
    if (Keys['KeyS'] || Keys['ArrowDown'])  this.shieldDir = 'S';
    if (Keys['KeyA'] || Keys['ArrowLeft'])  this.shieldDir = 'A';
    if (Keys['KeyD'] || Keys['ArrowRight']) this.shieldDir = 'D';

    // Spawn arrows
    this.spawnTimer += dt;
    if (this.spawnTimer >= this._spawnRate) {
      this.spawnTimer = 0;
      this._spawnArrow();
    }

    // Yellow fake-out flip logic
    this._tickFlips(dt);

    // Shield block detection (runs BEFORE bullet pool collision)
    this._checkBlocks();
  }

  // ── Spawn one arrow from a random side ───────────────────────────
  _spawnArrow() {
    const b      = this.boundary;
    const hx     = this.dir.hx, hy = this.dir.hy;
    const sides  = ['W', 'A', 'S', 'D'];
    const side   = sides[Math.floor(Math.random() * 4)];
    const yellow = Math.random() < 0.30; // 30% fake-out
    const spd    = 130 + clamp(score / 400, 0, 90);

    let sx, sy, vx, vy;
    if (side === 'W') { sx = hx; sy = b.y;       vx = 0;    vy =  spd; }
    if (side === 'S') { sx = hx; sy = b.y + b.h; vx = 0;    vy = -spd; }
    if (side === 'A') { sx = b.x;       sy = hy; vx =  spd; vy = 0;    }
    if (side === 'D') { sx = b.x + b.w; sy = hy; vx = -spd; vy = 0;    }

    const bullet = this.pool.spawn({
      x: sx, y: sy, vx, vy,
      r: 10,
      color: yellow ? '#ffee00' : '#00ccff',
      life: 10,
    });

    if (bullet) {
      bullet.fromSide  = side;
      bullet.isYellow  = yellow;
      bullet.flipped   = false;
      bullet.flipTimer = yellow ? rnd(0.55, 0.85) : -1;
    }
  }

  // ── Yellow flip: reverse direction mid-flight ─────────────────────
  _tickFlips(dt) {
    const OPP = { W: 'S', S: 'W', A: 'D', D: 'A' };
    for (const b of this.pool.list) {
      if (!b.active || !b.isYellow || b.flipped) continue;
      b.flipTimer -= dt;

      // Flash warning in the last 0.25 s before flip
      if (b.flipTimer < 0.25) {
        b.color = Math.floor(b.flipTimer * 18) % 2 === 0 ? '#ffee00' : '#ff6600';
      }

      if (b.flipTimer <= 0) {
        b.vx      = -b.vx;
        b.vy      = -b.vy;
        b.flipped = true;
        b.fromSide = OPP[b.fromSide];
        b.color   = '#ff8800'; // orange after flip
      }
    }
  }

  // ── Shield interception ───────────────────────────────────────────
  _checkBlocks() {
    const hx = this.dir.hx, hy = this.dir.hy;
    const SR = this.SHIELD_R;

    for (const b of this.pool.list) {
      if (!b.active || !b.fromSide) continue;
      if (b.fromSide !== this.shieldDir)  continue; // wrong side
      const dist = Math.hypot(b.x - hx, b.y - hy);
      if (dist - b.r < SR) {
        b.active = false; // blocked!
        this.particles.burst(b.x, b.y, '#33ff77', 8, 110);
      }
    }
  }

  // ── Draw ──────────────────────────────────────────────────────────
  draw(ctx) {
    const b  = this.boundary;
    const hx = this.dir.hx, hy = this.dir.hy;

    // Boundary box
    ctx.strokeStyle = 'rgba(50,255,120,0.10)';
    ctx.lineWidth   = 1;
    ctx.strokeRect(b.x, b.y, b.w, b.h);

    // Shield arc — a thick glowing arc on the active side
    const ANGLE = { W: -Math.PI/2, S: Math.PI/2, A: Math.PI, D: 0 };
    const center  = ANGLE[this.shieldDir];
    const halfArc = Math.PI * 0.52; // ~94° sweep each way

    ctx.beginPath();
    ctx.arc(hx, hy, this.SHIELD_R, center - halfArc, center + halfArc);
    ctx.strokeStyle = '#33ff77';
    ctx.lineWidth   = 8;
    ctx.shadowBlur  = 16; ctx.shadowColor = '#33ff77';
    ctx.lineCap     = 'round';
    ctx.stroke();
    ctx.shadowBlur  = 0;
    ctx.lineCap     = 'butt';

    // Direction hint glyphs (W A S D)
    const GLYPH = { W: '▲', A: '◀', S: '▼', D: '▶' };
    const POS   = {
      W: { x: hx,                y: hy - this.SHIELD_R - 16 },
      S: { x: hx,                y: hy + this.SHIELD_R + 14 },
      A: { x: hx - this.SHIELD_R - 14, y: hy + 4 },
      D: { x: hx + this.SHIELD_R + 10, y: hy + 4 },
    };
    ctx.font      = '12px "Courier New"';
    ctx.textAlign = 'center';
    for (const [dir, glyph] of Object.entries(GLYPH)) {
      const active = dir === this.shieldDir;
      ctx.fillStyle = active
        ? 'rgba(50,255,120,0.95)'
        : 'rgba(50,255,120,0.20)';
      ctx.fillText(glyph, POS[dir].x, POS[dir].y);
    }
    ctx.textAlign = 'left';
  }
}
