'use strict';
// ═══════════════════════════════════════════════════════════════════
// HELL 4 — GRAVITY HELL
// Dark blue heart · Platformer physics · Rectangle boundary
// Variable-height single jump (W / Space) · A / D horizontal
// Gravity flips every 7-12 s, lasts 4-7 s · Solid floor & ceiling
// Timer economy: graze +2 s · hit -5 s
// ═══════════════════════════════════════════════════════════════════
class GravityHell extends HellBase {
  constructor(dir) {
    super(dir);
    this.GRAV          = 900;
    this.JUMP_SPEED    = 490;
    this.JUMP_HOLD_ACC = 800;
    this.JUMP_HOLD_MAX = 0.21;
    this.WALK_SPEED    = 270;
    this.MAX_FALL      = 680;
    this.SPIKE_W = 26;
    this.SPIKE_H = 36;
    this.vy            = 0;
    this.isGrounded    = false;
    this.jumped        = false;
    this.jumpHeld      = false;
    this.jumpHoldTimer = 0;
    this.gravFlipped   = false;
    this.flipTimer     = 0;
    this.flipWarning   = false;
    this.flipWarnTimer = 0;
    this.spikes        = [];
    this.spikeTimer    = 0;
    this.arrowTimer    = 0;
    this._prevJump     = false;
  }

  get heartColor()      { return '#1166dd'; }
  get name()            { return 'GRAVITY HELL'; }
  get cfg()             { return { grazeGain: 2, hitPenalty: 5 }; }
  get heartMovable()    { return false; }
  get heartUpsideDown() { return this.gravFlipped; }

  get boundary() {
    const W = canvas.width, H = canvas.height;
    const bw = Math.min(W, H) * 0.82;
    const bh = Math.min(W, H) * 0.50;
    return { x: (W - bw) / 2, y: (H - bh) / 2, w: bw, h: bh };
  }

  reset() {
    this.gravFlipped = false;
    this.flipWarning = false;
    this.vy          = 0;
    this.spikes      = [];
  }

  enter() {
    const b = this.boundary;
    this.dir.hx        = b.x + b.w / 2;
    this.dir.hy        = b.y + b.h - HEART_R - 1;
    this.vy            = 0;
    this.isGrounded    = true;
    this.jumped        = false;
    this.jumpHeld      = false;
    this.jumpHoldTimer = 0;
    this.gravFlipped   = false;
    this.flipTimer     = rnd(7, 12);
    this.flipWarning   = false;
    this.flipWarnTimer = 0;
    this.spikes        = [];
    this.spikeTimer    = rnd(1.0, 2.0);
    this.arrowTimer    = rnd(1.5, 2.5);
    this._prevJump     = false;
  }

  exit() {
    super.exit();
    this.spikes      = [];
    this.gravFlipped = false;
  }

  update(dt) {
    const b      = this.boundary;
    const gDir   = this.gravFlipped ? -1 : 1;
    const floorY = b.y + b.h - HEART_R;
    const ceilY  = b.y + HEART_R;

    const focused = Keys['ShiftLeft'] || Keys['ShiftRight'];
    const wspd    = this.WALK_SPEED * (focused ? 0.45 : 1);
    if (Keys['KeyA'] || Keys['ArrowLeft'])  this.dir.hx -= wspd * dt;
    if (Keys['KeyD'] || Keys['ArrowRight']) this.dir.hx += wspd * dt;
    this.dir.hx = clamp(this.dir.hx, b.x + HEART_R, b.x + b.w - HEART_R);

    const jumpKey  = !!(Keys['KeyW'] || Keys['Space']);
    const jumpDown = jumpKey && !this._prevJump;
    this._prevJump = jumpKey;

    if (jumpDown && this.isGrounded) {
      this.vy            = -this.JUMP_SPEED * gDir;
      this.isGrounded    = false;
      this.jumped        = true;
      this.jumpHeld      = true;
      this.jumpHoldTimer = 0;
    }
    if (this.jumpHeld && jumpKey && this.jumpHoldTimer < this.JUMP_HOLD_MAX) {
      this.vy            -= this.JUMP_HOLD_ACC * gDir * dt;
      this.jumpHoldTimer += dt;
    }
    if (!jumpKey) this.jumpHeld = false;

    this.vy += this.GRAV * gDir * dt;
    this.vy  = clamp(this.vy, -this.MAX_FALL, this.MAX_FALL);
    this.dir.hy += this.vy * dt;

    if (!this.gravFlipped) {
      if (this.dir.hy >= floorY) { this.dir.hy = floorY; this.vy = 0; this.isGrounded = true; this.jumped = false; }
      if (this.dir.hy <= ceilY)  { this.dir.hy = ceilY;  if (this.vy < 0) this.vy = 0; }
    } else {
      if (this.dir.hy <= ceilY)  { this.dir.hy = ceilY;  this.vy = 0; this.isGrounded = true; this.jumped = false; }
      if (this.dir.hy >= floorY) { this.dir.hy = floorY; if (this.vy > 0) this.vy = 0; }
    }

    this.flipTimer -= dt;
    if (!this.flipWarning && this.flipTimer <= 1.2) { this.flipWarning = true; this.flipWarnTimer = 1.2; }
    if (this.flipWarnTimer > 0) this.flipWarnTimer -= dt;
    if (this.flipTimer <= 0) {
      this.gravFlipped  = !this.gravFlipped;
      this.vy           = 0;
      this.isGrounded   = false;
      this.jumped       = false;
      this.flipWarning  = false;
      this.dir.flashAlpha = 0.4;
      this.flipTimer = this.gravFlipped ? rnd(4, 7) : rnd(7, 12);
    }

    this.spikeTimer -= dt;
    if (this.spikeTimer <= 0) { this.spikeTimer = rnd(1.6, 2.8); this._spawnSpikes(b); }

    this.arrowTimer -= dt;
    if (this.arrowTimer <= 0) { this.arrowTimer = rnd(1.3, 2.4); this._spawnArrow(b); }

    const hx = this.dir.hx, hy = this.dir.hy;
    for (let i = this.spikes.length - 1; i >= 0; i--) {
      const s = this.spikes[i];
      s.age += dt;
      if      (s.state === 'warn'   && s.age >= s.warnDur  ) { s.state = 'active'; s.age = 0; }
      else if (s.state === 'active' && s.age >= s.activeDur) { this.spikes.splice(i, 1); continue; }
      if (s.state !== 'active' || this.dir.iframes > 0) continue;
      const distTip = Math.hypot(hx - s.x, hy - s.tipY);
      const inBody  = Math.abs(hx - s.x) < this.SPIKE_W / 2 &&
                      hy >= Math.min(s.baseY, s.tipY) - HEART_R &&
                      hy <= Math.max(s.baseY, s.tipY) + HEART_R;
      if (!s.grazed && distTip < GRAZE_R && distTip >= HEART_R) {
        s.grazed = true;
        this.dir.clock.add(this.cfg.grazeGain, hx, hy - 24);
        this.dir.particles.burst(hx, hy, '#4499ff', 5, 110);
      }
      if (!s.hit && (distTip < HEART_R || inBody)) {
        s.hit = true;
        this.dir.iframes = this.dir.IFRAME_DUR;
        this.dir.particles.burst(hx, hy, this.heartColor, 16, 220);
        this.dir.clock.subtract(this.cfg.hitPenalty, hx, hy - 24);
      }
    }
  }

  draw(ctx) {
    const b = this.boundary;
    const W = canvas.width, H = canvas.height;

    if (this.flipWarning && this.flipWarnTimer > 0) {
      const t     = 1 - this.flipWarnTimer / 1.2;
      const pulse = Math.abs(Math.sin(t * Math.PI * 5));
      ctx.fillStyle = `rgba(255,130,0,${pulse * 0.14})`;
      ctx.fillRect(0, 0, W, H);
    }

    ctx.strokeStyle = 'rgba(30,90,220,0.30)';
    ctx.lineWidth   = 1.5;
    ctx.strokeRect(b.x, b.y, b.w, b.h);

    ctx.lineWidth = 4;
    const floorGlow = !this.gravFlipped;
    ctx.shadowBlur  = floorGlow ? 10 : 0;
    ctx.shadowColor = '#1155dd';
    ctx.strokeStyle = floorGlow ? '#3366ff' : 'rgba(30,100,200,0.4)';
    ctx.beginPath(); ctx.moveTo(b.x, b.y + b.h); ctx.lineTo(b.x + b.w, b.y + b.h); ctx.stroke();

    const ceilGlow  = this.gravFlipped;
    ctx.shadowBlur  = ceilGlow ? 10 : 0;
    ctx.strokeStyle = ceilGlow ? '#ff8800' : 'rgba(30,100,200,0.4)';
    ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.lineTo(b.x + b.w, b.y); ctx.stroke();
    ctx.shadowBlur  = 0;

    this._drawGravArrow(ctx, b);

    for (const s of this.spikes) {
      const progress = s.state === 'warn' ? s.age / s.warnDur : 1;
      const alpha    = s.state === 'warn' ? 0.20 + progress * 0.55 : 1;
      ctx.beginPath();
      ctx.moveTo(s.x - this.SPIKE_W / 2, s.baseY);
      ctx.lineTo(s.x + this.SPIKE_W / 2, s.baseY);
      ctx.lineTo(s.x, s.tipY);
      ctx.closePath();
      ctx.shadowBlur  = s.state === 'active' ? 10 : 0;
      ctx.shadowColor = '#2255ff';
      ctx.fillStyle   = s.state === 'warn' ? `rgba(60,130,255,${alpha})` : '#3366ff';
      ctx.fill();
      if (s.state === 'warn') {
        ctx.strokeStyle = `rgba(120,180,255,${alpha})`; ctx.lineWidth = 1.5; ctx.stroke();
      }
      ctx.shadowBlur = 0;
    }
  }

  _drawGravArrow(ctx, b) {
    const ax   = b.x - 22;
    const midY = b.y + b.h / 2;
    const gDir = this.gravFlipped ? -1 : 1;
    const col  = this.gravFlipped ? '#ff8800' : '#3366ee';
    ctx.strokeStyle = col; ctx.lineWidth = 2;
    ctx.shadowBlur = 6; ctx.shadowColor = col;
    ctx.beginPath();
    ctx.moveTo(ax, midY - 14 * gDir); ctx.lineTo(ax, midY + 14 * gDir);
    ctx.moveTo(ax - 5, midY + 8 * gDir); ctx.lineTo(ax, midY + 14 * gDir); ctx.lineTo(ax + 5, midY + 8 * gDir);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  _spawnSpikes(b) {
    const baseY = this.gravFlipped ? b.y : b.y + b.h;
    const tipY  = this.gravFlipped ? b.y + this.SPIKE_H : b.y + b.h - this.SPIKE_H;
    const count = Math.floor(rnd(1, 4));
    const placed = [];
    for (let i = 0; i < count; i++) {
      let sx, attempts = 0;
      do {
        sx = b.x + this.SPIKE_W + Math.random() * (b.w - this.SPIKE_W * 2);
        attempts++;
      } while (placed.some(px => Math.abs(px - sx) < this.SPIKE_W * 2.5) && attempts < 12);
      placed.push(sx);
      this.spikes.push({ x: sx, baseY, tipY, state: 'warn', age: 0,
        warnDur: rnd(0.6, 1.0), activeDur: rnd(1.2, 1.8), grazed: false, hit: false });
    }
  }

  _spawnArrow(b) {
    const margin = this.SPIKE_H + HEART_R + 12;
    const minY   = b.y + margin;
    const maxY   = b.y + b.h - margin;
    if (maxY <= minY) return;
    const fromLeft = Math.random() < 0.5;
    const spd      = 340 + clamp(score / 500, 0, 100);
    this.pool.spawn({
      x: fromLeft ? b.x - 16 : b.x + b.w + 16,
      y: rnd(minY, maxY),
      vx: fromLeft ? spd : -spd, vy: 0,
      r: 7, color: '#4488ff', life: 6
    });
  }
}
