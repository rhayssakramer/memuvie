import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-esqueci-senha',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './esqueci-senha.component.html',
  styleUrls: ['./esqueci-senha.component.css']
})
export class EsqueciSenhaComponent {
  @Input() embedded: boolean = false;
  @Output() close = new EventEmitter<void>();
  email: string = '';
  mensagem: string = '';
  erro: string = '';
  enviado: boolean = false;
  loading: boolean = false;

  constructor(private authService: AuthService, private router: Router, private toastService: ToastService) {}

  onSubmit() {
    // Limpa mensagens anteriores
    this.erro = '';
    this.mensagem = '';
    
    // Valida o email
    if (!this.email.trim()) {
      this.toastService.error('Por favor, informe seu email');
      this.erro = 'Por favor, informe seu email';
      return;
    }
    
    // Exibe indicador de carregamento
    this.loading = true;

    // Chama o serviço de authentication para solicitar reset
    this.authService.solicitarRedefinicaoSenha(this.email).subscribe({
      next: (response) => {
        this.loading = false;
        this.enviado = true;
        this.mensagem = response.mensagem || 'Email enviado com sucesso! Verifique sua caixa de entrada.';
        this.toastService.success(this.mensagem);
      },
      error: (err) => {
        console.error('Erro ao solicitar redefinição de senha:', err);
        this.loading = false;
        
        // Mesmo em caso de error, mostramos uma message genérica para do not revelar
        // quais emails estão cadastrados no sistema
        this.enviado = true;
        this.mensagem = 'Se o email estiver cadastrado em nosso sistema, você receberá um link para redefinir sua senha em instantes.';
        this.toastService.info(this.mensagem);
        
        // Para debug only
        // this.error = err.message || 'Ocorreu um error ao processar sua solicitação.';
      }
    });
  }

  // Retorna para a tela de login
  voltar() {
    if (this.embedded) {
      this.close.emit();
    } else {
      this.router.navigate(['/login']);
    }
  }
}