'use strict';
// ═══════════════════════════════════════════════════════════════════
// GAME DIRECTOR
// Owns: clock, pool, particles, indicators, hell list
// Manages: heart position, iframes, hell transitions, HUD, game state
// ═══════════════════════════════════════════════════════════════════
class GameDirector {
  constructor() {
    this.clock      = new LoopClock(60);
    this.pool       = new BulletPool(900);
    this.particles  = new Particles();
    this.indicators = new IndicatorSystem();

    this.hx         = 0;    // heart x
    this.hy         = 0;    // heart y
    this.iframes    = 0;    // invincibility seconds remaining
    this.IFRAME_DUR = 1.6;

    // ── Hell registry — add new hells here as they are built ────────
    this.hells = [
      new DodgeHell(this),
      // new ShieldHell(this),
      // new StringHell(this),
      // ...
    ];
    this.hellIdx     = 0;
    this.currentHell = this.hells[0];

    this.state      = 'MENU'; // MENU | PLAYING | DEAD
    this.flashAlpha = 0;
    this._lastHellN = 0;
  }

  // ── Start / Restart ───────────────────────────────────────────────
  start() {
    score           = 0;
    this._lastHellN = 0;
    this.clock      = new LoopClock(60);
    this.pool.clear();
    this.particles.list.length  = 0;
    this.indicators.list.length = 0;
    this.iframes    = 0;
    this.flashAlpha = 0;

    this.hx = canvas.width  / 2;
    this.hy = canvas.height / 2;

    this.hellIdx     = 0;
    this.currentHell = this.hells[0];
    this.currentHell.enter();
    this.state = 'PLAYING';
  }

  // ── Hell Transition ───────────────────────────────────────────────
  _transition() {
    this.currentHell.exit();
    this.hellIdx     = (this.hellIdx + 1) % this.hells.length;
    this.currentHell = this.hells[this.hellIdx];
    this.currentHell.enter();
    this.flashAlpha  = 1; // white flash
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
    if (this.state !== 'PLAYING') return;

    // Passive score & hell gating
    score += SCORE_PER_SEC * dt;
    const hellN = Math.floor(score / HELL_SCORE_STEP);
    if (hellN > this._lastHellN) {
      this._lastHellN = hellN;
      this._transition();
    }

    // Clock (timer = health)
    this.clock.update(dt);
    if (this.clock.dead) {
      this.state = 'DEAD';
      this.particles.burst(this.hx, this.hy, '#ff3333', 28, 340);
      return;
    }

    // Invincibility frames
    if (this.iframes > 0) this.iframes -= dt;

    // Heart movement — WASD, Shift = focus (slower, precise)
    const focused = Keys['ShiftLeft'] || Keys['ShiftRight'];
    const spd     = BASE_SPEED * (focused ? FOCUS_MULT : 1);
    if (Keys['KeyA'] || Keys['ArrowLeft'])  this.hx -= spd * dt;
    if (Keys['KeyD'] || Keys['ArrowRight']) this.hx += spd * dt;
    if (Keys['KeyW'] || Keys['ArrowUp'])    this.hy -= spd * dt;
    if (Keys['KeyS'] || Keys['ArrowDown'])  this.hy += spd * dt;
    this._constrain();

    // Hell-specific logic
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

    if (this.flashAlpha > 0) this.flashAlpha = Math.max(0, this.flashAlpha - dt * 3);
  }

  // ── Draw ──────────────────────────────────────────────────────────
  draw(ctx) {
    const W = canvas.width, H = canvas.height;
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, W, H);

    if (this.state === 'MENU') { this._drawMenu(ctx, W, H); return; }
    if (this.state === 'DEAD') { this._drawDead(ctx, W, H);  return; }

    // Hell background / boundary
    this.currentHell.draw(ctx);

    // Bullets → indicators → particles
    this.pool.draw(ctx);
    this.indicators.draw(ctx);
    this.particles.draw(ctx);

    // Heart (flicker during iframes)
    const show = this.iframes <= 0 || Math.floor(this.iframes * 9) % 2 === 0;
    if (show) {
      drawHeart(ctx, this.hx, this.hy, HEART_R * 1.55,
        this.currentHell.heartColor, this.currentHell.heartUpsideDown);
    }

    // Graze ring — always-on blue outer ring (lethal ring drawn inside drawHeart)
    const focused = Keys['ShiftLeft'] || Keys['ShiftRight'];
    ctx.beginPath();
    ctx.arc(this.hx, this.hy, GRAZE_R, 0, TWO_PI);
    ctx.strokeStyle = focused ? 'rgba(60,140,255,0.70)' : 'rgba(60,120,255,0.28)';
    ctx.lineWidth   = focused ? 1.5 : 1;
    ctx.stroke();

    // HUD
    this.clock.draw(ctx, W);
    this._drawHUD(ctx, W, H);

    // Hell-transition flash
    if (this.flashAlpha > 0) {
      ctx.fillStyle = `rgba(255,255,255,${this.flashAlpha * 0.45})`;
      ctx.fillRect(0, 0, W, H);
    }
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
    ctx.fillText('SCORE', W / 2 - 52, H - 30);
    ctx.fillText('HELL  ' + hell,  W / 2 + 22, H - 30);
    ctx.textAlign = 'left';
  }

  // ── Screen states ─────────────────────────────────────────────────
  _drawMenu(ctx, W, H) {
    ctx.textAlign  = 'center';
    ctx.font       = 'bold 30px "Courier New"';
    ctx.shadowBlur = 22; ctx.shadowColor = '#ff3333';
    ctx.fillStyle  = '#fff';
    ctx.fillText('\u2736  INFINITE HEART  \u2736', W / 2, H / 2 - 44);
    ctx.shadowBlur = 0;
    ctx.font = '13px "Courier New"'; ctx.fillStyle = '#aaa';
    ctx.fillText('PRESS  SPACE  OR  ENTER  TO  START', W / 2, H / 2 + 6);
    ctx.font = '10px "Courier New"'; ctx.fillStyle = '#444';
    ctx.fillText('WASD \u2014 MOVE   |   SHIFT \u2014 FOCUS MODE   |   GRAZE \u2192 +1s   |   HIT \u2192 \u22126s', W / 2, H / 2 + 32);
    ctx.fillText('HELL CHANGES EVERY  ' + HELL_SCORE_STEP + '  SCORE', W / 2, H / 2 + 50);
    ctx.textAlign = 'left';
  }

  _drawDead(ctx, W, H) {
    this.particles.draw(ctx);
    ctx.fillStyle = 'rgba(0,0,0,0.72)'; ctx.fillRect(0, 0, W, H);
    ctx.textAlign  = 'center';
    ctx.font       = 'bold 26px "Courier New"';
    ctx.shadowBlur = 18; ctx.shadowColor = '#ff0000';
    ctx.fillStyle  = '#ff3333';
    ctx.fillText('\u2014 TIME IS UP \u2014', W / 2, H / 2 - 32);
    ctx.shadowBlur = 0;
    ctx.font = '14px "Courier New"'; ctx.fillStyle = '#aaa';
    ctx.fillText('SCORE:  ' + Math.floor(score), W / 2, H / 2 + 8);
    ctx.fillText('REACHED HELL  ' + (this.hellIdx + 1), W / 2, H / 2 + 30);
    ctx.font = '11px "Courier New"'; ctx.fillStyle = '#555';
    ctx.fillText('PRESS SPACE OR ENTER TO RETRY', W / 2, H / 2 + 58);
    ctx.textAlign = 'left';
  }
}
