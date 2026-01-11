import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomerOrdersService } from '../services/customer-orders.service';
import { MealsService } from '../../core/services/meals.service';
import { Order, OrderStatus } from '../../core/models/order.model';

interface TimelineStep {
  key: string;
  label: string;
  subLabel: string;
  icon: 'check' | 'spinner' | 'box';
  status: 'completed' | 'current' | 'upcoming';
}

@Component({
  selector: 'app-customer-my-orders',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-orders.html',
  styleUrl: './my-orders.scss'
})
export class CustomerMyOrdersComponent implements OnInit, OnDestroy {
  order: Order | null = null;
  isLoading = true;
  error: string | null = null;
  timelineSteps: TimelineStep[] = [];

  constructor(
    private customerOrdersService: CustomerOrdersService,
    private mealsService: MealsService
  ) {}

  ngOnInit(): void {
    // Start polling for order updates
    this.customerOrdersService.pollCurrentOrder().subscribe({
      next: (order) => {
        this.order = order;
        this.isLoading = false;
        console.log('Order data:', order);
        if (order?.snackMeal) {
          console.log('Snack meal:', order.snackMeal);
          console.log('Snack image URL:', order.snackMeal.imageUrl);
        }
        this.updateTimeline();
      },
      error: (error) => {
        console.error('Error polling order:', error);
        this.error = 'فشل تحميل الطلب';
        this.isLoading = false;
      }
    });
  }

  ngOnDestroy(): void {
    // Stop polling when component is destroyed
    this.customerOrdersService.stopPolling();
  }

  /**
   * Update timeline based on current order status
   */
  private updateTimeline(): void {
    if (!this.order) {
      this.timelineSteps = [];
      return;
    }

    const status = this.order.status;
    
    // Define timeline steps
    const steps: TimelineStep[] = [
      {
        key: 'received',
        label: 'تم استلام الطلب',
        subLabel: 'مكتمل',
        icon: 'check',
        status: 'completed' // Always completed as first step
      },
      {
        key: 'preparing',
        label: 'قيد التحضير',
        subLabel: status === 'preparing' ? 'قيد التنفيذ' : (status === 'ready' || status === 'completed') ? 'مكتمل' : 'قيد التنفيذ',
        icon: 'spinner',
        status: status === 'preparing' ? 'current' : (status === 'ready' || status === 'completed') ? 'completed' : 'upcoming'
      },
      {
        key: 'ready',
        label: 'جاهز للاستلام',
        subLabel: (status === 'ready' || status === 'completed') ? 'مكتمل' : 'قيد التنفيذ',
        icon: 'box',
        status: (status === 'ready' || status === 'completed') ? 'completed' : 'upcoming'
      }
    ];

    this.timelineSteps = steps;
  }

  /**
   * Get meal image URL
   */
  getMealImage(imageUrl?: string): string {
    const finalUrl = this.mealsService.getImageUrl(imageUrl || null);
    console.log('getMealImage input:', imageUrl, '-> output:', finalUrl);
    return finalUrl;
  }

  /**
   * Track by function for ngFor
   */
  trackByIndex(index: number): number {
    return index;
  }
}
