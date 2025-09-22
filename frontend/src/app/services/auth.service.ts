import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { UserProfile } from '../utils/auth';

export interface LoginRequest {
  email: string;
  senha: string;  // Alterado de password para password para corresponder ao backend
}

export interface RegisterRequest {
  nome: string;  // Alterado de "name" para "name" para corresponder ao backend
  email: string;
  senha: string; // Alterado de "password" para "password" para corresponder ao backend
  fotoPerfil?: string;
}

export interface EsqueciSenhaRequest {
  email: string;
}

export interface RedefinirSenhaRequest {
  token: string;
  novaSenha: string;
}

export interface AuthResponse {
  token: string;
  expiresAt: number;
  user: UserProfile;
}

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) { }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<any>(`${this.apiUrl}/login`, request, httpOptions).pipe(
      tap(response => console.log('Login response:', response)),
      map(response => ({
        token: response.token,
        expiresAt: Date.now() + 3600000, // 1 hora de expiração padrão
        user: {
          name: response.usuario?.nome || '',
          email: response.usuario?.email || '',
          photo: response.usuario?.fotoPerfil || ''
        }
      })),
      catchError(this.handleError<AuthResponse>('login'))
    );
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<any>(`${this.apiUrl}/registrar`, request, httpOptions).pipe(
      map(response => ({
        token: response.token || '',  // Protegendo contra valores nulos
        expiresAt: Date.now() + (response.expiresIn || 3600000), // Default para 1 hora se do not especificado
        user: {
          name: response.nome || request.nome,
          email: response.email || request.email,
          photo: response.fotoPerfil || request.fotoPerfil
        }
      })),
      catchError(this.handleError<AuthResponse>('register'))
    );
  }

  // Método para validar token no backend
  validateToken(token: string): Observable<boolean> {
    return this.http.post<any>(`${this.apiUrl}/validate`, { token }, httpOptions).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }

  // Método para solicitar reset de password
  solicitarRedefinicaoSenha(email: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/esqueci-senha`, { email }, httpOptions).pipe(
      catchError(this.handleError<any>('solicitarRedefinicaoSenha'))
    );
  }

  // Método para verificar se um token de reset é válido
  verificarTokenRedefinicao(token: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/verificar-token?token=${token}`, httpOptions).pipe(
      tap(response => console.log('Resposta do backend para verificação de token:', response)),
      catchError(error => {
        console.error('Erro ao verificar token:', error);
        return throwError(() => new Error('Erro ao verificar o token. Tente novamente mais tarde.'));
      })
    );
  }

  // Método para reset a password usando um token
  redefinirSenha(token: string, novaSenha: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/redefinir-senha`, { token, novaSenha }, httpOptions).pipe(
      catchError(this.handleError<any>('redefinirSenha'))
    );
  }

  private handleError<T>(operation = 'operation') {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      console.error('Error details:', error);

      // message de error para o usuário
      let errorMessage = 'Ocorreu um erro na operação';

      // Para operações de reset de password, sempre retornamos uma message genérica
      if (operation === 'solicitarRedefinicaoSenha') {
        return throwError(() => new Error('Serviço temporariamente indisponível. Tente novamente mais tarde.'));
      }

      if (error.status === 401) {
        errorMessage = 'Email ou senha inválidos';
      } else if (error.status === 409) {
        errorMessage = 'Este email já está em uso';
      } else if (error.status === 500) {
        // Para erros 500, verificar se há uma message específica
        if (error.error && typeof error.error === 'object' && error.error.message) {
          errorMessage = `Erro no servidor: ${error.error.message}`;
        } else {
          errorMessage = 'Ocorreu um erro interno no servidor. A imagem pode ser muito grande ou em formato não suportado.';
        }
      } else if (error.error && error.error.message) {
        errorMessage = error.error.message;
      }

      return throwError(() => new Error(errorMessage));
    };
  }
}
