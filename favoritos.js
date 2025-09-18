// favoritos.js
class FavoritosManager {
    constructor() {
      this.favoritosGrid = document.getElementById('favoritosGrid');
      this.favoritosVazio = document.getElementById('favoritosVazio');
      this.ordenarSelect = document.getElementById('ordenarFavoritos');
      this.limparBtn = document.getElementById('limparFavoritos');
      this.favoritos = [];
      
      this.init();
    }
    
    init() {
      this.carregarFavoritos();
      this.configurarEventListeners();
      this.renderizarFavoritos();
      this.atualizarContadorHeader();
    }
    
    carregarFavoritos() {
      try {
        const favoritosData = localStorage.getItem('indexsbook_favorites');
        this.favoritos = favoritosData ? JSON.parse(favoritosData) : [];
      } catch (error) {
        console.error('Erro ao carregar favoritos:', error);
        this.favoritos = [];
      }
    }
    
    configurarEventListeners() {
      // Ordenação
      this.ordenarSelect.addEventListener('change', () => {
        this.ordenarFavoritos(this.ordenarSelect.value);
      });
      
      // Limpar favoritos
      this.limparBtn.addEventListener('click', () => {
        this.limparTodosFavoritos();
      });
      
      // Event delegation para os botões de ação
      this.favoritosGrid.addEventListener('click', (e) => {
        const card = e.target.closest('.favorito-card');
        if (!card) return;
        
        const productId = card.dataset.id;
        
        if (e.target.closest('.btn-remover-favorito')) {
          this.removerFavorito(productId, card);
        } else if (e.target.closest('.btn-adicionar-carrinho')) {
          this.adicionarAoCarrinho(productId);
        }
      });
    }
    
    ordenarFavoritos(criterio) {
      switch(criterio) {
        case 'recentes':
          this.favoritos.sort((a, b) => 
            new Date(b.favoritedAt) - new Date(a.favoritedAt)
          );
          break;
        case 'antigos':
          this.favoritos.sort((a, b) => 
            new Date(a.favoritedAt) - new Date(b.favoritedAt)
          );
          break;
        case 'titulo':
          this.favoritos.sort((a, b) => 
            a.title.localeCompare(b.title)
          );
          break;
        case 'preco':
          this.favoritos.sort((a, b) => 
            a.price - b.price
          );
          break;
      }
      
      this.renderizarFavoritos();
    }
    
    renderizarFavoritos() {
      if (this.favoritos.length === 0) {
        this.mostrarEstadoVazio();
        return;
      }
      
      this.esconderEstadoVazio();
      
      this.favoritosGrid.innerHTML = this.favoritos.map(favorito => `
        <div class="favorito-card" data-id="${favorito.id}">
          <div class="favorito-data">
            ${this.formatarData(favorito.favoritedAt)}
          </div>
          <img src="${favorito.image}" alt="${favorito.title}" class="favorito-imagem" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlbSBuw6NvIGVuY29udHJhZGE8L3RleHQ+PC9zdmc+'>
          <div class="favorito-info">
            <h3 class="favorito-titulo">${this.escapeHtml(favorito.title)}</h3>
            <p class="favorito-autor">${favorito.author ? this.escapeHtml(favorito.author) : 'Autor não informado'}</p>
            <p class="favorito-preco">R$ ${favorito.price.toFixed(2).replace('.', ',')}</p>
            <div class="favorito-acoes">
              <button class="btn-adicionar-carrinho">Adicionar ao Carrinho</button>
              <button class="btn-remover-favorito" title="Remover dos favoritos">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      `).join('');
    }
    
    remouterFavorito(productId, cardElement) {
      const index = this.favoritos.findIndex(item => item.id === productId);
      
      if (index > -1) {
        // Animação de remoção
        cardElement.style.opacity = '0';
        cardElement.style.transform = 'translateX(100px)';
        cardElement.style.transition = 'all 0.3s ease';
        
        setTimeout(() => {
          this.favoritos.splice(index, 1);
          this.salvarFavoritos();
          this.renderizarFavoritos();
          this.atualizarContadorHeader();
          this.mostrarNotificacao('Livro removido dos favoritos', 'success');
        }, 300);
      }
    }
    
    adicionarAoCarrinho(productId) {
      const produto = this.favoritos.find(item => item.id === productId);
      
      if (produto && typeof window.indexsBook !== 'undefined') {
        window.indexsBook.addToCart(productId, { 
          querySelector: () => ({ 
            closest: () => ({ 
              querySelector: () => ({ textContent: produto.title }) 
            }) 
          }) 
        });
        this.mostrarNotificacao('Adicionado ao carrinho!', 'success');
      }
    }
    
    limparTodosFavoritos() {
      if (this.favoritos.length === 0) return;
      
      if (confirm('Tem certeza que deseja remover todos os favoritos?')) {
        this.favoritos = [];
        this.salvarFavoritos();
        this.renderizarFavoritos();
        this.atualizarContadorHeader();
        this.mostrarNotificacao('Todos os favoritos foram removidos', 'info');
      }
    }
    
    salvarFavoritos() {
      try {
        localStorage.setItem('indexsbook_favorites', JSON.stringify(this.favoritos));
      } catch (error) {
        console.error('Erro ao salvar favoritos:', error);
      }
    }
    
    mostrarEstadoVazio() {
      this.favoritosGrid.style.display = 'none';
      this.favoritosVazio.style.display = 'block';
    }
    
    esconderEstadoVazio() {
      this.favoritosGrid.style.display = 'grid';
      this.favoritosVazio.style.display = 'none';
    }
    
    atualizarContadorHeader() {
      const favoritosIcon = document.querySelector('.cabecalho__icones a[aria-label="Favoritos"]');
      if (favoritosIcon) {
        favoritosIcon.dataset.count = this.favoritos.length;
        favoritosIcon.setAttribute('aria-label', `Favoritos com ${this.favoritos.length} itens`);
        
        // Adicionar classe ativa se houver favoritos
        if (this.favoritos.length > 0) {
          favoritosIcon.classList.add('icone-ativo');
        } else {
          favoritosIcon.classList.remove('icone-ativo');
        }
      }
    }
    
    formatarData(dataString) {
      const data = new Date(dataString);
      return data.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
    
    escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }
    
    mostrarNotificacao(mensagem, tipo = 'info') {
      if (typeof window.showNotification === 'function') {
        window.showNotification(mensagem, tipo);
      } else {
        // Fallback simples
        alert(mensagem);
      }
    }
  }
  
  // Função para redirecionar para favoritos
  function redirectToFavorites() {
    window.location.href = 'favoritos.html';
  }
  
  // Inicializar quando o DOM estiver pronto
  document.addEventListener('DOMContentLoaded', function() {
    const favoritosManager = new FavoritosManager();
    
    // Adicionar event listener para o ícone de favoritos no header
    const favoritosIcon = document.querySelector('.cabecalho__icones a[aria-label="Favoritos"]');
    if (favoritosIcon) {
      favoritosIcon.addEventListener('click', function(e) {
        e.preventDefault();
        redirectToFavorites();
      });
    }
  });
  
  // Caso a página seja carregada via AJAX ou SPA
  if (typeof window !== 'undefined') {
    window.FavoritosManager = FavoritosManager;
    window.redirectToFavorites = redirectToFavorites;
  }