import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminSubscriptionsService } from './services/admin-subscriptions.service';
import { SubscriberCard, SubscriptionStatus } from '../../core/models/subscription.model';
import { AddSubscriberModalComponent } from './components/add-subscriber-modal/add-subscriber-modal';
import { ConfirmationModalComponent } from '../../shared/components/confirmation-modal/confirmation-modal';
import { ToastService } from '../../shared/services/toast.service';

/**
 * Subscriptions Management Page (Admin)
 * 
 * Lists subscriber cards with ability to:
 * - Add new subscriber
 * - Edit subscriber
 * - Delete subscriber
 * - Filter by status
 * - Search by name/phone/email
 */
@Component({
  selector: 'app-subscriptions',
  standalone: true,
  imports: [CommonModule, AddSubscriberModalComponent, ConfirmationModalComponent],
  templateUrl: './subscriptions.html',
  styleUrl: './subscriptions.scss'
})
export class AdminSubscriptionsComponent implements OnInit {
  subscribers: SubscriberCard[] = [];
  isLoading = false;
  isInitialLoading = true;
  error: string | null = null;
  
  // Modal state
  isModalOpen = false;
  editingSubscriber: SubscriberCard | null = null;

  // Confirmation modal state
  isConfirmationOpen = false;
  subscriberToDelete: SubscriberCard | null = null;

  // Filters
  searchTerm = '';
  statusFilter: SubscriptionStatus | '' = '';

  // Pagination
  currentPage = 1;
  pageSize = 12;
  totalItems = 0;
  totalPages = 0;

  constructor(
    private subscriptionsService: AdminSubscriptionsService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadSubscribers();
  }

  /**
   * Load subscribers from API
   */
  loadSubscribers(): void {
    this.isLoading = true;
    this.error = null;

    this.subscriptionsService.getSubscribers({
      search: this.searchTerm,
      status: this.statusFilter,
      page: this.currentPage,
      pageSize: this.pageSize
    }).subscribe({
      next: (response) => {
        this.subscribers = response.subscribers;
        this.currentPage = response.pagination.page;
        this.pageSize = response.pagination.pageSize;
        this.totalItems = response.pagination.totalItems;
        this.totalPages = response.pagination.totalPages;
        this.isLoading = false;
        this.isInitialLoading = false;
      },
      error: (err) => {
        console.error('Error loading subscribers:', err);
        this.error = 'حدث خطأ في تحميل المشتركين';
        this.isLoading = false;
        this.isInitialLoading = false;
      }
    });
  }

  /**
   * Open modal to add new subscriber
   */
  openAddSubscriberModal(): void {
    this.editingSubscriber = null;
    this.isModalOpen = true;
  }

  /**
   * Open modal to edit existing subscriber
   */
  onEditSubscriber(subscriber: SubscriberCard): void {
    this.editingSubscriber = subscriber;
    this.isModalOpen = true;
  }

  /**
   * Delete subscriber - open confirmation modal
   */
  onDeleteSubscriber(subscriber: SubscriberCard): void {
    this.subscriberToDelete = subscriber;
    this.isConfirmationOpen = true;
  }

  /**
   * Confirm deletion
   */
  confirmDelete(): void {
    if (!this.subscriberToDelete) return;

    this.isConfirmationOpen = false;
    this.isLoading = true;

    this.subscriptionsService.deleteSubscriber(this.subscriberToDelete.id).subscribe({
      next: () => {
        this.subscribers = this.subscribers.filter(s => s.id !== this.subscriberToDelete!.id);
        this.isLoading = false;
        this.subscriberToDelete = null;
        this.toastService.success('تم إيقاف اشتراك المشترك بنجاح ✅');
      },
      error: (err) => {
        console.error('Error deleting subscriber:', err);
        this.isLoading = false;
        this.subscriberToDelete = null;
        this.toastService.error('حدث خطأ في إيقاف الاشتراك. يرجى المحاولة مرة أخرى.');
      }
    });
  }

  /**
   * Cancel deletion
   */
  cancelDelete(): void {
    this.isConfirmationOpen = false;
    this.subscriberToDelete = null;
  }

  /**
   * Handle modal close
   */
  onModalClose(): void {
    this.isModalOpen = false;
    this.editingSubscriber = null;
  }

  /**
   * Handle subscriber saved (created or updated)
   */
  onSubscriberSaved(): void {
    this.isModalOpen = false;
    this.editingSubscriber = null;
    this.loadSubscribers(); // Reload list
    
    // Show success toast
    const message = this.editingSubscriber 
      ? 'تم تحديث بيانات المشترك بنجاح ✅' 
      : 'تم إضافة المشترك بنجاح ✅';
    this.toastService.success(message);
  }

  /**
   * Search subscribers
   */
  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm = input.value;
    this.currentPage = 1; // Reset to first page
    this.loadSubscribers();
  }

  /**
   * Filter by status
   */
  onStatusFilterChange(status: SubscriptionStatus | ''): void {
    this.statusFilter = status;
    this.currentPage = 1; // Reset to first page
    this.loadSubscribers();
  }

  /**
   * Format date for display (Gregorian)
   */
  formatDate(date: string | Date): string {
    const d = new Date(date);
    return d.toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  /**
   * Get status text
   */
  getStatusText(status: SubscriptionStatus): string {
    return status === 'active' ? 'نشط' : 'متوقف مؤقتاً';
  }

  /**
   * Get status class
   */
  getStatusClass(status: SubscriptionStatus): string {
    return status === 'active' ? 'status-active' : 'status-paused';
  }
}
