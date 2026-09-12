'use strict';
// ═══════════════════════════════════════════════════════════════════
// HEART DRAWING — sleek symmetric design
//
// Path is fully symmetric top ↔ bottom: lobes peak at -size, tip at +size.
// This means the geometric centre is exactly (0,0) = collision centre.
// Both the white hitbox ring and blue graze ring in director.js
// are drawn at (hx, hy) — all three are perfectly aligned.
// ═══════════════════════════════════════════════════════════════════
function drawHeart(ctx, x, y, size, color, upsideDown = false) {
  const h = size;
  const w = size * 0.68; // narrower lobes → sleeker silhouette

  ctx.save();
  ctx.translate(x, y);
  if (upsideDown) ctx.scale(1, -1);

  // Glow
  ctx.shadowBlur  = 20;
  ctx.shadowColor = color;
  ctx.fillStyle   = color;

  // Clockwise from bottom tip
  ctx.beginPath();
  ctx.moveTo(0, h);                                                    // bottom tip ↓
  ctx.bezierCurveTo( w*0.08,  h*0.52,  w*1.20,  h*0.05,  w, -h*0.22); // right outer
  ctx.bezierCurveTo( w*0.80, -h*1.00,  0,       -h*0.78,  0, -h*0.32); // right lobe → dip
  ctx.bezierCurveTo( 0,      -h*0.78, -w*0.80, -h*1.00, -w, -h*0.22); // left lobe
  ctx.bezierCurveTo(-w*1.20,  h*0.05, -w*0.08,  h*0.52,  0,  h);      // left outer → tip ↓
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;

  // Lethal hitbox ring — white, centred at collision point (0, 0)
  ctx.beginPath();
  ctx.arc(0, 0, HEART_R, 0, TWO_PI);
  ctx.strokeStyle = 'rgba(255,255,255,0.40)';
  ctx.lineWidth   = 1.5;
  ctx.stroke();

  ctx.restore();
}
