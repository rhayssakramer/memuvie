import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toasts: Toast[] = [];
  private toastsSubject = new BehaviorSubject<Toast[]>([]);

  get toasts$(): Observable<Toast[]> {
    return this.toastsSubject.asObservable();
  }

  constructor() { }

  /**
   * Adiciona um novo toast à lista
   */
  showToast(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info', duration: number = 3000): number {
    // Gerar ID único baseado no timestamp
    const id = Date.now();
    
    // Criar o toast
    const toast: Toast = {
      id,
      message,
      type,
      duration
    };
    
    // Adicionar à lista e emitir evento
    this.toasts.push(toast);
    this.toastsSubject.next([...this.toasts]);
    
    // Configurar auto-remoção após a duração especificada
    if (duration > 0) {
      setTimeout(() => {
        this.removeToast(id);
      }, duration);
    }
    
    return id;
  }

  /**
   * Remove um toast específico pelo ID
   */
  removeToast(id: number): void {
    this.toasts = this.toasts.filter(t => t.id !== id);
    this.toastsSubject.next([...this.toasts]);
  }

  /**
   * Métodos de conveniência
   */
  success(message: string, duration: number = 3000): number {
    return this.showToast(message, 'success', duration);
  }

  error(message: string, duration: number = 5000): number {
    return this.showToast(message, 'error', duration);
  }

  info(message: string, duration: number = 3000): number {
    return this.showToast(message, 'info', duration);
  }

  warning(message: string, duration: number = 4000): number {
    return this.showToast(message, 'warning', duration);
  }

  /**
   * Remove todos os toasts
   */
  clearAll(): void {
    this.toasts = [];
    this.toastsSubject.next([]);
  }
}