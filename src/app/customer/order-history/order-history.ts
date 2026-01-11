import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomerOrdersService } from '../services/customer-orders.service';
import { MealsService } from '../../core/services/meals.service';
import { Order, OrderStatus } from '../../core/models/order.model';

@Component({
  selector: 'app-customer-order-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-history.html',
  styleUrl: './order-history.scss'
})
export class CustomerOrderHistoryComponent implements OnInit {
  orders: Order[] = [];
  isLoading = true;
  error: string | null = null;

  constructor(
    private customerOrdersService: CustomerOrdersService,
    private mealsService: MealsService
  ) {}

  ngOnInit(): void {
    this.loadOrderHistory();
  }

  /**
   * Load order history from API
   */
  loadOrderHistory(): void {
    this.isLoading = true;
    console.log('Loading order history...');
    this.customerOrdersService.getOrderHistory().subscribe({
      next: (orders) => {
        console.log('Order history loaded:', orders);
        this.orders = orders;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading order history:', error);
        this.error = 'فشل تحميل سجل الطلبات';
        this.isLoading = false;
      }
    });
  }

  /**
   * Get status label in Arabic
   */
  getStatusLabel(status: OrderStatus): string {
    const statusMap: Record<OrderStatus, string> = {
      'received': 'قيد الاستلام',
      'preparing': 'قيد التحضير',
      'ready': 'جاهز للاستلام',
      'completed': 'مكتمل'
    };
    return statusMap[status] || status;
  }

  /**
   * Get status badge class
   */
  getStatusClass(status: OrderStatus): string {
    const classMap: Record<OrderStatus, string> = {
      'received': 'status-received',
      'preparing': 'status-preparing',
      'ready': 'status-ready',
      'completed': 'status-completed'
    };
    return classMap[status] || '';
  }

  /**
   * Get meal image URL
   */
  getMealImage(imageUrl?: string): string {
    return this.mealsService.getImageUrl(imageUrl || null);
  }

  /**
   * Format date to Hijri (simplified - showing Gregorian with Arabic)
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    
    // Format: "DD month YYYY" (simplified)
    return `${day} ${this.getMonthName(month)} ${year}`;
  }

  /**
   * Get month name in Arabic
   */
  private getMonthName(month: number): string {
    const months = [
      'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];
    return months[month - 1] || '';
  }

  /**
   * Get total meals count text
   */
  getMealsCountText(order: Order): string {
    const mealsCount = order.selections.length;
    const hasSnack = order.snackMeal && order.snackMeal.mealId;
    
    if (hasSnack) {
      return `${mealsCount} + سناك`;
    }
    return `${mealsCount} وجبة`;
  }

  /**
   * Track by function for ngFor
   */
  trackByOrderId(index: number, order: Order): string {
    return order._id;
  }

  /**
   * Track by function for selections
   */
  trackByIndex(index: number): number {
    return index;
  }
}
