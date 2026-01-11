import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminDashboardService, LatestOrder } from '../../services/admin-dashboard.service';

/**
 * Dashboard Latest Orders Component
 * 
 * Displays a table of recent orders with order number, customer, meals count, and status
 */
@Component({
  selector: 'app-dashboard-latest-orders',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-latest-orders.html',
  styleUrl: './dashboard-latest-orders.scss'
})
export class DashboardLatestOrdersComponent implements OnInit {
  latestOrders: LatestOrder[] = [];

  // Status configuration for consistent styling
  private statusConfig: Record<string, { label: string; color: string; bg: string }> = {
    received: { label: 'قيد الاستلام', color: '#FBBF24', bg: '#FEF3C7' },
    preparing: { label: 'قيد التحضير', color: '#3B82F6', bg: '#DBEAFE' },
    ready: { label: 'جاهز', color: '#10B981', bg: '#D1FAE5' },
    completed: { label: 'مكتمل', color: '#6B7280', bg: '#F3F4F6' }
  };

  constructor(private dashboardService: AdminDashboardService) {}

  ngOnInit(): void {
    this.loadLatestOrders();
  }

  private loadLatestOrders(): void {
    this.dashboardService.getLatestOrders().subscribe({
      next: (orders) => {
        this.latestOrders = orders;
      },
      error: (error) => {
        console.error('Error loading latest orders:', error);
        this.latestOrders = [];
      }
    });
  }

  getMealsCountText(order: LatestOrder): string {
    if (order.hasSnack) {
      return `${order.mealsCount} + سناك`;
    }
    return order.mealsCount.toString();
  }

  getStatusLabel(status: string): string {
    return this.statusConfig[status]?.label || status;
  }

  getStatusColor(status: string): string {
    return this.statusConfig[status]?.color || '#6B7280';
  }

  getStatusBg(status: string): string {
    return this.statusConfig[status]?.bg || '#F3F4F6';
  }
}
