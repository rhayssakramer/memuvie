import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { isSessionValid, getProfile } from '../../utils/auth';

// HeaderComponent removido: não usado diretamente no Home template
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class HomeComponent implements OnInit, OnDestroy {
  // Countdown target: 04/10/2025 17:00 local time (dd/MM/yyyy HH:mm)
  private target = new Date(2025, 9, 4, 17, 0, 0); // Mês é 0-based: 9 => Outubro
  private timerId?: any;

  days = 0;
  hours = 0;
  minutes = 0;
  seconds = 0;

  // Decorative dots for background
  dots: Array<{
    id: number;
    top?: string; // css value like '10px' or '20%'
    left?: string;
    size: number;
    color: string;
    opacity: number;
    delay: number;
    floatDuration: number;
    pulseDuration: number;
  }> = [];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.tick();
    this.timerId = setInterval(() => this.tick(), 1000);

    // Gerar dots decorativos aleatórios
    this.generateDots(18);
  }

  ngOnDestroy(): void {
    if (this.timerId) clearInterval(this.timerId);
  }

  private tick(): void {
    const now = new Date();
    let diff = Math.max(0, this.target.getTime() - now.getTime());

    // Quando countdown chega a zero, mantém zeros e para
    if (diff === 0) {
      if (this.timerId) clearInterval(this.timerId);
      this.days = this.hours = this.minutes = this.seconds = 0;
      return;
    }

    const sec = Math.floor(diff / 1000);
    this.days = Math.floor(sec / (60 * 60 * 24));
    this.hours = Math.floor((sec % (60 * 60 * 24)) / 3600);
    this.minutes = Math.floor((sec % 3600) / 60);
    this.seconds = sec % 60;
  }

  onEnter() {
    // Se o usuário estiver autenticado, vai para interação
    // Se do not, vai para a página de login
    if (isSessionValid() && !!getProfile()) {
      this.router.navigate(['/interaction']);
    } else {
      this.router.navigate(['/login']);
    }
  }

  private generateDots(count: number) {
    const palette = ['#ffffff', 'rgba(255,95,163,0.95)', 'rgba(58,123,255,0.95)', '#fff7f9', '#f0f5ff'];
    this.dots = Array.from({ length: count }).map((_, i) => {
      const size = Math.round(18 + Math.random() * 110); // px
      const top = Math.round(Math.random() * 90) + '%';
      const left = Math.round(Math.random() * 95) + '%';
      const color = palette[Math.floor(Math.random() * palette.length)];
      const opacity = +(0.18 + Math.random() * 0.6).toFixed(2);
      const delay = +(Math.random() * 6).toFixed(2);
    // tornar flutuação mais perceptível: duração moderada
  const floatDuration = +(3 + Math.random() * 4).toFixed(2); // 3s - 7s
    const pulseDuration = +(4 + Math.random() * 6).toFixed(2); // 4s - 10s
      return {
        id: i,
        top,
        left,
        size,
        color,
        opacity,
        delay,
        floatDuration,
        pulseDuration
      };
    });
  }

  trackById(index: number, item: any) {
    return item?.id ?? index;
  }
}