import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DotsBackgroundComponent } from '../../shared/dots-background/dots-background.component';

@Component({
  selector: 'app-redefinir-senha',
  templateUrl: './redefinir-senha.component.html',
  styleUrls: ['./redefinir-senha.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, DotsBackgroundComponent]
})
export class RedefinirSenhaComponent implements OnInit {
  token: string = '';
  novaSenha: string = '';
  confirmarSenha: string = '';
  loading: boolean = false;
  erro: string = '';
  tokenValido: boolean = false;
  sucesso: boolean = false;
  verificandoToken: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
      
      if (!this.token) {
        this.erro = 'Token de redefinição não encontrado';
        this.verificandoToken = false;
        return;
      }

      this.verificarToken();
    });
  }

  verificarToken(): void {
    this.verificandoToken = true;
    this.authService.verificarTokenRedefinicao(this.token).subscribe({
      next: (resposta) => {
        // Verifica se a resposta contém a propriedade 'valido'
        this.tokenValido = resposta && (resposta.valido === true);
        this.verificandoToken = false;
        console.log('Resposta da verificação do token:', resposta);
      },
      error: (error) => {
        if (error.status === 400) {
          this.erro = 'Este token de redefinição é inválido ou expirou';
        } else {
          this.erro = 'Erro ao verificar o token. Tente novamente mais tarde.';
        }
        this.tokenValido = false;
        this.verificandoToken = false;
      }
    });
  }

  onSubmit(): void {
    this.erro = '';
    
    if (!this.novaSenha) {
      this.erro = 'Por favor, informe a nova senha';
      return;
    }
    
    if (this.novaSenha.length < 6) {
      this.erro = 'A senha deve ter pelo menos 6 caracteres';
      return;
    }
    
    if (this.novaSenha !== this.confirmarSenha) {
      this.erro = 'As senhas não coincidem';
      return;
    }

    this.loading = true;
    this.authService.redefinirSenha(this.token, this.novaSenha).subscribe({
      next: () => {
        this.sucesso = true;
        this.loading = false;
      },
      error: (error) => {
        if (error.status === 400) {
          this.erro = 'Token inválido ou expirado';
        } else {
          this.erro = 'Erro ao redefinir senha. Tente novamente mais tarde.';
        }
        this.loading = false;
      }
    });
  }

  voltar(): void {
    this.router.navigate(['/login']);
  }
}