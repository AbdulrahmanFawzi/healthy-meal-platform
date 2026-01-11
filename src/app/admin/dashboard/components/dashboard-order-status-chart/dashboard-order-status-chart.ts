import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminDashboardService, OrderStatusStats } from '../../services/admin-dashboard.service';

interface OrderStatusSegment {
  label: string;
  value: number;
  color: string;
  percentage: number;
  startAngle: number;
  endAngle: number;
  path: string;
}

/**
 * Dashboard Order Status Chart Component
 * 
 * Displays a donut chart showing order status distribution
 */
@Component({
  selector: 'app-dashboard-order-status-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-order-status-chart.html',
  styleUrl: './dashboard-order-status-chart.scss'
})
export class DashboardOrderStatusChartComponent implements OnInit {
  orderStatuses: Array<{ label: string; value: number; color: string }> = [];
  totalOrders = 0;

  constructor(private dashboardService: AdminDashboardService) {}

  ngOnInit(): void {
    this.loadOrderStats();
  }

  private loadOrderStats(): void {
    this.dashboardService.getOrderStatusStats().subscribe({
      next: (stats) => {
        this.buildOrderStatuses(stats);
      },
      error: (error) => {
        console.error('Error loading order status stats:', error);
      }
    });
  }

  private buildOrderStatuses(stats: OrderStatusStats): void {
    this.orderStatuses = [
      { label: 'قيد الاستلام', value: stats.received, color: '#FBBF24' },
      { label: 'قيد التحضير', value: stats.preparing, color: '#3B82F6' },
      { label: 'جاهز', value: stats.ready, color: '#10B981' },
      { label: 'مكتمل', value: stats.completed, color: '#6B7280' }
    ];

    this.totalOrders = this.orderStatuses.reduce((sum, status) => sum + status.value, 0);
  }

  getPieChartSegments(): OrderStatusSegment[] {
    const total = this.totalOrders;
    if (total === 0) return [];

    let currentAngle = -90; // Start from top
    return this.orderStatuses.map(status => {
      const percentage = (status.value / total) * 100;
      const angle = (percentage / 100) * 360;
      const segment: OrderStatusSegment = {
        ...status,
        percentage,
        startAngle: currentAngle,
        endAngle: currentAngle + angle,
        path: this.createArcPath(currentAngle, currentAngle + angle)
      };
      currentAngle += angle;
      return segment;
    }).filter(s => s.value > 0);
  }

  private createArcPath(startAngle: number, endAngle: number): string {
    const cx = 80;
    const cy = 80;
    const radius = 70;
    const innerRadius = 40; // For donut chart

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1 = cx + radius * Math.cos(startRad);
    const y1 = cy + radius * Math.sin(startRad);
    const x2 = cx + radius * Math.cos(endRad);
    const y2 = cy + radius * Math.sin(endRad);

    const x3 = cx + innerRadius * Math.cos(endRad);
    const y3 = cy + innerRadius * Math.sin(endRad);
    const x4 = cx + innerRadius * Math.cos(startRad);
    const y4 = cy + innerRadius * Math.sin(startRad);

    const largeArc = endAngle - startAngle > 180 ? 1 : 0;

    return `
      M ${x1} ${y1}
      A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}
      L ${x3} ${y3}
      A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4}
      Z
    `;
  }
}
