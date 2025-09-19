import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { getProfile, startSession, logoutAll } from '../../utils/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email = '';
  password = '';
  error = '';

  constructor(private router: Router) {}

  onSubmit() {
    this.error = '';
    if (!this.email.trim() || !this.password.trim()) {
      this.error = 'Preencha e-mail e senha';
      return;
    }

    // Login local: exige perfil salvo localmente com mesmo e-mail
    const profile = getProfile();
    if (profile && profile.email.toLowerCase() === this.email.trim().toLowerCase()) {
      startSession(4);
      this.router.navigate(['/interaction']);
    } else {
      this.error = 'Perfil não encontrado. Crie seu perfil primeiro.';
    }
  }

  goToCreate() {
    // Clear any previous session/profile so Identification won't be skipped by guards
    logoutAll();
    this.router.navigate(['/identification']);
  }
}
