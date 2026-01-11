import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminDashboardService, DashboardStats } from '../../services/admin-dashboard.service';

/**
 * Dashboard Header Stats Component
 * 
 * Displays 4 KPI cards showing key metrics:
 * - Today's orders
 * - Total meals
 * - Completed orders  
 * - Active subscribers
 */
@Component({
  selector: 'app-dashboard-header-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-header-stats.html',
  styleUrl: './dashboard-header-stats.scss'
})
export class DashboardHeaderStatsComponent implements OnInit {
  stats: DashboardStats | null = null;

  kpiCards: Array<{
    title: string;
    value: number;
    icon: string;
    type: string;
    trend?: string;
  }> = [];

  constructor(private dashboardService: AdminDashboardService) {}

  ngOnInit(): void {
    this.loadStats();
  }

  private loadStats(): void {
    this.dashboardService.getDashboardStats().subscribe({
      next: (stats) => {
        this.stats = stats;
        this.buildKpiCards();
      },
      error: (error) => {
        console.error('Error loading dashboard stats:', error);
      }
    });
  }

  private buildKpiCards(): void {
    if (!this.stats) return;

    this.kpiCards = [
      {
        title: 'إجمالي طلبات اليوم',
        value: this.stats.todayOrders,
        icon: 'assets/order-icon.svg',
        type: 'orders',
        trend: this.stats.trends?.todayOrders
      },
      {
        title: 'إجمالي الوجبات',
        value: this.stats.totalMeals,
        icon: 'assets/fork-icon.svg',
        type: 'meals',
        trend: undefined
      },
      {
        title: 'الطلبات المكتملة',
        value: this.stats.completedOrders,
        icon: 'assets/correct.svg',
        type: 'completed',
        trend: undefined
      },
      {
        title: 'المشتركين النشطيين',
        value: this.stats.activeSubscribers,
        icon: 'assets/subscriptaion-icon.svg',
        type: 'subscribers',
        trend: this.stats.trends?.activeSubscribers
      }
    ];
  }
}
