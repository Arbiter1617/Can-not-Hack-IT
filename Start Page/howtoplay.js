/* ==========================================================================
   Infinite Heart — How to Play Slideshow
   Handles navigation between slides using on-screen buttons or A/D keys.
   ========================================================================== */

(function () {
  if (typeof InfiniteHeartSubpage !== 'undefined') {
    InfiniteHeartSubpage.initBackNavigation();
  }

  const slides = document.querySelectorAll('.slide');
  const btnPrev = document.getElementById('btn-prev');
  const btnNext = document.getElementById('btn-next');
  const dotsContainer = document.getElementById('dots-container');
  
  let currentSlide = 0;

  // Create dots
  slides.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.className = 'dot' + (i === 0 ? ' active' : '');
    dotsContainer.appendChild(dot);
  });
  const dots = document.querySelectorAll('.dot');

  function updateSlides() {
    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === currentSlide);
    });
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentSlide);
    });
    
    btnPrev.disabled = (currentSlide === 0);
    btnNext.disabled = (currentSlide === slides.length - 1);
    
    if (typeof InfiniteHeartAudio !== 'undefined' && InfiniteHeartAudio.playSelectSound) {
      InfiniteHeartAudio.playSelectSound();
    }
  }

  btnPrev.addEventListener('click', (e) => {
    if (e.button !== 0) return;
    if (currentSlide > 0) {
      currentSlide--;
      updateSlides();
    }
  });

  btnNext.addEventListener('click', (e) => {
    if (e.button !== 0) return;
    if (currentSlide < slides.length - 1) {
      currentSlide++;
      updateSlides();
    }
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    if (key === 'a' || key === 'arrowleft') {
      if (currentSlide > 0) {
        currentSlide--;
        updateSlides();
      }
    } else if (key === 'd' || key === 'arrowright') {
      if (currentSlide < slides.length - 1) {
        currentSlide++;
        updateSlides();
      }
    }
  });

  // Initial state
  updateSlides();
})();
