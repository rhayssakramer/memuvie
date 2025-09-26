import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ImageVerificationService {
  constructor(private http: HttpClient) {}

  /**
   * Verifica se uma URL de imagem é válida e acessível
   * @param url URL da imagem para verificar
   * @returns Promise que resolve para true se a imagem for acessível, false caso contrário
   */
  verifyImageUrl(url: string): Promise<boolean> {
    return new Promise((resolve) => {
      const img = new Image();

      img.onload = () => {
        console.log(`Imagem verificada com sucesso: ${url}`);
        resolve(true);
      };

      img.onerror = () => {
        console.error(`Erro ao verificar imagem: ${url}`);
        resolve(false);
      };

      img.src = url;

      // Timeout de segurança após 5 segundos
      setTimeout(() => {
        if (!img.complete) {
          console.error(`Timeout ao verificar imagem: ${url}`);
          resolve(false);
        }
      }, 5000);
    });
  }

  /**
   * Tenta acessar uma URL via proxy para verificar se está acessível
   * @param url URL para verificar
   */
  checkUrlWithProxy(url: string) {
    // Usamos o método HEAD para evitar baixar o conteúdo completo
    return this.http.head(url, { observe: 'response' })
      .pipe(
        tap(response => {
          console.log(`URL verificada via proxy: ${url}`);
          console.log(`Status: ${response.status}`);
          return response.status >= 200 && response.status < 300;
        })
      );
  }
}
