import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpHeaders, HttpRequest } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
  private apiUrl = `${environment.apiUrl}/api/media`;

  constructor(private http: HttpClient) { }

  // Upload de imagem para o Cloudinary
  uploadImage(file: File): Observable<string> {
    const formData: FormData = new FormData();
    formData.append('file', file);

    return this.http.post<string>(`${this.apiUrl}/upload-image`, formData, {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${this.getToken()}`
      })
    }).pipe(
      tap(url => {
        console.log('URL da imagem retornada pelo servidor:', url);
        // Verificamos se a URL retornada pelo servidor tem um formato válido
        if (!url || (typeof url === 'string' && !url.startsWith('http'))) {
          console.error('URL inválida retornada pelo servidor:', url);
        }
      }),
      map(url => {
        // Garantimos que a URL seja uma string válida
        if (!url) {
          throw new Error('URL vazia retornada pelo servidor');
        }

        // Verificamos se a resposta é um objeto JSON em vez de uma string
        if (typeof url === 'object') {
          // Se for um objeto, tentamos extrair a URL
          const urlFromObject = (url as any).url || (url as any).secure_url;
          if (urlFromObject) {
            console.log('URL extraída do objeto:', urlFromObject);
            return urlFromObject;
          }
          throw new Error('Formato de resposta inesperado do servidor');
        }

        return url;
      }),
      catchError(this.handleError<string>('uploadImage'))
    );
  }

  // Upload de vídeo para o Cloudinary
  uploadVideo(file: File): Observable<string> {
    const formData: FormData = new FormData();
    formData.append('file', file);

    return this.http.post<string>(`${this.apiUrl}/upload-video`, formData, {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${this.getToken()}`
      })
    }).pipe(
      tap(url => {
        console.log('URL do vídeo retornada pelo servidor:', url);
        // Verificamos se a URL retornada pelo servidor tem um formato válido
        if (!url || (typeof url === 'string' && !url.startsWith('http'))) {
          console.error('URL inválida retornada pelo servidor:', url);
        }
      }),
      map(url => {
        // Garantimos que a URL seja uma string válida
        if (!url) {
          throw new Error('URL vazia retornada pelo servidor');
        }

        // Verificamos se a resposta é um objeto JSON em vez de uma string
        if (typeof url === 'object') {
          // Se for um objeto, tentamos extrair a URL
          const urlFromObject = (url as any).url || (url as any).secure_url;
          if (urlFromObject) {
            console.log('URL extraída do objeto:', urlFromObject);
            return urlFromObject;
          }
          throw new Error('Formato de resposta inesperado do servidor');
        }

        return url;
      }),
      catchError(this.handleError<string>('uploadVideo'))
    );
  }

  // Upload de file comum (mantido para compatibilidade)
  uploadFile(file: File): Observable<HttpEvent<any>> {
    const formData: FormData = new FormData();
    formData.append('file', file);

    const req = new HttpRequest('POST', `${environment.apiUrl}/files/upload`, formData, {
      reportProgress: true,
      responseType: 'json',
      headers: new HttpHeaders({
        'Authorization': `Bearer ${this.getToken()}`
      })
    });

    return this.http.request(req)
      .pipe(catchError(this.handleError<HttpEvent<any>>('uploadFile')));
  }

  // Upload de image como Base64
  uploadBase64(base64Image: string, filename: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/upload-base64`, {
      content: base64Image,
      filename: filename
    }, this.getHttpOptions())
      .pipe(catchError(this.handleError<any>('uploadBase64')));
  }

  // Obter URL do file
  getFileUrl(filename: string): string {
    return `${environment.apiUrl}/files/${filename}`;
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
  private handleError<T>(operation = 'operation') {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed:`, error);
      console.error(`Detalhes do erro:`, {
        status: error.status,
        message: error.message,
        error: error.error
      });

      let errorMessage = 'Ocorreu um erro no upload do arquivo';

      if (error.status === 401) {
        errorMessage = 'Não autorizado. Faça login novamente.';
      } else if (error.error && error.error.message) {
        errorMessage = error.error.message;
      }

      // Alertamos sobre o erro no console para ajudar na depuração
      console.warn(`Erro durante ${operation}:`, errorMessage);

      return throwError(() => new Error(errorMessage));
    };
  }
}
