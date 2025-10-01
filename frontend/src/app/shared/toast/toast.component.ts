import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Toast, ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      <div 
        *ngFor="let toast of toasts" 
        class="toast" 
        [ngClass]="'toast-' + toast.type"
        (click)="removeToast(toast.id)">
        <div class="toast-content">
          <div class="toast-icon">
            <span *ngIf="toast.type === 'success'">✓</span>
            <span *ngIf="toast.type === 'error'">✕</span>
            <span *ngIf="toast.type === 'info'">ℹ</span>
            <span *ngIf="toast.type === 'warning'">⚠</span>
          </div>
          <div class="toast-message">{{ toast.message }}</div>
        </div>
        <button class="toast-close" (click)="removeToast(toast.id, $event)">✕</button>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-width: 300px;
    }
    
    .toast {
      padding: 12px;
      border-radius: 6px;
      box-shadow: 0 4px 8px rgba(0,0,0,0.2);
      display: flex;
      justify-content: space-between;
      align-items: center;
      animation: slide-in 0.3s ease-out;
      cursor: pointer;
    }
    
    .toast-content {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .toast-icon {
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      font-weight: bold;
    }
    
    .toast-message {
      flex: 1;
      font-size: 14px;
    }
    
    .toast-close {
      background: transparent;
      border: none;
      font-size: 16px;
      cursor: pointer;
      padding: 0;
      margin-left: 10px;
      opacity: 0.6;
      transition: opacity 0.2s;
      color: inherit;
    }
    
    .toast-close:hover {
      opacity: 1;
    }
    
    .toast-success {
      background-color: #d4edda;
      color: #155724;
      border-left: 4px solid #28a745;
    }
    
    .toast-error {
      background-color: #f8d7da;
      color: #721c24;
      border-left: 4px solid #dc3545;
    }
    
    .toast-info {
      background-color: #d1ecf1;
      color: #0c5460;
      border-left: 4px solid #17a2b8;
    }
    
    .toast-warning {
      background-color: #fff3cd;
      color: #856404;
      border-left: 4px solid #ffc107;
    }
    
    @keyframes slide-in {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `]
})
export class ToastComponent implements OnInit {
  toasts: Toast[] = [];

  constructor(private toastService: ToastService) { }

  ngOnInit(): void {
    // Inscrever-se para receber atualizações da lista de toasts
    this.toastService.toasts$.subscribe(toasts => {
      this.toasts = toasts;
    });
  }

  removeToast(id: number, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.toastService.removeToast(id);
  }
}