/**
 * Toast Notification Component
 * 
 * Displays toast notifications with animations
 * Automatically positioned in top-right (RTL-friendly)
 * Supports success, error, info, and warning types
 */

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ToastService, Toast } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.html',
  styleUrls: ['./toast.scss']
})
export class ToastComponent implements OnInit, OnDestroy {
  toasts: Toast[] = [];
  private subscription?: Subscription;

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    this.subscription = this.toastService.toasts$.subscribe(toasts => {
      this.toasts = toasts;
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  /**
   * Remove toast
   */
  removeToast(id: string): void {
    this.toastService.remove(id);
  }

  /**
   * Get icon for toast type
   */
  getIcon(type: Toast['type']): string {
    const icons = {
      success: '✓',
      error: '✕',
      info: 'ℹ',
      warning: '⚠'
    };
    return icons[type];
  }

  /**
   * Track toasts by ID for ngFor performance
   */
  trackByToastId(index: number, toast: Toast): string {
    return toast.id;
  }
}
