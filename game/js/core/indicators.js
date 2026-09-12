'use strict';
// ═══════════════════════════════════════════════════════════════════
// INDICATOR SYSTEM  (flash + ! + flicker before a projectile spawns)
// ═══════════════════════════════════════════════════════════════════
class IndicatorSystem {
  constructor() { this.list = []; }

  // dur = total warning duration in seconds (bullet fires when life hits 0)
  add(x, y, dur = 0.75) {
    this.list.push({ x, y, life: dur, maxLife: dur });
  }

  update(dt) {
    for (const i of this.list) i.life -= dt;
    this.list = this.list.filter(i => i.life > 0);
  }

  draw(ctx) {
    for (const ind of this.list) {
      const t       = 1 - ind.life / ind.maxLife;
      const flicker = Math.sin(t * Math.PI * 14) > 0;
      if (!flicker && t < 0.65) continue;

      ctx.globalAlpha = clamp(ind.life / ind.maxLife, 0, 0.9);

      // Expanding ring
      ctx.beginPath();
      ctx.arc(ind.x, ind.y, 8 + t * 10, 0, TWO_PI);
      ctx.strokeStyle = '#ff4422'; ctx.lineWidth = 2; ctx.stroke();

      // Exclamation mark
      ctx.fillStyle = '#ff4422';
      ctx.font      = 'bold 15px "Courier New"';
      ctx.textAlign = 'center';
      ctx.fillText('!', ind.x, ind.y - 14);
    }
    ctx.globalAlpha = 1; ctx.textAlign = 'left';
  }
}
