/* ==========================================================================
   Infinite Heart — Settings page
   Centered keybind list. Everything is rebindable, including menu
   navigation — selecting an action silently captures the next keypress
   and assigns it. Reset to Default at the bottom. Total Time Played is a
   non-editable display below the keybinds.

   NOTE: this page owns the keybind *data model* (stored in localStorage
   under 'ih_keybinds') so every other page can eventually read from it.
   Wiring every page's controls to read these bindings live is left for
   later, same as the hell/demo logic in Mode and How to Play.
   ========================================================================== */

(function () {
  const DEFAULTS = {
    moveUp: 'W',
    moveDown: 'S',
    moveLeft: 'A',
    moveRight: 'D',
    confirm: 'Space',
    back: 'Shift'
  };

  const LABELS = {
    moveUp: 'Move Up',
    moveDown: 'Move Down',
    moveLeft: 'Move Left',
    moveRight: 'Move Right',
    confirm: 'Confirm',
    back: 'Back'
  };

  const ACTION_ORDER = ['moveUp', 'moveDown', 'moveLeft', 'moveRight', 'confirm', 'back'];

  function loadKeybinds() {
    try {
      const saved = JSON.parse(localStorage.getItem('ih_keybinds') || 'null');
      if (saved) return Object.assign({}, DEFAULTS, saved);
    } catch (e) { /* ignore */ }
    return Object.assign({}, DEFAULTS);
  }

  function saveKeybinds(binds) {
    localStorage.setItem('ih_keybinds', JSON.stringify(binds));
  }

  let keybinds = loadKeybinds();
  let listening = false;

  const listEl = document.getElementById('keybind-list');

  function keyDisplayName(e) {
    if (e.key === ' ') return 'Space';
    if (e.key.length === 1) return e.key.toUpperCase();
    return e.key; // Shift, Control, ArrowUp, etc.
  }

  function buildRows() {
    listEl.innerHTML = '';

    ACTION_ORDER.forEach((action) => {
      const li = document.createElement('li');
      li.className = 'menu-item';
      li.dataset.action = action;

      const row = document.createElement('div');
      row.className = 'keybind-row';

      const name = document.createElement('span');
      name.className = 'keybind-name';
      name.textContent = LABELS[action];

      const key = document.createElement('span');
      key.className = 'keybind-key';
      key.textContent = keybinds[action];

      row.appendChild(name);
      row.appendChild(key);
      li.appendChild(row);
      listEl.appendChild(li);
    });

    const resetLi = document.createElement('li');
    resetLi.className = 'menu-item';
    resetLi.id = 'reset-row';
    resetLi.textContent = 'Reset to Default';
    listEl.appendChild(resetLi);
  }

  buildRows();

  function itemEls() { return Array.from(listEl.children); }

  function refreshKeyLabel(action) {
    const li = listEl.querySelector(`[data-action="${action}"]`);
    if (li) li.querySelector('.keybind-key').textContent = keybinds[action];
  }

  const controller = InfiniteHeartSubpage.initList(itemEls(), (index, el) => {
    if (listening) return; // ignore stray confirms while capturing

    if (el.id === 'reset-row') {
      keybinds = Object.assign({}, DEFAULTS);
      saveKeybinds(keybinds);
      buildRows();
      controller.setCurrent(index);
      return;
    }

    const action = el.dataset.action;
    startListening(action, el);
  });

  function startListening(action, el) {
    listening = true;
    el.classList.add('listening');

    function captureKey(e) {
      e.preventDefault();
      keybinds[action] = keyDisplayName(e);
      saveKeybinds(keybinds);
      refreshKeyLabel(action);
      el.classList.remove('listening');
      listening = false;
      document.removeEventListener('keydown', captureKey, true);
    }

    // capture phase so this fires before the shared list navigation
    document.addEventListener('keydown', captureKey, true);
  }

  InfiniteHeartSubpage.initBackNavigation();

  // --- total time played ---
  const TIME_KEY = 'ih_total_time_seconds';
  const timeValueEl = document.getElementById('time-played-value');

  function formatTime(totalSeconds) {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = Math.floor(totalSeconds % 60);
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  }

  function getStoredSeconds() {
    return parseInt(localStorage.getItem(TIME_KEY) || '0', 10);
  }

  let sessionStart = Date.now();
  function tickTimeDisplay() {
    const elapsed = (Date.now() - sessionStart) / 1000;
    timeValueEl.textContent = formatTime(getStoredSeconds() + elapsed);
  }
  const timeInterval = setInterval(tickTimeDisplay, 1000);
  tickTimeDisplay();

  window.addEventListener('beforeunload', () => {
    const elapsed = (Date.now() - sessionStart) / 1000;
    localStorage.setItem(TIME_KEY, String(getStoredSeconds() + elapsed));
    clearInterval(timeInterval);
  });
})();
