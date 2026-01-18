import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RestaurantBrandingService } from '../../core/services/restaurant-branding.service';
import { Observable } from 'rxjs';
import { RestaurantBranding } from '../../core/services/restaurant-branding.service';

@Component({
  selector: 'app-admin-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-header.html',
  styleUrl: './admin-header.scss'
})
export class AdminHeaderComponent implements OnInit {
  @Input() isSidebarOpen = false;
  @Output() toggleSidebar = new EventEmitter<void>();
  
  branding$: Observable<RestaurantBranding | null>;

  constructor(
    public brandingService: RestaurantBrandingService
  ) {
    this.branding$ = this.brandingService.branding$;
  }

  ngOnInit(): void {
    // Branding is loaded in login component after successful authentication
  }

  onToggleSidebar(): void {
    this.toggleSidebar.emit();
  }
}
