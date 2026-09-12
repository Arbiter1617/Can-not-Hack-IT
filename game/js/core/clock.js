'use strict';
// ═══════════════════════════════════════════════════════════════════
// LOOP CLOCK  (timer = health bar)
// ═══════════════════════════════════════════════════════════════════
class LoopClock {
  constructor(start = 60) {
    this.time    = start;
    this.maxTime = start;
    this.floats  = []; // floating +/-Xs feedback text
  }

  add(secs, x, y) {
    this.time = Math.min(this.time + secs, this.maxTime + 30);
    this.floats.push({ text: '+' + secs + 's', x, y, color: '#00ff88', life: 1.3 });
  }

  subtract(secs, x, y) {
    this.time = Math.max(this.time - secs, 0);
    this.floats.push({ text: '\u2212' + secs + 's', x, y, color: '#ff4444', life: 1.3 });
  }

  update(dt) {
    this.time = Math.max(this.time - dt, 0);
    for (const f of this.floats) { f.life -= dt; f.y -= 38 * dt; }
    this.floats = this.floats.filter(f => f.life > 0);
  }

  get dead() { return this.time <= 0; }

  draw(ctx, W) {
    const bW = W * 0.55, bX = (W - bW) / 2, bY = 14, bH = 10;
    const ratio = clamp(this.time / this.maxTime, 0, 1);
    const col   = ratio > 0.5 ? '#00cc66' : ratio > 0.25 ? '#ffaa00' : '#ff3333';

    // Bar background / fill / border
    ctx.fillStyle = '#111';  ctx.fillRect(bX, bY, bW, bH);
    ctx.fillStyle = col;     ctx.fillRect(bX, bY, bW * ratio, bH);
    ctx.strokeStyle = '#333'; ctx.lineWidth = 1;
    ctx.strokeRect(bX, bY, bW, bH);

    // Time label
    ctx.fillStyle = '#ccc'; ctx.font = '11px "Courier New"';
    ctx.textAlign = 'center';
    ctx.fillText(Math.ceil(this.time) + 's', W / 2, bY + bH + 14);
    ctx.textAlign = 'left';

    // Floating feedback text
    for (const f of this.floats) {
      ctx.globalAlpha = clamp(f.life, 0, 1);
      ctx.fillStyle   = f.color;
      ctx.font        = 'bold 14px "Courier New"';
      ctx.textAlign   = 'center';
      ctx.fillText(f.text, f.x, f.y);
    }
    ctx.globalAlpha = 1; ctx.textAlign = 'left';

    // Red screen pulse when < 10 s
    if (this.time < 10) {
      const pulse = Math.abs(Math.sin(performance.now() / 180)) * 0.07;
      ctx.fillStyle = `rgba(255,0,0,${pulse})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }
}
