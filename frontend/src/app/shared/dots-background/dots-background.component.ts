import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dots-background',
  templateUrl: './dots-background.component.html',
  styleUrls: ['./dots-background.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class DotsBackgroundComponent implements OnInit {
  @Input() count = 18;

  dots: Array<any> = [];

  ngOnInit(): void {
    this.generateDots(this.count);
  }

  private generateDots(count: number) {
    const palette = ['#ffffff', 'rgba(255,95,163,0.95)', 'rgba(58,123,255,0.95)', '#fff7f9', '#f0f5ff'];
    this.dots = Array.from({ length: count }).map((_, i) => {
      const size = Math.round(18 + Math.random() * 110);
      const top = Math.round(Math.random() * 90) + '%';
      const left = Math.round(Math.random() * 95) + '%';
      const color = palette[Math.floor(Math.random() * palette.length)];
      const opacity = +(0.18 + Math.random() * 0.6).toFixed(2);
      const delay = +(Math.random() * 6).toFixed(2);
      const floatDuration = +(3 + Math.random() * 4).toFixed(2); // 3s - 7s
      const pulseDuration = +(4 + Math.random() * 6).toFixed(2);
      return { id: i, top, left, size, color, opacity, delay, floatDuration, pulseDuration };
    });
  }

  trackById(index: number, item: any) {
    return item?.id ?? index;
  }
}
