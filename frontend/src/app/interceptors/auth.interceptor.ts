import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { getSession } from '../utils/auth';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor() {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Pegar o token do localStorage
    const session = getSession();

    // Se o token existe e não expirou
    if (session && session.token && session.expiresAt > Date.now()) {
      // Clone a requisição e adicione o header de autorização
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${session.token}`
        }
      });
    }

    return next.handle(request);
  }
}