'use strict';
// ─── Boot + Game Loop ────────────────────────────────────────────────
const director = new GameDirector();

window.addEventListener('keydown', e => {
  // ESC — pause / unpause at any time during play
  if (e.code === 'Escape') {
    director.togglePause();
    return;
  }
  // Space / Enter — start or restart (not while playing)
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
