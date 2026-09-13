'use strict';
// ═══════════════════════════════════════════════════════════════════
// HELL 12 — TYPING TEST HELL
//
// Heart inherits the previous hell's colour · locks to screen centre
// A 30-character WASD (+ space) string must be typed within a hard
// 5-second window. A HIDDEN consecutive-correct counter rewards every
// 8th correct keystroke with +3s; any wrong keystroke costs −1s and
// resets the streak. No bullets fly — action fully freezes.
// The 5-second window IS the phase timer: when it expires the hell
// ends and the next hell begins, regardless of progress.
// Timer economy: main clock paused · 8-streak +3s · wrong key −1s
// ═══════════════════════════════════════════════════════════════════
class TypingHell extends HellBase {
  constructor(dir) {
    super(dir);

    // ── Tunables (per HellDesignDoc.md) ────────────────────────────
    this.STRING_LEN     = 30;    // exactly 30 characters
    this.TYPING_TIME    = 5.0;   // 5-second hard window
    this.STREAK_TARGET  = 8;     // every 8 consecutive correct...
    this.STREAK_REWARD  = 3;     // ...gives +3s
    this.MISTAKE_PENALTY = 1;    // wrong key costs −1s
    this.WARN_MIN       = 0.4;   // "BE READY" flicker feels sudden,
    this.WARN_MAX       = 0.9;   // not a slow buildup — short random window
    this.VERT_OFFSET    = 90;    // px separation: string sits above centre, heart below

    // ── State ───────────────────────────────────────────────────────
    this._inheritedColor = null; // set by director via inheritColor()
    this.phase           = 'warning'; // 'warning' | 'typing'
    this.warningTimer    = 0;
    this.phaseTimer      = 0;
    this.str             = '';
    this.cursor          = 0;
    this.charState       = [];   // per-character: 'pending' | 'correct' | 'wrong'
    this.streak          = 0;    // HIDDEN — never rendered to the player
    this.forceTransition = false; // director watches this flag

    this._flickerOn  = false;
    this._flickerT   = 0;

    this._prevKeys = { KeyW: false, KeyA: false, KeyS: false, KeyD: false, Space: false };
  }

  // ── Hell identity ─────────────────────────────────────────────────
  get heartColor()   { return this._inheritedColor || '#ff3333'; } // inherits previous hell; falls back to classic red
  get name()         { return 'TYPING TEST HELL'; }
  get heartMovable() { return false; } // heart centres and does not move at all in this hell
  get timerPaused()  { return true; }  // main clock frozen — the 5s window is the phase timer
  get cfg()          { return { grazeGain: 0, hitPenalty: 0 }; } // no bullets ever fly here

  get boundary() { return null; } // heart is centre-locked directly, no movement box needed

  // Called by GameDirector._transition() right before enter(), so this
  // hell can inherit the outgoing hell's heart colour with no visual gap.
  inheritColor(color) { this._inheritedColor = color; }

  // ── Lifecycle ─────────────────────────────────────────────────────
  reset() {
    this._inheritedColor = null;
    this.forceTransition = false;
    this._beginWarning();
  }

  enter() {
    this.dir.hx = canvas.width  / 2;
    this.dir.hy = canvas.height / 2 + this.VERT_OFFSET; // heart sits below centre, clear of the string
    this._beginWarning();
  }

  exit() {
    super.exit(); // clears bullet pool (none spawned here, but keep contract)
  }

  _beginWarning() {
    this.phase        = 'warning';
    this.warningTimer = rnd(this.WARN_MIN, this.WARN_MAX);
    this._flickerOn   = false;
    this._flickerT    = 0;
  }

  _beginTyping() {
    this.phase      = 'typing';
    this.phaseTimer = this.TYPING_TIME;
    this.str        = this._generateString(this.STRING_LEN);
    this.cursor     = 0;
    this.charState  = new Array(this.STRING_LEN).fill('pending');
    this.streak     = 0;
  }

  // 30 chars, W/A/S/D + single spaces only, never two spaces in a row
  _generateString(len) {
    const CH = ['W', 'A', 'S', 'D'];
    let out = '';
    let lastWasSpace = false;
    for (let i = 0; i < len; i++) {
      const wantSpace = !lastWasSpace && Math.random() < 0.14;
      if (wantSpace) {
        out += ' ';
        lastWasSpace = true;
      } else {
        out += CH[Math.floor(Math.random() * CH.length)];
        lastWasSpace = false;
      }
    }
    return out;
  }

  // ── Update ────────────────────────────────────────────────────────
  update(dt) {
    // Heart stays locked in place, no movement during this hell
    this.dir.hx = canvas.width  / 2;
    this.dir.hy = canvas.height / 2 + this.VERT_OFFSET;

    if (this.phase === 'warning') {
      this._tickWarningFlicker(dt);
      this.warningTimer -= dt;
      if (this.warningTimer <= 0) this._beginTyping();
      return;
    }

    // ── Typing phase ─────────────────────────────────────────────
    this._pollKeys();

    this.phaseTimer -= dt;
    if (this.phaseTimer <= 0) {
      // If not a single key was pressed — hard AFK penalty
      if (this.cursor === 0) {
        const hx = this.dir.hx, hy = this.dir.hy;
        this.dir.clock.subtract(10, hx, hy - 40);
        this.dir.flashAlpha = 0.9;
        this.dir.particles.burst(hx, hy, '#ff2222', 22, 260);
      }
      // Hell ends — transition out or restart drill in practice
      if (PRACTICE_HELL) {
        this._beginWarning();
      } else {
        this.forceTransition = true;
      }
    }
  }

  // Edge-detect single keypresses against the expected next character
  _pollKeys() {
    const MAP = { KeyW: 'W', KeyA: 'A', KeyS: 'S', KeyD: 'D', Space: ' ' };
    for (const code in MAP) {
      const now = !!Keys[code];
      if (now && !this._prevKeys[code]) this._handlePress(MAP[code]);
      this._prevKeys[code] = now;
    }
  }

  _handlePress(ch) {
    if (this.cursor >= this.str.length) return; // string finished, wait out the clock

    const hx = this.dir.hx, hy = this.dir.hy;
    const expected = this.str[this.cursor];

    if (ch === expected) {
      this.charState[this.cursor] = 'correct'; // fades to dark
      this.cursor++;
      this.streak++;
      if (this.streak >= this.STREAK_TARGET) {
        this.streak = 0; // resets to 0 after each reward trigger
        this.clock.add(this.STREAK_REWARD, hx, hy - 40);
      }
    } else {
      this.charState[this.cursor] = 'wrong'; // turns red and stays red
      this.cursor++;
      this.clock.subtract(this.MISTAKE_PENALTY, hx, hy - 40);
      this.streak = 0;
    }
  }

  // Sudden, disorienting flicker — not a slow buildup
  _tickWarningFlicker(dt) {
    this._flickerT -= dt;
    if (this._flickerT <= 0) {
      this._flickerOn = Math.random() < 0.6;
      this._flickerT  = rnd(0.03, 0.11);
    }
  }

  // ── Draw ──────────────────────────────────────────────────────────
  draw(ctx) {
    const W = canvas.width, H = canvas.height;
    if (this.phase === 'warning') this._drawWarning(ctx, W, H);
    else                          this._drawTyping(ctx, W, H);
  }

  _drawWarning(ctx, W, H) {
    if (!this._flickerOn) return;

    // Random red flicker from the TOP of the screen
    const grad = ctx.createLinearGradient(0, 0, 0, H * 0.35);
    grad.addColorStop(0, 'rgba(255,20,20,0.55)');
    grad.addColorStop(1, 'rgba(255,20,20,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H * 0.35);

    ctx.textAlign  = 'center';
    ctx.font       = 'bold 30px "Courier New"';
    ctx.fillStyle  = '#ff2222';
    ctx.shadowBlur = 18; ctx.shadowColor = '#ff0000';
    ctx.fillText('BE READY', W / 2, H * 0.16);
    ctx.shadowBlur = 0;
    ctx.textAlign  = 'left';
  }

  _drawTyping(ctx, W, H) {
    const y     = H / 2 - this.VERT_OFFSET; // string sits above centre, clear of the heart
    const CH_W  = 23; // +3 over the original 20px
    const total = this.str.length * CH_W;
    let x       = W / 2 - total / 2;

    ctx.font = 'bold 23px "Courier New"'; // +3 over the original 20px

    for (let i = 0; i < this.str.length; i++) {
      const c       = this.str[i];
      const display = c === ' ' ? '\u00B7' : c; // render space as a visible middle dot

      if (i === this.cursor) {
        ctx.fillStyle = 'rgba(255,255,255,0.12)';
        ctx.fillRect(x, y - 18, CH_W, 26);
      }

      // Untyped = bright white · correctly typed = fades dark · wrongly typed = red, stays red
      const state = this.charState[i];
      ctx.fillStyle = state === 'wrong'   ? '#ff3333'
                     : state === 'correct' ? 'rgba(255,255,255,0.22)'
                     : '#ffffff';
      ctx.textAlign = 'left';
      ctx.fillText(display, x + CH_W / 2 - ctx.measureText(display).width / 2, y);
      x += CH_W;
    }
    ctx.textAlign = 'left';
    // NOTE: the consecutive-correct streak is intentionally never drawn —
    // it is a hidden counter, felt only through the timing of rewards/penalties.
  }
}
