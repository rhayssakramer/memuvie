import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HeaderComponent } from '../../shared/header/header.component';
import { DotsBackgroundComponent } from '../../shared/dots-background/dots-background.component';
import { logoutAll } from '../../utils/auth';
import { FileUploadService } from '../../services/file-upload.service';
import { GaleriaService, GaleriaPost } from '../../services/galeria.service';
import { ToastService } from '../../services/toast.service';

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
  isUploading: boolean = false;

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

  constructor(
    private router: Router,
    private fileUploadService: FileUploadService,
    private galeriaService: GaleriaService,
    private toast: ToastService
  ) {}

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

    // Garantir que exista pelo menos um evento válido no sistema
    this.galeriaService.garantirEventoValido().subscribe({
      next: (eventoId) => {
        console.log('Evento válido garantido com ID:', eventoId);
      },
      error: (error) => {
        console.error('Não foi possível garantir evento válido:', error);
      }
    });

    // Limpar os inputs de file
    setTimeout(() => {
      const photoInput = document.getElementById('photoInput') as HTMLInputElement | null;
      const videoInput = document.getElementById('videoInput') as HTMLInputElement | null;
      const galleryPhotoInput = document.getElementById('galleryPhotoInput') as HTMLInputElement | null;
      if (photoInput) photoInput.value = '';
      if (videoInput) videoInput.value = '';
      if (galleryPhotoInput) galleryPhotoInput.value = '';
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
    // Verifica se foi chamado a partir do botão "Envie Fotos/Vídeos da Festa"
    // Identifica o botão pelo ID do input, verificando se é photoInput ou algum outro ID específico
    const isDirectUpload = (input.id === 'photoInput');

    if (input.files && input.files[0]) {
      this.selectedPhoto = input.files[0];

      if (isDirectUpload) {
        // Se for upload direto para o Cloudinary sem exibir na galeria
        this.isUploading = true;
        console.log('Enviando foto diretamente para o Cloudinary...');

        this.fileUploadService.uploadImage(this.selectedPhoto).subscribe(
          (url) => {
            console.log('Foto enviada com sucesso para o Cloudinary:', url);
            this.isUploading = false;
            // Limpar após o upload bem-sucedido
            this.selectedPhoto = null;

            // Toast de sucesso
            this.toast.success('Foto enviada com sucesso!');

            // Limpar o input
            if (input) {
              input.value = '';
            }
          },
          (error) => {
            console.error('Erro no upload da foto:', error);
            this.isUploading = false;
            this.toast.error('Erro ao enviar a foto. Tente novamente.');
          }
        );

        return; // Sai do método após iniciar o upload direto
      }

      // Comportamento normal para fotos que serão mostradas na galeria
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
        // Em dispositivos móveis, o atributo capture="environment" prioriza a câmera
    // para gravação direta de vídeo
    (document.getElementById('videoInput') as HTMLInputElement)?.click();
  }

  onVideoSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    // Verifica se foi chamado a partir do botão "Deixe seu depoimento em vídeo"
    // Identifica pelo ID do input
    const isDirectUpload = (input.id === 'videoInput');

    if (input.files && input.files[0]) {
      this.selectedVideo = input.files[0];

      if (isDirectUpload) {
        // Se for upload direto para o Cloudinary sem exibir na galeria
        this.isUploading = true;
        console.log('Enviando vídeo diretamente para o Cloudinary...');

        this.fileUploadService.uploadVideo(this.selectedVideo).subscribe(
          (url) => {
            console.log('Vídeo enviado com sucesso para o Cloudinary:', url);
            this.isUploading = false;
            // Limpar após o upload bem-sucedido
            this.selectedVideo = null;

            this.toast.success('Depoimento em vídeo enviado com sucesso!');

            // Limpar o input
            if (input) {
              input.value = '';
            }
          },
          (error) => {
            console.error('Erro no upload do vídeo:', error);
            this.isUploading = false;
            this.toast.error('Erro ao enviar o vídeo. Tente novamente.');
          }
        );

        return; // Sai do método após iniciar o upload direto
      }

      // Comportamento normal para vídeos que serão mostrados na galeria
      const url = URL.createObjectURL(this.selectedVideo);
      this.videoPreviewUrl = url;

      // Verificar se o vídeo pode ser reproduzido
      console.log("Vídeo selecionado:", {
        nome: this.selectedVideo.name,
        tipo: this.selectedVideo.type,
        tamanho: Math.round(this.selectedVideo.size / 1024 / 1024 * 100) / 100 + "MB",
        url: this.videoPreviewUrl
      });

      // Limpe qualquer foto que possa estar selecionada para evitar confusão
      this.selectedPhoto = null;
      this.photoPreviewUrl = null;
    }
  }

  openPhotoCapture() {
    const input = document.getElementById('photoInput') as HTMLInputElement;
    if (input) {
      // Abre diretamente a galeria para seleção de imagens
      input.click();
    }
  }

openGalleryPhotoCapture() {
    const input = document.getElementById('galleryPhotoInput') as HTMLInputElement;
    if (input) {
      // Abre diretamente a galeria para seleção de imagens
      input.click();
    }
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

    this.isUploading = true;

    try {
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

      // Upload para Cloudinary em vez de armazenar no localStorage
      let photoUrl: string | null = null;
      let videoUrl: string | null = null;
      const maxRetries = 3;
      const retryDelay = 1000; // 1 segundo

      // Função auxiliar para retry
      const retryUpload = async (uploadFn: () => Promise<string>): Promise<string> => {
        let lastError;
        for (let i = 0; i < maxRetries; i++) {
          try {
            return await uploadFn();
          } catch (error) {
            console.error(`Tentativa ${i + 1} falhou:`, error);
            lastError = error;
            if (i < maxRetries - 1) {
              await new Promise(resolve => setTimeout(resolve, retryDelay));
            }
          }
        }
        throw lastError;
      };

      // Upload da foto para o Cloudinary, se existir
      if (this.selectedPhoto) {
        console.log('Fazendo upload da foto para o Cloudinary');
        try {
          photoUrl = await retryUpload(() =>
            new Promise<string>((resolve, reject) => {
              this.fileUploadService.uploadImage(this.selectedPhoto as File).subscribe(
                url => resolve(url),
                error => reject(error)
              );
            })
          );
        } catch (error) {
          console.error('Erro no upload da foto após todas as tentativas:', error);
          this.toast.error('Não foi possível fazer o upload da foto. Tente novamente.');
          this.isUploading = false;
          return;
        }
      } else if (this.photoPreviewUrl) {
        // Se temos apenas um preview base64, podemos convertê-lo em um Blob e fazer upload
        const blob = this.dataURLtoBlob(this.photoPreviewUrl);
        const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' });
        console.log('Fazendo upload da foto base64 para o Cloudinary');
        try {
          photoUrl = await retryUpload(() =>
            new Promise<string>((resolve, reject) => {
              this.fileUploadService.uploadImage(file).subscribe(
                url => resolve(url),
                error => reject(error)
              );
            })
          );
        } catch (error) {
          console.error('Erro no upload da foto base64 após todas as tentativas:', error);
          this.toast.error('Não foi possível fazer o upload da foto. Tente novamente.');
          this.isUploading = false;
          return;
        }
      }

      // Upload do vídeo para o Cloudinary, se existir
      if (this.selectedVideo) {
        console.log('Fazendo upload do vídeo para o Cloudinary');
        try {
          videoUrl = await new Promise<string>((resolve, reject) => {
            this.fileUploadService.uploadVideo(this.selectedVideo as File).subscribe(
              url => {
                console.log('Vídeo enviado com sucesso:', url);
                resolve(url);
              },
              error => {
                console.error('Falha no upload do vídeo:', error);
                reject(error);
              }
            );
          });
        } catch (error) {
          console.error('Erro no upload do vídeo:', error);
        }
      }

      // Salvar o post no backend e no localStorage como fallback
      const savePost = async () => {
        try {
          // Preparar o objeto para salvar
          const postData = {
            id: Date.now(),
            userName: userName,
            userPhoto: userPhoto,
            photo: photoUrl,  // URL da Cloudinary, não o arquivo completo
            video: videoUrl,  // URL da Cloudinary, não o arquivo completo
            message: this.message || '',
            date: new Date().toISOString()
          };

          // Log das URLs antes de salvar
          console.log('Salvando post com URLs:', {
            photo: photoUrl,
            video: videoUrl
          });

          // Salvar no localStorage como fallback
          try {
            // Limpar posts antigos se necessário
            await this.cleanupOldPosts();

            // Tentar salvar com diferentes estratégias de redução de dados
            const saveToLocalStorage = async (posts: any[]) => {
              try {
                localStorage.setItem('posts', JSON.stringify(posts));
                return true;
              } catch (e) {
                return false;
              }
            };

            const raw = localStorage.getItem('posts');
            const existingPosts = raw ? JSON.parse(raw) : [];
            const newPosts = [postData, ...existingPosts];

            // Primeira tentativa: salvar todos os posts
            let saved = await saveToLocalStorage(newPosts);

            if (!saved) {
              // Segunda tentativa: manter apenas os últimos 10 posts
              console.log('Tentando salvar apenas os últimos 10 posts...');
              saved = await saveToLocalStorage(newPosts.slice(0, 10));
            }

            if (!saved) {
              // Terceira tentativa: manter apenas os últimos 5 posts
              console.log('Tentando salvar apenas os últimos 5 posts...');
              saved = await saveToLocalStorage(newPosts.slice(0, 5));
            }

            if (!saved) {
              // Última tentativa: salvar apenas o post atual
              console.log('Tentando salvar apenas o post atual...');
              saved = await saveToLocalStorage([postData]);
            }

            if (saved) {
              console.log('Post salvo no localStorage como fallback');
            } else {
              console.error('Não foi possível salvar no localStorage mesmo após todas as tentativas');
            }
          } catch (e) {
            console.error('Erro ao salvar no localStorage:', e);
          }

          // Salvar no backend (apenas se for mensagem com foto para a galeria)
          // Não enviar para o backend se for upload direto de foto ou vídeo (botões principais)
          if (this.isGalleryContent()) {
            // Criar objeto no formato esperado pelo backend
            const backendPost: GaleriaPost = {
              mensagem: this.message || '',
              urlFoto: photoUrl || undefined,
              urlVideo: videoUrl || undefined
              // O backend irá associar ao usuário logado e ao evento atual
            };

            // Tentar salvar no backend (o retry está no service)
            this.galeriaService.createPost(backendPost).subscribe({
              next: (response) => {
                console.log('Post salvo com sucesso no backend:', response);
              },
              error: (error) => {
                console.error('Erro ao salvar post no backend:', error);
                console.warn('Post foi salvo apenas no localStorage');
              }
            });
          }

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
          ['photoInput', 'videoInput', 'galleryPhotoInput'].forEach(inputId => {
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
        } finally {
          this.isUploading = false;
        }
      };

      // Salvar o post com as URLs do Cloudinary
      await savePost();

    } catch (e) {
      console.error('Erro ao enviar conteúdo:', e);
      this.isUploading = false;
      // Mostrar mensagem de erro para o usuário se necessário
    }
  }

  // Converte DataURL para Blob para upload
  private dataURLtoBlob(dataURL: string): Blob {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
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
    const galleryPhotoInput = document.getElementById('galleryPhotoInput') as HTMLInputElement | null;
    if (galleryPhotoInput) galleryPhotoInput.value = '';
  }

  get remainingCharacters() {
    return this.maxLength - this.message.length;
  }

  /**
   * Verifica se o conteúdo atual deve ir para a galeria
   * Os botões principais (foto/vídeo da festa e depoimento) não vão para a galeria
   * Apenas o conteúdo de "Deixe uma mensagem especial" vai para a galeria
   */
  isGalleryContent(): boolean {
    // Se for uma mensagem com foto da área "Deixe uma mensagem especial"
    // O identificador é o uso do input galleryPhotoInput
    const galleryPhotoInput = document.getElementById('galleryPhotoInput') as HTMLInputElement | null;
    const hasGalleryPhoto = this.photoPreviewUrl && galleryPhotoInput?.files && galleryPhotoInput.files.length > 0;
    const hasMessage = this.message && this.message.trim().length > 0;

    // Se tem mensagem ou foto da galeria, é conteúdo para a galeria
    return !!hasGalleryPhoto || !!hasMessage;
  }

}
