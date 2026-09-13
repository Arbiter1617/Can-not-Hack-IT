'use strict';
// ═══════════════════════════════════════════════════════════════════
// HELL 3 — STRING HELL
// Reference: Muffet from Undertale
//
// VISIT 1:
//   Phase 1 (0–12 s) — 3 strings
//   Phase 2 (12 s+)  — 5 strings, Large Bomb available
//
// VISIT 2+ → CLIMBING MODE:
//   8 scrolling strings drift downward continuously.
//   Pac-Man monster fixed at bottom, eating/pulling strings down.
//   Player must keep snapping UP (W) to stay alive.
//   Touching monster = hit −4s.
//   No regular attacks — pure survival scroll.
//
// Controls: A/D = free horizontal · W/S = snap one string up/down
// Timer economy: graze +2s · hit −4s
// ═══════════════════════════════════════════════════════════════════
class StringHell extends HellBase {
  constructor(dir) {
    super(dir);
    // ── Persistent state (survives enter/exit cycles) ──────────────
    this._visitCount = 0;    // reset by director on game restart

    // ── Per-visit state ────────────────────────────────────────────
    this.currentString    = 1;
    this.timeInHell       = 0;
    this._prevW           = false;
    this._prevS           = false;
    this.attackCooldown   = 1.8;
    this._deferred        = [];
    this._activeBombs     = [];
    this._lastStringCount = 3;

    // ── Climbing mode state ────────────────────────────────────────
    this.isClimbing       = false;
    this.climbOffset      = 0;   // wrapping offset [0, CLIMB_SPACING)
    this.climbCumOffset   = 0;   // cumulative (never wraps) — used for string-locked bullets
    this.climbPlayerRow   = 3;
    this.CLIMB_COUNT      = 8;
    this.CLIMB_SPACING    = 38;
    this.CLIMB_SPEED      = 75;
    this.MONSTER_R        = 30;
    this.climbSpiderTimer = 0;

    // ── Layout constants ───────────────────────────────────────────
    this.STRING_SPACING   = 55;
    this.PAD              = 28;
  }

  // ── Hell identity ─────────────────────────────────────────────────
  get heartColor()   { return '#cc44ff'; }
  get name()         { return 'STRING HELL'; }
  get heartMovable() { return false; }
  get cfg()          { return { grazeGain: 2, hitPenalty: 4 }; }

  // ── Phase (normal mode only) ──────────────────────────────────────
  get _stringCount() { return this.timeInHell > 12 ? 5 : 3; }

  // ── Boundaries ────────────────────────────────────────────────────
  get boundary() {
    const W = canvas.width, H = canvas.height;
    const bw = Math.min(W, H) * 0.82;

    if (this.isClimbing) {
      // Height fits 8 strings + monster gap at bottom
      const bh = (this.CLIMB_COUNT - 1) * this.CLIMB_SPACING + this.PAD * 2
               + this.MONSTER_R * 2 + 10;
      return { x: (W - bw) / 2, y: (H - bh) / 2, w: bw, h: bh };
    }
    const n  = this._stringCount;
    const bh = (n - 1) * this.STRING_SPACING + this.PAD * 2;
    return { x: (W - bw) / 2, y: (H - bh) / 2, w: bw, h: bh };
  }

  // ── Normal string Y positions ─────────────────────────────────────
  get _strings() {
    const b = this.boundary;
    const n = this._stringCount;
    return Array.from({ length: n },
      (_, i) => b.y + this.PAD + i * this.STRING_SPACING);
  }

  // ── Climbing: Y for a given row ───────────────────────────────────
  _climbY(row) {
    const b = this.boundary;
    return b.y + this.PAD + row * this.CLIMB_SPACING + this.climbOffset;
  }

  get _monsterY()    { return this.boundary.y + this.boundary.h - this.MONSTER_R - 5; }
  get _attackRate()  { return 1.8 - clamp(score / 12000, 0, 1.05); }

  // ── reset() — called by director on game restart ──────────────────
  reset() {
    this._visitCount        = 0;
    this._practicePhaseTimer = 0;
  }

  // ── Phase starters (shared by enter() and practice loop) ──────────
  _startNormal() {
    this.isClimbing       = false;
    this.currentString    = 1;
    this.timeInHell       = 0;
    this._lastStringCount = 3;
    this.attackCooldown   = 1.8;
    this._activeBombs     = [];
    this.pool.clear();
    this.dir.hx = canvas.width  / 2;
    this.dir.hy = this._strings[1];
  }

  _startClimbing() {
    this.isClimbing       = true;
    this.climbOffset      = 0;
    this.climbCumOffset   = 0;
    this.climbPlayerRow   = Math.floor(this.CLIMB_COUNT / 2);
    this.attackCooldown   = 9999;
    this.climbSpiderTimer = 1.2;
    this.timeInHell       = 0;
    this.pool.clear();
    this.dir.hx = canvas.width  / 2;
    this.dir.hy = this._climbY(this.climbPlayerRow);
  }

  // ── Lifecycle ─────────────────────────────────────────────────────
  enter() {
    this._visitCount++;
    this._prevW = this._prevS = false;
    this._deferred.forEach(id => clearTimeout(id));
    this._deferred           = [];
    this._practicePhaseTimer = 0;

    // Practice mode always starts in normal phase and loops via timer
    if (PRACTICE_HELL === 'string') {
      this._startNormal();
      return;
    }

    // Normal play: 2nd+ visit triggers climbing
    if (this._visitCount >= 2) {
      this._startClimbing();
    } else {
      this._startNormal();
    }
  }

  exit() {
    super.exit();
    this._deferred.forEach(id => clearTimeout(id));
    this._deferred    = [];
    this._activeBombs = [];
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
    // Practice loop: 35 s normal phases → 25 s climbing → repeat indefinitely
    if (PRACTICE_HELL === 'string') {
      this._practicePhaseTimer += dt;
      if (!this.isClimbing && this._practicePhaseTimer >= 35) {
        this._practicePhaseTimer = 0;
        this._startClimbing();
        return;
      }
      if (this.isClimbing && this._practicePhaseTimer >= 25) {
        this._practicePhaseTimer = 0;
        this._startNormal();
        return;
      }
    }

    if (this.isClimbing) { this._updateClimbing(dt); return; }
    this._updateNormal(dt);
  }

  // ── NORMAL UPDATE ─────────────────────────────────────────────────
  _updateNormal(dt) {
    this.timeInHell += dt;

    const newCount = this._stringCount;
    if (newCount > this._lastStringCount) {
      this.currentString    = clamp(this.currentString + 1, 0, newCount - 1);
      this._lastStringCount = newCount;
    }

    const strings = this._strings;
    const n       = strings.length;
    const b       = this.boundary;

    const wDown = Keys['KeyW'] || Keys['ArrowUp'];
    const sDown = Keys['KeyS'] || Keys['ArrowDown'];
    if (wDown && !this._prevW) this.currentString = clamp(this.currentString - 1, 0, n - 1);
    if (sDown && !this._prevS) this.currentString = clamp(this.currentString + 1, 0, n - 1);
    this._prevW = wDown; this._prevS = sDown;

    if (Keys['KeyA'] || Keys['ArrowLeft'])  this.dir.hx -= BASE_SPEED * dt;
    if (Keys['KeyD'] || Keys['ArrowRight']) this.dir.hx += BASE_SPEED * dt;
    this.dir.hx = clamp(this.dir.hx, b.x + HEART_R, b.x + b.w - HEART_R);
    this.dir.hy = strings[this.currentString];

    // Pool bullet custom physics
    for (const bl of this.pool.list) {
      if (!bl.active) continue;
      if (bl.isBounce   && bl.boundsY &&
          (bl.y <= bl.boundsY.top || bl.y >= bl.boundsY.bot)) bl.vy = -bl.vy;
      if (bl.isBoomerang && bl.boundsX &&
          ((bl.vx > 0 && bl.x >= bl.boundsX.right) ||
           (bl.vx < 0 && bl.x <= bl.boundsX.left)))           bl.vx = -bl.vx;
    }

    // Bomb custom rect hit detection
    const hx = this.dir.hx, hy = this.dir.hy;
    for (let i = this._activeBombs.length - 1; i >= 0; i--) {
      const bomb = this._activeBombs[i];
      bomb.life -= dt;
      if (bomb.life <= 0) { this._activeBombs.splice(i, 1); continue; }
      if (!bomb.hit && this.dir.iframes <= 0 &&
          hx > bomb.x && hx < bomb.x + bomb.w &&
          hy > bomb.top - HEART_R && hy < bomb.bot + HEART_R) {
        bomb.hit           = true;
        this.dir.iframes   = this.dir.IFRAME_DUR;
        this.dir.flashAlpha = 0.5;
        this.dir.clock.subtract(this.cfg.hitPenalty, hx, hy);
        this.dir.particles.burst(hx, hy, '#ff44ff', 16, 220);
      }
    }

    // Spawn attacks
    this.attackCooldown -= dt;
    if (this.attackCooldown <= 0) {
      this.attackCooldown = this._attackRate;
      this._spawnAttack();
    }
  }

  // ── CLIMBING UPDATE ───────────────────────────────────────────────
  _updateClimbing(dt) {
    const b = this.boundary;

    // Scroll strings downward — base 75 px/s, accelerates to 175 px/s
    const speed = this.CLIMB_SPEED + clamp(this.timeInHell * 4, 0, 100);
    const delta = speed * dt;
    this.climbOffset    += delta;
    this.climbCumOffset += delta;   // never wraps — used to track spiders
    this.timeInHell     += dt;

    // Wrap grid: player row drifts down to stay visually in place
    while (this.climbOffset >= this.CLIMB_SPACING) {
      this.climbOffset    -= this.CLIMB_SPACING;
      this.climbPlayerRow += 1;
    }
    this.climbPlayerRow = clamp(this.climbPlayerRow, 0, this.CLIMB_COUNT - 1);

    // W/S → snap rows (rising edge)
    const wDown = Keys['KeyW'] || Keys['ArrowUp'];
    const sDown = Keys['KeyS'] || Keys['ArrowDown'];
    if (wDown && !this._prevW) this.climbPlayerRow = Math.max(0, this.climbPlayerRow - 1);
    if (sDown && !this._prevS) this.climbPlayerRow = Math.min(this.CLIMB_COUNT - 1, this.climbPlayerRow + 1);
    this._prevW = wDown; this._prevS = sDown;

    // A/D → horizontal movement
    if (Keys['KeyA'] || Keys['ArrowLeft'])  this.dir.hx -= BASE_SPEED * dt;
    if (Keys['KeyD'] || Keys['ArrowRight']) this.dir.hx += BASE_SPEED * dt;
    this.dir.hx = clamp(this.dir.hx, b.x + HEART_R, b.x + b.w - HEART_R);

    // Lock Y to current climbing row
    this.dir.hy = this._climbY(this.climbPlayerRow);

    // Drag string-spiders down with the scrolling grid
    // Each spider records climbCumOffset at spawn; every frame we apply the delta
    for (const bl of this.pool.list) {
      if (!bl.active || !bl.isStringLocked) continue;
      bl.y = bl.stringLockBaseY + this.climbCumOffset - bl.stringLockCumAtSpawn;
    }

    // Monster hit — if heart reaches the Pac-Man row
    const monsterY = this._monsterY;
    if (this.dir.hy >= monsterY - this.MONSTER_R - HEART_R && this.dir.iframes <= 0) {
      this.climbPlayerRow = Math.max(0, this.climbPlayerRow - 1);
      this.dir.hy         = this._climbY(this.climbPlayerRow);
      this.dir.iframes    = this.dir.IFRAME_DUR;
      this.dir.flashAlpha = 0.5;
      this.dir.clock.subtract(this.cfg.hitPenalty, this.dir.hx, this.dir.hy);
      this.dir.particles.burst(this.dir.hx, monsterY, '#ffdd00', 14, 200);
    }

    // Double spiders: spawn two per tick, rate 0.50s → 0.28s over time
    this.climbSpiderTimer -= dt;
    if (this.climbSpiderTimer <= 0) {
      this.climbSpiderTimer = 0.50 - clamp(this.timeInHell / 30, 0, 0.22);
      this._spawnClimbSpider();
      this._spawnClimbSpider(); // second spider same tick
    }
  }

  // ── Attack selector (normal mode only) ───────────────────────────
  _spawnAttack() {
    const choices = ['spider', 'bounce', 'boomerang'];
    if (this._stringCount >= 5) choices.push('bomb');
    const atk = choices[Math.floor(Math.random() * choices.length)];
    if (atk === 'spider')    this._spider();
    if (atk === 'bounce')    this._bounce();
    if (atk === 'boomerang') this._boomerang();
    if (atk === 'bomb')      this._bomb();
  }

  _spider() {
    const strings  = this._strings, b = this.boundary;
    const lane     = Math.floor(Math.random() * strings.length);
    const fromLeft = Math.random() > 0.5;
    const spd      = 190 + clamp(score / 280, 0, 95);
    const bullet   = this.pool.spawn({
      x: fromLeft ? b.x : b.x + b.w, y: strings[lane],
      vx: fromLeft ? spd : -spd, vy: 0, r: 11, color: '#aa44ff', life: 10,
    });
    if (bullet) bullet.isSpider = true;
  }

  _bounce() {
    const b = this.boundary, fromLeft = Math.random() > 0.5;
    const spd = 175 + clamp(score / 280, 0, 85);
    const sy  = rnd(b.y + 12, b.y + b.h - 12);
    const vy  = (Math.random() > 0.5 ? 1 : -1) * spd * 0.48;
    const bullet = this.pool.spawn({
      x: fromLeft ? b.x : b.x + b.w, y: sy,
      vx: fromLeft ? spd : -spd, vy, r: 9, color: '#ff88ff', life: 12,
    });
    if (bullet) { bullet.isBounce = true; bullet.boundsY = { top: b.y + 5, bot: b.y + b.h - 5 }; }
  }

  _boomerang() {
    const strings = this._strings, b = this.boundary;
    const lane    = Math.floor(Math.random() * strings.length);
    const fromLeft = Math.random() > 0.5;
    const spd     = 210 + clamp(score / 280, 0, 90);
    const bullet  = this.pool.spawn({
      x: fromLeft ? b.x : b.x + b.w, y: strings[lane],
      vx: fromLeft ? spd : -spd, vy: 0, r: 10, color: '#ffaaff', life: 16,
    });
    if (bullet) { bullet.isBoomerang = true; bullet.boundsX = { left: b.x, right: b.x + b.w }; }
  }

  _bomb() {
    const strings = this._strings, n = strings.length;
    if (n < 3) return;
    const b         = this.boundary;
    const startLane = Math.floor(Math.random() * (n - 2));
    this.indicators.add(b.x + b.w / 2, strings[startLane + 1], 2.0);
    this._defer(2000, () => {
      const strs = this._strings, bnd = this.boundary;
      this._activeBombs.push({
        x: bnd.x, w: bnd.w,
        top:  strs[startLane],
        bot:  strs[Math.min(startLane + 2, strs.length - 1)],
        life: 0.65, hit: false, lane: startLane,
      });
    });
  }

  // ── CLIMB SPIDER — spawns on a visible scrolling string lane ─────
  _spawnClimbSpider() {
    const b         = this.boundary;
    const monsterY  = this._monsterY;
    const validRows = [];
    for (let i = 0; i < this.CLIMB_COUNT; i++) {
      const y = this._climbY(i);
      if (y >= b.y + 5 && y < monsterY - this.MONSTER_R - 10) {
        validRows.push(y);
      }
    }
    if (validRows.length === 0) return;
    const spawnY   = validRows[Math.floor(Math.random() * validRows.length)];
    const fromLeft = Math.random() > 0.5;
    const spd      = 210 + clamp(score / 280, 0, 100);
    const bullet   = this.pool.spawn({
      x: fromLeft ? b.x : b.x + b.w, y: spawnY,
      vx: fromLeft ? spd : -spd, vy: 0,
      r: 11, color: '#aa44ff', life: 7,
    });
    if (bullet) {
      bullet.isSpider            = true;
      // String-lock: Y tracks the scrolling grid
      bullet.isStringLocked      = true;
      bullet.stringLockBaseY     = spawnY;           // Y at moment of spawn
      bullet.stringLockCumAtSpawn = this.climbCumOffset; // cumOffset at spawn
    }
  }

  // ── Draw ──────────────────────────────────────────────────────────
  draw(ctx) {
    if (this.isClimbing) { this._drawClimbing(ctx); return; }
    this._drawNormal(ctx);
  }

  // ── NORMAL DRAW ───────────────────────────────────────────────────
  _drawNormal(ctx) {
    const b       = this.boundary;
    const strings = this._strings;

    // All 4 boundary walls
    ctx.strokeStyle = 'rgba(170,68,255,0.40)';
    ctx.lineWidth   = 1.5;
    ctx.strokeRect(b.x, b.y, b.w, b.h);

    // Faint purple strings
    for (let i = 0; i < strings.length; i++) {
      const active = i === this.currentString;
      ctx.beginPath();
      ctx.moveTo(b.x, strings[i]); ctx.lineTo(b.x + b.w, strings[i]);
      ctx.strokeStyle = active ? 'rgba(170,68,255,0.55)' : 'rgba(170,68,255,0.22)';
      ctx.lineWidth   = active ? 2 : 1;
      ctx.shadowBlur  = active ? 10 : 3; ctx.shadowColor = '#aa44ff';
      ctx.stroke(); ctx.shadowBlur = 0;
    }

    // Active bomb rectangles
    for (const bomb of this._activeBombs) {
      const a = clamp(bomb.life / 0.65, 0, 1);
      const h = bomb.bot - bomb.top;
      ctx.fillStyle   = `rgba(160,0,220,${a * 0.45})`;
      ctx.fillRect(bomb.x, bomb.top, bomb.w, h);
      ctx.strokeStyle = `rgba(220,80,255,${a * 0.90})`;
      ctx.lineWidth   = 2.5;
      ctx.shadowBlur  = 18; ctx.shadowColor = '#cc00ff';
      ctx.strokeRect(bomb.x, bomb.top, bomb.w, h);
      ctx.shadowBlur  = 0;
      const strs = this._strings;
      for (let li = bomb.lane; li <= bomb.lane + 2 && li < strs.length; li++) {
        ctx.beginPath();
        ctx.moveTo(bomb.x, strs[li]); ctx.lineTo(bomb.x + bomb.w, strs[li]);
        ctx.strokeStyle = `rgba(255,160,255,${a * 0.60})`; ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  }

  // ── CLIMBING DRAW ─────────────────────────────────────────────────
  _drawClimbing(ctx) {
    const b         = this.boundary;
    const monsterY  = this._monsterY;

    // Boundary walls
    ctx.strokeStyle = 'rgba(170,68,255,0.40)';
    ctx.lineWidth   = 1.5;
    ctx.strokeRect(b.x, b.y, b.w, b.h);

    // Scrolling strings — only draw those within the playfield above monster
    for (let i = 0; i < this.CLIMB_COUNT; i++) {
      const y = this._climbY(i);
      if (y < b.y || y >= monsterY - this.MONSTER_R) continue;
      const active = i === this.climbPlayerRow;
      ctx.beginPath();
      ctx.moveTo(b.x, y); ctx.lineTo(b.x + b.w, y);
      ctx.strokeStyle = active ? 'rgba(170,68,255,0.60)' : 'rgba(170,68,255,0.22)';
      ctx.lineWidth   = active ? 2 : 1;
      ctx.shadowBlur  = active ? 10 : 3; ctx.shadowColor = '#aa44ff';
      ctx.stroke(); ctx.shadowBlur = 0;
    }

    // Monster string-eating effect — partial strings fading below monster zone
    const eatAlpha = 0.15 + 0.10 * Math.abs(Math.sin(performance.now() / 300));
    ctx.fillStyle = `rgba(0,0,0,${eatAlpha + 0.30})`;
    ctx.fillRect(b.x, monsterY - this.MONSTER_R, b.w,
                 b.h - (monsterY - this.MONSTER_R - b.y));

    // Full-width Pac-Man row
    this._drawMonster(ctx, b);

    // Danger zone glow near monster
    const dangerGrad = ctx.createLinearGradient(0, monsterY - 60, 0, monsterY);
    dangerGrad.addColorStop(0, 'rgba(255,200,0,0)');
    dangerGrad.addColorStop(1, 'rgba(255,200,0,0.08)');
    ctx.fillStyle = dangerGrad;
    ctx.fillRect(b.x, monsterY - 60, b.w, 60);
  }

  // ── Full-width Pac-Man monster row ────────────────────────────────
  _drawMonster(ctx, b) {
    const r        = this.MONSTER_R;
    const monsterY = this._monsterY;
    const chompT   = performance.now() / 140;
    const mouthOpen = Math.abs(Math.sin(chompT)) * 0.42; // chomping angle

    // Dark body fill — covers everything below the Pac-Man row
    ctx.fillStyle = '#110800';
    ctx.fillRect(b.x, monsterY, b.w, b.y + b.h - monsterY);

    // Pack Pac-Mans wall-to-wall across the boundary width
    const diameter = r * 2;
    const count    = Math.floor(b.w / diameter);          // how many fit
    const gapTotal = b.w - count * diameter;              // leftover space
    const gap      = gapTotal / (count + 1);              // distribute evenly

    for (let i = 0; i < count; i++) {
      const cx = b.x + gap + diameter * i + gap * i + r; // centred in its slot

      // Body — yellow Pac-Man mouth pointing UP
      ctx.beginPath();
      ctx.arc(cx, monsterY, r,
        -Math.PI / 2 + mouthOpen,
        -Math.PI / 2 - mouthOpen + TWO_PI);
      ctx.lineTo(cx, monsterY);
      ctx.closePath();
      ctx.fillStyle  = '#ffdd00';
      ctx.shadowBlur = 10; ctx.shadowColor = '#ffbb00';
      ctx.fill();
      ctx.shadowBlur = 0;

      // Eye — lower-right of the body (since mouth faces up)
      ctx.beginPath();
      ctx.arc(cx + r * 0.28, monsterY + r * 0.26, r * 0.11, 0, TWO_PI);
      ctx.fillStyle = '#000';
      ctx.fill();
    }

    // Top-edge highlight where strings disappear into the mouths
    ctx.strokeStyle = 'rgba(255,220,60,0.25)';
    ctx.lineWidth   = 1;
    ctx.beginPath();
    ctx.moveTo(b.x, monsterY - r); ctx.lineTo(b.x + b.w, monsterY - r);
    ctx.stroke();
  }
}
