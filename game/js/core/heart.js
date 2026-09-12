'use strict';
// ═══════════════════════════════════════════════════════════════════
// HEART DRAWING
// Two rings are always drawn at (x, y):
//   • White ring  — HEART_R  — lethal hitbox
//   • Blue ring   — GRAZE_R  — near-miss zone  (drawn in director.js)
// ═══════════════════════════════════════════════════════════════════
function drawHeart(ctx, x, y, size, color, upsideDown = false) {
  // Bezier path verified:  top of lobes ≈ -size*0.9,  bottom tip = +size
  // Geometric centre ≈ size*0.05 off (0,0) → effectively centred.
  const h = size, w = size * 0.9;

  ctx.save();
  ctx.translate(x, y);
  if (upsideDown) ctx.scale(1, -1);

  // Heart fill with glow
  ctx.shadowBlur = 22; ctx.shadowColor = color;
  ctx.fillStyle  = color;
  ctx.beginPath();
  ctx.moveTo(0, h);                                                     // bottom tip
  ctx.bezierCurveTo(-w*0.1,  h*0.5, -w*1.3,  h*0.1,  -w, -h*0.2);   // left outer
  ctx.bezierCurveTo(-w*0.7, -h*0.9,  0,      -h*0.7,   0, -h*0.4);   // left lobe → dip
  ctx.bezierCurveTo( 0,     -h*0.7,  w*0.7,  -h*0.9,   w, -h*0.2);   // right lobe
  ctx.bezierCurveTo( w*1.3,  h*0.1,  w*0.1,   h*0.5,   0,  h);       // right outer → tip
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;

  // Lethal hitbox ring — white, centred at collision point (0, 0)
  ctx.beginPath();
  ctx.arc(0, 0, HEART_R, 0, TWO_PI);
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth   = 1.5;
  ctx.stroke();

  ctx.restore();
}
