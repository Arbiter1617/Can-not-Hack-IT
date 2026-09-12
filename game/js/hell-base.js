'use strict';
// ═══════════════════════════════════════════════════════════════════
// HELL BASE  — abstract base class for every hell
//
// To add a new hell:
//   1. Create  game/js/hells/my-hell.js
//   2. class MyHell extends HellBase { ... }
//   3. Override the getters and methods you need
//   4. Add <script src="js/hells/my-hell.js"> in index.html
//   5. Register  new MyHell(this)  in director.js → constructor hells[]
// ═══════════════════════════════════════════════════════════════════
class HellBase {
  constructor(dir) {
    this.dir        = dir;          // GameDirector reference
    this.pool       = dir.pool;
    this.clock      = dir.clock;
    this.particles  = dir.particles;
    this.indicators = dir.indicators;
  }

  // ── Override these in each hell ──────────────────────────────────
  /** CSS colour string for the heart in this hell */
  get heartColor()      { return '#ff3333'; }

  /** Display name shown on the death screen */
  get name()            { return 'UNKNOWN HELL'; }

  /** Flip the heart sprite upside-down (Shooter Hell) */
  get heartUpsideDown() { return false; }

  /** If false, director skips WASD heart movement (hell reads WASD itself) */
  get heartMovable()    { return true; }

  /** If true, the countdown clock is frozen for the duration of this hell */
  get timerPaused()     { return false; }

  /**
   * Bounding box for heart movement.
   * Return { x, y, w, h } to constrain, or null for full screen.
   */
  get boundary()        { return null; }

  /**
   * Timer economy for this hell.
   * grazeGain  — seconds added per graze (0 = no graze reward)
   * hitPenalty — seconds removed per hit
   */
  get cfg() { return { grazeGain: 1, hitPenalty: 4 }; }

  /** Called once when this hell becomes active */
  enter() {}

  /** Called once when transitioning away; clears bullets by default */
  exit()  { this.pool.clear(); }

  /** Called every frame while this hell is active */
  update(dt) {}

  /** Called every frame to draw hell-specific visuals (boundary, bg, etc.) */
  draw(ctx) {}
}
