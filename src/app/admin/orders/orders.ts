import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrdersService } from '../../core/services/orders.service';
import { MealsService } from '../../core/services/meals.service';
import { ToastService } from '../../shared/services/toast.service';
import { Order, OrderStatus } from '../../core/models/order.model';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './orders.html',
  styleUrl: './orders.scss'
})
export class AdminOrdersComponent implements OnInit, OnDestroy {
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  isLoading = false;

  // Filters
  searchQuery = '';
  selectedStatus: OrderStatus | 'all' = 'all';
  
  // Search debounce
  private searchSubject = new Subject<string>();

  // Custom dropdown state
  isStatusDropdownOpen = false;
  openOrderStatusId: string | null = null;

  // Status options for dropdown
  statusOptions = [
    { value: 'all', label: 'جميع الطلبات' },
    { value: 'received', label: 'قيد الاستلام' },
    { value: 'preparing', label: 'قيد التحضير' },
    { value: 'ready', label: 'جاهز' },
    { value: 'completed', label: 'مكتمل' },
  ];

  // Status label mapping
  statusLabels: Record<OrderStatus, string> = {
    received: 'قيد الاستلام',
    preparing: 'قيد التحضير',
    ready: 'جاهز',
    completed: 'مكتمل',
  };

  constructor(
    private mealsService: MealsService,
    private ordersService: OrdersService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadOrders();

    // Debounce search input
    this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => {
        this.loadOrders();
      });
  }

  ngOnDestroy(): void {
    this.searchSubject.complete();
  }

  /**
   * Load today's orders with current filters
   */
  loadOrders(): void {
    this.isLoading = true;

    const filters: any = {};
    
    if (this.selectedStatus !== 'all') {
      filters.status = this.selectedStatus;
    }

    if (this.searchQuery.trim()) {
      filters.q = this.searchQuery.trim();
    }

    this.ordersService.getTodayOrders(filters).subscribe({
      next: (orders) => {
        this.orders = orders;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Failed to load orders:', error);
        this.toastService.error('فشل تحميل الطلبات');
        this.isLoading = false;
      },
    });
  }

  /**
   * Handle search input change
   */
  onSearchChange(value: string): void {
    this.searchQuery = value;
    this.searchSubject.next(value);
  }

  /**
   * Handle status filter change
   */
  onStatusFilterChange(): void {
    this.loadOrders();
  }

  /**
   * Toggle status dropdown
   */
  toggleStatusDropdown(): void {
    this.isStatusDropdownOpen = !this.isStatusDropdownOpen;
  }

  /**
   * Close status dropdown
   */
  closeStatusDropdown(): void {
    this.isStatusDropdownOpen = false;
    this.openOrderStatusId = null;
  }

  /**
   * Toggle order card status dropdown
   */
  toggleOrderStatusDropdown(orderId: string): void {
    this.openOrderStatusId = this.openOrderStatusId === orderId ? null : orderId;
  }

  /**
   * Select status filter
   */
  selectStatus(status: OrderStatus | 'all'): void {
    this.selectedStatus = status;
    this.isStatusDropdownOpen = false;
    this.loadOrders();
  }

  /**
   * Get selected status label
   */
  getSelectedStatusLabel(): string {
    const option = this.statusOptions.find(opt => opt.value === this.selectedStatus);
    return option?.label || 'جميع الطلبات';
  }

  /**
   * Update order status
   */
  onStatusChange(order: Order, newStatus: OrderStatus): void {
    this.openOrderStatusId = null; // Close dropdown
    this.ordersService.updateOrderStatus(order._id, newStatus).subscribe({
      next: (updatedOrder) => {
        // Update local order
        const index = this.orders.findIndex(o => o._id === order._id);
        if (index !== -1) {
          this.orders[index] = updatedOrder;
        }
        this.toastService.success('تم تحديث حالة الطلب');
      },
      error: (error) => {
        console.error('Failed to update status:', error);
        this.toastService.error('فشل تحديث الحالة');
      },
    });
  }

  /**
   * Send ready notification
   */
  sendNotification(order: Order): void {
    if (order.status !== 'ready') {
      this.toastService.warning('يجب أن تكون حالة الطلب "جاهز" لإرسال الإشعار');
      return;
    }

    this.ordersService.sendReadyNotification(order._id).subscribe({
      next: (result) => {
        if (result.alreadyNotified) {
          this.toastService.info('تم إرسال الإشعار مسبقاً');
        } else {
          this.toastService.success('تم إرسال الإشعار للعميل ✅');
        }
      },
      error: (error) => {
        console.error('Failed to send notification:', error);
        this.toastService.error('فشل إرسال الإشعار');
      },
    });
  }

  /**
   * Get meal image or placeholder
   */
  getMealImage(imageUrl?: string): string {
    return this.mealsService.getImageUrl(imageUrl || null);
  }

  /**
   * Track by function for ngFor
   */
  trackByOrderId(index: number, order: Order): string {
    return order._id;
  }
}
