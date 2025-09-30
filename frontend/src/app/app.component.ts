import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DotsBackgroundComponent } from './shared/dots-background/dots-background.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, DotsBackgroundComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'cha-revelacao';
}