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
    data: { roles: ['admin'] },
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./admin/dashboard/dashboard').then(m => m.AdminDashboardComponent)
      },
      {
        path: 'menu-management',
        loadComponent: () => import('./admin/menu-management/menu-management').then(m => m.AdminMenuManagementComponent)
      },
      {
        path: 'orders',
        loadComponent: () => import('./admin/orders/orders').then(m => m.AdminOrdersComponent)
      },
      {
        path: 'subscriptions',
        loadComponent: () => import('./admin/subscriptions/subscriptions').then(m => m.AdminSubscriptionsComponent)
      }
    ]
  },
  {
    path: 'customer',
    loadComponent: () => import('./customer/customer-layout/customer-layout').then(m => m.CustomerLayoutComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['customer'] },
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      },
      {
        path: 'home',
        loadComponent: () => import('./customer/home/home').then(m => m.CustomerHomeComponent)
      },
      {
        path: 'order-review',
        loadComponent: () => import('./customer/order-review/order-review').then(m => m.OrderReviewComponent)
      },
      {
        path: 'my-orders',
        loadComponent: () => import('./customer/my-orders/my-orders').then(m => m.CustomerMyOrdersComponent)
      },
      {
        path: 'order-history',
        loadComponent: () => import('./customer/order-history/order-history').then(m => m.CustomerOrderHistoryComponent)
      }
    ]
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
