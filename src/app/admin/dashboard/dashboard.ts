import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardHeaderStatsComponent } from './components/dashboard-header-stats/dashboard-header-stats';
import { DashboardOrderStatusChartComponent } from './components/dashboard-order-status-chart/dashboard-order-status-chart';
import { DashboardTodayMenuComponent } from './components/dashboard-today-menu/dashboard-today-menu';
import { DashboardLatestOrdersComponent } from './components/dashboard-latest-orders/dashboard-latest-orders';

/**
 * Admin Dashboard Component (Container)
 * 
 * Responsible ONLY for layout and composition.
 * No business logic or data fetching.
 * All data operations are delegated to child components and AdminDashboardService.
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    DashboardHeaderStatsComponent,
    DashboardOrderStatusChartComponent,
    DashboardTodayMenuComponent,
    DashboardLatestOrdersComponent
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class AdminDashboardComponent {}
