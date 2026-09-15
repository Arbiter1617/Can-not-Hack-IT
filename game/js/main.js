'use strict';
// ─── Boot + Game Loop ────────────────────────────────────────────────
const director = new GameDirector();

window.addEventListener('keydown', e => {
  if (e.code === 'Escape') {
    if (PRACTICE_HELL) {
      // In practice mode ESC exits back to the Mode selection page
      window.location.href = '../mode.html';
    } else if (director.state === 'DEAD') {
      // ESC from death screen goes to Main Menu
      window.location.href = '../index.html';
    } else {
      director.togglePause();
    }
    return;
  }
  // Space / Enter — start or restart (not while actively playing)
  if ((e.code === 'Space' || e.code === 'Enter') && director.state !== 'PLAYING') {
    director.start();
  }
});

// If arriving in practice mode, auto-start immediately (skip ready screen)
if (PRACTICE_HELL) {
  director.start();
}

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
