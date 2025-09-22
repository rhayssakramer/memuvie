import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ProfileMenuComponent } from '../../shared/profile-menu/profile-menu.component';
import { HeaderComponent } from '../../shared/header/header.component';
import { logoutAll } from '../../utils/auth';

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
  imports: [CommonModule, RouterModule, ProfileMenuComponent, HeaderComponent]
})
export class GalleryComponent implements OnInit {
  selectedItem: GalleryItem | null = null;
  galleryItems: GalleryItem[] = [];

  constructor(private router: Router, private location: Location) {}

  ngOnInit() {
    const raw = localStorage.getItem('posts');
    if (raw) {
      try {
        const items = JSON.parse(raw) as GalleryItem[];
        this.galleryItems = items;
      } catch {}
    }
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
    // Try browser history back, fallback to home if no history
    if (window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate(['/']);
    }
  }

  logout() {
    logoutAll(); // Clear session and profile
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
    if (!item) return; // Prevenir erro se o item for null

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
    const index = this.galleryItems.findIndex(i => i.id === item.id);
    if (index > -1) {
      this.galleryItems.splice(index, 1);
      localStorage.setItem('posts', JSON.stringify(this.galleryItems));
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
