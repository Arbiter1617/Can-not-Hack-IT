/* ==========================================================================
   Infinite Heart — shared audio helper
   Plays assets/Selected Option.mp3 on every snap/confirm.
   Wrapped defensively: if the asset isn't present yet, this fails silently
   instead of throwing, so menu navigation still works without it.
   ========================================================================== */

const InfiniteHeartAudio = (function () {
  let baseVolume = 1;
  let vfxVolume = 1;

  function loadVolumes() {
    try {
      const saved = JSON.parse(localStorage.getItem('ih_volumes') || '{}');
      if (typeof saved.master === 'number') baseVolume = saved.master;
      if (typeof saved.vfx === 'number') vfxVolume = saved.vfx;
    } catch (e) { /* ignore */ }
  }
  loadVolumes();

  function playSelectSound() {
    try {
      const audio = new Audio('assets/Selected Option.mp3');
      audio.volume = Math.max(0, Math.min(1, baseVolume * vfxVolume));
      audio.play().catch(() => { /* asset missing or autoplay blocked — ignore */ });
    } catch (e) { /* ignore */ }
  }

  function refreshVolumes() {
    loadVolumes();
  }

  return { playSelectSound, refreshVolumes };
})();
