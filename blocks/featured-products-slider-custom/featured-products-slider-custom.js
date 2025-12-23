import { addProductsToCart } from '@dropins/storefront-cart/api.js';
import { fetchPlaceholders, fetchProducts, getProductLink } from '../../scripts/commerce.js';

function updateActiveSlide(slide) {
  const block = slide.closest('.featured-products-slider-custom');
  const slideIndex = parseInt(slide.dataset.slideIndex, 10);
  block.dataset.activeSlide = slideIndex;

  const slides = block.querySelectorAll('.featured-products-slide');
  const indicators = block.querySelectorAll('.featured-products-indicator');

  slides.forEach((aSlide, idx) => {
    aSlide.setAttribute('aria-hidden', idx !== slideIndex);
  });

  indicators.forEach((indicator, idx) => {
    const button = indicator.querySelector('button');
    if (idx !== slideIndex) {
      button.removeAttribute('disabled');
    } else {
      button.setAttribute('disabled', 'true');
    }
  });
}

function showSlide(block, slideIndex = 0) {
  const slides = block.querySelectorAll('.featured-products-slide');
  let realSlideIndex = slideIndex < 0 ? slides.length - 1 : slideIndex;
  if (slideIndex >= slides.length) realSlideIndex = 0;
  
  const slidesContainer = block.querySelector('.featured-products-slides');
  const activeSlide = slides[realSlideIndex];

  slidesContainer.scrollTo({
    top: 0,
    left: activeSlide.offsetLeft,
    behavior: 'smooth',
  });
}

function bindEvents(block) {
  const indicatorsContainer = block.querySelector('.featured-products-indicators');
  if (indicatorsContainer) {
    indicatorsContainer.querySelectorAll('button').forEach((button) => {
      button.addEventListener('click', (e) => {
        const indicator = e.currentTarget.parentElement;
        showSlide(block, parseInt(indicator.dataset.targetSlide, 10));
      });
    });
  }

  const prevBtn = block.querySelector('.featured-products-prev');
  const nextBtn = block.querySelector('.featured-products-next');
  
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      showSlide(block, parseInt(block.dataset.activeSlide, 10) - 1);
    });
  }
  
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      showSlide(block, parseInt(block.dataset.activeSlide, 10) + 1);
    });
  }

  const slideObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) updateActiveSlide(entry.target);
    });
  }, { threshold: 0.2 });
  
  block.querySelectorAll('.featured-products-slide').forEach((slide) => {
    slideObserver.observe(slide);
  });
}

function createProductCard(product) {
  const card = document.createElement('div');
  card.className = 'featured-products-card';
  
  const productLink = document.createElement('a');
  productLink.href = getProductLink(product.urlKey, product.sku);
  productLink.className = 'product-link';
  
  if (product.isNew) {
    const newBadge = document.createElement('span');
    newBadge.className = 'featured-products-badge';
    newBadge.textContent = 'POPULARNE';
    productLink.appendChild(newBadge);
  }
  
  const imageContainer = document.createElement('div');
  imageContainer.className = 'featured-products-image';
  
  const image = document.createElement('img');
  image.src = product.image;
  image.alt = product.name;
  image.loading = 'lazy';
  imageContainer.appendChild(image);
  
  productLink.appendChild(imageContainer);
  
  const content = document.createElement('div');
  content.className = 'featured-products-content';
  
  const title = document.createElement('h3');
  title.className = 'featured-products-title';
  title.textContent = product.name;
  content.appendChild(title);
  
  const priceContainer = document.createElement('div');
  priceContainer.className = 'featured-products-price-container';
  
  const netPrice = document.createElement('div');
  netPrice.className = 'featured-products-net-price';
  
  if (product.price && product.price.final) {
    netPrice.textContent = `£${product.price.final.amount.value}`;
  } else {
    netPrice.textContent = product.formattedPrice || '£25.99';
  }
  
  priceContainer.appendChild(netPrice);
  
  const grossPrice = document.createElement('div');
  grossPrice.className = 'featured-products-gross-price';
  
  if (product.price && product.price.final) {
    const nettoValue = product.price.final.amount.value;
    const bruttoValue = (nettoValue * 1.23).toFixed(2);
    grossPrice.textContent = `£${bruttoValue} brutto`;
  } else {
    grossPrice.textContent = 'Do modyfikacji - brak danych brutto';
  }
  
  priceContainer.appendChild(grossPrice);
  content.appendChild(priceContainer);
  
  const addToCartPanel = document.createElement('div');
  addToCartPanel.className = 'add-to-cart-panel';
  
  const quantityControls = document.createElement('div');
  quantityControls.className = 'quantity-controls';
  
  const inputContainer = document.createElement('div');
  inputContainer.className = 'quantity-input-container';
  
  const quantityInput = document.createElement('input');
  quantityInput.type = 'number';
  quantityInput.name = 'quantity';
  quantityInput.className = 'quantity-input';
  quantityInput.value = '1';
  quantityInput.min = '1';
  quantityInput.max = '10';
  
  inputContainer.appendChild(quantityInput);
  
  const arrowsContainer = document.createElement('div');
  arrowsContainer.className = 'quantity-arrows';
  
  const increaseBtn = document.createElement('button');
  increaseBtn.type = 'button';
  increaseBtn.className = 'quantity-arrow increase';
  increaseBtn.innerHTML = '▲';
  increaseBtn.setAttribute('aria-label', 'Zwiększ ilość');
  
  const decreaseBtn = document.createElement('button');
  decreaseBtn.type = 'button';
  decreaseBtn.className = 'quantity-arrow decrease';
  decreaseBtn.innerHTML = '▼';
  decreaseBtn.setAttribute('aria-label', 'Zmniejsz ilość');
  
  arrowsContainer.appendChild(increaseBtn);
  arrowsContainer.appendChild(decreaseBtn);
  
  quantityControls.appendChild(inputContainer);
  quantityControls.appendChild(arrowsContainer);
  
  const addToCartButton = document.createElement('button');
  addToCartButton.type = 'button';
  addToCartButton.className = 'add-to-cart-button';
  addToCartButton.textContent = 'Dodaj do koszyka';
  addToCartButton.addEventListener('click', () => {
    addProductsToCart([{sku: product.sku, quantity: quantityInput.value}]);
  })
  
  addToCartPanel.appendChild(quantityControls);
  addToCartPanel.appendChild(addToCartButton);
  content.appendChild(addToCartPanel);
  
  decreaseBtn.addEventListener('click', () => {
    const currentValue = parseInt(quantityInput.value) || 1;
    if (currentValue > 1) {
      quantityInput.value = currentValue - 1;
    }
  });
  
  increaseBtn.addEventListener('click', () => {
    const currentValue = parseInt(quantityInput.value) || 1;
    if (currentValue < 10) {
      quantityInput.value = currentValue + 1;
    }
  });
  
  card.appendChild(productLink);
  card.appendChild(content);
  
  return card;
}



function createSlide(products, slideIndex, sliderId) {
  const slide = document.createElement('li');
  slide.dataset.slideIndex = slideIndex;
  slide.setAttribute('id', `featured-products-${sliderId}-slide-${slideIndex}`);
  slide.className = 'featured-products-slide';
  slide.setAttribute('role', 'tabpanel');
  slide.setAttribute('aria-roledescription', 'slide');

  products.forEach(product => {
    const productCard = createProductCard(product);
    slide.appendChild(productCard);
  });

  return slide;
}


function toCamelCase(str) {
  return str
    ?.trim()
    ?.toLowerCase()
    ?.split(/\s+/)
    ?.map((word, index) =>
      index === 0
        ? word
        : word.charAt(0).toUpperCase() + word.slice(1)
    )
    ?.join('');
}

function readConfig(block){
  const config = {
    productsPerSlide: 4,
    totalProducts: 8,
  };

  block.querySelectorAll(':scope > div').forEach((row) => {
    const label = toCamelCase(row.querySelector(':scope > div:first-child p')?.textContent);
    const value = row.querySelector(':scope > div:last-child p')?.textContent?.trim();

    if(label && value){
      config[label] = isNaN(value) ? value : Number(value);
    }
    
    return config;
  });

  return config;
}

let sliderId = 0;
export default async function decorate(block) {
  sliderId += 1;
  block.setAttribute('id', `featured-products-${sliderId}`);
  
  const placeholders = await fetchPlaceholders();
  
  // read and set config
  const config = readConfig(block);
  const productsPerSlide = config.productsPerSlide;
  const totalProducts = config.totalProducts;
  
  // Clear the block content
  block.innerHTML = '';

  // add label of block
  const blockLabelDiv = document.createElement('div');
  blockLabelDiv.textContent = "POPULARNE";
  blockLabelDiv.classList.add('block-label');
  block.append(blockLabelDiv);
  
  // fetch products from Magento
  let products = [];
  try {
    products = await fetchProducts({
      limit: totalProducts
    });
    
    if (!products || products.length === 0) {
      throw new Error('No products received from Magento');
    }
  } catch (error) {
    console.error('❌ [featured-products-slider-custom] Could not fetch products:', error);
    
    const errorMessage = document.createElement('div');
    errorMessage.className = 'featured-products-error';
    errorMessage.innerHTML = `
      <p>Unable to load products at the moment. Please try again later.</p>
      <small>Technical details: ${error.message}</small>
    `;
    block.appendChild(errorMessage);
    return;
  }
  
  if (!products || products.length === 0) {
    const message = document.createElement('p');
    message.textContent = 'No new products available at this time.';
    block.appendChild(message);
    return;
  }

  // Accessibility setup
  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', placeholders.newProductsSlider || 'New Products Slider');
  block.setAttribute('aria-label', placeholders.newProducts || 'New Products');

  // Create slider structure
  const container = document.createElement('div');
  container.className = 'featured-products-container';

  const slidesWrapper = document.createElement('ul');
  slidesWrapper.className = 'featured-products-slides';
  slidesWrapper.setAttribute('role', 'tablist');

  // Create navigation
  const navigation = document.createElement('div');
  navigation.className = 'featured-products-navigation';
  
  const prevButton = document.createElement('button');
  prevButton.type = 'button';
  prevButton.className = 'featured-products-prev';
  prevButton.setAttribute('aria-label', placeholders.previousSlide || 'Previous Slide');
  prevButton.innerHTML = '‹';
  
  const nextButton = document.createElement('button');
  nextButton.type = 'button';
  nextButton.className = 'featured-products-next';
  nextButton.setAttribute('aria-label', placeholders.nextSlide || 'Next Slide');
  nextButton.innerHTML = '›';
  
  navigation.appendChild(prevButton);
  navigation.appendChild(nextButton);

  // Split products into slides
  const slides = [];
  for (let i = 0; i < products.length; i += productsPerSlide) {
    const slideProducts = products.slice(i, i + productsPerSlide);
    slides.push(slideProducts);
  }

  const isSingleSlide = slides.length < 2;

  // Create indicators if multiple slides
  let indicatorsContainer = null;
  if (!isSingleSlide) {
    indicatorsContainer = document.createElement('ol');
    indicatorsContainer.className = 'featured-products-indicators';
    indicatorsContainer.setAttribute('role', 'tablist');
    indicatorsContainer.setAttribute('aria-label', placeholders.slideControls || 'Slide controls');
  }

  // Create slides from products
  slides.forEach((slideProducts, idx) => {
    const slide = createSlide(slideProducts, idx, sliderId);
    slidesWrapper.appendChild(slide);

    if (indicatorsContainer) {
      const indicator = document.createElement('li');
      indicator.className = 'featured-products-indicator';
      indicator.dataset.targetSlide = idx;
      indicator.setAttribute('role', 'tab');
      
      const indicatorButton = document.createElement('button');
      indicatorButton.type = 'button';
      indicatorButton.setAttribute('aria-label', `${placeholders.showSlide || 'Show Slide'} ${idx + 1} ${placeholders.of || 'of'} ${slides.length}`);
      
      if (idx === 0) {
        indicatorButton.setAttribute('disabled', 'true');
      }
      
      indicator.appendChild(indicatorButton);
      indicatorsContainer.appendChild(indicator);
    }
  });

  container.appendChild(slidesWrapper);
  container.appendChild(navigation);
  
  block.appendChild(container);
  
  if (indicatorsContainer) {
    block.appendChild(indicatorsContainer);
  }

  block.dataset.activeSlide = '0';
  
  if (!isSingleSlide) {
    bindEvents(block);
  }
}
