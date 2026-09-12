'use strict';
// ═══════════════════════════════════════════════════════════════════
// HELL 3 — STRING HELL
// Reference: Muffet from Undertale
//
// Purple heart · Horizontal rectangle boundary (visible all 4 walls)
// Y movement: W/S snap between string lanes (one-shot per press)
// X movement: A/D free horizontal within boundary
//
// PHASE 1 (0–18 s): 3 strings
// PHASE 2 (18+ s):  5 strings (boundary expands, 1 added top + 1 bottom)
//
// ATTACKS
//   Spider     — horizontal orb along one string lane
//   Bounce     — diagonal orb that bounces off boundary top/bottom
//   Boomerang  — horizontal orb, reflects off both walls, dodge twice
//   Bomb       — 5-string phase only; FULL-WIDTH rect covering 3 lanes
//                2 s indicator countdown before it detonates
//
// Timer economy: graze +2s · hit −4s
// ═══════════════════════════════════════════════════════════════════
class StringHell extends HellBase {
  constructor(dir) {
    super(dir);
    this.currentString    = 1;
    this.timeInHell       = 0;
    this._prevW           = false;
    this._prevS           = false;
    this.attackCooldown   = 1.8;
    this._deferred        = [];
    this._activeBombs     = [];   // custom bomb entries (not pool bullets)
    this.STRING_SPACING   = 55;
    this.PAD              = 28;
    this._lastStringCount = 3;
  }

  // ── Hell identity ─────────────────────────────────────────────────
  get heartColor()   { return '#cc44ff'; }
  get name()         { return 'STRING HELL'; }
  get heartMovable() { return false; }
  get cfg()          { return { grazeGain: 2, hitPenalty: 4 }; }

  // ── Phase ─────────────────────────────────────────────────────────
  get _stringCount() { return this.timeInHell > 18 ? 5 : 3; }

  // ── Boundary — narrower so all 4 walls are clearly visible ────────
  get boundary() {
    const W = canvas.width, H = canvas.height;
    const n  = this._stringCount;
    const bh = (n - 1) * this.STRING_SPACING + this.PAD * 2;
    const bw = Math.min(W, H) * 0.82; // narrower = left/right walls clearly visible
    return { x: (W - bw) / 2, y: (H - bh) / 2, w: bw, h: bh };
  }

  // ── String Y positions ────────────────────────────────────────────
  get _strings() {
    const b = this.boundary;
    const n = this._stringCount;
    return Array.from({ length: n },
      (_, i) => b.y + this.PAD + i * this.STRING_SPACING);
  }

  get _attackRate() { return 1.8 - clamp(score / 12000, 0, 1.05); }

  // ── Lifecycle ─────────────────────────────────────────────────────
  enter() {
    this.currentString    = 1;
    this.timeInHell       = 0;
    this._prevW = this._prevS = false;
    this.attackCooldown   = 1.8;
    this._deferred        = [];
    this._activeBombs     = [];
    this._lastStringCount = 3;
    this.dir.hx = canvas.width / 2;
    this.dir.hy = this._strings[1];
  }

  exit() {
    super.exit();
    this._deferred.forEach(id => clearTimeout(id));
    this._deferred     = [];
    this._activeBombs  = [];
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

    // Phase upgrade: 3 → 5 strings; shift currentString down so same lane
    const newCount = this._stringCount;
    if (newCount > this._lastStringCount) {
      this.currentString    = clamp(this.currentString + 1, 0, newCount - 1);
      this._lastStringCount = newCount;
    }

    const strings = this._strings;
    const n       = strings.length;
    const b       = this.boundary;

    // W/S → snap one string (rising-edge only)
    const wDown = Keys['KeyW'] || Keys['ArrowUp'];
    const sDown = Keys['KeyS'] || Keys['ArrowDown'];
    if (wDown && !this._prevW) this.currentString = clamp(this.currentString - 1, 0, n - 1);
    if (sDown && !this._prevS) this.currentString = clamp(this.currentString + 1, 0, n - 1);
    this._prevW = wDown;
    this._prevS = sDown;

    // A/D → free horizontal (clamped to boundary)
    const spd = BASE_SPEED;
    if (Keys['KeyA'] || Keys['ArrowLeft'])  this.dir.hx -= spd * dt;
    if (Keys['KeyD'] || Keys['ArrowRight']) this.dir.hx += spd * dt;
    this.dir.hx = clamp(this.dir.hx, b.x + HEART_R, b.x + b.w - HEART_R);

    // Lock Y to current string
    this.dir.hy = strings[this.currentString];

    // Custom physics for pool bullets
    for (const bl of this.pool.list) {
      if (!bl.active) continue;
      if (bl.isBounce && bl.boundsY) {
        if (bl.y <= bl.boundsY.top || bl.y >= bl.boundsY.bot) bl.vy = -bl.vy;
      }
      if (bl.isBoomerang && bl.boundsX) {
        if ((bl.vx > 0 && bl.x >= bl.boundsX.right) ||
            (bl.vx < 0 && bl.x <= bl.boundsX.left))  bl.vx = -bl.vx;
      }
    }

    // Bomb tick + rect hit detection (handled outside pool)
    const hx = this.dir.hx, hy = this.dir.hy;
    for (let i = this._activeBombs.length - 1; i >= 0; i--) {
      const bomb = this._activeBombs[i];
      bomb.life -= dt;
      if (bomb.life <= 0) { this._activeBombs.splice(i, 1); continue; }

      if (!bomb.hit && this.dir.iframes <= 0) {
        // Rect overlap: full boundary width × top-of-lane[0] to bottom-of-lane[2]
        if (hx > bomb.x && hx < bomb.x + bomb.w &&
            hy > bomb.top - HEART_R && hy < bomb.bot + HEART_R) {
          bomb.hit = true;
          this.dir.iframes    = this.dir.IFRAME_DUR;
          this.dir.flashAlpha = 0.5;
          this.dir.clock.subtract(this.cfg.hitPenalty, hx, hy);
          this.dir.particles.burst(hx, hy, '#ff44ff', 16, 220);
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

  // ── SPIDER ────────────────────────────────────────────────────────
  _spider() {
    const strings  = this._strings;
    const b        = this.boundary;
    const lane     = Math.floor(Math.random() * strings.length);
    const fromLeft = Math.random() > 0.5;
    const spd      = 190 + clamp(score / 280, 0, 95);
    const sx       = fromLeft ? b.x : b.x + b.w;
    const bullet   = this.pool.spawn({
      x: sx, y: strings[lane], vx: fromLeft ? spd : -spd, vy: 0,
      r: 11, color: '#aa44ff', life: 10,
    });
    if (bullet) { bullet.isSpider = true; }
  }

  // ── BOUNCING BALL ─────────────────────────────────────────────────
  _bounce() {
    const b        = this.boundary;
    const fromLeft = Math.random() > 0.5;
    const spd      = 175 + clamp(score / 280, 0, 85);
    const sx       = fromLeft ? b.x : b.x + b.w;
    const sy       = rnd(b.y + 12, b.y + b.h - 12);
    const vy       = (Math.random() > 0.5 ? 1 : -1) * spd * 0.48;
    const bullet   = this.pool.spawn({
      x: sx, y: sy, vx: fromLeft ? spd : -spd, vy,
      r: 9, color: '#ff88ff', life: 12,
    });
    if (bullet) {
      bullet.isBounce = true;
      bullet.boundsY  = { top: b.y + 5, bot: b.y + b.h - 5 };
    }
  }

  // ── BOOMERANG ─────────────────────────────────────────────────────
  _boomerang() {
    const strings  = this._strings;
    const b        = this.boundary;
    const lane     = Math.floor(Math.random() * strings.length);
    const fromLeft = Math.random() > 0.5;
    const spd      = 210 + clamp(score / 280, 0, 90);
    const sx       = fromLeft ? b.x : b.x + b.w;
    const bullet   = this.pool.spawn({
      x: sx, y: strings[lane], vx: fromLeft ? spd : -spd, vy: 0,
      r: 10, color: '#ffaaff', life: 16,
    });
    if (bullet) {
      bullet.isBoomerang = true;
      bullet.boundsX     = { left: b.x, right: b.x + b.w };
    }
  }

  // ── LARGE BOMB (5-string phase only) ──────────────────────────────
  // Spawns a 2 s indicator, then a FULL-WIDTH rectangle covering 3 lanes
  _bomb() {
    const strings = this._strings;
    const n       = strings.length;
    if (n < 3) return;
    const b         = this.boundary;
    const startLane = Math.floor(Math.random() * (n - 2));  // 0..n-3
    const cy        = strings[startLane + 1]; // centre lane Y for indicator

    // 2 s warning indicator at the centre of the 3-lane zone
    this.indicators.add(b.x + b.w / 2, cy, 2.0);

    this._defer(2000, () => {
      const strs = this._strings; // re-fetch in case boundary changed
      const bnd  = this.boundary;
      // Bomb rectangle spans full boundary width, top-of-lane-0 to bot-of-lane-2
      this._activeBombs.push({
        x:    bnd.x,
        w:    bnd.w,
        top:  strs[startLane],
        bot:  strs[Math.min(startLane + 2, strs.length - 1)],
        life: 0.65,
        hit:  false,
        lane: startLane,
      });
    });
  }

  // ── Draw ──────────────────────────────────────────────────────────
  draw(ctx) {
    const b       = this.boundary;
    const strings = this._strings;

    // ── Boundary — all 4 walls clearly visible ──────────────────────
    ctx.strokeStyle = 'rgba(170,68,255,0.40)';
    ctx.lineWidth   = 1.5;
    ctx.strokeRect(b.x, b.y, b.w, b.h);

    // ── Strings — faint purple horizontal lines ─────────────────────
    for (let i = 0; i < strings.length; i++) {
      const y      = strings[i];
      const active = i === this.currentString;
      ctx.beginPath();
      ctx.moveTo(b.x, y);
      ctx.lineTo(b.x + b.w, y);
      ctx.strokeStyle = active ? 'rgba(170,68,255,0.55)' : 'rgba(170,68,255,0.22)';
      ctx.lineWidth   = active ? 2 : 1;
      ctx.shadowBlur  = active ? 10 : 3;
      ctx.shadowColor = '#aa44ff';
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // ── Active bomb explosions — full-width rectangles ───────────────
    for (const bomb of this._activeBombs) {
      const alpha = clamp(bomb.life / 0.65, 0, 1);
      const h     = bomb.bot - bomb.top;

      // Fill — glowing purple rect
      ctx.fillStyle = `rgba(160,0,220,${alpha * 0.45})`;
      ctx.fillRect(bomb.x, bomb.top, bomb.w, h);

      // Bright border
      ctx.strokeStyle = `rgba(220,80,255,${alpha * 0.90})`;
      ctx.lineWidth   = 2.5;
      ctx.shadowBlur  = 18; ctx.shadowColor = '#cc00ff';
      ctx.strokeRect(bomb.x, bomb.top, bomb.w, h);
      ctx.shadowBlur = 0;

      // String lane accent lines inside explosion
      const strs = this._strings;
      for (let li = bomb.lane; li <= bomb.lane + 2 && li < strs.length; li++) {
        ctx.beginPath();
        ctx.moveTo(bomb.x, strs[li]);
        ctx.lineTo(bomb.x + bomb.w, strs[li]);
        ctx.strokeStyle = `rgba(255,160,255,${alpha * 0.60})`;
        ctx.lineWidth   = 1;
        ctx.stroke();
      }
    }
  }
}
