import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { getProfile, updateProfile } from '../../utils/auth';
import { ToastService } from '../../services/toast.service';
import { FormsModule } from '@angular/forms';

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
export class EditProfileComponent implements OnInit {
  isOpen = false;
  profile: any = null;
  photoPreview: string | null = null;
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
  
  constructor(private toastService: ToastService) {}

  ngOnInit() {
    this.profile = getProfile();
    if (this.profile) {
      this.form.name = this.profile.name || '';
      this.form.email = this.profile.email || '';
      this.photoPreview = this.profile.photo;
    }
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
        this.toastService.error('A foto deve ter no máximo 5MB');
        return;
      }

      // Verifica o tipo do file
      if (!file.type.startsWith('image/')) {
        this.toastService.error('Por favor, selecione uma imagem válida');
        return;
      }

      this.form.photo = file;

      // Cria preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.photoPreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  async onSubmit() {
    this.errorMessage = '';
    this.successMessage = '';

    // Validações
    if (this.form.newPassword && this.form.newPassword !== this.form.confirmPassword) {
      this.toastService.error('As senhas não coincidem');
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

          this.toastService.success('Senha alterada com sucesso!');
        } catch (error: any) {
          this.toastService.error(error.message || 'Erro ao alterar senha');
          return;
        }
      }

      updateProfile(updatedProfile);
      this.toastService.success('Perfil atualizado com sucesso!');

      // Atualiza o profile local
      this.profile = updatedProfile;

      // Fecha o modal após 2 segundos
      setTimeout(() => this.close(), 2000);

    } catch (error) {
      this.toastService.error('Erro ao atualizar o perfil. Tente novamente.');
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
}
