import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { logoutAll } from '../../utils/auth';
import { HeaderComponent } from '../../shared/header/header.component';
import { DotsBackgroundComponent } from '../../shared/dots-background/dots-background.component';

@Component({
  selector: 'app-interaction',
  templateUrl: './interaction.component.html',
  styleUrls: ['./interaction.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HeaderComponent, DotsBackgroundComponent]
})
export class InteractionComponent implements OnInit {
  message: string = '';
  selectedPhoto: File | null = null;
  photoPreviewUrl: string | null = null;
  isReadingPhoto: boolean = false;
  currentFileReader: FileReader | null = null;
  selectedVideo: File | null = null;
  videoPreviewUrl: string | null = null;
  maxLength: number = 5000;


  constructor(private router: Router) {}

  ngOnInit() {
    console.log('Inicializando componente');
    this.resetForm();
  }

  private resetForm() {
    console.log('Resetando formulário');
    this.message = '';
    this.selectedPhoto = null;
    this.photoPreviewUrl = null;
    this.isReadingPhoto = false;
    this.currentFileReader = null;
    this.selectedVideo = null;
    this.videoPreviewUrl = null;

    // Reset file inputs
    setTimeout(() => {
      ['photoInput', 'videoInput'].forEach(inputId => {
        const input = document.getElementById(inputId) as HTMLInputElement | null;
        if (input) {
          input.value = '';
          input.files = null;
        }
      });
    });
  }

  logout() {
    logoutAll();
    this.router.navigate(['/login']);
  }

  openPhotoCapture() {
    const input = document.getElementById('photoInput') as HTMLInputElement;
    if (input) {
      input.click();
    }
  }

  openVideoCapture() {
    const input = document.getElementById('videoInput') as HTMLInputElement | null;
    if (input) {
      input.click();
    }
  }

  onPhotoSelected(event: Event) {
    console.log('Foto selecionada');
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedPhoto = input.files[0];
      const reader = new FileReader();
      this.isReadingPhoto = true;
      
      reader.onload = () => {
        console.log('Foto carregada com sucesso');
        this.photoPreviewUrl = reader.result as string;
        this.isReadingPhoto = false;
      };
      
      reader.onerror = () => {
        console.error('Erro ao ler foto');
        this.isReadingPhoto = false;
        this.selectedPhoto = null;
        this.photoPreviewUrl = null;
      };
      
      reader.readAsDataURL(this.selectedPhoto);
    }
  }

  async submitMessage() {
    console.log('Iniciando envio');
    
    if (!(this.message.trim() || this.photoPreviewUrl)) {
      console.log('Sem conteúdo para enviar');
      return;
    }

    try {
      const userName = localStorage.getItem('userName') || 'Convidado';
      const posts = JSON.parse(localStorage.getItem('posts') || '[]');
      
      const newPost = {
        id: Date.now(),
        userName,
        userPhoto: localStorage.getItem('userPhoto') || 'assets/avatar-1.jpg',
        photo: this.photoPreviewUrl,
        video: this.videoPreviewUrl || null,
        message: this.message,
        date: new Date().toISOString()
      };

      console.log('Salvando novo post:', newPost);
      posts.unshift(newPost);
      localStorage.setItem('posts', JSON.stringify(posts));
      
      this.resetForm();
      
      console.log('Post salvo, navegando para galeria');
      await this.router.navigate(['/gallery']);
    } catch (error) {
      console.error('Erro ao salvar:', error);
    }
  }

  cancelUpload() {
    this.selectedPhoto = null;
    this.photoPreviewUrl = null;
    if (this.videoPreviewUrl) {
      try { URL.revokeObjectURL(this.videoPreviewUrl); } catch(e) {}
    }
    this.selectedVideo = null;
    const input = document.getElementById('photoInput') as HTMLInputElement | null;
    if (input) {
      input.value = '';
    }
  }

  onVideoSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedVideo = input.files[0];
      try {
        const url = URL.createObjectURL(this.selectedVideo);
        this.videoPreviewUrl = url;
      } catch (e) {
        console.error('Erro ao criar preview de vídeo', e);
        this.videoPreviewUrl = null;
      }
    }
  }

  get remainingCharacters() {
    return this.maxLength - (this.message?.length || 0);
  }
}