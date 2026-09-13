'use strict';
// ═══════════════════════════════════════════════════════════════════
// HELL 2 — SHIELD HELL
//
// Green heart · Locked to centre · WASD rotates arc shield
// Arrows fly in from 4 sides; correct shield direction blocks them.
// Yellow arrows: flash warning → TELEPORT to opposite side → player
//   must switch shield direction fast.
// Timer economy: graze gives nothing · hit −1s
// ═══════════════════════════════════════════════════════════════════
class ShieldHell extends HellBase {
  constructor(dir) {
    super(dir);
    this.shieldDir  = 'W';   // active shield side: W A S D
    this.spawnTimer = 0;
    this._deferred  = [];
    this.SHIELD_R   = 36;    // radius at which shield intercepts arrows
  }

  // ── Hell identity ─────────────────────────────────────────────────
  get heartColor()   { return '#33ff77'; }
  get name()         { return 'SHIELD HELL'; }
  get heartMovable() { return false; }
  get timerPaused()  { return true; }    // clock freezes during Shield Hell
  get cfg()          { return { grazeGain: 0, hitPenalty: 1 }; }

  get boundary() {
    const W = canvas.width, H = canvas.height;
    const sz = Math.min(W, H) * 0.88;
    return { x: (W - sz) / 2, y: (H - sz) / 2, w: sz, h: sz };
  }

  // Arrows spawn interval — fast baseline, gets tighter with score
  get _spawnRate() { return 0.80 - clamp(score / 10000, 0, 1) * 0.45; }

  // Arrow speed: 425 base → 600 max
  get _arrowSpd()  { return 425 + clamp(score / 240, 0, 175); }

  // ── Lifecycle ─────────────────────────────────────────────────────
  enter() {
    this.spawnTimer = 0;
    this.shieldDir  = 'W';
    this._deferred  = [];
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
    // Keep heart locked
    this.dir.hx = canvas.width  / 2;
    this.dir.hy = canvas.height / 2;

    // WASD → shield direction
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

    // Yellow fake-out tick (teleport, not reverse-in-place)
    this._tickFlips(dt);

    // Shield block check (before pool collision)
    this._checkBlocks();
  }

  // ── Spawn one arrow from a random side ───────────────────────────
  _spawnArrow() {
    const b      = this.boundary;
    const hx     = this.dir.hx, hy = this.dir.hy;
    const sides  = ['W', 'A', 'S', 'D'];
    const side   = sides[Math.floor(Math.random() * 4)];
    const yellow = Math.random() < 0.28;
    const spd    = this._arrowSpd;

    let sx, sy, vx, vy;
    if (side === 'W') { sx = hx; sy = b.y;       vx = 0;    vy =  spd; }
    if (side === 'S') { sx = hx; sy = b.y + b.h; vx = 0;    vy = -spd; }
    if (side === 'A') { sx = b.x;       sy = hy;  vx =  spd; vy = 0;    }
    if (side === 'D') { sx = b.x + b.w; sy = hy;  vx = -spd; vy = 0;    }

    // r=2 → tiny pool-rendered glow; full arrow drawn in draw()
    const bullet = this.pool.spawn({
      x: sx, y: sy, vx, vy,
      r: 2,
      color: yellow ? '#ffee00' : '#00ccff',
      life: 12,
    });

    if (bullet) {
      bullet.fromSide  = side;
      bullet.isYellow  = yellow;
      bullet.flipped   = false;
      bullet.flipTimer = yellow ? rnd(0.45, 0.75) : -1;
      bullet.baseSpd   = spd;
    }
  }

  // ── Yellow fake-out: TELEPORT to opposite side ────────────────────
  _tickFlips(dt) {
    const OPP = { W: 'S', S: 'W', A: 'D', D: 'A' };
    const b   = this.boundary;
    const hx  = this.dir.hx, hy = this.dir.hy;

    for (const bl of this.pool.list) {
      if (!bl.active || !bl.isYellow || bl.flipped) continue;
      bl.flipTimer -= dt;

      // Flash warning 0.3 s before teleport
      if (bl.flipTimer < 0.3) {
        bl.color = Math.floor(bl.flipTimer * 20) % 2 === 0 ? '#ffee00' : '#ff5500';
      }

      if (bl.flipTimer <= 0) {
        const newSide = OPP[bl.fromSide];
        const spd     = bl.baseSpd;
        const bnd     = this.boundary;
        const hx      = this.dir.hx, hy = this.dir.hy;

        // Spawn 50% of the way from opposite boundary toward center
        // (much closer = much less reaction time)
        const frac = 0.50;
        switch (newSide) {
          case 'W':
            bl.x = hx;
            bl.y = bnd.y + (hy - bnd.y) * frac;
            bl.vx = 0; bl.vy = spd; break;
          case 'S':
            bl.x = hx;
            bl.y = (bnd.y + bnd.h) - ((bnd.y + bnd.h) - hy) * frac;
            bl.vx = 0; bl.vy = -spd; break;
          case 'A':
            bl.x = bnd.x + (hx - bnd.x) * frac;
            bl.y = hy;
            bl.vx = spd; bl.vy = 0; break;
          case 'D':
            bl.x = (bnd.x + bnd.w) - ((bnd.x + bnd.w) - hx) * frac;
            bl.y = hy;
            bl.vx = -spd; bl.vy = 0; break;
        }
        bl.fromSide = newSide;
        bl.flipped  = true;
        bl.color    = '#ff8800';
        bl.trail    = [];
      }  // clear trail so no teleport smear
    }
  }

  // ── Shield interception ───────────────────────────────────────────
  _checkBlocks() {
    const hx = this.dir.hx, hy = this.dir.hy;
    const SR = this.SHIELD_R;

    for (const b of this.pool.list) {
      if (!b.active || !b.fromSide) continue;

      // Derive required shield from ACTUAL velocity direction (robust after flip)
      let req;
      if      (b.vy >  1) req = 'W'; // moving down  → arrow comes from top → W shield
      else if (b.vy < -1) req = 'S'; // moving up    → arrow comes from bottom → S shield
      else if (b.vx >  1) req = 'A'; // moving right → arrow comes from left  → A shield
      else if (b.vx < -1) req = 'D'; // moving left  → arrow comes from right → D shield
      else continue;                  // stationary — skip

      if (req !== this.shieldDir) continue;
      if (Math.hypot(b.x - hx, b.y - hy) < SR) {
        b.active = false;
        this.particles.burst(b.x, b.y, '#33ff77', 7, 100);
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

    // Custom arrow rendering (pool renders tiny r=2 glow; we draw the full shape)
    for (const bl of this.pool.list) {
      if (!bl.active || !bl.fromSide) continue;
      this._drawArrow(ctx, bl);
    }

    // Shield arc — narrow, precise
    const ANGLE   = { W: -Math.PI / 2, S: Math.PI / 2, A: Math.PI, D: 0 };
    const center  = ANGLE[this.shieldDir];
    const halfArc = Math.PI * 0.22; // ≈ 40° each way = ~80° total arc

    ctx.beginPath();
    ctx.arc(hx, hy, this.SHIELD_R, center - halfArc, center + halfArc);
    ctx.strokeStyle = '#33ff77';
    ctx.lineWidth   = 7;
    ctx.lineCap     = 'round';
    ctx.shadowBlur  = 14; ctx.shadowColor = '#33ff77';
    ctx.stroke();
    ctx.shadowBlur  = 0;
    ctx.lineCap     = 'butt';

    // Direction glyphs
    const GLYPH = { W: '▲', A: '◀', S: '▼', D: '▶' };
    const POS   = {
      W: { x: hx,                    y: hy - this.SHIELD_R - 16 },
      S: { x: hx,                    y: hy + this.SHIELD_R + 14 },
      A: { x: hx - this.SHIELD_R - 14, y: hy + 4 },
      D: { x: hx + this.SHIELD_R + 10, y: hy + 4 },
    };
    ctx.font      = '12px "Courier New"';
    ctx.textAlign = 'center';
    for (const [dir, glyph] of Object.entries(GLYPH)) {
      ctx.fillStyle = dir === this.shieldDir
        ? 'rgba(50,255,120,0.95)'
        : 'rgba(50,255,120,0.20)';
      ctx.fillText(glyph, POS[dir].x, POS[dir].y);
    }
    ctx.textAlign = 'left';
  }

  // ── Arrowhead shape ───────────────────────────────────────────────
  _drawArrow(ctx, b) {
    const spd = Math.hypot(b.vx, b.vy);
    if (spd < 1) return;
    const nx = b.vx / spd, ny = b.vy / spd; // unit direction
    const px = -ny,        py =  nx;          // perpendicular

    ctx.save();
    ctx.shadowBlur  = 10; ctx.shadowColor = b.color;
    ctx.fillStyle   = b.color;
    ctx.strokeStyle = b.color;

    // Shaft — thin line behind the bullet centre
    ctx.beginPath();
    ctx.moveTo(b.x - nx * 18, b.y - ny * 18);
    ctx.lineTo(b.x,           b.y);
    ctx.lineWidth = 2;
    ctx.stroke();

    // Arrowhead triangle — tip forward, wings behind
    ctx.beginPath();
    ctx.moveTo(b.x + nx * 14,           b.y + ny * 14);           // tip
    ctx.lineTo(b.x + nx *  2 + px * 7,  b.y + ny *  2 + py * 7); // left wing
    ctx.lineTo(b.x + nx *  2 - px * 7,  b.y + ny *  2 - py * 7); // right wing
    ctx.closePath();
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.restore();
  }
}
