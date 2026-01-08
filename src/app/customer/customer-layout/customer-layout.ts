import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CustomerHeaderComponent } from '../customer-header/customer-header';
import { CustomerSidebarComponent } from '../customer-sidebar/customer-sidebar';

@Component({
  selector: 'app-customer-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, CustomerHeaderComponent, CustomerSidebarComponent],
  templateUrl: './customer-layout.html',
  styleUrl: './customer-layout.scss'
})
export class CustomerLayoutComponent {
}
