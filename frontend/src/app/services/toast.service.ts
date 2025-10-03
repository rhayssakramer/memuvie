import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
  duration: number; // ms, 0 to persist until close
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private toasts: Toast[] = [];
  private toastsSubject = new BehaviorSubject<Toast[]>([]);
  toasts$ = this.toastsSubject.asObservable();

  show(message: string, type: ToastType = 'info', duration = 3000): number {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    const toast: Toast = { id, message, type, duration };
    this.toasts.push(toast);
    this.toastsSubject.next([...this.toasts]);

    if (duration > 0) {
      setTimeout(() => this.dismiss(id), duration);
    }
    return id;
  }

  dismiss(id: number) {
    this.toasts = this.toasts.filter(t => t.id !== id);
    this.toastsSubject.next([...this.toasts]);
  }

  clearAll() {
    this.toasts = [];
    this.toastsSubject.next([]);
  }

  success(message: string, duration = 3000) { return this.show(message, 'success', duration); }
  error(message: string, duration = 5000) { return this.show(message, 'error', duration); }
  info(message: string, duration = 3000) { return this.show(message, 'info', duration); }
  warning(message: string, duration = 4000) { return this.show(message, 'warning', duration); }
}
