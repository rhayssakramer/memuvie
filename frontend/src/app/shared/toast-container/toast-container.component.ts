import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="toast-container" *ngIf="(toastService.toasts$ | async) as toasts">
    <div *ngFor="let t of toasts" class="toast" [class.success]="t.type==='success'" [class.error]="t.type==='error'" [class.info]="t.type==='info'" [class.warning]="t.type==='warning'">
      <span class="message">{{ t.message }}</span>
      <button class="close" aria-label="Fechar" (click)="toastService.dismiss(t.id)">×</button>
    </div>
  </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 16px;
      right: 16px;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      gap: 8px;
      pointer-events: none;
    }
    .toast {
      pointer-events: auto;
      display: flex;
      align-items: center;
      gap: 12px;
      min-width: 240px;
      max-width: 420px;
      padding: 10px 12px;
      border-radius: 8px;
      color: #fff;
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
      background-color: #2f2f2f;
      border-left: 4px solid #888;
      font-size: 14px;
    }
    .toast.success { background-color: #1f6f2e; border-left-color: #4caf50; }
    .toast.error { background-color: #7a1f1f; border-left-color: #f44336; }
    .toast.info { background-color: #1f3f7a; border-left-color: #2196f3; }
    .toast.warning { background-color: #7a5a1f; border-left-color: #ff9800; }
    .toast .message { flex: 1; }
    .toast .close {
      appearance: none;
      border: none;
      background: transparent;
      color: #fff;
      font-size: 18px;
      cursor: pointer;
      line-height: 1;
    }
    .toast .close:focus { outline: 2px solid rgba(255,255,255,0.4); border-radius: 4px; }
  `]
})
export class ToastContainerComponent {
  constructor(public toastService: ToastService) {}
}
