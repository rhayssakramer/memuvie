import { Routes, CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { HomeComponent } from './pages/home/home.component';
import { IdentificationComponent } from './pages/identification/identification.component';
import { InteractionComponent } from './pages/interaction/interaction.component';
import { GalleryComponent } from './pages/gallery/gallery.component';
import { LoginComponent } from './pages/login/login.component';
import { isSessionValid, getProfile } from './utils/auth';

// Guard: requires identified user
export const isIdentifiedGuard: CanActivateFn = (route, state) => {
  // Require BOTH a valid session and an existing profile
  if (isSessionValid() && !!getProfile()) {
    return true;
  }
  // No profile -> redirect to identification
  const router = inject(Router);
  router.navigate(['/login']);
  return false;
};

// Guard: redirect to interaction if already identified (skip identification)
export const redirectIfIdentifiedGuard: CanActivateFn = (route, state) => {
  // Only skip identification if session is valid AND profile exists
  if (isSessionValid() && !!getProfile()) {
    const router = inject(Router);
    router.navigate(['/interaction']);
    return false;
  }
  return true;
};

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'identification', component: IdentificationComponent, canActivate: [redirectIfIdentifiedGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'interaction', component: InteractionComponent, canActivate: [isIdentifiedGuard] },
  { path: 'gallery', component: GalleryComponent, canActivate: [isIdentifiedGuard] },
  { path: '**', redirectTo: '' }
];
