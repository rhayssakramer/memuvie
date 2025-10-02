import { Component, OnInit, OnDestroy } from '@angular/core';
import { Location } from '@angular/common';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ProfileMenuComponent } from '../../shared/profile-menu/profile-menu.component';
import { HeaderComponent } from '../../shared/header/header.component'; // Manter importação do componente de cabeçalho
import { DotsBackgroundComponent } from '../../shared/dots-background/dots-background.component';
import { logoutAll, getProfile } from '../../utils/auth';
import { GaleriaService, GaleriaPost } from '../../services/galeria.service';
import { ToastService } from '../../services/toast.service';

interface GalleryItem {
  id: number;
  userName: string;
  userPhoto: string;
  photo: string | null;
  video?: string | null;
  message: string;
  date: Date | string;
  userEmail?: string; // Email do usuário que criou o post
}

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, DotsBackgroundComponent] // Remove ProfileMenuComponent das importações
})
export class GalleryComponent implements OnInit, OnDestroy {
  selectedItem: GalleryItem | null = null;
  itemToDelete: GalleryItem | null = null;
  galleryItems: GalleryItem[] = [];
  isLoading: boolean = false;
  error: string | null = null;
  showEmojiSelector: boolean = false;
  showModalEmojiSelector: boolean = false;
  currentEmojiItem: GalleryItem | null = null;
  userReactions: Map<number, string> = new Map(); // Armazenar reações por ID do item
  reactionCounts: Map<number, {curtir: number, gostei: number, festejar: number}> = new Map(); // Contagens de reações por item
  lastReactions: Map<number, string> = new Map(); // Última reação recebida por item (para exibição do ícone)
  
  // Variáveis para controle de interação
  private pressTimer: any = null;
  private isLongPress: boolean = false;
  private readonly LONG_PRESS_DELAY = 500; // 500ms para detectar pressionar longo
  private readonly DEFAULT_REACTION = 'curtir';

  constructor(
    private router: Router, 
    private location: Location,
    private galeriaService: GaleriaService,
    private toastService: ToastService
  ) {}

  private documentClickListener: any;

  ngOnInit() {
    // Importar a função syncUserData
    import('../../utils/auth').then(auth => {
      // Garantir que os dados do usuário estejam sincronizados
      auth.syncUserData();
    });

    // Fechar seletor de emoji quando clicar fora
    this.documentClickListener = () => {
      this.showEmojiSelector = false;
      this.currentEmojiItem = null;
      // Não fechamos o modal aqui para não afetar a experiência do usuário
    };
    
    document.addEventListener('click', this.documentClickListener);

    this.loadGalleryPosts();
  }
  
  ngOnDestroy() {
    // Remover o event listener quando o componente for destruído
    if (this.documentClickListener) {
      document.removeEventListener('click', this.documentClickListener);
    }
    
    // Limpar timers pendentes
    if (this.pressTimer) {
      clearTimeout(this.pressTimer);
      this.pressTimer = null;
    }
  }

  /**
   * Carrega posts da galeria a partir do backend
   */
  loadGalleryPosts() {
    this.isLoading = true;
    this.error = null;

    this.galeriaService.getPosts().subscribe({
      next: (posts) => {
        console.log('Posts carregados do backend:', posts);
        // Converter os posts do backend para o formato de exibição da galeria
        this.galleryItems = this.mapBackendPostsToGalleryItems(posts);
        this.isLoading = false;
        
        if (posts.length === 0) {
          this.toastService.info('A galeria está vazia. Seja o primeiro a compartilhar algo especial!');
        }
      },
      error: (err) => {
        console.error('Erro ao carregar posts da galeria:', err);
        this.error = 'Não foi possível carregar as publicações. Tente novamente mais tarde.';
        this.isLoading = false;
        
        this.toastService.error('Não foi possível conectar ao servidor. Mostrando conteúdo local.');
        
        // Fallback para o localStorage se o backend não estiver disponível
        this.loadFromLocalStorage();
      }
    });
  }

  /**
   * Carrega posts do localStorage como fallback caso o backend falhe
   */
  private loadFromLocalStorage() {
    console.log('Tentando carregar posts do localStorage como fallback...');
    const raw = localStorage.getItem('posts');
    if (raw) {
      try {
        const items = JSON.parse(raw) as GalleryItem[];
        this.galleryItems = items.filter(item => {
          // Filtra posts inválidos ou corrompidos
          return !(item.photo === "[object Object]" || 
                 (typeof item.photo === 'object' && item.photo !== null) ||
                 item.video === "[object Object]" ||
                 (typeof item.video === 'object' && item.video !== null));
        });
        console.log('Posts carregados do localStorage:', this.galleryItems.length);
      } catch (e) {
        console.error('Erro ao carregar do localStorage:', e);
      }
    }
  }

  /**
   * Converte posts do backend para o formato usado na galeria
   */
  private mapBackendPostsToGalleryItems(posts: GaleriaPost[]): GalleryItem[] {
    const items = posts.map(post => ({
      id: post.id || Date.now(),
      userName: post.usuario?.nome || 'Usuário',
      userPhoto: post.usuario?.fotoPerfil || 'assets/avatar-1.jpg',
      photo: post.fotoUrl || null,
      video: post.videoUrl || null,
      message: post.mensagem || '',
      date: post.dataCriacao || new Date().toISOString(),
      userEmail: post.usuario?.email // Adicionar o email do usuário para verificar propriedade
    }));

    // Inicializar contagens de reações para cada item
    items.forEach(item => {
      this.initializeReactionCounts(item.id);
    });

    // Simular algumas reações automáticas após um tempo (apenas para demonstração)
    this.simulateAutomaticReactions(items);

    return items;
  }

  /**
   * Inicializa as contagens de reações para um item
   */
  private initializeReactionCounts(itemId: number) {
    // Por enquanto, vamos simular algumas contagens aleatórias
    // Em uma aplicação real, esses dados viriam do backend
    const randomCounts = {
      curtir: Math.floor(Math.random() * 10), 
      gostei: Math.floor(Math.random() * 8),
      festejar: Math.floor(Math.random() * 5)
    };
    
    this.reactionCounts.set(itemId, randomCounts);
    
    // Definir uma última reação aleatória se houver alguma contagem > 0
    const totalCount = randomCounts.curtir + randomCounts.gostei + randomCounts.festejar;
    if (totalCount > 0) {
      const reactionTypes = ['curtir', 'gostei', 'festejar'];
      const availableReactions = reactionTypes.filter(type => randomCounts[type as keyof typeof randomCounts] > 0);
      if (availableReactions.length > 0) {
        const lastReaction = availableReactions[Math.floor(Math.random() * availableReactions.length)];
        this.lastReactions.set(itemId, lastReaction);
      }
    }
  }

  openModal(item: GalleryItem) {
    this.selectedItem = item;
    this.showEmojiSelector = false;
    this.showModalEmojiSelector = false;
  }

  closeModal() {
    this.selectedItem = null;
    this.showModalEmojiSelector = false;
  }
  
  toggleEmojiSelector(item: GalleryItem) {
    // Método mantido para compatibilidade com seletores de emoji
    // Se o seletor já está aberto para este item, feche-o
    if (this.showEmojiSelector && this.currentEmojiItem?.id === item.id) {
      this.showEmojiSelector = false;
      this.currentEmojiItem = null;
    } else {
      // Caso contrário, abra o seletor para este item
      this.showEmojiSelector = true;
      this.currentEmojiItem = item;
      // Feche o seletor modal se estiver aberto
      this.showModalEmojiSelector = false;
    }
  }
  
  toggleModalEmojiSelector() {
    // Método mantido para compatibilidade com seletores de emoji
    this.showModalEmojiSelector = !this.showModalEmojiSelector;
    // Feche o seletor do card se estiver aberto
    this.showEmojiSelector = false;
    this.currentEmojiItem = null;
  }
  
  selectEmoji(item: GalleryItem, emojiType: string) {
    if (!item) return;
    
    // Verificar se já havia uma reação anterior para remover da contagem
    const previousReaction = this.userReactions.get(item.id);
    if (previousReaction) {
      this.decrementReactionCount(item.id, previousReaction);
    }
    
    // Armazenar a nova reação do usuário
    this.userReactions.set(item.id, emojiType);
    
    // Incrementar a contagem da nova reação
    this.incrementReactionCount(item.id, emojiType);
    
    // Atualizar a última reação (sempre que alguém reage, essa vira a última)
    this.lastReactions.set(item.id, emojiType);
    
    // Esta função seria conectada ao backend em uma implementação real
    // Por enquanto, apenas simule a ação e mostre feedback ao usuário
    console.log(`Emoji ${emojiType} selecionado para o post de ${item.userName}`);
    
    // Feedback visual para o usuário
    this.toastService.success(`Você reagiu com ${emojiType} ao post de ${item.userName}`);
    
    // Feche os seletores após a escolha
    this.showEmojiSelector = false;
    this.showModalEmojiSelector = false;
    this.currentEmojiItem = null;
  }

  // Método para remover reação
  removeReaction(item: GalleryItem) {
    if (!item) return;
    
    const reactionType = this.userReactions.get(item.id);
    if (reactionType) {
      // Decrementar a contagem da reação removida
      this.decrementReactionCount(item.id, reactionType);
      
      // Remover a reação do usuário
      this.userReactions.delete(item.id);
      
      // Se não há mais reações, limpar a última reação
      const totalReactions = this.getTotalReactions(item.id);
      if (totalReactions === 0) {
        this.lastReactions.delete(item.id);
      }
      
      this.toastService.info(`Reação removida do post de ${item.userName}`);
    }
    
    // Feche os seletores
    this.showEmojiSelector = false;
    this.showModalEmojiSelector = false;
    this.currentEmojiItem = null;
  }

  // Método para detectar se é dispositivo móvel
  private isMobileDevice(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           ('ontouchstart' in window) ||
           (navigator.maxTouchPoints > 0);
  }

  // Método para lidar com clique rápido no ícone emoji
  handleEmojiClick(item: GalleryItem, event: Event) {
    event.stopPropagation();
    
    const currentReaction = this.getReaction(item.id);
    
    if (currentReaction) {
      // Se já tem reação, remove
      this.removeReaction(item);
    } else {
      // Se não tem reação, adiciona a reação padrão
      this.selectEmoji(item, this.DEFAULT_REACTION);
    }
  }

  // Método para lidar com clique no emoji quando já selecionado
  handleSelectedEmojiClick(item: GalleryItem, event: Event) {
    event.stopPropagation();
    
    if (this.isLongPress) {
      // Se foi um clique longo, não remove a reação, apenas mostra o seletor
      this.isLongPress = false;
      return;
    }
    
    // Se foi um clique rápido, remove a reação
    this.removeReaction(item);
  }

  // Método para mouse hover (Web)
  handleMouseEnter(item: GalleryItem) {
    if (!this.isMobileDevice()) {
      // Delay pequeno para evitar abertura acidental
      setTimeout(() => {
        if (!this.showEmojiSelector) {
          this.showEmojiSelector = true;
          this.currentEmojiItem = item;
          this.showModalEmojiSelector = false;
          
          // Adicionar classe de animação
          setTimeout(() => {
            const selector = document.querySelector('.emoji-selector');
            if (selector) {
              selector.classList.add('fade-in');
            }
          }, 10);
        }
      }, 300);
    }
  }

  // Método para mouse leave (Web)
  handleMouseLeave() {
    if (!this.isMobileDevice()) {
      // Delay para permitir movimento para o seletor
      setTimeout(() => {
        if (!this.isHoveringEmojiSelector()) {
          this.showEmojiSelector = false;
          this.currentEmojiItem = null;
        }
      }, 200);
    }
  }

  // Verificar se está com mouse sobre o seletor
  private isHoveringEmojiSelector(): boolean {
    const selector = document.querySelector('.emoji-selector');
    return selector && selector.matches(':hover') || false;
  }

  // Touch start para mobile - detectar pressionar longo
  handleTouchStartEmoji(event: TouchEvent, item: GalleryItem) {
    event.preventDefault();
    this.isLongPress = false;
    
    // Adicionar feedback visual imediato
    const button = event.currentTarget as HTMLElement;
    if (button) {
      button.classList.add('long-press-active');
    }
    
    this.pressTimer = setTimeout(() => {
      this.isLongPress = true;
      // Pressionar longo - mostrar seletor
      this.showEmojiSelector = true;
      this.currentEmojiItem = item;
      this.showModalEmojiSelector = false;
      
      // Vibração no dispositivo se disponível
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }, this.LONG_PRESS_DELAY);
  }

  // Touch end para mobile
  handleTouchEndEmoji(event: TouchEvent, item: GalleryItem) {
    // Remover feedback visual
    const button = event.currentTarget as HTMLElement;
    if (button) {
      button.classList.remove('long-press-active');
    }
    
    if (this.pressTimer) {
      clearTimeout(this.pressTimer);
      this.pressTimer = null;
    }
    
    if (!this.isLongPress) {
      // Se não foi pressionar longo, trata como clique rápido
      this.handleEmojiClick(item, event);
    }
    
    // Reset flag após um pequeno delay
    setTimeout(() => {
      this.isLongPress = false;
    }, 100);
  }

  // Métodos similares para modal
  handleModalEmojiClick(item: GalleryItem, event: Event) {
    if (!item) return;
    this.handleEmojiClick(item, event);
  }

  handleModalSelectedEmojiClick(item: GalleryItem, event: Event) {
    if (!item) return;
    this.handleSelectedEmojiClick(item, event);
  }

  handleModalMouseEnter(item: GalleryItem) {
    if (!item || this.isMobileDevice()) return;
    
    setTimeout(() => {
      if (!this.showModalEmojiSelector) {
        this.showModalEmojiSelector = true;
        this.showEmojiSelector = false;
        this.currentEmojiItem = null;
        
        // Adicionar classe de animação
        setTimeout(() => {
          const selector = document.querySelector('.modal-emoji-selector');
          if (selector) {
            selector.classList.add('fade-in');
          }
        }, 10);
      }
    }, 300);
  }

  handleModalMouseLeave() {
    if (!this.isMobileDevice()) {
      setTimeout(() => {
        const selector = document.querySelector('.modal-emoji-selector');
        if (!selector || !selector.matches(':hover')) {
          this.showModalEmojiSelector = false;
        }
      }, 200);
    }
  }

  handleModalTouchStartEmoji(event: TouchEvent) {
    if (!this.selectedItem) return;
    event.preventDefault();
    this.isLongPress = false;
    
    // Adicionar feedback visual imediato
    const button = event.currentTarget as HTMLElement;
    if (button) {
      button.classList.add('long-press-active');
    }
    
    this.pressTimer = setTimeout(() => {
      this.isLongPress = true;
      this.showModalEmojiSelector = true;
      this.showEmojiSelector = false;
      this.currentEmojiItem = null;
      
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }, this.LONG_PRESS_DELAY);
  }

  handleModalTouchEndEmoji(event: TouchEvent) {
    if (!this.selectedItem) return;
    
    // Remover feedback visual
    const button = event.currentTarget as HTMLElement;
    if (button) {
      button.classList.remove('long-press-active');
    }
    
    if (this.pressTimer) {
      clearTimeout(this.pressTimer);
      this.pressTimer = null;
    }
    
    if (!this.isLongPress) {
      this.handleModalEmojiClick(this.selectedItem, event);
    }
    
    setTimeout(() => {
      this.isLongPress = false;
    }, 100);
  }
  
  // Método para verificar se um item tem reação
  hasReaction(itemId: number): boolean {
    return this.userReactions.has(itemId);
  }
  
  // Método para obter a reação de um item
  getReaction(itemId: number): string | null {
    return this.userReactions.get(itemId) || null;
  }
  
  // Método para obter o contador de reações para o tooltip
  getReactionUsers(itemId: number): string {
    const reactionType = this.getReaction(itemId);
    if (!reactionType) return '';
    
    // Em uma aplicação real, buscaríamos o número de reações do backend
    // Para simulação, definiremos um contador para cada tipo
    const reactionCounts = {
      'curtir': 3,
      'gostei': 4,
      'festejar': 3
    };
    
    const count = reactionCounts[reactionType as keyof typeof reactionCounts] || 1;
    
    // Retorna apenas o número de reações
    return count.toString();
  }
  
  // Método para converter o tipo de reação em emoji
  getReactionEmoji(reactionType: string): string {
    const emojis = {
      'curtir': '👍',
      'gostei': '❤️',
      'festejar': '🥳'
    };
    return emojis[reactionType as keyof typeof emojis] || '👍';
  }

  // Método para obter o total de reações de um item
  getTotalReactions(itemId: number): number {
    const counts = this.reactionCounts.get(itemId);
    if (!counts) return 0;
    
    return counts.curtir + counts.gostei + counts.festejar;
  }

  // Método para verificar se o item tem reações (baseado no total)
  hasAnyReactions(itemId: number): boolean {
    return this.getTotalReactions(itemId) > 0;
  }

  // Método para obter a última reação de um item (para exibição do ícone)
  getLastReaction(itemId: number): string | null {
    return this.lastReactions.get(itemId) || null;
  }

  // Método para simular reação de outro usuário (para demonstração)
  simulateOtherUserReaction(itemId: number, reactionType: string, userName: string = 'Usuário') {
    // Incrementar a contagem da reação
    this.incrementReactionCount(itemId, reactionType);
    
    // Atualizar a última reação (sempre que alguém reage, essa vira a última)
    this.lastReactions.set(itemId, reactionType);
    
    // Feedback visual
    this.toastService.info(`${userName} reagiu com ${reactionType}`);
    
    console.log(`Reação simulada: ${userName} reagiu com ${reactionType} no item ${itemId}`);
  }

  // Método para simular reações automáticas (apenas para demonstração)
  private simulateAutomaticReactions(items: GalleryItem[]) {
    const reactionTypes = ['curtir', 'gostei', 'festejar'];
    const userNames = ['Maria', 'João', 'Ana', 'Pedro', 'Sofia'];
    
    // Simular algumas reações após intervalos aleatórios
    items.forEach((item, index) => {
      // Simular 1-3 reações automáticas por item após alguns segundos
      const numReactions = Math.floor(Math.random() * 3) + 1;
      
      for (let i = 0; i < numReactions; i++) {
        const delay = (index * 2000) + (i * 3000) + Math.random() * 2000; // Espalhar ao longo do tempo
        const reactionType = reactionTypes[Math.floor(Math.random() * reactionTypes.length)];
        const userName = userNames[Math.floor(Math.random() * userNames.length)];
        
        setTimeout(() => {
          // Verificar se o componente ainda existe antes de simular a reação
          if (this.galleryItems.find(gi => gi.id === item.id)) {
            this.simulateOtherUserReaction(item.id, reactionType, userName);
          }
        }, delay);
      }
    });
  }

  // Método para atualizar as contagens de reações quando uma reação é adicionada
  private incrementReactionCount(itemId: number, reactionType: string) {
    const counts = this.reactionCounts.get(itemId) || { curtir: 0, gostei: 0, festejar: 0 };
    
    if (reactionType === 'curtir') {
      counts.curtir++;
    } else if (reactionType === 'gostei') {
      counts.gostei++;
    } else if (reactionType === 'festejar') {
      counts.festejar++;
    }
    
    this.reactionCounts.set(itemId, counts);
  }

  // Método para atualizar as contagens de reações quando uma reação é removida
  private decrementReactionCount(itemId: number, reactionType: string) {
    const counts = this.reactionCounts.get(itemId) || { curtir: 0, gostei: 0, festejar: 0 };
    
    if (reactionType === 'curtir' && counts.curtir > 0) {
      counts.curtir--;
    } else if (reactionType === 'gostei' && counts.gostei > 0) {
      counts.gostei--;
    } else if (reactionType === 'festejar' && counts.festejar > 0) {
      counts.festejar--;
    }
    
    this.reactionCounts.set(itemId, counts);
  }

  goToInteraction() {
    this.router.navigate(['/interaction']);
  }

  // Método para lidar com toque longo em reações em dispositivos móveis
  handleTouchStart(event: TouchEvent, itemId: number): void {
    // Prevenir comportamento padrão de toque longo
    event.preventDefault();
    
    // Adicionar classe para exibir o tooltip
    const element = event.currentTarget as HTMLElement;
    if (element) {
      element.classList.add('touch-active');
      
      // Definir um temporizador para remover a classe após 3 segundos
      setTimeout(() => {
        element.classList.remove('touch-active');
      }, 3000);
    }
  }
  
  // Método para cancelar toque longo
  handleTouchEnd(event: TouchEvent): void {
    const element = event.currentTarget as HTMLElement;
    if (element) {
      element.classList.remove('touch-active');
    }
  }

  goBack() {
    // Tentar retornar ao histórico do navegador, retornar à página inicial se não houver histórico
    if (window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate(['/']);
    }
  }

  logout() {
    logoutAll(); // Limpar sessão e perfil
    this.router.navigate(['/']); // Navega para a página inicial (home)
  }

  formatDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  async share(item: GalleryItem) {
    if (!item) return; // Prevenir error se o item for null

    const text = `${item.userName} compartilhou uma homenagem no Chá Revelação\n\n${item.message || ''}`.trim();
    const url = location.href;

    try {
      // Verificar se a API está realmente disponível
      if (typeof navigator.share === 'function') {
        await navigator.share({
          title: 'Chá Revelação',
          text,
          url
        });
        return;
      }
    } catch (error) {
      console.log('Share failed:', error);
    }

    // Fallback: abrir em nova janela com delay para evitar bloqueio de popup
    const openWindow = (url: string) => {
      const win = window.open(url, '_blank');
      if (!win || win.closed || typeof win.closed === 'undefined') {
        // Popup foi bloqueado, mostra em nova aba
        window.location.href = url;
      }
    };

    // Links de compartilhamento
    const encodedText = encodeURIComponent(text + '\n' + url);
    const whatsapp = `https://wa.me/?text=${encodedText}`;
    const facebook = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`;

    // Tentar abrir WhatsApp primeiro
    try {
      openWindow(whatsapp);
    } catch (error) {
      console.log('WhatsApp share failed:', error);
    }

    // Facebook com pequeno delay
    setTimeout(() => {
      try {
        openWindow(facebook);
      } catch (error) {
        console.log('Facebook share failed:', error);
      }
    }, 500);
  }

  removeItem(item: GalleryItem) {
    // Verificar se o usuário atual é o proprietário do post
    const currentUserEmail = this.getCurrentUserEmail();
    
    // Se o item pertence ao usuário atual ou é um post local (sem ID de usuário)
    if (this.isCurrentUserOwner(item)) {
      // Mostra o modal de confirmação
      this.itemToDelete = item;
    } else {
      this.toastService.error('Você só pode excluir seus próprios posts');
    }
  }
  
  // Verifica se o usuário atual é o proprietário do post
  isCurrentUserOwner(item: GalleryItem): boolean {
    const profile = getProfile();
    
    // Se não tiver profile, não pode excluir nada
    if (!profile) {
      return false;
    }
    
    // Verifica se o email do usuário atual corresponde ao email do post
    // Ou se é um post local sem ID definido (backwards compatibility)
    const isNameMatch = item.userName === profile.name;
    const isLocalPost = typeof item.id !== 'number';
    const isEmailMatch = !!item.userEmail && item.userEmail === profile.email;
    
    return Boolean(isNameMatch || isLocalPost || isEmailMatch);
  }
  
  // Obtém o email do usuário atual
  getCurrentUserEmail(): string | null {
    const profile = getProfile();
    return profile ? profile.email : null;
  }
  
  cancelDelete() {
    this.itemToDelete = null;
    this.toastService.info('Exclusão cancelada');
  }
  
  confirmDelete() {
    if (!this.itemToDelete) return;
    
    const item = this.itemToDelete;
    this.itemToDelete = null; // Fecha o modal
    
    // Primeiro, remove do array local para feedback imediato ao usuário
    const index = this.galleryItems.findIndex(i => i.id === item.id);
    if (index > -1) {
      this.galleryItems.splice(index, 1);
      
      // Também remove do localStorage (como fallback se estiver usando)
      try {
        const raw = localStorage.getItem('posts');
        if (raw) {
          const localItems = JSON.parse(raw) as GalleryItem[];
          const newLocalItems = localItems.filter(i => i.id !== item.id);
          localStorage.setItem('posts', JSON.stringify(newLocalItems));
        }
      } catch (e) {
        console.error('Erro ao atualizar localStorage:', e);
        this.toastService.error('Erro ao atualizar o armazenamento local');
      }
      
      // Tenta remover do backend
      if (typeof item.id === 'number') {
        this.galeriaService.deletePost(item.id).subscribe({
          next: () => {
            console.log(`Post ${item.id} removido com sucesso do backend`);
            this.toastService.success('Post removido com sucesso');
          },
          error: (err) => {
            console.error(`Erro ao remover post ${item.id} do backend:`, err);
            this.toastService.warning('O post foi removido da galeria, mas houve um problema ao remover do servidor');
            // Se não conseguir remover do backend, poderia recarregar a lista
            // para garantir consistência, mas isso pode ser frustrante para o usuário
          }
        });
      } else {
        this.toastService.success('Post removido com sucesso');
      }
    }
  }

  async sharePage() {
    const title = 'Galeria - Chá Revelação';
    const text = 'Veja a nossa Galeria de Memórias do Chá Revelação';
    const url = location.href;

    try {
      if (typeof navigator.share === 'function') {
        await navigator.share({ title, text, url });
        return;
      }
    } catch (error) {
      console.log('Share page failed:', error);
    }

    // Função auxiliar para abrir janelas com fallback
    const openWindow = (url: string) => {
      const win = window.open(url, '_blank');
      if (!win || win.closed || typeof win.closed === 'undefined') {
        window.location.href = url;
      }
    };

    // Preparar URLs de compartilhamento
    const encodedText = encodeURIComponent(text + '\n' + url);
    const whatsapp = `https://wa.me/?text=${encodedText}`;
    const facebook = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`;

    // Tentar compartilhar com tratamento de erros
    try {
      openWindow(whatsapp);
      setTimeout(() => {
        try {
          openWindow(facebook);
        } catch (error) {
          console.log('Facebook share failed:', error);
        }
      }, 500);
    } catch (error) {
      console.log('WhatsApp share failed:', error);
    }
  }

}
