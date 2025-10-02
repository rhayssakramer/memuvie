import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface GaleriaPost {
  id?: number;
  mensagem?: string;
  fotoUrl?: string;
  videoUrl?: string;
  dataCriacao?: string;
  eventoId?: number;
  usuarioId?: number;
  usuario?: {
    id: number;
    nome: string;
    email: string;
    fotoPerfil?: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class GaleriaService {
  private apiUrl = `${environment.apiUrl}/api/galeria`;

  constructor(private http: HttpClient) { }

  // Obter todos os posts da galeria
  getPosts(): Observable<GaleriaPost[]> {
    return this.http.get<GaleriaPost[]>(this.apiUrl, this.getHttpOptions())
      .pipe(catchError(this.handleError<GaleriaPost[]>('getPosts', [])));
  }

  // Obter posts por evento
  getPostsByEvento(eventoId: number): Observable<GaleriaPost[]> {
    return this.http.get<GaleriaPost[]>(`${this.apiUrl}/evento/${eventoId}`, this.getHttpOptions())
      .pipe(catchError(this.handleError<GaleriaPost[]>('getPostsByEvento', [])));
  }

  // Criar um novo post
  createPost(post: GaleriaPost): Observable<GaleriaPost> {
    return this.http.post<GaleriaPost>(this.apiUrl, post, this.getHttpOptions())
      .pipe(catchError(this.handleError<GaleriaPost>('createPost')));
  }

  // Atualizar um post existente
  updatePost(id: number, post: GaleriaPost): Observable<GaleriaPost> {
    return this.http.put<GaleriaPost>(`${this.apiUrl}/${id}`, post, this.getHttpOptions())
      .pipe(catchError(this.handleError<GaleriaPost>('updatePost')));
  }

  // Remove um post
  deletePost(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`, this.getHttpOptions())
      .pipe(catchError(this.handleError<any>('deletePost')));
  }

  // Obter os cabeçalhos HTTP com o token de authentication
  private getHttpOptions() {
    const token = this.getToken();
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      })
    };
  }

  // Obter o token do localStorage
  private getToken(): string {
    const sessionStr = localStorage.getItem('session');
    if (!sessionStr) return '';

    try {
      const session = JSON.parse(sessionStr);
      return session.token || '';
    } catch {
      return '';
    }
  }

  // Tratamento de erros
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);

      let errorMessage = 'Ocorreu um erro na operação';

      if (error.status === 401) {
        errorMessage = 'Não autorizado. Faça login novamente.';
      } else if (error.error && error.error.message) {
        errorMessage = error.error.message;
      }

      return throwError(() => new Error(errorMessage));
    };
  }
}