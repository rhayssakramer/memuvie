import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { saveProfile, startSession, logoutAll, getProfile } from '../../utils/auth';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-identification',
  templateUrl: './identification.component.html',
  styleUrls: ['./identification.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class IdentificationComponent implements OnInit {
  userName: string = '';
  email: string = '';
  password: string = '';
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  isSubmitting: boolean = false;
  errorMessage: string = '';

  ngOnInit() {
    // Limpar tudo na inicialização
    logoutAll();
    // Limpe todo o armazenamento para ficar mais seguro
    localStorage.clear();
    sessionStorage.clear();
  }

  constructor(
    private router: Router,
    private authService: AuthService,
    private toastService: ToastService
  ) {
    // Forçar a limpeza de qualquer sessão existente na criação do componente
    logoutAll();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      // Criar URL de visualização
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  onSubmit() {
    if (!this.userName.trim() || !this.email.trim() || !this.password.trim()) {
      this.errorMessage = 'Por favor, preencha todos os campos obrigatórios.';
      this.toastService.error(this.errorMessage);
      return;
    }

    // Verificar se já existe um perfil local com este email
    const existingProfile = getProfile();
    if (existingProfile && existingProfile.email.toLowerCase() === this.email.trim().toLowerCase()) {
      this.errorMessage = 'Este email já está sendo usado. Faça login ao invés de criar um novo perfil.';
      this.toastService.error(this.errorMessage);
      return;
    }

    // Verificar todos os dados no localStorage para emails duplicados
    const storedUserName = localStorage.getItem('userName');
    const storedUserEmail = localStorage.getItem('userEmail');
    if (storedUserEmail && storedUserEmail.toLowerCase() === this.email.trim().toLowerCase()) {
      this.errorMessage = 'Este email já está cadastrado localmente. Faça login para continuar.';
      this.toastService.error(this.errorMessage);
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const registerRequest = {
      nome: this.userName.trim(),
      email: this.email.trim(),
      senha: this.password.trim(),
      fotoPerfil: this.previewUrl || undefined
    };

    // Registrar APENAS no backend - SEM FALLBACK LOCAL
    this.authService.register(registerRequest).subscribe({
      next: (response) => {
        console.log('Registro bem-sucedido:', response);

        // Salvar os dados da sessão
        if (response.token) {
          localStorage.setItem('token', response.token);
        }

        // Salvar o perfil
        saveProfile({
          name: this.userName.trim(),
          email: this.email.trim(),
          photo: this.previewUrl || null
        });

        // Inicia a sessão de 4h
        startSession(4);

        // Backward-compat keys
        localStorage.setItem('userName', this.userName.trim());
        localStorage.setItem('userEmail', this.email.trim());
        if (this.previewUrl) {
          localStorage.setItem('userPhoto', this.previewUrl);
        }

        this.toastService.success('Perfil criado com sucesso!');
        this.router.navigate(['/interaction']);
      },
      error: (error) => {
        console.error('Erro ao criar perfil:', error);
        this.isSubmitting = false;

        // Tratar especificamente email duplicado
        if (error.status === 409 || (error.error && error.error.message && error.error.message.includes('já está em uso'))) {
          this.errorMessage = 'Este email já está cadastrado. Tente fazer login ou use outro email.';
          this.toastService.error(this.errorMessage);
          return;
        }

        // Para qualquer outro erro, NÃO criar localmente
        this.errorMessage = error.message || 'Erro ao conectar com o servidor. Tente novamente mais tarde.';
        this.toastService.error(this.errorMessage);
      }
    });
  }

  onBack() {
    this.router.navigate(['/']);
  }

}
