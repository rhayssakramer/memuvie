import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DotsBackgroundComponent } from './shared/dots-background/dots-background.component';
import { ToastContainerComponent } from './shared/toast-container/toast-container.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, DotsBackgroundComponent, ToastContainerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'cha-revelacao';
}
