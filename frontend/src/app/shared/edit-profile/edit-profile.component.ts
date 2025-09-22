import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { getProfile, updateProfile } from '../../utils/auth';

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
      
      // Verifica o tamanho do arquivo (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.errorMessage = 'A foto deve ter no máximo 5MB';
        return;
      }

      // Verifica o tipo do arquivo
      if (!file.type.startsWith('image/')) {
        this.errorMessage = 'Por favor, selecione uma imagem válida';
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
      this.errorMessage = 'As senhas não coincidem';
      return;
    }

    try {
      // Se tiver foto, converte para base64
      let photoBase64 = null;
      if (this.form.photo) {
        photoBase64 = await this.fileToBase64(this.form.photo);
      }

      // Atualiza o perfil
      const updatedProfile = {
        ...this.profile,
        name: this.form.name,
        email: this.form.email,
        photo: photoBase64 || this.profile.photo
      };

      // TODO: Implementar atualização de senha no backend
      if (this.form.newPassword) {
        // updatePassword(this.form.currentPassword, this.form.newPassword);
      }

      updateProfile(updatedProfile);
      this.successMessage = 'Perfil atualizado com sucesso!';
      
      // Atualiza o perfil local
      this.profile = updatedProfile;
      
      // Fecha o modal após 2 segundos
      setTimeout(() => this.close(), 2000);

    } catch (error) {
      this.errorMessage = 'Erro ao atualizar o perfil. Tente novamente.';
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
}