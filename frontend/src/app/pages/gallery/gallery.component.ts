import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ProfileMenuComponent } from '../../shared/profile-menu/profile-menu.component';
import { HeaderComponent } from '../../shared/header/header.component'; // Manter importação do componente de cabeçalho
import { DotsBackgroundComponent } from '../../shared/dots-background/dots-background.component';
import { logoutAll } from '../../utils/auth';
import { GaleriaService, GaleriaPost } from '../../services/galeria.service';

interface GalleryItem {
  id: number;
  userName: string;
  userPhoto: string;
  photo: string | null;
  video?: string | null;
  message: string;
  date: Date | string;
}

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, DotsBackgroundComponent] // Remove ProfileMenuComponent das importações
})
export class GalleryComponent implements OnInit {
  selectedItem: GalleryItem | null = null;
  galleryItems: GalleryItem[] = [];
  isLoading: boolean = false;
  error: string | null = null;

  constructor(
    private router: Router,
    private location: Location,
    private galeriaService: GaleriaService
  ) {}

  ngOnInit() {
    // Importar a função syncUserData
    import('../../utils/auth').then(auth => {
      // Garantir que os dados do usuário estejam sincronizados
      auth.syncUserData();
    });

    this.loadGalleryPosts();
  }

  /**
   * Carrega posts da galeria a partir do backend
   */
  loadGalleryPosts() {
    this.isLoading = true;
    this.error = null;

    // Primeiro testar a conectividade
    this.galeriaService.testConnection().subscribe({
      next: (connected) => {
        if (connected) {
          // Garantir que exista pelo menos um evento válido no sistema
          this.galeriaService.garantirEventoValido().subscribe(
            (eventoId) => {
              console.log('Evento válido encontrado:', eventoId);
              
              // Primeiro tentamos obter os posts por evento (mais confiável)
              this.galeriaService.getPostsByEvento(eventoId).subscribe({
                next: (postsByEvent) => {
                  console.log('Posts do evento carregados com sucesso:', postsByEvent);
                  this.galleryItems = this.mapBackendPostsToGalleryItems(postsByEvent);
                  this.isLoading = false;
                },
                error: (eventErr) => {
                  console.error('Falhou ao buscar posts por evento:', eventErr);
                  
                  // Se falhar, tentamos usar o endpoint geral
                  console.log('Tentando buscar todos os posts');
                  this.galeriaService.getPosts().subscribe({
                    next: (posts) => {
                      console.log('Posts carregados do backend:', posts);
                      this.galleryItems = this.mapBackendPostsToGalleryItems(posts);
                      this.isLoading = false;
                    },
                    error: (err) => {
                      console.error('Também falhou ao buscar todos os posts:', err);
                      this.error = 'Não foi possível carregar as publicações do servidor. Usando dados locais.';
                      this.isLoading = false;
                      this.loadFromLocalStorage();
                    }
                  });
                }
              });
            },
            (err) => {
              console.error('Erro ao garantir evento válido:', err);
              this.error = 'Não foi possível conectar ao servidor. Usando dados locais.';
              this.isLoading = false;
              this.loadFromLocalStorage();
            }
          );
        } else {
          // Se não conectado, usar apenas localStorage
          console.log('Backend não disponível, usando apenas localStorage');
          this.isLoading = false;
          this.loadFromLocalStorage();
        }
      },
      error: (err) => {
        console.error('Erro ao testar conectividade:', err);
        this.isLoading = false;
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
    return posts.map(post => ({
      id: post.id || Date.now(),
      userName: post.usuario?.nome || 'Usuário',
      userPhoto: post.usuario?.fotoPerfil || 'assets/avatar-1.jpg',
      photo: post.urlFoto || null,
      video: post.urlVideo || null,
      message: post.mensagem || '',
      date: post.dataCriacao || new Date().toISOString()
    }));
  }

  openModal(item: GalleryItem) {
    this.selectedItem = item;
  }

  closeModal() {
    this.selectedItem = null;
  }

  goToInteraction() {
    this.router.navigate(['/interaction']);
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
      }

      // Tenta remover do backend
      if (typeof item.id === 'number') {
        this.galeriaService.deletePost(item.id).subscribe({
          next: () => {
            console.log(`Post ${item.id} removido com sucesso do backend`);
          },
          error: (err) => {
            console.error(`Erro ao remover post ${item.id} do backend:`, err);
            // Se não conseguir remover do backend, poderia recarregar a lista
            // para garantir consistência, mas isso pode ser frustrante para o usuário
          }
        });
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
