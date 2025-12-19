import { fetchPlaceholders } from '../../scripts/commerce.js';

function updateActiveSlide(slide) {
  const block = slide.closest('.carousel-custom');
  const slideIndex = parseInt(slide.dataset.slideIndex, 10);
  block.dataset.activeSlide = slideIndex;

  const indicators = block.querySelectorAll('.carousel-custom-slide-indicator button');
  indicators.forEach((btn, idx) => {
    btn.disabled = idx === slideIndex;
  });
}

function showSlide(block, slideIndex = 0) {
  const slides = block.querySelectorAll('.carousel-custom-slide');
  if (!slides.length) return;

  if (slideIndex < 0) slideIndex = slides.length - 1;
  if (slideIndex >= slides.length) slideIndex = 0;

  block.dataset.activeSlide = slideIndex;
  block.querySelector('.carousel-custom-slides').scrollTo({
    left: slides[slideIndex].offsetLeft,
    behavior: 'smooth'
  });
}

function observeSlides(block) {
  const slides = block.querySelectorAll('.carousel-custom-slide');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) updateActiveSlide(entry.target);
    });
  }, { threshold: 0.5 });

  slides.forEach(slide => observer.observe(slide));
}

function createSlide(row, slideIndex, carouselId) {
  const slide = document.createElement('li');
  slide.dataset.slideIndex = slideIndex;
  slide.setAttribute('id', `carousel-custom-${carouselId}-slide-${slideIndex}`);
  slide.classList.add('carousel-custom-slide');

  row.querySelectorAll(':scope > div').forEach((column, colIdx) => {
    column.classList.add(`carousel-custom-slide-${colIdx === 0 ? 'image' : 'content'}`);
    slide.append(column);
  });

  const labeledBy = slide.querySelector('h1, h2, h3, h4, h5, h6');
  if (labeledBy) slide.setAttribute('aria-labelledby', labeledBy.getAttribute('id'));

  return slide;
}

let carouselId = 0;
export default async function decorate(block) {
  carouselId += 1;
  block.setAttribute('id', `carousel-custom-${carouselId}`);
  const rows = block.querySelectorAll(':scope > div');
  const isSingleSlide = rows.length < 2;

  const placeholders = await fetchPlaceholders();
  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', placeholders.carousel || 'Carousel');

  const container = document.createElement('div');
  container.classList.add('carousel-custom-slides-container');

  const slidesWrapper = document.createElement('ul');
  slidesWrapper.classList.add('carousel-custom-slides');
  container.append(slidesWrapper);

  let slideIndicators;
  if (!isSingleSlide) {
    slideIndicators = document.createElement('ol');
    slideIndicators.classList.add('carousel-custom-slide-indicators');
    container.append(slideIndicators);
  }

  rows.forEach((row, idx) => {
    const slide = createSlide(row, idx, carouselId);
    slidesWrapper.append(slide);

    if (slideIndicators) {
      const li = document.createElement('li');
      li.classList.add('carousel-custom-slide-indicator');
      li.dataset.targetSlide = idx;
      li.innerHTML = `<button type="button" aria-label="${placeholders.showSlide || 'Show Slide'} ${idx + 1} ${placeholders.of || 'of'} ${rows.length}"></button>`;
      slideIndicators.append(li);
    }

    row.remove();
  });

  block.prepend(container);

  const parentSection = block.closest(".section");
  parentSection.style.marginTop = '0';

  if (slideIndicators) {
    slideIndicators.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', e => {
        const index = [...slideIndicators.children].indexOf(e.target.closest('li'));
        showSlide(block, index);
      });
    });
  }

  observeSlides(block);
}
