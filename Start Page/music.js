/* ==========================================================================
   Infinite Heart — Music page
   Centered stack of three horizontal sliders: Master (multiplier over
   VFX + BGM), VFX, and BGM volume. Draggable with the mouse, or nudged
   with A/D when a slider is focused (W/S moves focus between sliders).
   Values persist to localStorage under 'ih_volumes' so other pages
   (via audio.js) pick them up.
   ========================================================================== */

(function () {
  const SLIDERS = [
    { key: 'master', label: 'Master Volume' },
    { key: 'vfx',    label: 'VFX Volume' },
    { key: 'bgm',    label: 'BGM Volume' }
  ];

  function loadVolumes() {
    try {
      const saved = JSON.parse(localStorage.getItem('ih_volumes') || 'null');
      if (saved) return Object.assign({ master: 1, vfx: 1, bgm: 1 }, saved);
    } catch (e) { /* ignore */ }
    return { master: 1, vfx: 1, bgm: 1 };
  }

  function saveVolumes(v) {
    localStorage.setItem('ih_volumes', JSON.stringify(v));
    InfiniteHeartAudio.refreshVolumes();
  }

  let volumes = loadVolumes();
  let current = 0;

  const stack = document.getElementById('slider-stack');
  const rows = {};

  SLIDERS.forEach((s, i) => {
    const row = document.createElement('div');
    row.className = 'slider-row';
    row.dataset.key = s.key;

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

    stack.appendChild(row);
    rows[s.key] = row;

    row.addEventListener('mouseenter', () => setCurrent(i, { silent: false }));

    const handle = row.querySelector('.slider-handle');
    const track = row.querySelector('.slider-track');

    function setFromClientX(clientX) {
      const rect = track.getBoundingClientRect();
      let pct = (clientX - rect.left) / rect.width;
      pct = Math.max(0, Math.min(1, pct));
      volumes[s.key] = pct;
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
    });
  });

  function renderRow(key) {
    const row = rows[key];
    const pct = Math.round(volumes[key] * 100);
    row.querySelector('.slider-pct').textContent = pct + '%';
    row.querySelector('.slider-fill').style.width = pct + '%';
    row.querySelector('.slider-handle').style.left = pct + '%';
  }

  function renderAll() {
    SLIDERS.forEach((s) => renderRow(s.key));
    SLIDERS.forEach((s, i) => rows[s.key].classList.toggle('active', i === current));
  }

  function setCurrent(index, opts) {
    opts = opts || {};
    if (index === current) return;
    current = index;
    if (!opts.silent) InfiniteHeartAudio.playSelectSound();
    renderAll();
  }

  function nudge(delta) {
    const key = SLIDERS[current].key;
    volumes[key] = Math.max(0, Math.min(1, volumes[key] + delta));
    saveVolumes(volumes);
    renderRow(key);
  }

  document.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    if (key === 'w' || key === 'arrowup') setCurrent((current - 1 + SLIDERS.length) % SLIDERS.length);
    else if (key === 's' || key === 'arrowdown') setCurrent((current + 1) % SLIDERS.length);
    else if (key === 'a' || key === 'arrowleft') nudge(-0.05);
    else if (key === 'd' || key === 'arrowright') nudge(0.05);
  });

  InfiniteHeartSubpage.initBackNavigation();

  renderAll();
})();
