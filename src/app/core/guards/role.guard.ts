import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { UserRole } from '../models/user.model';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // First, ensure user is authenticated
  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  // Get current user and extract allowed roles from route data
  const user = authService.getUser();
  const allowedRoles = route.data['roles'] as UserRole[];

  // Check if user's role matches any of the allowed roles
  if (user && allowedRoles && allowedRoles.includes(user.role)) {
    return true;
  }

  // Role doesn't match - redirect to home
  router.navigate(['/']);
  return false;
};
