import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { EsqueciSenhaComponent } from '../esqueci-senha/esqueci-senha.component';
import { DotsBackgroundComponent } from '../../shared/dots-background/dots-background.component';
import { getProfile, logoutAll, saveProfile, UserProfile, saveSession } from '../../utils/auth';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, EsqueciSenhaComponent, DotsBackgroundComponent],
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

  // Controle da visibilidade da password
  showPassword: boolean = false;
  showNewPassword: boolean = false;
  showConfirmPassword: boolean = false;

  constructor(private router: Router, private authService: AuthService, private toast: ToastService) {}

  toggleShowPassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    this.error = '';
    if (!this.email.trim() || !this.password.trim()) {
      this.error = 'Preencha e-mail e senha';
      this.toast.error(this.error);
      return;
    }

    // Tentar authenticate no backend primeiro
    this.authService.login({
      email: this.email.trim(),
      senha: this.password.trim()  // Alterado de password para password para corresponder ao backend
    }).subscribe({
      next: (response) => {
        console.log('Login bem-sucedido com resposta:', response);

        // Save a sessão e o profile
        saveSession(response.token, response.expiresAt);

        // Verifica se temos dados de usuário válidos
        if (response.user && response.user.name) {
          saveProfile(response.user);

          // Também salvar em formato legado para compatibilidade
          localStorage.setItem('userName', response.user.name);
          localStorage.setItem('userEmail', response.user.email);
          if (response.user.photo) {
            localStorage.setItem('userPhoto', response.user.photo);
          }

          console.log('Perfil de usuário salvo:', response.user);
        } else {
          console.error('Dados de usuário inválidos na resposta de login');
        }

        this.router.navigate(['/interaction']);
      },
      error: (err) => {
        // Fallback para o modo local (temporário até backend completo)
        console.warn('Backend auth failed, trying local mode:', err);

        // Verifica o profile salvo localmente
        const profile = getProfile();
        if (profile && profile.email.toLowerCase() === this.email.trim().toLowerCase()) {
          // Usar startSession importado do auth.ts
          const session = {
            token: Math.random().toString(36).substring(2),
            expiresAt: Date.now() + 4 * 60 * 60 * 1000
          };
          saveSession(session.token, session.expiresAt);
          this.router.navigate(['/interaction']);
        } else {
          this.error = 'Email ou senha inválidos. Crie seu perfil primeiro.';
          this.toast.error(this.error);
        }
      }
    });
  }

  // Abre o modal de criação de profile
  // Recebe o evento do click para prevenir o comportamento padrão do <a href="#"> (evita navegação)
  goToCreate(event?: Event) {
    if (event) {
      event.preventDefault();
    }
    logoutAll(); // Limpa qualquer sessão anterior
    this.showCreateProfile = true;
    // Desabilita a body scroll enquanto o modal estiver aberto
    try {
      document.body.style.overflow = 'hidden';
    } catch (e) {
      // server-side rendering ou environment ou ambiente sem documento - ignorar
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
      // Ignorar erros
    }
  }

  // Navegação para a página de recovery de password
  esqueceuSenha() {
    // Abrir o embedded recovery modal incorporado em vez de navegar
    this.showRecoveryModal = true;
    try {
      document.body.style.overflow = 'hidden';
    } catch (e) {}
  }

  showRecoveryModal: boolean = false;

  closeRecovery() {
    this.showRecoveryModal = false;
    try {
      document.body.style.overflow = '';
    } catch (e) {}
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Verificar o size do file (limitar a 1MB)
      if (file.size > 1024 * 1024) {
        this.error = 'A imagem é muito grande. Por favor, selecione uma imagem com menos de 1MB.';
        this.toast.error(this.error);
        return;
      }

      this.selectedFile = file;
      this.resizeAndCompressImage(file);
    }
  }

  // Método para redimensionar e comprimir a image
  resizeAndCompressImage(file: File) {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const img = new Image();
      img.onload = () => {
        // Redimensionar para um size máximo razoável
        let width = img.width;
        let height = img.height;
        const MAX_SIZE = 500; // pixels - size máximo em qualquer dimensão

        if (width > height && width > MAX_SIZE) {
          height = Math.round((height * MAX_SIZE) / width);
          width = MAX_SIZE;
        } else if (height > MAX_SIZE) {
          width = Math.round((width * MAX_SIZE) / height);
          height = MAX_SIZE;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);

          // Comprimir a image - qualidade reduzida para JPEG
          // Qualidade entre 0 e 1, onde 1 é a melhor qualidade
          const compressedImageData = canvas.toDataURL('image/jpeg', 0.7);
          this.previewUrl = compressedImageData;

          // Verificar o size final da string
          if (this.previewUrl.length > 900000) { // Limite um pouco abaixo do size do campo no banco
            this.error = 'A imagem ainda está muito grande após compressão. Por favor, selecione uma imagem menor.';
            this.selectedFile = null;
            this.previewUrl = null;
            this.toast.error(this.error);
          } else {
            this.error = ''; // Limpa qualquer error anterior
          }
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  // Remove a image selecionada sem abrir o seletor
  removeSelected(event: Event) {
    // Evita que o clique no button abra o input file (propagação para o container)
    event.stopPropagation();
    this.selectedFile = null;
    this.previewUrl = null;
  }

  createProfile() {
    // Validation dos campos
    if (!this.newUserName.trim() || !this.newEmail.trim() || !this.newPassword.trim() || !this.newConfirmPassword.trim()) {
      this.error = 'Preencha todos os campos obrigatórios';
      this.toast.error(this.error);
      return;
    }

    if (this.newPassword.length < 6) {
      this.error = 'A senha deve ter no mínimo 6 caracteres';
      this.toast.error(this.error);
      return;
    }

    if (this.newPassword !== this.newConfirmPassword) {
      this.error = 'As senhas não conferem';
      this.toast.error(this.error);
      return;
    }

    // Verificar se já existe perfil com este email
    const existingProfile = getProfile();
    if (existingProfile && existingProfile.email.toLowerCase() === this.newEmail.trim().toLowerCase()) {
      this.error = 'Este email já está sendo usado. Faça login ao invés de criar um novo perfil.';
      this.toast.error(this.error);
      return;
    }

    // Verificar dados legados também
    const storedUserEmail = localStorage.getItem('userEmail');
    if (storedUserEmail && storedUserEmail.toLowerCase() === this.newEmail.trim().toLowerCase()) {
      this.error = 'Este email já está cadastrado. Faça login para continuar.';
      this.toast.error(this.error);
      return;
    }

    // Criar o objeto de registro
    const registerRequest = {
      nome: this.newUserName.trim(),
      email: this.newEmail.trim(),
      senha: this.newPassword.trim(),
      fotoPerfil: this.previewUrl || undefined
    };

    // Registrar APENAS no backend - SEM FALLBACK LOCAL
    this.authService.register(registerRequest).subscribe({
      next: (response) => {
        console.log('Registro bem-sucedido com resposta:', response);

        // save a sessão e o profile
        saveSession(response.token, response.expiresAt);
        saveProfile(response.user);

        // Também salvar em formato legado para compatibilidade
        localStorage.setItem('userName', response.user.name);
        localStorage.setItem('userEmail', response.user.email);
        if (response.user.photo) {
          localStorage.setItem('userPhoto', response.user.photo);
        }

        console.log('Perfil de usuário salvo após registro:', response.user);

        // Preencher o formulário de login
        this.email = this.newEmail.trim();
        this.password = this.newPassword.trim();

        // Limpar os campos do formulário
        this.newUserName = '';
        this.newEmail = '';
        this.newPassword = '';
        this.newConfirmPassword = '';
        this.selectedFile = null;
        this.previewUrl = null;

        // Fechar o modal
        this.showCreateProfile = false;

  // Mensagem de sucesso
  const msgSuccess = 'Perfil criado com sucesso! Faça login para continuar.';
  this.error = msgSuccess; // mantém feedback inline existente
  this.toast.success(msgSuccess);
      },
      error: (err) => {
        console.error('Registration failed:', err);

        // Tratar especificamente email duplicado
        if (err.status === 409 || (err.error && err.error.message && err.error.message.includes('já está em uso'))) {
          this.error = 'Este email já está cadastrado. Tente fazer login ou use outro email.';
          this.toast.error(this.error);
          return;
        }

        // Para qualquer outro erro, NÃO criar localmente - apenas mostrar erro
        this.error = err.message || 'Erro ao conectar com o servidor. Tente novamente mais tarde.';
        this.toast.error(this.error);
      }
    });
  }

  toggleShowNewPassword() {
    this.showNewPassword = !this.showNewPassword;
  }

  toggleShowConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
}
