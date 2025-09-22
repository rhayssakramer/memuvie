import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { InteractionComponent } from './pages/interaction/interaction.component';
import { GalleryComponent } from './pages/gallery/gallery.component';
import { LoginComponent } from './pages/login/login.component';
import { EsqueciSenhaComponent } from './pages/esqueci-senha/esqueci-senha.component';
import { RedefinirSenhaComponent } from './pages/redefinir-senha/redefinir-senha.component';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { getProfile, isSessionValid } from './utils/auth';

// Guarda: requer authenticated user
const requireAuthGuard = () => {
  const router = inject(Router);
  if (isSessionValid() && getProfile()) {
    return true;
  }
  router.navigate(['/']); // Redirecionando para home ao invés de login
  return false;
};

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'esqueci-senha', component: EsqueciSenhaComponent },
  { path: 'redefinir-senha', component: RedefinirSenhaComponent },
  { 
    path: 'interaction', 
    component: InteractionComponent, 
    canActivate: [requireAuthGuard]
  },
  { 
    path: 'gallery', 
    component: GalleryComponent, 
    canActivate: [requireAuthGuard]
  },
  { path: '**', redirectTo: '' }
];