'use strict';
// ═══════════════════════════════════════════════════════════════════
// FRUIT NINJA HELL  (parallel overlay — runs on top of active hell)
//
// A pocket-watch with wings flies across the screen.
// Swipe the mouse cursor THROUGH it (no click needed) to slice it.
// Slicing gives +8–15 s bonus time.  Missing gives ZERO penalty.
//
// Also draws an always-on white cursor trail when mouse moves.
//
// Spawns: score ≥ 3000 required, then 45–90 s between watches.
//         Practice (fruitninja): no score gate, 4–8 s initial, 8–15 s repeats.
// ═══════════════════════════════════════════════════════════════════
class FruitNinjaSystem {
  constructor(dir) {
    this.dir       = dir;
    this.watch     = null;
    this.spawnTimer = 60;
    this.WATCH_R   = 30;
    this.SCORE_MIN = 3000;
    this.trail     = [];
    this.TRAIL_LEN = 20;
  }

  reset() {
    this.watch = null;
    this.trail = [];
    this.spawnTimer = (PRACTICE_HELL === 'fruitninja')
      ? 4 + Math.random() * 4
      : 45 + Math.random() * 45;
  }

  // ── Update ────────────────────────────────────────────────────────
  update(dt) {
    this.trail.push({ x: Mouse.x, y: Mouse.y });
    if (this.trail.length > this.TRAIL_LEN) this.trail.shift();

    const noGate = PRACTICE_HELL === 'fruitninja';
    if (!this.watch) {
      this.spawnTimer -= dt;
      if (this.spawnTimer <= 0 && (noGate || score >= this.SCORE_MIN)) {
        this._spawnWatch();
      }
    } else {
      this._updateWatch(dt);
      if (this.watch && !this.watch.sliced) this._checkSlice();
    }
  }

  _spawnWatch() {
    const W = canvas.width, H = canvas.height;
    const fromLeft = Math.random() > 0.5;
    const bonus    = Math.floor(8 + Math.random() * 8);
    const baseY    = H * (0.18 + Math.random() * 0.60);
    this.watch = {
      x: fromLeft ? -this.WATCH_R - 10 : W + this.WATCH_R + 10,
      y: baseY, baseY,
      vx: fromLeft ? 130 + Math.random() * 60 : -(130 + Math.random() * 60),
      time: 0, bonus,
      sliced: false, sliceTimer: 0,
      wingPhase: Math.random() * Math.PI * 2,
    };
  }

  _updateWatch(dt) {
    const w = this.watch;
    w.time += dt;
    if (w.sliced) {
      w.sliceTimer -= dt;
      if (w.sliceTimer <= 0) this._resetWatch();
      return;
    }
    w.x += w.vx * dt;
    w.y  = w.baseY + Math.sin(w.time * 2.4 + w.wingPhase) * 38;
    const W = canvas.width;
    if ((w.vx > 0 && w.x > W + this.WATCH_R + 30) ||
        (w.vx < 0 && w.x < -this.WATCH_R - 30)) {
      this._resetWatch();
    }
  }

  _checkSlice() {
    if (this.trail.length < 2) return;
    const p1 = this.trail[this.trail.length - 2];
    const p2 = this.trail[this.trail.length - 1];
    const dx = p2.x - p1.x, dy = p2.y - p1.y;
    if (dx * dx + dy * dy < 36) return; // too slow
    const w = this.watch;
    if (this._segCircle(p1, p2, w.x, w.y, this.WATCH_R)) this._sliceWatch();
  }

  _segCircle(p1, p2, cx, cy, r) {
    const dx = p2.x - p1.x, dy = p2.y - p1.y;
    const fx = p1.x - cx,   fy = p1.y - cy;
    const a  = dx * dx + dy * dy;
    if (a === 0) return false;
    const b    = 2 * (fx * dx + fy * dy);
    const c    = fx * fx + fy * fy - r * r;
    const disc = b * b - 4 * a * c;
    if (disc < 0) return false;
    const sd = Math.sqrt(disc);
    const t1 = (-b - sd) / (2 * a);
    const t2 = (-b + sd) / (2 * a);
    return (t1 >= 0 && t1 <= 1) || (t2 >= 0 && t2 <= 1);
  }

  _sliceWatch() {
    const w = this.watch;
    if (w.sliced) return;
    w.sliced = true; w.sliceTimer = 1.2;
    this.dir.clock.add(w.bonus, w.x, w.y);
    this.dir.particles.burst(w.x, w.y, '#ffd700', 24, 300);
    this.dir.particles.burst(w.x, w.y, '#ffffff',  8, 180);
  }

  _resetWatch() {
    this.watch = null;
    this.spawnTimer = (PRACTICE_HELL === 'fruitninja')
      ? 8 + Math.random() * 7
      : 45 + Math.random() * 45;
  }

  // ── Draw ──────────────────────────────────────────────────────────
  draw(ctx) {
    this._drawTrail(ctx);
    if (!this.watch) return;
    if (this.watch.sliced) { this._drawSlicedWatch(ctx); return; }
    this._drawWatch(ctx);
  }

  _drawTrail(ctx) {
    const n = this.trail.length;
    if (n < 2) return;
    ctx.save();
    ctx.lineCap = 'round';
    for (let i = 1; i < n; i++) {
      const p1 = this.trail[i - 1], p2 = this.trail[i];
      const ddx = p2.x - p1.x, ddy = p2.y - p1.y;
      if (ddx * ddx + ddy * ddy < 2) continue;
      const t = i / n;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y);
      ctx.strokeStyle = `rgba(255,255,255,${(t * 0.65).toFixed(2)})`;
      ctx.lineWidth   = t * 2.5 + 0.5;
      ctx.stroke();
    }
    ctx.restore();
  }

  _drawWatch(ctx) {
    const w = this.watch, r = this.WATCH_R;
    const now = performance.now() / 1000;
    const flapT = Math.abs(Math.sin(now * 5.5 + w.wingPhase));

    this._drawWings(ctx, w.x, w.y, r, flapT);

    // Outer rim
    ctx.beginPath(); ctx.arc(w.x, w.y, r, 0, TWO_PI);
    ctx.fillStyle = '#7a5200';
    ctx.shadowBlur = 16; ctx.shadowColor = '#ffd700'; ctx.fill(); ctx.shadowBlur = 0;

    // Gold border
    ctx.beginPath(); ctx.arc(w.x, w.y, r, 0, TWO_PI);
    ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 2.5; ctx.stroke();

    // Cream face
    ctx.beginPath(); ctx.arc(w.x, w.y, r * 0.80, 0, TWO_PI);
    ctx.fillStyle = '#f8efd4'; ctx.fill();

    // Hour markers
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * TWO_PI;
      ctx.beginPath();
      ctx.arc(w.x + Math.cos(a) * r * 0.62, w.y + Math.sin(a) * r * 0.62, 1.5, 0, TWO_PI);
      ctx.fillStyle = '#9a7c40'; ctx.fill();
    }

    // Hour hand (slow)
    const hrA = w.time * 0.08 - Math.PI / 2;
    ctx.beginPath(); ctx.moveTo(w.x, w.y);
    ctx.lineTo(w.x + Math.cos(hrA) * r * 0.42, w.y + Math.sin(hrA) * r * 0.42);
    ctx.strokeStyle = '#333'; ctx.lineWidth = 2.5; ctx.lineCap = 'round'; ctx.stroke();

    // Minute hand (fast)
    const mnA = w.time * 0.80 - Math.PI / 2;
    ctx.beginPath(); ctx.moveTo(w.x, w.y);
    ctx.lineTo(w.x + Math.cos(mnA) * r * 0.60, w.y + Math.sin(mnA) * r * 0.60);
    ctx.strokeStyle = '#444'; ctx.lineWidth = 1.5; ctx.stroke();

    // Centre pin
    ctx.beginPath(); ctx.arc(w.x, w.y, 2.5, 0, TWO_PI);
    ctx.fillStyle = '#ffd700'; ctx.fill();

    // Bonus text
    ctx.font = `bold ${Math.round(r * 0.38)}px "Courier New"`;
    ctx.fillStyle = '#7a3800'; ctx.textAlign = 'center';
    ctx.fillText(`+${w.bonus}s`, w.x, w.y + r * 0.56);
    ctx.textAlign = 'left';

    // Crown stem
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(w.x - 3.5, w.y - r - 9, 7, 10);
    ctx.beginPath();
    ctx.arc(w.x, w.y - r - 9, 3.5, Math.PI, TWO_PI); ctx.fill();
  }

  _drawWings(ctx, cx, cy, r, flapT) {
    const wingW = r * 1.55;
    const wingH = r * 0.90 * (0.25 + flapT * 0.75);
    ctx.save();
    for (const side of [-1, 1]) {
      const ox = cx + side * r * 0.82;
      const oy = cy - r * 0.20;
      ctx.beginPath();
      ctx.ellipse(ox + side * wingW * 0.50, oy - wingH * 0.15,
                  wingW * 0.52, Math.max(wingH * 0.52, 1), side * 0.2, 0, TWO_PI);
      ctx.fillStyle   = 'rgba(210,230,255,0.48)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(180,210,255,0.65)';
      ctx.lineWidth   = 1; ctx.stroke();

      ctx.beginPath();
      ctx.ellipse(ox + side * wingW * 0.38, oy + wingH * 0.40,
                  wingW * 0.32, Math.max(wingH * 0.30, 1), side * 0.3, 0, TWO_PI);
      ctx.fillStyle   = 'rgba(200,220,255,0.32)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(160,195,255,0.50)';
      ctx.stroke();
    }
    ctx.restore();
  }

  _drawSlicedWatch(ctx) {
    const w = this.watch;
    const a = clamp(w.sliceTimer / 1.2, 0, 1);
    const r = this.WATCH_R * (1.0 + (1 - a) * 0.8);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.beginPath(); ctx.arc(w.x, w.y, r, 0, TWO_PI);
    ctx.fillStyle = '#ffd700';
    ctx.shadowBlur = 35; ctx.shadowColor = '#ffee00'; ctx.fill(); ctx.shadowBlur = 0;
    ctx.beginPath(); ctx.arc(w.x, w.y, r * 1.2, 0, TWO_PI);
    ctx.strokeStyle = `rgba(255,255,255,${a * 0.70})`; ctx.lineWidth = 3; ctx.stroke();
    ctx.font = `bold ${Math.round(r * 0.85)}px "Courier New"`;
    ctx.fillStyle = '#fff'; ctx.textAlign = 'center';
    ctx.fillText(`+${w.bonus}s`, w.x, w.y + r * 0.30);
    ctx.textAlign = 'left';
    ctx.restore();
  }
}
