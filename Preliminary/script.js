document.addEventListener('DOMContentLoaded', () => {
  // --- Accordion Logic ---
  const headers = document.querySelectorAll('.accordion-header');
  headers.forEach(header => {
    header.addEventListener('click', () => {
      const item = header.parentElement;
      const content = item.querySelector('.accordion-content');
      const icon = header.querySelector('.icon');
      const isOpen = item.classList.contains('active');
      
      document.querySelectorAll('.accordion-item').forEach(otherItem => {
        otherItem.classList.remove('active');
        otherItem.querySelector('.accordion-content').style.maxHeight = null;
        otherItem.querySelector('.icon').textContent = '+';
      });

      if (!isOpen) {
        item.classList.add('active');
        content.style.maxHeight = content.scrollHeight + "px";
        icon.textContent = '−'; 
      } else {
        item.classList.remove('active');
        content.style.maxHeight = null;
        icon.textContent = '+';
      }
    });
  });

  // --- Horizontal Slide Shift Engine ---
  const slider = document.querySelector('.carousel-slider');
  const slides = document.querySelectorAll('.slide');
  const dots = document.querySelectorAll('.dot');
  const prevBtn = document.querySelector('.prev-btn');
  const nextBtn = document.querySelector('.next-btn');
  
  let currentSlideIndex = 0;
  const totalSlides = slides.length;
  let autoSlideInterval;

  function moveToSlide(index) {
    // Wrap tracking indexes around boundary rules
    if (index < 0) {
      currentSlideIndex = totalSlides - 1;
    } else if (index >= totalSlides) {
      currentSlideIndex = 0;
    } else {
      currentSlideIndex = index;
    }

    // Translate container wrapper horizontally matching width fractions
    slider.style.transform = `translateX(-${(currentSlideIndex * 100) / totalSlides}%)`;

    // Toggle indicator dot styles
    dots.forEach(dot => dot.classList.remove('active-dot'));
    dots[currentSlideIndex].classList.add('active-dot');
  }

  function startAutoSlide() {
    autoSlideInterval = setInterval(() => {
      moveToSlide(currentSlideIndex + 1);
    }, 6000);
  }

  function resetAutoSlide() {
    clearInterval(autoSlideInterval);
    startAutoSlide();
  }

  // Bind Control Events
  nextBtn.addEventListener('click', () => {
    moveToSlide(currentSlideIndex + 1);
    resetAutoSlide();
  });

  prevBtn.addEventListener('click', () => {
    moveToSlide(currentSlideIndex - 1);
    resetAutoSlide();
  });

  dots.forEach(dot => {
    dot.addEventListener('click', (e) => {
      const targetIndex = parseInt(e.target.getAttribute('data-slide'));
      moveToSlide(targetIndex);
      resetAutoSlide();
    });
  });

  // Initialize Timer Loop
  startAutoSlide();
});