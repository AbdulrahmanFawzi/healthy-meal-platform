import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-customer-layout',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './customer-layout.html',
  styleUrl: './customer-layout.scss'
})
export class CustomerLayoutComponent {
  // TODO: Load from AuthService.getRestaurant()
  restaurantName = 'مطعم الصحة';
  // TODO: Load from AuthService.getUser()
  userName = 'فاطمة العميلة';
}
