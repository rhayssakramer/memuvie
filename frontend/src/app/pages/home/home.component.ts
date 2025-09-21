import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { isSessionValid, getProfile } from '../../utils/auth';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class HomeComponent implements OnInit, OnDestroy {
  // Countdown target: 04/10/2025 17:00 local time (dd/MM/yyyy HH:mm)
  private target = new Date(2025, 9, 4, 17, 0, 0); // Month is 0-based: 9 => October
  private timerId?: any;

  days = 0;
  hours = 0;
  minutes = 0;
  seconds = 0;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.tick();
    this.timerId = setInterval(() => this.tick(), 1000);
  }

  ngOnDestroy(): void {
    if (this.timerId) clearInterval(this.timerId);
  }

  private tick(): void {
    const now = new Date();
    let diff = Math.max(0, this.target.getTime() - now.getTime());

    // When countdown hits zero, keep zeros and stop
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
    // Se não, vai para a página de login
    if (isSessionValid() && !!getProfile()) {
      this.router.navigate(['/interaction']);
    } else {
      this.router.navigate(['/login']);
    }
  }
}
