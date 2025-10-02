import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Evento {
  id?: number;
  titulo: string;
  descricao: string;
  dataEvento: string;
  localEvento: string;
  fotoCapa?: string;
  videoDestaque?: string;
  corTema?: string;
  tipoEvento?: string;
}

@Injectable({
  providedIn: 'root'
})
export class EventoService {
  private apiUrl = `${environment.apiUrl}/api/eventos`;

  constructor(private http: HttpClient) { }

  // Obter todos os eventos
  getEventos(): Observable<Evento[]> {
    return this.http.get<Evento[]>(this.apiUrl)
      .pipe(catchError(this.handleError<Evento[]>('getEventos', [])));
  }

  // Obter um evento específico
  getEvento(id: number): Observable<Evento> {
    return this.http.get<Evento>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError<Evento>('getEvento')));
  }

  // Criar um novo evento
  createEvento(evento: Evento): Observable<Evento> {
    return this.http.post<Evento>(this.apiUrl, evento, this.getHttpOptions())
      .pipe(catchError(this.handleError<Evento>('createEvento')));
  }

  // Atualizar um evento existente
  updateEvento(id: number, evento: Evento): Observable<Evento> {
    return this.http.put<Evento>(`${this.apiUrl}/${id}`, evento, this.getHttpOptions())
      .pipe(catchError(this.handleError<Evento>('updateEvento')));
  }

  // Remove um evento
  deleteEvento(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`, this.getHttpOptions())
      .pipe(catchError(this.handleError<any>('deleteEvento')));
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
