import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
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
  selector: 'app-customer-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './customer-sidebar.html',
  styleUrl: './customer-sidebar.scss'
})
export class CustomerSidebarComponent implements OnInit {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();
  
  branding$: Observable<RestaurantBranding | null>;

  menuItems: MenuItem[] = [
    { label: 'الرئيسية', icon: 'assets/home-icon.svg', route: '/customer/home' },
    { label: 'طلباتي', icon: 'assets/order-icon.svg', route: '/customer/my-orders' },
    { label: 'سجل الطلبات', icon: 'assets/order-history.svg', route: '/customer/order-history' }
  ];

  // Subscription data (hardcoded for now - will be loaded from API)
  // TEST CASES - Change end date to test different statuses:
  // GREEN (>20 days): subscriptionEndDate: new Date('2026-02-15')
  // YELLOW (11-20 days): subscriptionEndDate: new Date('2026-01-22')
  // RED (<=10 days): subscriptionEndDate: new Date('2026-01-14')
  // EXPIRED (0 days): subscriptionEndDate: new Date('2026-01-01')
  subscriptionStartDate: Date = new Date('2025-12-15');
  subscriptionEndDate: Date = new Date('2026-01-22'); 

  // Computed properties
  totalDays: number = 0;
  elapsedDays: number = 0;
  remainingDays: number = 0;
  progressPercent: number = 0;

  constructor(
    public router: Router,
    private authService: AuthService,
    public brandingService: RestaurantBrandingService
  ) {
    this.branding$ = this.brandingService.branding$;
  }

  ngOnInit(): void {
    this.calculateSubscriptionStatus();
  }

  calculateSubscriptionStatus(): void {
    const now = new Date();
    const start = this.subscriptionStartDate;
    const end = this.subscriptionEndDate;

    // Calculate total days in subscription period
    const totalMs = end.getTime() - start.getTime();
    this.totalDays = Math.max(1, Math.ceil(totalMs / (1000 * 60 * 60 * 24)));

    // Calculate elapsed days
    if (now < start) {
      // Subscription hasn't started yet
      this.elapsedDays = 0;
      this.remainingDays = this.totalDays;
    } else if (now > end) {
      // Subscription has ended
      this.elapsedDays = this.totalDays;
      this.remainingDays = 0;
    } else {
      // Subscription is active
      const elapsedMs = now.getTime() - start.getTime();
      this.elapsedDays = Math.floor(elapsedMs / (1000 * 60 * 60 * 24));
      const remainingMs = end.getTime() - now.getTime();
      this.remainingDays = Math.ceil(remainingMs / (1000 * 60 * 60 * 24));
    }

    // Calculate progress percentage
    this.progressPercent = Math.min(100, Math.max(0, (this.elapsedDays / this.totalDays) * 100));
  }

  getProgressBarColor(): string {
    if (this.remainingDays === 0) {
      return '#EF4444'; // Red - expired
    } else if (this.remainingDays <= 10) {
      return '#EF4444'; // Red - ending soon
    } else if (this.remainingDays <= 20) {
      return '#F59E0B'; // Yellow - warning
    } else {
      return '#10B981'; // Green - safe
    }
  }

  getStatusClass(): string {
    if (this.remainingDays === 0 || this.remainingDays <= 10) {
      return 'status-red';
    } else if (this.remainingDays <= 20) {
      return 'status-yellow';
    } else {
      return 'status-green';
    }
  }

  onNavItemClick(): void {
    // Close sidebar on mobile when nav item is clicked
    if (window.innerWidth <= 768) {
      this.close.emit();
    }
  }

  showWarning(): boolean {
    return this.remainingDays > 0 && this.remainingDays <= 10;
  }

  getStatusText(): string {
    if (this.remainingDays === 0) {
      return 'انتهى الاشتراك';
    } else if (this.remainingDays <= 10) {
      return 'ينتهي قريبًا';
    }
    return '';
  }

  isActive(route: string): boolean {
    return this.router.url === route;
  }

  logout(): void {
    this.authService.logout();
  }
}
