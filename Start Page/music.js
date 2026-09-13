/* ==========================================================================
   Infinite Heart — Music page
   Centered stack of settings: Master, VFX, BGM (sliders), and Special Music (toggle).
   Navigation is keyboard-only: W/S to move focus, A/D to adjust sliders, Enter to toggle.
   Values persist to localStorage under 'ih_volumes'.
   ========================================================================== */

(function () {
  const ITEMS = [
    { key: 'master', label: 'Master Volume', type: 'slider' },
    { key: 'vfx',    label: 'VFX Volume', type: 'slider' },
    { key: 'bgm',    label: 'BGM Volume', type: 'slider' },
    { key: 'specialMusic', label: 'Special end of game music?', type: 'toggle' }
  ];

  function loadVolumes() {
    try {
      const saved = JSON.parse(localStorage.getItem('ih_volumes') || 'null');
      if (saved) return Object.assign({ master: 1, vfx: 1, bgm: 1, specialMusic: true }, saved);
    } catch (e) { /* ignore */ }
    return { master: 1, vfx: 1, bgm: 1, specialMusic: true };
  }

  function saveVolumes(v) {
    localStorage.setItem('ih_volumes', JSON.stringify(v));
    if (window.InfiniteHeartAudio && InfiniteHeartAudio.refreshVolumes) {
      InfiniteHeartAudio.refreshVolumes();
    }
  }

  let volumes = loadVolumes();
  let current = 0;

  const stack = document.getElementById('slider-stack');
  const rows = {};

  ITEMS.forEach((s, i) => {
    const row = document.createElement('div');
    row.className = 'slider-row';
    row.dataset.key = s.key;

    if (s.type === 'slider') {
      row.innerHTML = `
        <div class="slider-label-row">
          <span class="slider-name">${s.label}</span>
          <span class="slider-pct"></span>
        </div>
        <div class="slider-track-wrap">
          <div class="slider-track">
            <div class="slider-fill"></div>
            <div class="slider-handle" tabindex="-1"></div>
          </div>
        </div>
      `;
    } else {
      row.innerHTML = `
        <div class="slider-label-row">
          <span class="slider-name">${s.label}</span>
          <div class="toggle-switch ${volumes[s.key] ? 'on' : ''}">
            <div class="toggle-knob"></div>
          </div>
        </div>
      `;
    }

    stack.appendChild(row);
    rows[s.key] = row;

    row.addEventListener('mouseenter', () => setCurrent(i, { silent: false }));

    if (s.type === 'slider') {
      const handle = row.querySelector('.slider-handle');
      const track = row.querySelector('.slider-track-wrap');

      function setFromClientX(x) {
        const rect = track.getBoundingClientRect();
        const p = Math.max(0, Math.min(1, (x - rect.left) / rect.width));
        volumes[s.key] = p;
        saveVolumes(volumes);
        renderRow(s.key);
      }

      function onPointerMove(e) { setFromClientX(e.clientX); }
      function onPointerUp() {
        document.removeEventListener('pointermove', onPointerMove);
        document.removeEventListener('pointerup', onPointerUp);
      }

      handle.addEventListener('pointerdown', (e) => {
        setCurrent(i, { silent: true });
        setFromClientX(e.clientX);
        document.addEventListener('pointermove', onPointerMove);
        document.addEventListener('pointerup', onPointerUp);
      });

      track.addEventListener('pointerdown', (e) => {
        if (e.target === handle) return;
        setCurrent(i, { silent: true });
        setFromClientX(e.clientX);
        document.addEventListener('pointermove', onPointerMove);
        document.addEventListener('pointerup', onPointerUp);
      });
    } else {
      const toggleBtn = row.querySelector('.toggle-switch');
      toggleBtn.addEventListener('click', (e) => {
        setCurrent(i, { silent: true });
        toggleCurrent();
      });
    }
  });

  function renderRow(key) {
    const row = rows[key];
    const item = ITEMS.find(x => x.key === key);
    if (item.type === 'slider') {
      const pct = Math.round(volumes[key] * 100);
      row.querySelector('.slider-pct').textContent = pct + '%';
      row.querySelector('.slider-fill').style.width = pct + '%';
      row.querySelector('.slider-handle').style.left = pct + '%';
    } else {
      const ts = row.querySelector('.toggle-switch');
      if (ts) ts.classList.toggle('on', !!volumes[key]);
    }
  }

  function renderAll() {
    ITEMS.forEach((s) => renderRow(s.key));
    ITEMS.forEach((s, i) => rows[s.key].classList.toggle('active', i === current));
  }

  function setCurrent(index, opts) {
    opts = opts || {};
    if (index === current) return;
    current = index;
    if (!opts.silent && window.InfiniteHeartAudio) {
      InfiniteHeartAudio.playSelectSound();
    }
    renderAll();
  }

  function nudge(delta) {
    const item = ITEMS[current];
    if (item.type !== 'slider') return;
    volumes[item.key] = Math.max(0, Math.min(1, volumes[item.key] + delta));
    saveVolumes(volumes);
    renderRow(item.key);
  }

  function toggleCurrent() {
    const item = ITEMS[current];
    if (item.type !== 'toggle') return;
    volumes[item.key] = !volumes[item.key];
    saveVolumes(volumes);
    renderRow(item.key);
    if (window.InfiniteHeartAudio) InfiniteHeartAudio.playSelectSound();
  }

  document.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    if (key === 'w' || key === 'arrowup') setCurrent((current - 1 + ITEMS.length) % ITEMS.length);
    else if (key === 's' || key === 'arrowdown') setCurrent((current + 1) % ITEMS.length);
    else if (key === 'a' || key === 'arrowleft') nudge(-0.05);
    else if (key === 'd' || key === 'arrowright') nudge(0.05);
    else if (key === 'enter' || key === ' ') toggleCurrent();
  });

  if (typeof InfiniteHeartSubpage !== 'undefined') {
    InfiniteHeartSubpage.initBackNavigation();
  }

  renderAll();
})();
