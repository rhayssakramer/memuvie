import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { EsqueciSenhaComponent } from '../esqueci-senha/esqueci-senha.component';
import { getProfile, logoutAll, saveProfile, UserProfile, saveSession } from '../../utils/auth';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, EsqueciSenhaComponent],
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

  // Controle da visibilidade da senha
  showPassword: boolean = false;

  constructor(private router: Router, private authService: AuthService) {}

  toggleShowPassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    this.error = '';
    if (!this.email.trim() || !this.password.trim()) {
      this.error = 'Preencha e-mail e senha';
      return;
    }

    // Tentar autenticar no backend primeiro
    this.authService.login({
      email: this.email.trim(),
      senha: this.password.trim()  // Alterado de password para senha para corresponder ao backend
    }).subscribe({
      next: (response) => {
        // Salvar a sessão e o perfil
        saveSession(response.token, response.expiresAt);
        saveProfile(response.user);
        this.router.navigate(['/interaction']);
      },
      error: (err) => {
        // Fallback para o modo local (temporário até backend completo)
        console.warn('Backend auth failed, trying local mode:', err);

        // Verifica o perfil salvo localmente
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
        }
      }
    });
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
      // Ignore errors
    }
  }

  // Navegação para a página de recuperação de senha
  esqueceuSenha() {
    // Open embedded recovery modal instead of navigating
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

      // Verificar o tamanho do arquivo (limitar a 1MB)
      if (file.size > 1024 * 1024) {
        this.error = 'A imagem é muito grande. Por favor, selecione uma imagem com menos de 1MB.';
        return;
      }

      this.selectedFile = file;
      this.resizeAndCompressImage(file);
    }
  }

  // Método para redimensionar e comprimir a imagem
  resizeAndCompressImage(file: File) {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const img = new Image();
      img.onload = () => {
        // Redimensionar para um tamanho máximo razoável
        let width = img.width;
        let height = img.height;
        const MAX_SIZE = 500; // pixels - tamanho máximo em qualquer dimensão

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

          // Comprimir a imagem - qualidade reduzida para JPEG
          // Qualidade entre 0 e 1, onde 1 é a melhor qualidade
          const compressedImageData = canvas.toDataURL('image/jpeg', 0.7);
          this.previewUrl = compressedImageData;

          // Verificar o tamanho final da string
          if (this.previewUrl.length > 900000) { // Limite um pouco abaixo do tamanho do campo no banco
            this.error = 'A imagem ainda está muito grande após compressão. Por favor, selecione uma imagem menor.';
            this.selectedFile = null;
            this.previewUrl = null;
          } else {
            this.error = ''; // Limpa qualquer erro anterior
          }
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  // Remove a imagem selecionada sem abrir o seletor
  removeSelected(event: Event) {
    // Evita que o clique no botão abra o input file (propagação para o container)
    event.stopPropagation();
    this.selectedFile = null;
    this.previewUrl = null;
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

    // Criar o objeto de registro
    const registerRequest = {
      nome: this.newUserName.trim(),
      email: this.newEmail.trim(),
      senha: this.newPassword.trim(),
      fotoPerfil: this.previewUrl || undefined
    };

    // Registrar no backend
    this.authService.register(registerRequest).subscribe({
      next: (response) => {
        // Salvar a sessão e o perfil
        saveSession(response.token, response.expiresAt);
        saveProfile(response.user);

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

        // Mostrar mensagem de sucesso
        this.error = 'Perfil criado com sucesso! Faça login para continuar.';
      },
      error: (err) => {
        console.error('Registration failed:', err);

        // Fallback para o modo local (temporário até backend completo)
        try {
          // Salva o novo perfil localmente
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

          // Mostra mensagem de sucesso (com aviso)
          this.error = 'Perfil criado localmente! Faça login para continuar. Nota: O backend pode não estar disponível.';
        } catch (e) {
          this.error = 'Erro ao criar perfil. Tente novamente.';
        }
      }
    });
  }
}
