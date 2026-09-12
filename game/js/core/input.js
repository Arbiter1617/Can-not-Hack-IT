'use strict';
// ─── Input Manager ───────────────────────────────────────────────────
const Keys  = {};
const Mouse = { x: 0, y: 0, prevX: 0, prevY: 0, trail: [] };

window.addEventListener('keydown', e => {
  Keys[e.code] = true;
  e.preventDefault();
});
window.addEventListener('keyup', e => {
  Keys[e.code] = false;
});
window.addEventListener('mousemove', e => {
  Mouse.prevX = Mouse.x;
  Mouse.prevY = Mouse.y;
  Mouse.x     = e.clientX;
  Mouse.y     = e.clientY;
  Mouse.trail.push({ x: Mouse.x, y: Mouse.y, t: performance.now() });
  if (Mouse.trail.length > 24) Mouse.trail.shift();
});
