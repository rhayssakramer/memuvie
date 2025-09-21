import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { getProfile, startSession, logoutAll, saveProfile, UserProfile } from '../../utils/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  // Campos do login
  email = '';
  password = '';
  error = '';
  
  // Controle do modal
  showCreateProfile = false;
  
  // Campos do formulário de criação
  newUserName = '';
  newEmail = '';
  newPassword = '';
  newConfirmPassword = '';
  selectedFile: File | null = null;
  previewUrl: string | null = null;

  constructor(private router: Router) {}

  onSubmit() {
    this.error = '';
    if (!this.email.trim() || !this.password.trim()) {
      this.error = 'Preencha e-mail e senha';
      return;
    }

    // Verifica o perfil salvo
    const profile = getProfile();
    if (profile && profile.email.toLowerCase() === this.email.trim().toLowerCase()) {
      startSession(4);
      this.router.navigate(['/interaction']);
    } else {
      this.error = 'Perfil não encontrado. Crie seu perfil primeiro.';
    }
  }

  // Abre o modal de criação de perfil
  // Recebe o evento do click para prevenir o comportamento padrão do <a href="#"> (evita navegação)
  goToCreate(event?: Event) {
    if (event) {
      event.preventDefault();
    }
    logoutAll(); // Limpa qualquer sessão anterior
    this.showCreateProfile = true;
    // Disable body scroll while modal is open
    try {
      document.body.style.overflow = 'hidden';
    } catch (e) {
      // server-side rendering or environment without document - ignore
    }
  }

  // Fecha o modal e limpa os campos
  closeCreateProfile() {
    this.showCreateProfile = false;
    this.newUserName = '';
    this.newEmail = '';
    this.newPassword = '';
    this.newConfirmPassword = '';
    this.selectedFile = null;
    this.previewUrl = null;
    // Re-enable body scroll
    try {
      document.body.style.overflow = '';
    } catch (e) {
      // ignore
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  createProfile() {
    // Validação dos campos
    if (!this.newUserName.trim() || !this.newEmail.trim() || !this.newPassword.trim() || !this.newConfirmPassword.trim()) {
      this.error = 'Preencha todos os campos obrigatórios';
      return;
    }

    if (this.newPassword.length < 6) {
      this.error = 'A senha deve ter no mínimo 6 caracteres';
      return;
    }

    if (this.newPassword !== this.newConfirmPassword) {
      this.error = 'As senhas não conferem';
      return;
    }
    
    try {
      // Salva o novo perfil
      saveProfile({
        name: this.newUserName.trim(),
        email: this.newEmail.trim(),
        photo: this.previewUrl || null
      });
      
      // Salva os dados de compatibilidade
      localStorage.setItem('userName', this.newUserName.trim());
      if (this.previewUrl) {
        localStorage.setItem('userPhoto', this.previewUrl);
      }
      
      // Preenche o formulário de login
      this.email = this.newEmail.trim();
      this.password = this.newPassword.trim();
      
      // Limpa os campos do formulário de criação
      this.newUserName = '';
      this.newEmail = '';
      this.newPassword = '';
  this.newConfirmPassword = '';
      this.selectedFile = null;
      this.previewUrl = null;
      
      // Fecha o modal
      this.showCreateProfile = false;
      
      // Mostra mensagem de sucesso
      this.error = 'Perfil criado com sucesso! Faça login para continuar.';
    } catch (e) {
      this.error = 'Erro ao criar perfil. Tente novamente.';
    }
  }
}
