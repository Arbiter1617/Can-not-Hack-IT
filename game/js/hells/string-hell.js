'use strict';
// ═══════════════════════════════════════════════════════════════════
// HELL 3 — STRING HELL
// Reference: Muffet from Undertale
//
// Purple heart · Horizontal rectangle boundary
// Y movement: W/S snap between string lanes (one-shot per press)
// X movement: A/D free horizontal within boundary
//
// PHASE 1 (0–18 s): 3 strings
// PHASE 2 (18+ s):  5 strings (boundary expands, 1 string added top + 1 bottom)
//
// ATTACKS
//   Spider     — horizontal orb along one string lane
//   Bounce     — diagonal orb that bounces off boundary top/bottom
//   Boomerang  — horizontal orb, reflects off wall, must dodge twice
//   Bomb       — 5-string phase only; large 3-lane circle with 2 s countdown
//
// Timer economy: graze +2s · hit −4s
// ═══════════════════════════════════════════════════════════════════
class StringHell extends HellBase {
  constructor(dir) {
    super(dir);
    this.currentString    = 1;   // index into _strings array
    this.timeInHell       = 0;
    this._prevW           = false;
    this._prevS           = false;
    this.attackCooldown   = 1.8;
    this._deferred        = [];
    this.STRING_SPACING   = 55;  // px between string lanes
    this.PAD              = 28;  // px from first/last string to boundary edge
    this._lastStringCount = 3;
  }

  // ── Hell identity ─────────────────────────────────────────────────
  get heartColor()   { return '#cc44ff'; }
  get name()         { return 'STRING HELL'; }
  get heartMovable() { return false; }  // WASD handled here
  get cfg()          { return { grazeGain: 2, hitPenalty: 4 }; }

  // ── Phase ─────────────────────────────────────────────────────────
  get _stringCount() { return this.timeInHell > 18 ? 5 : 3; }

  // ── Boundary — horizontal rectangle, grows at phase 2 ─────────────
  get boundary() {
    const W = canvas.width, H = canvas.height;
    const n = this._stringCount;
    const h = (n - 1) * this.STRING_SPACING + this.PAD * 2;
    const w = W * 0.90;
    return { x: (W - w) / 2, y: (H - h) / 2, w, h };
  }

  // ── String Y positions ────────────────────────────────────────────
  get _strings() {
    const b = this.boundary;
    const n = this._stringCount;
    return Array.from({ length: n },
      (_, i) => b.y + this.PAD + i * this.STRING_SPACING);
  }

  // ── Attack spawn interval (gets faster with score) ────────────────
  get _attackRate() { return 1.8 - clamp(score / 12000, 0, 1.05); }

  // ── Lifecycle ─────────────────────────────────────────────────────
  enter() {
    this.currentString    = 1;
    this.timeInHell       = 0;
    this._prevW           = this._prevS = false;
    this.attackCooldown   = 1.8;
    this._deferred        = [];
    this._lastStringCount = 3;
    // Place heart at centre of middle string
    this.dir.hx = canvas.width / 2;
    this.dir.hy = this._strings[1];
  }

  exit() {
    super.exit();
    this._deferred.forEach(id => clearTimeout(id));
    this._deferred = [];
  }

  _defer(ms, fn) {
    const id = setTimeout(() => {
      if (this.dir.currentHell !== this) return;
      fn();
    }, ms);
    this._deferred.push(id);
  }

  // ── Update ────────────────────────────────────────────────────────
  update(dt) {
    this.timeInHell += dt;

    // Phase upgrade: when 3→5 strings, add one above and below.
    // Shift currentString down by 1 so the player stays on same relative lane.
    const newCount = this._stringCount;
    if (newCount > this._lastStringCount) {
      this.currentString  = clamp(this.currentString + 1, 0, newCount - 1);
      this._lastStringCount = newCount;
    }

    const strings = this._strings;
    const n       = strings.length;

    // W / S → snap one string up/down (rising-edge only — not held)
    const wDown = Keys['KeyW'] || Keys['ArrowUp'];
    const sDown = Keys['KeyS'] || Keys['ArrowDown'];
    if (wDown && !this._prevW) this.currentString = clamp(this.currentString - 1, 0, n - 1);
    if (sDown && !this._prevS) this.currentString = clamp(this.currentString + 1, 0, n - 1);
    this._prevW = wDown;
    this._prevS = sDown;

    // A / D → free horizontal movement
    const b   = this.boundary;
    const spd = BASE_SPEED;
    if (Keys['KeyA'] || Keys['ArrowLeft'])  this.dir.hx -= spd * dt;
    if (Keys['KeyD'] || Keys['ArrowRight']) this.dir.hx += spd * dt;
    this.dir.hx = clamp(this.dir.hx, b.x + HEART_R, b.x + b.w - HEART_R);

    // Lock Y to current string
    this.dir.hy = strings[this.currentString];

    // Custom physics for bounce/boomerang
    for (const bl of this.pool.list) {
      if (!bl.active) continue;

      // Bounce ball: reflect off top/bottom boundary
      if (bl.isBounce && bl.boundsY) {
        if (bl.y <= bl.boundsY.top || bl.y >= bl.boundsY.bot) bl.vy = -bl.vy;
      }

      // Boomerang: reflect off left/right boundary
      if (bl.isBoomerang && bl.boundsX) {
        if ((bl.vx > 0 && bl.x >= bl.boundsX.right) ||
            (bl.vx < 0 && bl.x <= bl.boundsX.left)) {
          bl.vx = -bl.vx;
        }
      }
    }

    // Spawn attacks
    this.attackCooldown -= dt;
    if (this.attackCooldown <= 0) {
      this.attackCooldown = this._attackRate;
      this._spawnAttack();
    }
  }

  // ── Attack selector ───────────────────────────────────────────────
  _spawnAttack() {
    const choices = ['spider', 'bounce', 'boomerang'];
    if (this._stringCount >= 5) choices.push('bomb');
    const atk = choices[Math.floor(Math.random() * choices.length)];
    if (atk === 'spider')    this._spider();
    if (atk === 'bounce')    this._bounce();
    if (atk === 'boomerang') this._boomerang();
    if (atk === 'bomb')      this._bomb();
  }

  // ── SPIDER — horizontal orb along a string lane ───────────────────
  _spider() {
    const strings   = this._strings;
    const b         = this.boundary;
    const lane      = Math.floor(Math.random() * strings.length);
    const fromLeft  = Math.random() > 0.5;
    const spd       = 190 + clamp(score / 280, 0, 95);
    const sx        = fromLeft ? b.x : b.x + b.w;

    const bullet = this.pool.spawn({
      x: sx, y: strings[lane], vx: fromLeft ? spd : -spd, vy: 0,
      r: 11, color: '#aa44ff', life: 10,
    });
    if (bullet) { bullet.isSpider = true; bullet.stringLane = lane; }
  }

  // ── BOUNCING BALL — diagonal, reflects top/bottom ─────────────────
  _bounce() {
    const b        = this.boundary;
    const fromLeft = Math.random() > 0.5;
    const spd      = 175 + clamp(score / 280, 0, 85);
    const sx       = fromLeft ? b.x : b.x + b.w;
    const sy       = rnd(b.y + 15, b.y + b.h - 15);
    const vy       = (Math.random() > 0.5 ? 1 : -1) * spd * 0.48;

    const bullet = this.pool.spawn({
      x: sx, y: sy, vx: fromLeft ? spd : -spd, vy,
      r: 9, color: '#ff88ff', life: 12,
    });
    if (bullet) {
      bullet.isBounce = true;
      bullet.boundsY  = { top: b.y + 5, bot: b.y + b.h - 5 };
    }
  }

  // ── BOOMERANG — horizontal, reflects off both walls ───────────────
  _boomerang() {
    const strings  = this._strings;
    const b        = this.boundary;
    const lane     = Math.floor(Math.random() * strings.length);
    const fromLeft = Math.random() > 0.5;
    const spd      = 210 + clamp(score / 280, 0, 90);
    const sx       = fromLeft ? b.x : b.x + b.w;

    const bullet = this.pool.spawn({
      x: sx, y: strings[lane], vx: fromLeft ? spd : -spd, vy: 0,
      r: 10, color: '#ffaaff', life: 16,
    });
    if (bullet) {
      bullet.isBoomerang = true;
      bullet.boundsX     = { left: b.x, right: b.x + b.w };
    }
  }

  // ── LARGE BOMB — 2 s countdown, covers 3 adjacent string lanes ────
  _bomb() {
    const strings    = this._strings;
    const b          = this.boundary;
    const n          = strings.length;
    if (n < 3) return;
    const startLane  = Math.floor(Math.random() * (n - 2));
    const cx         = rnd(b.x + b.w * 0.15, b.x + b.w * 0.85);
    const cy         = strings[startLane + 1]; // centre of 3-lane span

    // 2-second warning indicator
    this.indicators.add(cx, cy, 2.0);

    this._defer(2000, () => {
      // Radius large enough to cover one STRING_SPACING above + below centre
      const bullet = this.pool.spawn({
        x: cx, y: cy, vx: 0, vy: 0,
        r: this.STRING_SPACING - 2,
        color: '#9900cc', life: 0.70,
      });
      if (bullet) bullet.isBomb = true;
    });
  }

  // ── Draw ──────────────────────────────────────────────────────────
  draw(ctx) {
    const b       = this.boundary;
    const strings = this._strings;

    // Boundary rectangle
    ctx.strokeStyle = 'rgba(170,68,255,0.15)';
    ctx.lineWidth   = 1;
    ctx.strokeRect(b.x, b.y, b.w, b.h);

    // Strings — faint purple horizontal lines
    for (let i = 0; i < strings.length; i++) {
      const y      = strings[i];
      const active = i === this.currentString;

      ctx.beginPath();
      ctx.moveTo(b.x, y);
      ctx.lineTo(b.x + b.w, y);
      ctx.strokeStyle = active
        ? 'rgba(170,68,255,0.55)'
        : 'rgba(170,68,255,0.22)';
      ctx.lineWidth   = active ? 2 : 1;
      ctx.shadowBlur  = active ? 10 : 3;
      ctx.shadowColor = '#aa44ff';
      ctx.stroke();
      ctx.shadowBlur  = 0;
    }
  }
}
