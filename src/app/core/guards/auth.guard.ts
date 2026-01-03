import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../auth/auth.service';


export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // User is authenticated - allow access
  if (authService.isAuthenticated()) {
    return true;
  }

  // Not authenticated - redirect to login
  router.navigate(['/login']);
  return false;
};
