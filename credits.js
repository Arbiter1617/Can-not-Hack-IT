/* ==========================================================================
   Infinite Heart — Credits Background Clock Animation
   Spins the clock continuously behind the scrolling text.
   ========================================================================== */

(function () {
  if (typeof InfiniteHeartSubpage !== 'undefined') {
    InfiniteHeartSubpage.initBackNavigation();
  }

  const handEl = document.getElementById('hand');
  const hourHandEl = document.getElementById('hand-hour');
  const ticksGroup = document.getElementById('ticks');

  const RADIUS = 230;
  const HAND_LENGTH = 190;
  const HOUR_HAND_LENGTH = 110;

  function toXY(angleDeg, radius) {
    const rad = (angleDeg - 90) * (Math.PI / 180); // -90 so 0deg = top
    return { x: Math.cos(rad) * radius, y: Math.sin(rad) * radius };
  }

  // Draw 12 decorative ticks around the ring
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

  let lastTime = 0;
  let totalMinuteAngle = 0; 
  let baseHourAngle = Math.floor(Math.random() * 12) * 30; // Random starting hour
  let hourAngle = baseHourAngle;

  // Spin endlessly!
  function animate(now) {
    if (!lastTime) lastTime = now;
    const dt = (now - lastTime) / 1000;
    lastTime = now;

    // Minute hand spins steadily (e.g., 45 degrees per second)
    const spinSpeed = 45; 
    const mainDelta = spinSpeed * dt;
    totalMinuteAngle += mainDelta;

    // Draw minute hand
    const tip = toXY(totalMinuteAngle, HAND_LENGTH);
    handEl.setAttribute('x2', tip.x);
    handEl.setAttribute('y2', tip.y);

    // Draw hour hand exactly 1/12th the speed
    hourAngle = (baseHourAngle + totalMinuteAngle / 12) % 360;
    const tipHour = toXY(hourAngle, HOUR_HAND_LENGTH);
    hourHandEl.setAttribute('x2', tipHour.x);
    hourHandEl.setAttribute('y2', tipHour.y);

    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
})();
