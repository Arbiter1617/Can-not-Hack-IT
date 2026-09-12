'use strict';
// ─── Boot + Game Loop ────────────────────────────────────────────────
// All classes are already in global scope from the <script> tags above.

const director = new GameDirector();

// Space / Enter starts or restarts the game
window.addEventListener('keydown', e => {
  if ((e.code === 'Space' || e.code === 'Enter') && director.state !== 'PLAYING') {
    director.start();
  }
});

// Delta-time loop — capped at 50 ms to handle tab-switch spikes
let _lt = 0;
function loop(ts) {
  const dt = Math.min((ts - _lt) / 1000, 0.05);
  _lt = ts;
  director.update(dt);
  director.draw(ctx);
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
