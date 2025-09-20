import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

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
  imports: [CommonModule, RouterModule]
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
    // logout is handled elsewhere in app via auth utils; keep simple redirect
    this.router.navigate(['/identification']);
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
    const text = `${item.userName} compartilhou uma homenagem no Chá Revelação\n\n${item.message || ''}`.trim();
    const url = location.href; // current page, or could be a deep link
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Chá Revelação', text, url });
        return;
      }
    } catch {}

    // Fallback share links
    const encodedText = encodeURIComponent(text + '\n' + url);
    const whatsapp = `https://wa.me/?text=${encodedText}`;
    const facebook = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`;
    // Instagram doesn't support direct web share with pre-filled content; open profile
    const instagram = `https://www.instagram.com/`;

    window.open(whatsapp, '_blank');
    setTimeout(() => window.open(facebook, '_blank'), 400);
    setTimeout(() => window.open(instagram, '_blank'), 800);
  }

  async sharePage() {
    const title = 'Galeria - Chá Revelação';
    const text = 'Veja a nossa Galeria de Memórias do Chá Revelação';
    const url = location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title, text, url });
        return;
      }
    } catch {}
    const whatsapp = `https://wa.me/?text=${encodeURIComponent(text + '\n' + url)}`;
    const facebook = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`;
    window.open(whatsapp, '_blank');
    setTimeout(() => window.open(facebook, '_blank'), 400);
  }

}
