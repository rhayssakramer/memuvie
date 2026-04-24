import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { getProfile, updateProfile } from '../../utils/auth';
import { ToastService } from '../../services/toast.service';

interface ProfileForm {
  name: string;
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  photo?: File;
}

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class EditProfileComponent implements OnInit, OnDestroy {
  isOpen = false;
  isCropOpen = false;
  profile: any = null;
  photoPreview: string | null = null;
  cropImageSource: string | null = null;
  cropZoom = 1;
  cropPositionX = 0;
  cropPositionY = 0;
  croppedFile: File | null = null;
  isDragging = false;
  dragStartX = 0;
  dragStartY = 0;
  
  form: ProfileForm = {
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };
  errorMessage = '';
  successMessage = '';
  mostrarSenhaAtual: boolean = false;
  mostrarNovaSenha: boolean = false;
  mostrarConfirmarSenha: boolean = false;

  constructor(private toast: ToastService) {
    // Bind de métodos para manter 'this' correto
    this.onCropMouseMove = this.onCropMouseMove.bind(this);
    this.onCropMouseUp = this.onCropMouseUp.bind(this);
  }

  ngOnInit() {
    this.profile = getProfile();
    if (this.profile) {
      this.form.name = this.profile.name || '';
      this.form.email = this.profile.email || '';
      this.photoPreview = this.profile.photo;
    }
  }

  ngOnDestroy() {
    // Remove event listeners quando componente é destruído
    document.removeEventListener('mousemove', this.onCropMouseMove);
    document.removeEventListener('mouseup', this.onCropMouseUp);
  }

  open() {
    this.isOpen = true;
    // Reset mensagens
    this.errorMessage = '';
    this.successMessage = '';
  }

  close() {
    this.isOpen = false;
    // Reset form
    this.form.currentPassword = '';
    this.form.newPassword = '';
    this.form.confirmPassword = '';
  }

  onPhotoSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Verifica o size do file (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.errorMessage = 'A foto deve ter no máximo 5MB';
        this.toast.error('A foto deve ter no máximo 5MB');
        return;
      }

      // Verifica o tipo do file
      if (!file.type.startsWith('image/')) {
        this.errorMessage = 'Por favor, selecione uma imagem válida';
        this.toast.error('Por favor, selecione uma imagem válida');
        return;
      }

      // Cria preview para crop
      const reader = new FileReader();
      reader.onload = (e) => {
        this.cropImageSource = e.target?.result as string;
        this.croppedFile = file;
        this.cropZoom = 1;
        this.cropPositionX = 0;
        this.cropPositionY = 0;
        this.isCropOpen = true;
        console.log('Crop modal aberto:', { isCropOpen: this.isCropOpen, cropImageSource: this.cropImageSource ? 'tem imagem' : 'sem imagem' });
      };
      reader.readAsDataURL(file);
    }
  }

  async onSubmit() {
    this.errorMessage = '';
    this.successMessage = '';

    // Validações
    if (this.form.newPassword && this.form.newPassword !== this.form.confirmPassword) {
      this.errorMessage = 'As senhas não coincidem';
      this.toast.error('As senhas não coincidem');
      return;
    }

    try {
      // Se tiver photo, converte para base64
      let photoBase64 = null;
      if (this.form.photo) {
        photoBase64 = await this.fileToBase64(this.form.photo);
      }

      // Atualiza o profile
      const updatedProfile = {
        ...this.profile,
        name: this.form.name,
        email: this.form.email,
        photo: photoBase64 || this.profile.photo
      };

      // Atualizar senha se fornecida
      if (this.form.newPassword && this.form.currentPassword) {
        try {
          const userId = localStorage.getItem('userId');
          if (!userId) {
            throw new Error('ID do usuário não encontrado');
          }

          const token = localStorage.getItem('token');
          if (!token) {
            throw new Error('Token não encontrado');
          }

          // Chamar o endpoint de alteração de senha
          const response = await fetch(`http://localhost:8080/api/usuario/alterar-senha`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              senhaAtual: this.form.currentPassword,
              novaSenha: this.form.newPassword
            })
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erro ao alterar senha');
          }

          this.successMessage = 'Senha alterada com sucesso!';
          this.toast.success('Senha alterada com sucesso!');
        } catch (error: any) {
          this.errorMessage = error.message || 'Erro ao alterar senha';
          this.toast.error(this.errorMessage);
          return;
        }
      }

      updateProfile(updatedProfile);
      this.successMessage = 'Perfil atualizado com sucesso!';
      this.toast.success('Perfil atualizado com sucesso!');

      // Atualiza o profile local
      this.profile = updatedProfile;

      // Fecha o modal após 2 segundos
      setTimeout(() => this.close(), 2000);

    } catch (error) {
      this.errorMessage = 'Erro ao atualizar o perfil. Tente novamente.';
      this.toast.error(this.errorMessage);
    }
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  }

  // Fecha o modal se clicar fora
  onClickOutside(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.modal-content')) {
      this.close();
    }
  }

  toggleMostrarSenhaAtual(): void {
    this.mostrarSenhaAtual = !this.mostrarSenhaAtual;
  }

  toggleMostrarNovaSenha(): void {
    this.mostrarNovaSenha = !this.mostrarNovaSenha;
  }

  toggleMostrarConfirmarSenha(): void {
    this.mostrarConfirmarSenha = !this.mostrarConfirmarSenha;
  }

  // Métodos de Crop
  confirmCrop() {
    if (!this.croppedFile || !this.cropImageSource) return;

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Container visível (igual ao CSS)
      const containerW = 300;
      const containerH = 300;

      // Canvas de saída igual ao container
      canvas.width = containerW;
      canvas.height = containerH;

      // Centro da imagem exibida no container (após o drag)
      const imgCenterX = containerW / 2 + this.cropPositionX;
      const imgCenterY = containerH / 2 + this.cropPositionY;

      // Tamanho da imagem com zoom
      const scaledW = img.width * this.cropZoom;
      const scaledH = img.height * this.cropZoom;

      // Topo-esquerda da imagem exibida
      const displayLeft = imgCenterX - scaledW / 2;
      const displayTop  = imgCenterY - scaledH / 2;

      // Desenha no canvas exatamente o que está visível
      ctx.drawImage(img, displayLeft, displayTop, scaledW, scaledH);

      canvas.toBlob((blob) => {
        if (blob) {
          const croppedFile = new File([blob], 'cropped.jpg', { type: 'image/jpeg' });
          this.form.photo = croppedFile;

          const reader = new FileReader();
          reader.onload = (e) => {
            this.photoPreview = e.target?.result as string;
          };
          reader.readAsDataURL(croppedFile);
        }
      }, 'image/jpeg', 0.95);
    };
    img.src = this.cropImageSource;

    this.isCropOpen = false;
    this.toast.success('Foto enquadrada com sucesso!');
  }

  cancelCrop() {
    this.isCropOpen = false;
    this.cropImageSource = null;
    this.croppedFile = null;
    this.isDragging = false;
  }

  onCropClickOutside(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.crop-container')) {
      this.cancelCrop();
    }
  }

  onZoomChange(event: Event) {
    this.cropZoom = +(event.target as HTMLInputElement).value;
  }

  onCropMouseDown(event: MouseEvent) {
    if (event.button !== 0) return; // Apenas mouse esquerdo
    event.preventDefault();
    this.isDragging = true;
    this.dragStartX = event.clientX;
    this.dragStartY = event.clientY;
    
    // Adiciona listeners no document para capturar movimento fora do elemento
    document.addEventListener('mousemove', this.onCropMouseMove);
    document.addEventListener('mouseup', this.onCropMouseUp);
  }

  onCropMouseMove(event: MouseEvent) {
    if (!this.isDragging) return;
    event.preventDefault();
    
    const deltaX = event.clientX - this.dragStartX;
    const deltaY = event.clientY - this.dragStartY;
    
    this.cropPositionX += deltaX;
    this.cropPositionY += deltaY;
    
    this.dragStartX = event.clientX;
    this.dragStartY = event.clientY;
  }

  onCropMouseUp(event: MouseEvent) {
    this.isDragging = false;
    document.removeEventListener('mousemove', this.onCropMouseMove);
    document.removeEventListener('mouseup', this.onCropMouseUp);
  }
}
