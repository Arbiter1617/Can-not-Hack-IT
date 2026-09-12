/* ==========================================================================
   Infinite Heart — Mode page
   Centered list of all 13 hells, all always selectable. Selecting a hell
   enters practice mode (no timer, runs until Escape/Back). Back from a
   hell returns to Mode; Back from Mode returns to the clock.
   ========================================================================== */

(function () {
  const HELLS = [
    'Dodge', 'Shield', 'String', 'Gravity', 'Laser', 'Projectile',
    'Fruit Ninja', 'Shooter', 'Kamikaze', 'Dark Maze', 'Hole in the Wall',
    'Typing Test', 'Music'
  ];

  const listEl = document.getElementById('hell-list');
  const practiceView = document.getElementById('practice-view');
  const practiceNameEl = document.getElementById('practice-hell-name');
  const listPage = document.getElementById('list-page');

  let inPractice = false;

  HELLS.forEach((name) => {
    const li = document.createElement('li');
    li.className = 'menu-item';
    li.textContent = name;
    listEl.appendChild(li);
  });

  const itemEls = Array.from(listEl.children);

  function enterPractice(index) {
    inPractice = true;
    practiceNameEl.textContent = HELLS[index];
    practiceView.classList.add('visible');
    listPage.style.visibility = 'hidden';
    // NOTE: actual hell/demo simulation logic will be wired in later —
    // this view is a placeholder that just confirms navigation works.
  }

  function exitPractice() {
    inPractice = false;
    practiceView.classList.remove('visible');
    listPage.style.visibility = 'visible';
  }

  // Map index → URL param name (add more as hells get coded)
  const PRACTICE_ROUTES = {
    0: 'dodge',
  };

  InfiniteHeartSubpage.initList(itemEls, (index) => {
    const route = PRACTICE_ROUTES[index];
    if (route) {
      // Navigate to the actual game in practice mode
      const page = document.querySelector('.page');
      if (page) page.classList.add('page-fade-out');
      setTimeout(() => {
        window.location.href = `../game/index.html?practice=${route}`;
      }, 300);
    } else {
      // Hell not yet coded — show placeholder
      enterPractice(index);
    }
  });

  // Back button and Escape share one rule: if inside a hell, back out to
  // the Mode list first; otherwise, back out to the clock.
  InfiniteHeartSubpage.initBackNavigation(() => {
    if (inPractice) exitPractice();
    else InfiniteHeartSubpage.goBackToClock();
  });
})();
