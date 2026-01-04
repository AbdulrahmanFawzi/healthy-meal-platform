import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-sidebar.html',
  styleUrl: './admin-sidebar.scss'
})
export class AdminSidebarComponent {
  restaurantLogoUrl: string = 'assets/healthyFoodIcon.png';

  menuItems: MenuItem[] = [
    { label: 'لوحة التحكم', icon: 'assets/dashboard-icon.svg', route: '/admin/dashboard' },
    { label: 'إدارة القائمة', icon: 'assets/fork-icon.svg', route: '/admin/menu-management' },
    { label: 'الطلبات', icon: 'assets/order-icon.svg', route: '/admin/orders' },
    { label: 'الاشتراكات', icon: 'assets/subscriptaion-icon.svg', route: '/admin/subscriptions' }
  ];

  constructor(public router: Router, private authService: AuthService) {}

  isActive(route: string): boolean {
    return this.router.url === route;
  }

  logout(): void {
    this.authService.logout();
  }
}
