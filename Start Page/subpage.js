/* ==========================================================================
   Infinite Heart — shared subpage behaviour
   Every subpage (Mode, Settings, Music, Credits, How to Play, Play) uses
   this for: the top-left Back button, Escape-to-back, and the shared
   focus-expand / neighbour-push-away / tick-sound list navigation.
   ========================================================================== */

const InfiniteHeartSubpage = (function () {

  /**
   * Navigate back to the main menu clock, with a fade-out transition.
   */
  function goBackToClock() {
    const page = document.querySelector('.page');
    if (page) page.classList.add('page-fade-out');
    setTimeout(() => { window.location.href = 'index.html'; }, 300);
  }

  /**
   * Wire the standard top-left back button + Escape key so both trigger
   * the exact same "go back" behaviour.
   * @param {Function} [onBack] optional override for what going back does
   *        (used by Mode, where going back exits a hell first, then the
   *        list, before finally returning to the clock). Defaults to
   *        going straight to the clock.
   */
  function initBackNavigation(onBack) {
    const handler = typeof onBack === 'function' ? onBack : goBackToClock;
    const backBtn = document.querySelector('.back-button');
    if (backBtn) {
      backBtn.addEventListener('click', (e) => {
        if (e.button === 0) handler(); // left click only
      });
    }
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') handler();
    });
  }

  /**
   * Wire a vertical list of .menu-item elements with the shared
   * focus-expand behaviour: W/S move focus, Space/Enter/click confirms,
   * mouse hover also moves focus. Plays the tick sound on every change.
   *
   * @param {HTMLElement[]} items - the .menu-item elements, in order
   * @param {Function} onSelect - called with (index, itemEl) on confirm
   * @param {Object} [opts]
   * @param {number} [opts.startIndex=0]
   * @param {Function} [opts.isDisabled] - (index) => bool, skip on nav
   */
  function initList(items, onSelect, opts) {
    opts = opts || {};
    let current = opts.startIndex || 0;

    function render() {
      items.forEach((el, i) => {
        const isActive = (i === current);
        el.classList.toggle('active', isActive);
        if (isActive && el.scrollIntoView) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
    }

    function isDisabled(i) {
      return typeof opts.isDisabled === 'function' && opts.isDisabled(i);
    }

    function move(delta) {
      const n = items.length;
      let next = current;
      for (let tries = 0; tries < n; tries++) {
        next = (next + delta + n) % n;
        if (!isDisabled(next)) break;
      }
      if (next !== current) {
        current = next;
        InfiniteHeartAudio.playSelectSound();
        render();
      }
    }

    function confirm() {
      if (isDisabled(current)) return;
      InfiniteHeartAudio.playSelectSound();
      onSelect(current, items[current]);
    }
    // Only keyboard navigation is allowed now.

    document.addEventListener('keydown', (e) => {
      const key = e.key.toLowerCase();
      if (key === 'w' || key === 'arrowup') move(-1);
      else if (key === 's' || key === 'arrowdown') move(1);
      else if (key === ' ' || key === 'enter') { e.preventDefault(); confirm(); }
    });

    render();

    return {
      getCurrent: () => current,
      setCurrent: (i) => { current = i; render(); },
      refresh: render
    };
  }

  return { goBackToClock, initBackNavigation, initList };
})();
