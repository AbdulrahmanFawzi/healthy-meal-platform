import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { RestaurantBrandingService } from '../../core/services/restaurant-branding.service';
import { Observable } from 'rxjs';
import { RestaurantBranding } from '../../core/services/restaurant-branding.service';

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
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();
  
  branding$: Observable<RestaurantBranding | null>;

  menuItems: MenuItem[] = [
    { label: 'لوحة التحكم', icon: 'assets/dashboard-icon.svg', route: '/admin/dashboard' },
    { label: 'إدارة القائمة', icon: 'assets/fork-icon.svg', route: '/admin/menu-management' },
    { label: 'الطلبات', icon: 'assets/order-icon.svg', route: '/admin/orders' },
    { label: 'الاشتراكات', icon: 'assets/subscriptaion-icon.svg', route: '/admin/subscriptions' }
  ];

  constructor(
    public router: Router,
    private authService: AuthService,
    public brandingService: RestaurantBrandingService
  ) {
    this.branding$ = this.brandingService.branding$;
  }

  isActive(route: string): boolean {
    return this.router.url === route;
  }

  onNavItemClick(): void {
    // Close sidebar on mobile when nav item is clicked
    if (window.innerWidth <= 768) {
      this.close.emit();
    }
  }

  logout(): void {
    this.authService.logout();
  }
}
