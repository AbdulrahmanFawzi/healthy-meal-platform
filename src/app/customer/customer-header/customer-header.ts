import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/auth/auth.service';
import { RestaurantBrandingService } from '../../core/services/restaurant-branding.service';
import { Observable } from 'rxjs';
import { RestaurantBranding } from '../../core/services/restaurant-branding.service';

@Component({
  selector: 'app-customer-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './customer-header.html',
  styleUrl: './customer-header.scss'
})
export class CustomerHeaderComponent implements OnInit {
  @Input() isSidebarOpen = false;
  @Output() toggleSidebar = new EventEmitter<void>();
  
  branding$: Observable<RestaurantBranding | null>;
  customerName: string = 'اسم العميل';
  dailyMealsCount: number = 3;

  constructor(
    private authService: AuthService,
    public brandingService: RestaurantBrandingService
  ) {
    this.branding$ = this.brandingService.branding$;
  }

  ngOnInit(): void {
    const user = this.authService.getUser();
    if (user) {
      this.customerName = user.name;
    }

    // TODO: Load dailyMealsCount from customer's active subscription
    // For now using placeholder value
  }

  onToggleSidebar(): void {
    this.toggleSidebar.emit();
  }
}
