/* ==========================================================================
   Infinite Heart — main menu (the stopwatch)
   The cursor is purely a system pointer here — it moves, but it cannot
   select or trigger anything on this page. Navigation is keyboard-only:
   W steps forward through the snap order, S steps backward, Space / Enter
   confirms the active node.
   Snap order: 12 -> PLAY -> Credits -> Music -> Settings -> Mode
               -> How to Play -> 12

   A second, shorter hour hand is purely decorative: it starts at a random
   angle and rotates in the same direction as the main hand, at 1/60th of
   whatever angle the main hand actually travels (hourAngle += mainDelta/60).
   ========================================================================== */

(function () {
  // Angles are degrees clockwise from 12 o'clock (0deg = top).
  // Layout: 12 (neutral) and PLAY (3 o'clock) each stand alone. Every other
  // option lives on the left side only — the arc running anticlockwise from
  // 12 down to 6 (i.e. angles strictly between 180deg and 360deg). That arc
  // is split into 6 equal slices for the 5 nodes, so the margins next to 12
  // and next to 6 match the gaps between the nodes themselves — nothing
  // bleeds onto the right side, where only PLAY sits.
  const LEFT_ARC_START = 180; // 6 o'clock
  const LEFT_ARC_SPAN = 180;  // up to 360 / 0, i.e. 12 o'clock
  const LEFT_SLICE = LEFT_ARC_SPAN / 6; // 5 nodes -> 6 gaps

  const NODES = [
    { id: 'twelve',     label: '12',           angle: 0,   neutral: true,  action: null },
    { id: 'play',       label: 'PLAY',         angle: 90,  action: () => go('./game/index.html') },
    { id: 'credits',    label: 'Credits',      angle: LEFT_ARC_START + LEFT_SLICE * 1, action: () => go('credits.html') },
    { id: 'music',      label: 'Music',        angle: LEFT_ARC_START + LEFT_SLICE * 2, action: () => go('music.html') },
    { id: 'settings',   label: 'Settings',     angle: LEFT_ARC_START + LEFT_SLICE * 3, action: () => go('settings.html') },
    { id: 'mode',       label: 'Mode',         angle: LEFT_ARC_START + LEFT_SLICE * 4, action: () => go('mode.html') },
    { id: 'howtoplay',  label: 'How to Play',  angle: LEFT_ARC_START + LEFT_SLICE * 5, action: () => go('howtoplay.html') },
  ];

  function go(url) {
    const page = document.querySelector('.page');
    if (page) page.classList.add('page-fade-out');
    setTimeout(() => { window.location.href = url; }, 300);
  }

  const svg = document.getElementById('clock-svg');
  const handEl = document.getElementById('hand');
  const hourHandEl = document.getElementById('hand-hour');
  const ticksGroup = document.getElementById('ticks');
  const labelsGroup = document.getElementById('node-labels');

  const RADIUS = 230;
  const LABEL_RADIUS = 172;
  const HAND_LENGTH = 190;
  const HOUR_HAND_LENGTH = 110;

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
  let totalMinuteAngle = 0; // cumulative minutes rotation
  let baseHourAngle = Math.floor(Math.random() * 12) * 30; // Snap to an exact hour
  let hourAngle = baseHourAngle;

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

  function drawHourHand() {
    const tip = toXY(hourAngle, HOUR_HAND_LENGTH);
    hourHandEl.setAttribute('x2', tip.x);
    hourHandEl.setAttribute('y2', tip.y);
  }

  // --- animation loop: smooth hand movement with a small overshoot/snap ---
  function animate() {
    const remaining = angularDelta(handAngle, targetAngle);
    if (Math.abs(remaining) > 0.05 || Math.abs(overshoot) > 0.05) {
      const prevHandAngle = handAngle;
      handAngle += remaining * 0.18;
      overshoot *= 0.82;
      const drawAngle = handAngle + overshoot;
      const tip = toXY(drawAngle, HAND_LENGTH);
      handEl.setAttribute('x2', tip.x);
      handEl.setAttribute('y2', tip.y);

      // hour hand: rotates like a real clock (1/12th ratio)
      const mainDelta = angularDelta(prevHandAngle, handAngle);
      totalMinuteAngle += mainDelta;
      hourAngle = (baseHourAngle + totalMinuteAngle / 12) % 360;
      if (hourAngle < 0) hourAngle += 360;
      drawHourHand();
    }
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);

  // initialise main hand pointing at 12, hour hand at its random start
  handAngle = 0;
  targetAngle = 0;
  render();
  drawHourHand();

  // --- keyboard: W steps forward, S steps backward, Space/Enter confirms ---
  // (the only way to navigate this menu — the pointer moves on screen but
  // cannot select or trigger anything here)
  document.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    if (key === 'w' || key === 'arrowup') {
      setActive((currentIndex + 1) % NODES.length);
    } else if (key === 's' || key === 'arrowdown') {
      setActive((currentIndex - 1 + NODES.length) % NODES.length);
    } else if (key === ' ' || key === 'enter') {
      e.preventDefault();
      confirmCurrent();
    }
  });

  function confirmCurrent() {
    const node = NODES[currentIndex];
    if (!node.action) return; // 12 o'clock does nothing
    InfiniteHeartAudio.playSelectSound();
    node.action();
  }
})();
