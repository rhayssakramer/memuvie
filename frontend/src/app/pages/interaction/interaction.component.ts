import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HeaderComponent } from '../../shared/header/header.component';
import { DotsBackgroundComponent } from '../../shared/dots-background/dots-background.component';
import { logoutAll } from '../../utils/auth';

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

  private resizeImage(base64Str: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const maxWidth = 600;  // Reduzido de 800 para 600
        const maxHeight = 600; // Reduzido de 800 para 600
        let width = img.width;
        let height = img.height;

        // Calcular novas dimensões mantendo a proporção
        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Não foi possível criar contexto 2d'));
          return;
        }

        // Aplica um leve desfoque para melhor compressão
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'low';
        ctx.drawImage(img, 0, 0, width, height);

        // Converter para JPEG com qualidade mais baixa para economizar espaço
        resolve(canvas.toDataURL('image/jpeg', 0.5));
      };
      img.onerror = () => {
        reject(new Error('Erro ao carregar imagem'));
      };
    });
  }

  private async cleanupOldPosts() {
    try {
      const raw = localStorage.getItem('posts');
      if (raw) {
        const posts = JSON.parse(raw);
        // Primeiro tenta manter 10 posts
        let recentPosts = posts.slice(0, 10);

        try {
          localStorage.setItem('posts', JSON.stringify(recentPosts));
        } catch (e) {
          // Se ainda estiver cheio, tenta manter only 5 posts
          recentPosts = posts.slice(0, 5);
          try {
            localStorage.setItem('posts', JSON.stringify(recentPosts));
          } catch (e) {
            // Se ainda estiver cheio, limpa tudo
            localStorage.removeItem('posts');
          }
        }
      }
    } catch (e) {
      console.error('Erro ao limpar posts antigos:', e);
      // Em caso de error, tenta limpar tudo
      localStorage.removeItem('posts');
    }
  }

  constructor(private router: Router) {}

  ngOnInit() {
    // Limpar todo o estado quando o componente é inicializado
    this.message = '';
    this.selectedPhoto = null;
    this.photoPreviewUrl = null;
    this.isReadingPhoto = false;
    this.currentFileReader = null;
    this.selectedVideo = null;
    this.videoPreviewUrl = null;

    // Importar a função syncUserData
    import('../../utils/auth').then(auth => {
      // Garantir que os dados do usuário estejam sincronizados
      auth.syncUserData();
    });

    // Limpar os inputs de file
    setTimeout(() => {
      const photoInput = document.getElementById('photoInput') as HTMLInputElement | null;
      const videoInput = document.getElementById('videoInput') as HTMLInputElement | null;
      if (photoInput) photoInput.value = '';
      if (videoInput) videoInput.value = '';
    }, 0);

    // Garantir que a rolagem do body esteja habilitada ao entrar na página.
    // Alguns modais em outras páginas mudam `document.body.style.overflow` para 'hidden'
    // e, em casos específicos, pode permanecer assim após navegação. Aqui nos certificamos
    // de resetar para permitir rolagem sem precisar de refresh (F5).
    try {
      if (document && document.body && document.body.style) {
        document.body.style.overflow = '';
      }
    } catch (e) {
      // Ignorar em ambientes sem DOM (SSR) ou em caso de erro
    }
  }

  logout() {
    logoutAll(); // Limpar sessão e perfil
    this.router.navigate(['/']); // Navega para a página inicial (home)
  }

  openFileUpload() {
    document.getElementById('fileInput')?.click();
  }

  onPhotoSelected(event: Event) {
    console.log('Foto selecionada');
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedPhoto = input.files[0];
      const reader = new FileReader();
      this.isReadingPhoto = true;

      reader.onload = () => {
        console.log('Foto carregada, iniciando redimensionamento');
        const base64Str = reader.result as string;

        this.resizeImage(base64Str)
          .then(resizedBase64 => {
            console.log('Foto redimensionada com sucesso');
            this.photoPreviewUrl = resizedBase64;
            this.isReadingPhoto = false;
          })
          .catch(error => {
            console.error('Erro ao redimensionar:', error);
            this.isReadingPhoto = false;
            this.selectedPhoto = null;
            this.photoPreviewUrl = null;
          });
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

  openVideoCapture() {
    (document.getElementById('videoInput') as HTMLInputElement)?.click();
  }

  onVideoSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedVideo = input.files[0];
      const url = URL.createObjectURL(this.selectedVideo);
      this.videoPreviewUrl = url;
    }
  }

  openPhotoCapture() {
    (document.getElementById('photoInput') as HTMLInputElement)?.click();
  }

  async submitMessage() {
    console.log('Iniciando submitMessage');

    // Verificar se há conteúdo para enviar
    const hasContent = this.message.trim() || this.selectedPhoto || this.selectedVideo || this.photoPreviewUrl;
    console.log('Tem conteúdo para enviar?', hasContent, {
      message: this.message.trim(),
      photo: !!this.selectedPhoto,
      video: !!this.selectedVideo,
      preview: !!this.photoPreviewUrl
    });

    if (!hasContent) {
      console.log('Nenhum conteúdo para enviar');
      return;
    }

    // Obter dados do usuário do localStorage
    // Primeiro, tenta do formato atual userProfile
    const userProfileStr = localStorage.getItem('userProfile');
    let userName = 'Convidado';
    let userPhoto = 'assets/avatar-1.jpg';

    if (userProfileStr) {
      try {
        const userProfile = JSON.parse(userProfileStr);
        userName = userProfile.name || 'Convidado';
        userPhoto = userProfile.photo || 'assets/avatar-1.jpg';
        console.log('Dados do usuário carregados do userProfile:', userName, userPhoto);
      } catch (error) {
        console.error('Erro ao carregar perfil do usuário de userProfile:', error);
      }
    } else {
      // Tenta obter do formato anterior
      const storedName = localStorage.getItem('userName');
      const storedPhoto = localStorage.getItem('userPhoto');

      if (storedName) {
        userName = storedName;
        console.log('Nome do usuário carregado do armazenamento antigo:', userName);
      }

      if (storedPhoto) {
        userPhoto = storedPhoto;
        console.log('Foto do usuário carregada do armazenamento antigo:', userPhoto);
      }
    }

    // Log para depuração
    console.log('Dados finais do usuário para o post:', { userName, userPhoto });

    const savePost = (photoDataUrl?: string, videoDataUrl?: string) => {
      try {
        // Salva o post
        const raw = localStorage.getItem('posts');
        const posts = raw ? JSON.parse(raw) : [];
        posts.unshift({
          id: Date.now(),
          userName: userName, // Usando o nome real do usuário
          userPhoto: userPhoto, // Usando a foto real do usuário
          photo: photoDataUrl || null,
          video: videoDataUrl || null,
          message: this.message || '',
          date: new Date().toISOString()
        });
        localStorage.setItem('posts', JSON.stringify(posts));

        // Limpar o estado
        this.message = '';
        this.selectedPhoto = null;
        this.photoPreviewUrl = null;
        this.isReadingPhoto = false;
        this.currentFileReader = null;

        if (this.videoPreviewUrl) {
          try { URL.revokeObjectURL(this.videoPreviewUrl); } catch(e) {}
        }
        this.selectedVideo = null;
        this.videoPreviewUrl = null;

        // Limpar inputs de file
        ['photoInput', 'videoInput'].forEach(inputId => {
          const input = document.getElementById(inputId) as HTMLInputElement | null;
          if (input) {
            input.value = '';
            input.files = null;
          }
        });

        // Navegar após um pequeno delay para garantir que tudo foi limpo
        setTimeout(() => {
          this.router.navigate(['/gallery']);
        }, 100);
      } catch (error) {
        console.error('Erro ao salvar o post:', error);
      }
    };

    // Auxiliar para ler um arquivo como DataURL
    const readFileAsDataURL = (file: File) => {
      return new Promise<string>((resolve, reject) => {
        const r = new FileReader();
        this.currentFileReader = r;
        r.onload = () => { this.currentFileReader = null; resolve(r.result as string); };
        r.onerror = () => { this.currentFileReader = null; reject(new Error('read error')); };
        r.onabort = () => { this.currentFileReader = null; reject(new Error('aborted')); };
        r.readAsDataURL(file);
      });
    };

    try {
      let photoDataUrl: string | undefined = undefined;
      let videoDataUrl: string | undefined = undefined;

      if (this.photoPreviewUrl) {
        // Já tem uma prévia do DataURL
        photoDataUrl = this.photoPreviewUrl;
      } else if (this.selectedPhoto) {
        photoDataUrl = await readFileAsDataURL(this.selectedPhoto);
      }

      if (this.selectedVideo) {
        // Converte o arquivo de vídeo para DataURL para que ele persista
        videoDataUrl = await readFileAsDataURL(this.selectedVideo);
      } else if (this.videoPreviewUrl && !this.selectedVideo) {
        // Caso videoPreviewUrl tenha sido criado com createObjectURL, mas o arquivo não esteja definido, evite armazenar a URL do objeto
        videoDataUrl = undefined;
      }

      savePost(photoDataUrl, videoDataUrl);
    } catch (e) {
      // Leitura falhou - não navegue para longe
      // Saia do estado para que o usuário possa tentar novamente
      return;
    }
  }

  cancelUpload() {
    // Abortar qualquer FileReader em andamento
    try {
      if (this.currentFileReader && (this.currentFileReader.readyState !== 2)) {
        // readyState 2 === DONE
        this.currentFileReader.abort();
      }
    } catch (e) {
      // ignore
    }

    // Limpar arquivos selecionados e visualizações
    this.selectedPhoto = null;
    this.photoPreviewUrl = null;
    this.selectedVideo = null;
    if (this.videoPreviewUrl) {
      try { URL.revokeObjectURL(this.videoPreviewUrl); } catch(e) {}
    }
    this.videoPreviewUrl = null;

    // Limpa os elementos de entrada do arquivo para que o mesmo arquivo possa ser selecionado novamente, se desejado
    const photoInput = document.getElementById('photoInput') as HTMLInputElement | null;
    if (photoInput) photoInput.value = '';
    const videoInput = document.getElementById('videoInput') as HTMLInputElement | null;
    if (videoInput) videoInput.value = '';
  }

  get remainingCharacters() {
    return this.maxLength - this.message.length;
  }

}
