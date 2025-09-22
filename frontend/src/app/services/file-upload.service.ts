import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpHeaders, HttpRequest } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
  private apiUrl = `${environment.apiUrl}/files`;

  constructor(private http: HttpClient) { }

  // Upload de arquivo comum
  uploadFile(file: File): Observable<HttpEvent<any>> {
    const formData: FormData = new FormData();
    formData.append('file', file);

    const req = new HttpRequest('POST', `${this.apiUrl}/upload`, formData, {
      reportProgress: true,
      responseType: 'json',
      headers: new HttpHeaders({
        'Authorization': `Bearer ${this.getToken()}`
      })
    });

    return this.http.request(req)
      .pipe(catchError(this.handleError<HttpEvent<any>>('uploadFile')));
  }

  // Upload de imagem como Base64
  uploadBase64(base64Image: string, filename: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/upload-base64`, {
      content: base64Image,
      filename: filename
    }, this.getHttpOptions())
      .pipe(catchError(this.handleError<any>('uploadBase64')));
  }

  // Obter URL do arquivo
  getFileUrl(filename: string): string {
    return `${environment.apiUrl}/files/${filename}`;
  }

  // Obter os cabeçalhos HTTP com o token de autenticação
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
      console.error(`${operation} failed: ${error.message}`);

      let errorMessage = 'Ocorreu um erro no upload do arquivo';

      if (error.status === 401) {
        errorMessage = 'Não autorizado. Faça login novamente.';
      } else if (error.error && error.error.message) {
        errorMessage = error.error.message;
      }

      return throwError(() => new Error(errorMessage));
    };
  }
}
