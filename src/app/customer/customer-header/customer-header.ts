import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-customer-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './customer-header.html',
  styleUrl: './customer-header.scss'
})
export class CustomerHeaderComponent implements OnInit {
  restaurantLogoUrl: string = 'assets/healthyFoodIcon.png';
  customerName: string = 'اسم العميل';
  dailyMealsCount: number = 3;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    const user = this.authService.getUser();
    if (user) {
      this.customerName = user.name;
    }
    
    const restaurant = this.authService.getRestaurant();
    if (restaurant && restaurant.logoUrl) {
      this.restaurantLogoUrl = restaurant.logoUrl;
    }

    // TODO: Load dailyMealsCount from customer's active subscription
    // For now using placeholder value
  }
}
