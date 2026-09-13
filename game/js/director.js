'use strict';
// ═══════════════════════════════════════════════════════════════════
// GAME DIRECTOR
// Owns: clock, pool, particles, indicators, hell list
// Manages: heart position, iframes, hell transitions, HUD, game state
// States: MENU | PLAYING | PAUSED | DEAD
// ═══════════════════════════════════════════════════════════════════
class GameDirector {
  constructor() {
    this.clock      = new LoopClock(60);
    this.pool       = new BulletPool(900);
    this.particles  = new Particles();
    this.indicators = new IndicatorSystem();

    this.hx         = 0;
    this.hy         = 0;
    this.iframes    = 0;
    this.IFRAME_DUR = 1.6;

    // ── Hell registry — add new hells here as they are built ────────
    this.hells = [
      new DodgeHell(this),
      new ShieldHell(this),
      new StringHell(this),
      new TypingHell(this),
      new LaserProjectileHell(this),    // Laser beams + projectiles simultaneously
      new GravityHell(this),             // Platformer physics + gravity flip
      // ...
    ];
    this.hellIdx     = 0;
    this.currentHell = this.hells[0];

    // ── Parallel overlay systems ─────────────────────────────────────
    this.fruitNinja = new FruitNinjaSystem(this);

    this.state      = 'MENU';
    this.flashAlpha = 0;
    this._lastHellN = 0;
  }

  // ── Start / Restart ───────────────────────────────────────────────
  start() {
    score           = 0;
    this._lastHellN = 0;
    // Randomised first threshold: 2000–3500 pts before first hell switch
    this._nextHellScore = 2000 + Math.random() * 1500;

    // Reset cross-visit hell state (e.g. visit counters)
    this.hells.forEach(h => h.reset());
    this.fruitNinja.reset();

    // Practice mode: normal timer, hell stays locked — no transitions
    const practiceIdx = PRACTICE_HELL ? (PRACTICE_HELL_IDX[PRACTICE_HELL] ?? 0) : 0;
    this.clock = new LoopClock(60);

    this.pool.clear();
    this.particles.list.length  = 0;
    this.indicators.list.length = 0;
    this.iframes    = 0;
    this.flashAlpha = 0;

    this.hx = canvas.width  / 2;
    this.hy = canvas.height / 2;

    // Non-practice: start on a random hell
    const startIdx = PRACTICE_HELL
      ? practiceIdx
      : Math.floor(Math.random() * this.hells.length);

    this.hellIdx     = startIdx;
    this.currentHell = this.hells[startIdx];
    this.currentHell.enter();
    this.state = 'PLAYING';
  }

  // ── Pause toggle (ESC) ────────────────────────────────────────────
  togglePause() {
    if (this.state === 'PLAYING') this.state = 'PAUSED';
    else if (this.state === 'PAUSED') this.state = 'PLAYING';
  }

  // ── Hell Transition — picks a RANDOM hell (never the same one twice) ──
  _transition() {
    const prevColor = this.currentHell.heartColor; // captured before exit()
    this.currentHell.exit();
    const others = this.hells
      .map((_, i) => i)
      .filter(i => i !== this.hellIdx);
    this.hellIdx     = others[Math.floor(Math.random() * others.length)];
    this.currentHell = this.hells[this.hellIdx];
    // Lets TypingHell (and future hells) inherit the outgoing heart colour
    this.currentHell.inheritColor?.(prevColor);
    this.currentHell.enter();
    this.flashAlpha  = 1;
  }

  // ── Constrain heart inside boundary ──────────────────────────────
  _constrain() {
    const b = this.currentHell.boundary;
    if (!b) return;
    this.hx = clamp(this.hx, b.x + HEART_R, b.x + b.w - HEART_R);
    this.hy = clamp(this.hy, b.y + HEART_R, b.y + b.h - HEART_R);
  }

  // ── Update ────────────────────────────────────────────────────────
  update(dt) {
    if (this.state !== 'PLAYING') return; // MENU / PAUSED / DEAD all skip

    // Passive score & hell gating (skipped in practice — hell is locked)
    score += SCORE_PER_SEC * dt;
    if (!PRACTICE_HELL) {
      if (score >= this._nextHellScore) {
        // Normal score-based transition
        this._nextHellScore += 2000 + Math.random() * 1500;
        this._transition();
      } else if (this.currentHell.forceTransition) {
        // Hell ended itself on its own timer (e.g. Typing Hell 5s window)
        this.currentHell.forceTransition = false;
        this._transition();
      }
    }

    // Clock — frozen during hells that pause the timer (e.g. Shield Hell)
    if (!this.currentHell.timerPaused) this.clock.update(dt);
    if (this.clock.dead) {
      this.state = 'DEAD';
      this.particles.burst(this.hx, this.hy, '#ff3333', 28, 340);
      return;
    }

    // iFrames
    if (this.iframes > 0) this.iframes -= dt;

    // Heart movement — skipped if hell uses WASD for its own controls
    if (this.currentHell.heartMovable !== false) {
      const focused = Keys['ShiftLeft'] || Keys['ShiftRight'];
      const spd     = BASE_SPEED * (focused ? FOCUS_MULT : 1);
      if (Keys['KeyA'] || Keys['ArrowLeft'])  this.hx -= spd * dt;
      if (Keys['KeyD'] || Keys['ArrowRight']) this.hx += spd * dt;
      if (Keys['KeyW'] || Keys['ArrowUp'])    this.hy -= spd * dt;
      if (Keys['KeyS'] || Keys['ArrowDown'])  this.hy += spd * dt;
      this._constrain();
    }

    // Hell logic
    this.currentHell.update(dt);

    // Bullet physics + collision
    const hit = this.pool.update(
      dt, this.hx, this.hy,
      this.clock, this.iframes > 0,
      this.currentHell.cfg
    );
    if (hit) {
      this.iframes = this.IFRAME_DUR;
      this.particles.burst(this.hx, this.hy, this.currentHell.heartColor, 16, 220);
    }

    this.particles.update(dt);
    this.indicators.update(dt);
    this.fruitNinja.update(dt);  // parallel overlay — always runs during play

    if (this.flashAlpha > 0) this.flashAlpha = Math.max(0, this.flashAlpha - dt * 3);
  }

  // ── Draw ──────────────────────────────────────────────────────────
  draw(ctx) {
    const W = canvas.width, H = canvas.height;
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, W, H);

    if (this.state === 'MENU')   { this._drawMenu(ctx, W, H);   return; }
    if (this.state === 'DEAD')   { this._drawDead(ctx, W, H);   return; }

    // ── Active game (PLAYING or PAUSED) ──────────────────────────
    this.currentHell.draw(ctx);
    this.pool.draw(ctx);
    this.indicators.draw(ctx);
    this.particles.draw(ctx);

    // Heart (flicker during iframes)
    const show = this.iframes <= 0 || Math.floor(this.iframes * 9) % 2 === 0;
    if (show) {
      drawHeart(ctx, this.hx, this.hy, HEART_R * 1.5,
        this.currentHell.heartColor, this.currentHell.heartUpsideDown);
    }

    // Graze ring — always-on blue, brighter in focus
    const focused = Keys['ShiftLeft'] || Keys['ShiftRight'];
    ctx.beginPath();
    ctx.arc(this.hx, this.hy, GRAZE_R, 0, TWO_PI);
    ctx.strokeStyle = focused ? 'rgba(60,160,255,0.85)' : 'rgba(60,140,255,0.55)';
    ctx.lineWidth   = focused ? 2 : 1.5;
    ctx.stroke();

    // HUD
    this.clock.draw(ctx, W);
    this._drawHUD(ctx, W, H);

    // Hell-transition flash
    if (this.flashAlpha > 0) {
      ctx.fillStyle = `rgba(255,255,255,${this.flashAlpha * 0.45})`;
      ctx.fillRect(0, 0, W, H);
    }

    // Fruit Ninja overlay — trail + watch on top of all game elements
    this.fruitNinja.draw(ctx);

    // Pause overlay on top of everything
    if (this.state === 'PAUSED') this._drawPaused(ctx, W, H);
  }

  // ── HUD ───────────────────────────────────────────────────────────
  _drawHUD(ctx, W, H) {
    const sc   = Math.floor(score);
    const hell = this.hellIdx + 1;

    ctx.textAlign  = 'center';
    ctx.font       = 'bold 18px "Courier New"';
    ctx.fillStyle  = '#ffffff';
    ctx.shadowBlur = 8; ctx.shadowColor = '#4488ff';
    ctx.fillText(sc.toString().padStart(6, '0'), W / 2, H - 30);
    ctx.shadowBlur = 0;

    ctx.font      = '10px "Courier New"';
    ctx.fillStyle = '#555';
    if (PRACTICE_HELL) {
      // Practice: show mode label instead of hell number
      ctx.fillStyle = '#c084fc'; // purple tint
      ctx.fillText('PRACTICE  —  ' + PRACTICE_HELL.toUpperCase(), W / 2 - 10, H - 30);
    } else {
      ctx.fillText('SCORE', W / 2 - 52, H - 30);
      ctx.fillText('HELL  ' + hell, W / 2 + 22, H - 30);
    }
    ctx.textAlign = 'left';
  }

  // ── Screen: minimal ready-up (no title — already on Start Page) ──
  _drawMenu(ctx, W, H) {
    // Faint pulsing heart in background
    const pulse = 0.55 + Math.abs(Math.sin(performance.now() / 700)) * 0.45;
    ctx.globalAlpha = pulse * 0.18;
    drawHeart(ctx, W / 2, H / 2, 90, '#ff3333');
    ctx.globalAlpha = 1;

    // Ready-up prompt
    ctx.textAlign  = 'center';
    ctx.font       = 'bold 15px "Courier New"';
    ctx.fillStyle  = '#ffffff';
    ctx.shadowBlur = 10; ctx.shadowColor = '#ff3333';
    ctx.fillText('PRESS SPACE TO READY UP', W / 2, H / 2 + 6);
    ctx.shadowBlur = 0;

    // Tiny sub-hint
    ctx.font      = '10px "Courier New"';
    ctx.fillStyle = '#333';
    ctx.fillText('WASD — MOVE   |   SHIFT — FOCUS   |   GRAZE → +1s   |   HIT → −4s', W / 2, H / 2 + 28);
    ctx.textAlign = 'left';
  }

  // ── Screen: pause overlay ─────────────────────────────────────────
  _drawPaused(ctx, W, H) {
    // Dark semi-transparent veil over the game
    ctx.fillStyle = 'rgba(0,0,0,0.60)';
    ctx.fillRect(0, 0, W, H);

    ctx.textAlign  = 'center';
    ctx.font       = 'bold 22px "Courier New"';
    ctx.fillStyle  = '#ffffff';
    ctx.shadowBlur = 12; ctx.shadowColor = '#4488ff';
    ctx.fillText('— PAUSED —', W / 2, H / 2 - 12);
    ctx.shadowBlur = 0;

    ctx.font      = '11px "Courier New"';
    ctx.fillStyle = '#555';
    ctx.fillText('ESC to resume', W / 2, H / 2 + 16);
    ctx.textAlign = 'left';
  }

  // ── Screen: dead ─────────────────────────────────────────────────
  _drawDead(ctx, W, H) {
    this.particles.draw(ctx);
    ctx.fillStyle = 'rgba(0,0,0,0.72)'; ctx.fillRect(0, 0, W, H);
    ctx.textAlign  = 'center';
    ctx.font       = 'bold 26px "Courier New"';
    ctx.shadowBlur = 18; ctx.shadowColor = '#ff0000';
    ctx.fillStyle  = '#ff3333';
    ctx.fillText('\u2014 TIME IS UP \u2014', W / 2, H / 2 - 40);
    ctx.shadowBlur = 0;
    ctx.font = '14px "Courier New"'; ctx.fillStyle = '#aaa';
    ctx.fillText('SCORE:  ' + Math.floor(score), W / 2, H / 2 + 2);
    ctx.font = '12px "Courier New"'; ctx.fillStyle = '#888';
    ctx.fillText('DIED IN  ' + this.currentHell.name, W / 2, H / 2 + 26);
    ctx.font = '11px "Courier New"'; ctx.fillStyle = '#555';
    ctx.fillText('PRESS SPACE OR ENTER TO RETRY', W / 2, H / 2 + 58);
    ctx.textAlign = 'left';
  }
}
