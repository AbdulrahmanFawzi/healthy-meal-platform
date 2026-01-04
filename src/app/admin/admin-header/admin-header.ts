import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-admin-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-header.html',
  styleUrl: './admin-header.scss'
})
export class AdminHeaderComponent implements OnInit {
  restaurantLogoUrl: string = 'assets/healthyFoodIcon.png';
  restaurantName: string = '';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    const restaurant = this.authService.getRestaurant();
    if (restaurant) {
      this.restaurantName = restaurant.name;
      if (restaurant.logoUrl) {
        this.restaurantLogoUrl = restaurant.logoUrl;
      }
    }
  }
}
