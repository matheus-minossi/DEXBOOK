
const CONFIG = {
  debounceDelay: 100,
  scrollThreshold: 50,
  animationDuration: 300
};

const APP_STATE = {
  cart: [],
  favorites: [],
  searchTerm: '',
  currentPage: 1
};

document.addEventListener('DOMContentLoaded', function() {
  initializeApp();
});

function initializeApp() {
  initializeHeader();
  initializeSwiper();
  initializeFilters();
  initializeCart();
  initializeNewsletter();
  initializeSearch();
  loadPersistedData();
}

function initializeHeader() {
  const header = document.querySelector('.cabecalho');
  const toggleButton = document.getElementById('toggleMenu');
  const menu = document.getElementById('listaMenu');
  const overlay = document.querySelector('.menu-overlay');

  if (!header || !toggleButton || !menu) {
    console.warn('Elementos do header não encontrados');
    return;
  }

  const scrollHandler = debounce(function() {
    const shouldAddClass = window.scrollY > CONFIG.scrollThreshold;
    header.classList.toggle('scrolled', shouldAddClass);
  }, CONFIG.debounceDelay);

  window.addEventListener('scroll', scrollHandler);
  scrollHandler(); 

  toggleButton.addEventListener('click', toggleMenu);
  
  if (overlay) {
    overlay.addEventListener('click', closeMenu);
  }

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && menu.getAttribute('aria-hidden') === 'false') {
      closeMenu();
    }
  });

  document.addEventListener('click', function(e) {
    if (!menu.contains(e.target) && 
        !toggleButton.contains(e.target) && 
        menu.getAttribute('aria-hidden') === 'false') {
      closeMenu();
    }
  });

  function toggleMenu() {
    const isExpanded = toggleButton.getAttribute('aria-expanded') === 'true';
    toggleButton.setAttribute('aria-expanded', !isExpanded);
    menu.setAttribute('aria-hidden', isExpanded);
    
    if (overlay) {
      overlay.classList.toggle('active', !isExpanded);
    }
    
    document.body.style.overflow = !isExpanded ? 'hidden' : '';
  }

  function closeMenu() {
    toggleButton.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-hidden', 'true');
    
    if (overlay) {
      overlay.classList.remove('active');
    }
    
    document.body.style.overflow = '';
  }
}

function initializeSwiper() {
  const swiperElement = document.querySelector('.swiper');
  
  if (!swiperElement) {
    console.warn('Elemento Swiper não encontrado');
    return;
  }

  if (typeof Swiper === 'undefined') {
    console.warn('Swiper não carregado. Verifique se o script foi incluído.');
    
    loadSwiperScript();
    return;
  }

  try {
    const swiper = new Swiper('.swiper', {
      speed: 400,
      spaceBetween: 20,
      slidesPerView: 'auto',
      centeredSlides: false,
      loop: false,
      grabCursor: true,
      
      pagination: {
        el: '.swiper-pagination',
        type: 'bullets',
        clickable: true,
        dynamicBullets: true
      },
      
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
      
     breakpoints: {
        320: {
          slidesPerView: 1,
          spaceBetween: 10
        },
        640: {
          slidesPerView: 2,
          spaceBetween: 15
        },
        768: {
          slidesPerView: 3,
          spaceBetween: 20
        },
        1024: {
          slidesPerView: 4,
          spaceBetween: 20
        }
      },
      
      a11y: {
        enabled: true,
        prevSlideMessage: 'Slide anterior',
        nextSlideMessage: 'Próximo slide',
        firstSlideMessage: 'Este é o primeiro slide',
        lastSlideMessage: 'Este é o último slide',
        paginationBulletMessage: 'Ir para slide {{index}}',
        notificationClass: 'swiper-notification'
      },
      
      on: {
        init: function() {
          console.log('Swiper inicializado com sucesso');
        },
        error: function(error) {
          console.error('Erro no Swiper:', error);
        }
      }
    });
    
    return swiper;
    
  } catch (error) {
    console.error('Erro ao inicializar Swiper:', error);
    
    const slides = document.querySelectorAll('.swiper-slide');
    slides.forEach(slide => {
      slide.style.display = 'block';
      slide.style.margin = '10px';
    });
  }
}

function loadSwiperScript() {
  if (typeof Swiper !== 'undefined') return;
  
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js';
  script.onload = function() {
    console.log('Swiper carregado dinamicamente');
    setTimeout(initializeSwiper, 100);
  };
  script.onerror = function() {
    console.error('Falha ao carregar o Swiper');
  };
  document.head.appendChild(script);
}

function initializeFilters() {
  const filtroCategoria = document.querySelector('.filtro[aria-label="Filtrar por categoria"]');
  const filtroOrdem = document.querySelector('.filtro[aria-label="Ordenar por"]');
  
  if (!filtroCategoria || !filtroOrdem) return;

  const applyFilters = debounce(function() {
    filtrarEOrdenarLivros();
  }, CONFIG.debounceDelay);

  filtroCategoria.addEventListener('change', applyFilters);
  filtroOrdem.addEventListener('change', applyFilters);
}

function filtrarEOrdenarLivros() {
  const livrosGrid = document.querySelector('.livros-grid');
  const livroCards = document.querySelectorAll('.livro-card');
  const filtroCategoria = document.querySelector('.filtro[aria-label="Filtrar por categoria"]');
  const filtroOrdem = document.querySelector('.filtro[aria-label="Ordenar por"]');
  
  if (!livrosGrid || !filtroCategoria || !filtroOrdem) return;
  
  const categoria = filtroCategoria.value;
  const ordem = filtroOrdem.value;
  
  livrosGrid.classList.add('carregando');
  
  setTimeout(() => {
    let livrosArray = Array.from(livroCards);
    
    if (categoria !== 'todos') {
      livrosArray = livrosArray.filter(livro => {
        return livro.dataset.categoria === categoria;
      });
    }
    
    livrosArray.sort((a, b) => {
      switch(ordem) {
        case 'recentes':
          return (b.dataset.data || 0) - (a.dataset.data || 0);
        case 'antigos':
          return (a.dataset.data || 0) - (b.dataset.data || 0);
        case 'preco':
          return (a.dataset.preco || 0) - (b.dataset.preco || 0);
        case 'popularidade':
          return (b.dataset.popularidade || 0) - (a.dataset.popularidade || 0);
        default:
          return 0;
      }
    });
    
    // Reordenar no DOM
    const livrosContainer = livrosGrid.parentNode;
    livrosArray.forEach(livro => {
      livrosContainer.appendChild(livro);
    });
    
    livrosGrid.classList.remove('carregando');
  }, 300);
}

function initializeSearch() {
  const searchInput = document.querySelector('.banner__pesquisa');
  if (!searchInput) return;
  
  const searchHandler = debounce(function() {
    APP_STATE.searchTerm = this.value.trim().toLowerCase();
    performSearch();
  }, CONFIG.debounceDelay);
  
  searchInput.addEventListener('input', searchHandler);
}

function performSearch() {
  const searchTerm = APP_STATE.searchTerm;
  
  if (!searchTerm) {
    const livros = document.querySelectorAll('.livro-card, .card');
    livros.forEach(livro => {
      livro.style.display = 'block';
    });
    return;
  }
  
  const livros = document.querySelectorAll('.livro-card, .card');
  livros.forEach(livro => {
    const title = livro.querySelector('.descricao__titulo-livro, .livro-titulo')?.textContent.toLowerCase() || '';
    const author = livro.querySelector('.livro-autor')?.textContent.toLowerCase() || '';
    const description = livro.querySelector('.descricao__texto')?.textContent.toLowerCase() || '';
    
    const isMatch = title.includes(searchTerm) || 
                   author.includes(searchTerm) || 
                   description.includes(searchTerm);
    
    livro.style.display = isMatch ? 'block' : 'none';
  });
}

function initializeCart() {
  updateCartCount();
  updateFavoritesCount();
  
  document.querySelectorAll('.livro-botao, .botoes__ancora').forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      const productCard = this.closest('.livro-card, .card');
      const productId = productCard?.dataset.id || generateProductId(productCard);
      
      if (this.classList.contains('livro-botao') || this.textContent.includes('Carrinho') || this.textContent.includes('Saiba mais')) {
        addToCart(productId, productCard);
      } else if (this.textContent.includes('Favoritos')) {
        toggleFavorite(productId, productCard);
      }
    });
  });
}

function initializeNewsletter() {
  const newsletterForm = document.querySelector('.newsletter-form');
  
  if (!newsletterForm) return;
  
  newsletterForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const emailInput = this.querySelector('input[type="email"]');
    const email = emailInput.value.trim();
    
    if (validateEmail(email)) {
      subscribeNewsletter(email);
      emailInput.value = '';
      showNotification('Inscrição realizada com sucesso!', 'success');
    } else {
      showNotification('Por favor, insira um e-mail válido.', 'error');
    }
  });
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function addToCart(productId, productElement) {
  const productInfo = extractProductInfo(productElement);
  
  const existingItemIndex = APP_STATE.cart.findIndex(item => item.id === productId);
  
  if (existingItemIndex > -1) {
    APP_STATE.cart[existingItemIndex].quantity += 1;
  } else {
    APP_STATE.cart.push({
      id: productId,
      ...productInfo,
      quantity: 1,
      addedAt: new Date().toISOString()
    });
  }
  
  updateCartCount();
  persistData();
  showNotification(`${productInfo.title} adicionado ao carrinho!`, 'success');
  
  if (productElement) {
    productElement.classList.add('adicionado');
    setTimeout(() => {
      productElement.classList.remove('adicionado');
    }, CONFIG.animationDuration);
  }
}

function toggleFavorite(productId, productElement) {
  const productInfo = extractProductInfo(productElement);
  const existingIndex = APP_STATE.favorites.findIndex(item => item.id === productId);
  
  if (existingIndex > -1) {
    APP_STATE.favorites.splice(existingIndex, 1);
    showNotification(`${productInfo.title} removido dos favoritos.`, 'info');
  } else {
    APP_STATE.favorites.push({
      id: productId,
      ...productInfo,
      favoritedAt: new Date().toISOString()
    });
    showNotification(`${productInfo.title} adicionado aos favoritos!`, 'success');
  }
  
  updateFavoritesCount();
  persistData();
}

function extractProductInfo(productElement) {
  const title = productElement.querySelector('.descricao__titulo-livro, .livro-titulo')?.textContent || 'Produto sem nome';
  const priceText = productElement.querySelector('.livro-preco')?.textContent || '';
  const price = parseFloat(priceText.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
  const image = productElement.querySelector('img')?.src || '';
  const author = productElement.querySelector('.livro-autor')?.textContent || '';
  
  return { title, price, image, author };
}

function generateProductId(element) {
  const title = element.querySelector('.descricao__titulo-livro, .livro-titulo')?.textContent || '';
  return 'product-' + Math.random().toString(36).substr(2, 9) + '-' + title.replace(/\s+/g, '-').toLowerCase();
}

function updateCartCount() {
  const totalItems = APP_STATE.cart.reduce((total, item) => total + item.quantity, 0);
  const cartIcon = document.querySelector('.cabecalho__icones a[aria-label="Carrinho"]');
  
  if (cartIcon) {
    cartIcon.dataset.count = totalItems;
    cartIcon.setAttribute('aria-label', `Carrinho com ${totalItems} itens`);
  }
}
function updateFavoritesCount() {
  const favoriteIcon = document.querySelector('.cabecalho__icones a[aria-label="Favoritos"]');
  
  if (favoriteIcon) {
    favoriteIcon.dataset.count = APP_STATE.favorites.length;
    favoriteIcon.setAttribute('aria-label', `Favoritos com ${APP_STATE.favorites.length} itens`);
  }
}

function persistData() {
  try {
    localStorage.setItem('indexsbook_cart', JSON.stringify(APP_STATE.cart));
    localStorage.setItem('indexsbook_favorites', JSON.stringify(APP_STATE.favorites));
  } catch (error) {
    console.error('Erro ao salvar dados no localStorage:', error);
  }
}
function loadPersistedData() {
  try {
    const cartData = localStorage.getItem('indexsbook_cart');
    const favoritesData = localStorage.getItem('indexsbook_favorites');
    
    if (cartData) APP_STATE.cart = JSON.parse(cartData);
    if (favoritesData) APP_STATE.favorites = JSON.parse(favoritesData);
    
    updateCartCount();
    updateFavoritesCount();
  } catch (error) {
    console.error('Erro ao carregar dados do localStorage:', error);
    localStorage.removeItem('indexsbook_cart');
    localStorage.removeItem('indexsbook_favorites');
  }
}

function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

function subscribeNewsletter(email) {
  console.log('Inscrito na newsletter:', email);
}

function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 100px;
    right: 20px;
    padding: 15px 20px;
    background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#F44336' : '#2196F3'};
    color: white;
    border-radius: 4px;
    z-index: 10000;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    animation: slideIn 0.3s ease;
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 3000);
}

if (!document.querySelector('#swiper-notification-styles')) {
  const style = document.createElement('style');
  style.id = 'swiper-notification-styles';
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(100%); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
}

if (typeof window !== 'undefined') {
  window.APP_STATE = APP_STATE;
  window.indexsBook = {
    addToCart,
    toggleFavorite,
    updateCartCount,
    updateFavoritesCount
  };
}

/**
 * Inicializa funcionalidades de favoritos
 */
function initializeFavorites() {
  // Atualizar contadores
  updateFavoritesCount();
  
  // Adicionar event listeners aos botões de favorito
  document.querySelectorAll('.botoes__favorito, .livro-favorito').forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      const productCard = this.closest('.card, .livro-card');
      const productId = this.dataset.id || generateProductId(productCard);
      
      toggleFavorite(productId, productCard, this);
    });
  });
  
  // Verificar e marcar favoritos já existentes
  markExistingFavorites();
}

/**
 * Marca os favoritos já existentes na interface
 */
function markExistingFavorites() {
  document.querySelectorAll('.card, .livro-card').forEach(card => {
    const productId = card.dataset.id || generateProductId(card);
    const favoriteButton = card.querySelector('.botoes__favorito, .livro-favorito');
    
    if (favoriteButton && APP_STATE.favorites.some(item => item.id === productId)) {
      favoriteButton.classList.add('ativo');
      favoriteButton.setAttribute('aria-label', 'Remover dos favoritos');
    }
  });
}

/**
 * Alternar produto nos favoritos (versão melhorada)
 */
function toggleFavorite(productId, productElement, buttonElement) {
  const productInfo = extractProductInfo(productElement);
  const existingIndex = APP_STATE.favorites.findIndex(item => item.id === productId);
  
  if (existingIndex > -1) {
    // Remover dos favoritos
    APP_STATE.favorites.splice(existingIndex, 1);
    if (buttonElement) {
      buttonElement.classList.remove('ativo');
      buttonElement.setAttribute('aria-label', 'Adicionar aos favoritos');
    }
    showNotification(`${productInfo.title} removido dos favoritos.`, 'info');
  } else {
    // Adicionar aos favoritos
    APP_STATE.favorites.push({
      id: productId,
      ...productInfo,
      favoritedAt: new Date().toISOString()
    });
    if (buttonElement) {
      buttonElement.classList.add('ativo');
      buttonElement.setAttribute('aria-label', 'Remover dos favoritos');
    }
    showNotification(`${productInfo.title} adicionado aos favoritos!`, 'success');
  }
  
  // Atualizar UI e persistir dados
  updateFavoritesCount();
  persistData();
}

// Adicione a chamada para initializeFavorites na função initializeApp
function initializeApp() {
  initializeHeader();
  initializeSwiper();
  initializeFilters();
  initializeCart();
  initializeFavorites(); // ← Adicione esta linha
  initializeNewsletter();
  initializeSearch();
  loadPersistedData();
}

/**
 * Inicializa funcionalidades de favoritos
 */
function initializeFavorites() {
  // Atualizar contadores
  updateFavoritesCount();
  
  // Adicionar event listeners aos botões de favorito
  document.querySelectorAll('.botoes__favorito, .livro-favorito').forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      const productCard = this.closest('.card, .livro-card');
      const productId = this.dataset.id || generateProductId(productCard);
      
      toggleFavorite(productId, productCard, this);
    });
  });
  
  // Verificar e marcar favoritos já existentes
  markExistingFavorites();
}

/**
 * Marca os favoritos já existentes na interface
 */
function markExistingFavorites() {
  document.querySelectorAll('.card, .livro-card').forEach(card => {
    const productId = card.dataset.id || generateProductId(card);
    const favoriteButton = card.querySelector('.botoes__favorito, .livro-favorito');
    
    if (favoriteButton && APP_STATE.favorites.some(item => item.id === productId)) {
      favoriteButton.classList.add('ativo');
      favoriteButton.setAttribute('aria-label', 'Remover dos favoritos');
    }
  });
}

/**
 * Alternar produto nos favoritos (versão melhorada)
 */
function toggleFavorite(productId, productElement, buttonElement) {
  const productInfo = extractProductInfo(productElement);
  const existingIndex = APP_STATE.favorites.findIndex(item => item.id === productId);
  
  if (existingIndex > -1) {
    // Remover dos favoritos
    APP_STATE.favorites.splice(existingIndex, 1);
    if (buttonElement) {
      buttonElement.classList.remove('ativo');
      buttonElement.setAttribute('aria-label', 'Adicionar aos favoritos');
    }
    showNotification(`${productInfo.title} removido dos favoritos.`, 'info');
  } else {
    // Adicionar aos favoritos
    APP_STATE.favorites.push({
      id: productId,
      ...productInfo,
      favoritedAt: new Date().toISOString()
    });
    if (buttonElement) {
      buttonElement.classList.add('ativo');
      buttonElement.setAttribute('aria-label', 'Remover dos favoritos');
    }
    showNotification(`${productInfo.title} adicionado aos favoritos!`, 'success');
  }
  
  // Atualizar UI e persistir dados
  updateFavoritesCount();
  persistData();
}

/**
 * Navega para a página de favoritos
 */
function goToFavorites() {
  window.location.href = 'favoritos.html';
}

// Adicione a chamada para initializeFavorites na função initializeApp
function initializeApp() {
  initializeHeader();
  initializeSwiper();
  initializeFilters();
  initializeCart();
  initializeFavorites(); // ← Adicione esta linha
  initializeNewsletter();
  initializeSearch();
  loadPersistedData();
  
  // Configurar clique no ícone de favoritos do header
  const favoritosIcon = document.querySelector('.cabecalho__icones a[aria-label="Favoritos"]');
  if (favoritosIcon) {
    favoritosIcon.addEventListener('click', function(e) {
      e.preventDefault();
      goToFavorites();
    });
  }
}

// Torne estas funções disponíveis globalmente
if (typeof window !== 'undefined') {
  window.indexsBook = {
    addToCart,
    toggleFavorite,
    updateCartCount,
    updateFavoritesCount,
    goToFavorites
  };
}

/**
 * Atualiza contador de favoritos no header
 */
function updateFavoritesCount() {
  const favoriteIcon = document.querySelector('.cabecalho__icones a[aria-label="Favoritos"]');
  
  if (favoriteIcon) {
    favoriteIcon.dataset.count = APP_STATE.favorites.length;
    favoriteIcon.setAttribute('aria-label', `Favoritos com ${APP_STATE.favorites.length} itens`);
    
    // Adicionar classe ativa se houver favoritos
    if (APP_STATE.favorites.length > 0) {
      favoriteIcon.classList.add('icone-ativo');
    } else {
      favoriteIcon.classList.remove('icone-ativo');
    }
  }
}