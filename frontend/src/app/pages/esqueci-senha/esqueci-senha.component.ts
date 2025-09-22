import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-esqueci-senha',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './esqueci-senha.component.html',
  styleUrls: ['./esqueci-senha.component.css']
})
export class EsqueciSenhaComponent {
  email: string = '';
  mensagem: string = '';
  erro: string = '';
  enviado: boolean = false;
  loading: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    // Limpa mensagens anteriores
    this.erro = '';
    this.mensagem = '';
    
    // Valida o email
    if (!this.email.trim()) {
      this.erro = 'Por favor, informe seu email';
      return;
    }
    
    // Exibe indicador de carregamento
    this.loading = true;

    // Chama o serviço de autenticação para solicitar redefinição
    this.authService.solicitarRedefinicaoSenha(this.email).subscribe({
      next: (response) => {
        this.loading = false;
        this.enviado = true;
        this.mensagem = response.mensagem || 'Email enviado com sucesso! Verifique sua caixa de entrada.';
      },
      error: (err) => {
        console.error('Erro ao solicitar redefinição de senha:', err);
        this.loading = false;
        
        // Mesmo em caso de erro, mostramos uma mensagem genérica para não revelar
        // quais emails estão cadastrados no sistema
        this.enviado = true;
        this.mensagem = 'Se o email estiver cadastrado em nosso sistema, você receberá um link para redefinir sua senha em instantes.';
        
        // Para debug apenas
        // this.erro = err.message || 'Ocorreu um erro ao processar sua solicitação.';
      }
    });
  }

  // Retorna para a tela de login
  voltar() {
    this.router.navigate(['/login']);
  }
}