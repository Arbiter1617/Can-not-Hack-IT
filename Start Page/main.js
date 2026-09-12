/* ==========================================================================
   Infinite Heart — main menu (the stopwatch)
   The clock hand is the cursor. W/S step between snap positions.
   Space / Enter / left-click confirms the currently active node.
   Snap order: 12 -> PLAY -> EXIT -> Credits -> Music -> Settings -> Mode
               -> How to Play -> 12
   ========================================================================== */

(function () {
  // Angles are degrees clockwise from 12 o'clock (0deg = top).
  const NODES = [
    { id: 'twelve',     label: '12',           angle: 0,   neutral: true,  action: null },
    { id: 'play',       label: 'PLAY',         angle: 90,  action: () => go('../game/index.html') },
    { id: 'exit',       label: 'EXIT',         angle: 135, action: () => window.close() },
    { id: 'credits',    label: 'Credits',      angle: 171, action: () => go('credits.html') },
    { id: 'music',      label: 'Music',        angle: 207, action: () => go('music.html') },
    { id: 'settings',   label: 'Settings',     angle: 243, action: () => go('settings.html') },
    { id: 'mode',       label: 'Mode',         angle: 279, action: () => go('mode.html') },
    { id: 'howtoplay',  label: 'How to Play',  angle: 315, action: () => go('howtoplay.html') },
  ];

  function go(url) {
    const page = document.querySelector('.page');
    if (page) page.classList.add('page-fade-out');
    setTimeout(() => { window.location.href = url; }, 300);
  }

  const svg = document.getElementById('clock-svg');
  const handEl = document.getElementById('hand');
  const ticksGroup = document.getElementById('ticks');
  const labelsGroup = document.getElementById('node-labels');

  const RADIUS = 230;
  const LABEL_RADIUS = 195;
  const HAND_LENGTH = 190;

  function toXY(angleDeg, radius) {
    const rad = (angleDeg - 90) * (Math.PI / 180); // -90 so 0deg = top
    return { x: Math.cos(rad) * radius, y: Math.sin(rad) * radius };
  }

  // --- draw hour ticks around the ring (12 of them, decorative) ---
  for (let i = 0; i < 12; i++) {
    const angle = i * 30;
    const outer = toXY(angle, RADIUS);
    const inner = toXY(angle, RADIUS - 14);
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('class', 'tick');
    line.setAttribute('x1', inner.x);
    line.setAttribute('y1', inner.y);
    line.setAttribute('x2', outer.x);
    line.setAttribute('y2', outer.y);
    ticksGroup.appendChild(line);
  }

  // --- draw node labels + dots ---
  const labelEls = [];
  const dotEls = [];
  NODES.forEach((node) => {
    const pos = toXY(node.angle, LABEL_RADIUS);
    const dotPos = toXY(node.angle, RADIUS);

    const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    dot.setAttribute('class', 'node-dot');
    dot.setAttribute('cx', dotPos.x);
    dot.setAttribute('cy', dotPos.y);
    dot.setAttribute('r', 4);
    labelsGroup.appendChild(dot);
    dotEls.push(dot);

    if (node.neutral) {
      // 12 o'clock: decorative only, no text label drawn (the ring/hand
      // already reads clearly at rest here), but keep the dot.
      labelEls.push(null);
      return;
    }

    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('class', 'node-label');
    text.setAttribute('x', pos.x);
    text.setAttribute('y', pos.y);
    text.textContent = node.label;
    labelsGroup.appendChild(text);
    labelEls.push(text);
  });

  // --- state ---
  let currentIndex = 0; // start neutral at 12
  let handAngle = 0;        // currently rendered angle
  let targetAngle = 0;      // angle we're animating toward
  let overshoot = 0;        // small overshoot offset for the snap feel

  function angularDelta(a, b) {
    // shortest signed distance from a to b, in degrees
    let d = (b - a) % 360;
    if (d > 180) d -= 360;
    if (d < -180) d += 360;
    return d;
  }

  function setActive(index, { silent } = {}) {
    if (index === currentIndex && silent) return;
    currentIndex = index;
    targetAngle = handAngle + angularDelta(handAngle, NODES[index].angle);
    overshoot = angularDelta(handAngle, targetAngle) > 0 ? 6 : -6;
    if (!silent) InfiniteHeartAudio.playSelectSound();
    render();
  }

  function render() {
    NODES.forEach((node, i) => {
      const isActive = i === currentIndex;
      if (labelEls[i]) labelEls[i].classList.toggle('active', isActive);
      dotEls[i].classList.toggle('active', isActive);
      dotEls[i].setAttribute('r', isActive ? 6 : 4);
    });
  }

  // --- animation loop: smooth hand movement with a small overshoot/snap ---
  function animate() {
    const remaining = angularDelta(handAngle, targetAngle);
    if (Math.abs(remaining) > 0.05 || Math.abs(overshoot) > 0.05) {
      handAngle += remaining * 0.18;
      overshoot *= 0.82;
      const drawAngle = handAngle + overshoot;
      const tip = toXY(drawAngle, HAND_LENGTH);
      handEl.setAttribute('x2', tip.x);
      handEl.setAttribute('y2', tip.y);
    }
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);

  // initialise hand pointing at 12
  handAngle = 0;
  targetAngle = 0;
  render();

  // --- mouse: the hand follows the cursor's angle, snapping to whichever
  //     node is angularly nearest ---
  document.addEventListener('mousemove', (e) => {
    const rect = svg.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    if (Math.hypot(dx, dy) < 8) return; // ignore right at dead center

    let mouseAngle = (Math.atan2(dy, dx) * 180 / Math.PI) + 90;
    mouseAngle = (mouseAngle + 360) % 360;

    let nearest = 0;
    let nearestDist = Infinity;
    NODES.forEach((node, i) => {
      const d = Math.abs(angularDelta(mouseAngle, node.angle));
      if (d < nearestDist) { nearestDist = d; nearest = i; }
    });

    if (nearest !== currentIndex) setActive(nearest);
  });

  // --- keyboard: W/S step through the snap order, Space/Enter confirm ---
  document.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    if (key === 'w' || key === 'arrowup') {
      setActive((currentIndex - 1 + NODES.length) % NODES.length);
    } else if (key === 's' || key === 'arrowdown') {
      setActive((currentIndex + 1) % NODES.length);
    } else if (key === ' ' || key === 'enter') {
      e.preventDefault();
      confirmCurrent();
    }
  });

  // --- click anywhere on the face confirms the active node ---
  svg.addEventListener('click', () => confirmCurrent());

  function confirmCurrent() {
    const node = NODES[currentIndex];
    if (!node.action) return; // 12 o'clock does nothing
    InfiniteHeartAudio.playSelectSound();
    node.action();
  }
})();
