import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./landing/landing').then(m => m.LandingComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login').then(m => m.LoginComponent)
  },
  {
    path: 'admin',
    loadComponent: () => import('./admin/admin-layout/admin-layout').then(m => m.AdminLayoutComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin'] }
  },
  {
    path: 'customer',
    loadComponent: () => import('./customer/customer-layout/customer-layout').then(m => m.CustomerLayoutComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['customer'] }
  },
  {
    path: 'platform',
    loadComponent: () => import('./platform/platform-layout/platform-layout').then(m => m.PlatformLayoutComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['super_admin'] }
  },
  {
    path: '**',
    redirectTo: ''
  }
];
