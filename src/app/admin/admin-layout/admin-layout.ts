import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.scss'
})
export class AdminLayoutComponent {
  // TODO: Load from AuthService.getRestaurant()
  restaurantName = 'مطعم الصحة';
  // TODO: Load from AuthService.getUser()
  userName = 'أحمد المدير';
}
