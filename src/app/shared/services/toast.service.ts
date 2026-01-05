/**
 * Toast Notification Service
 * 
 * Global service for displaying toast notifications
 * Provides success, error, info, and warning toast types
 * Auto-dismisses after configurable duration
 */

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastsSubject = new BehaviorSubject<Toast[]>([]);
  public toasts$: Observable<Toast[]> = this.toastsSubject.asObservable();

  /**
   * Show success toast
   */
  success(message: string, duration: number = 4000): void {
    this.show('success', message, duration);
  }

  /**
   * Show error toast
   */
  error(message: string, duration: number = 5000): void {
    this.show('error', message, duration);
  }

  /**
   * Show info toast
   */
  info(message: string, duration: number = 4000): void {
    this.show('info', message, duration);
  }

  /**
   * Show warning toast
   */
  warning(message: string, duration: number = 4000): void {
    this.show('warning', message, duration);
  }

  /**
   * Show toast notification
   */
  private show(type: Toast['type'], message: string, duration: number): void {
    const toast: Toast = {
      id: this.generateId(),
      type,
      message,
      duration
    };

    const currentToasts = this.toastsSubject.value;
    this.toastsSubject.next([...currentToasts, toast]);

    // Auto-dismiss after duration
    if (duration > 0) {
      setTimeout(() => {
        this.remove(toast.id);
      }, duration);
    }
  }

  /**
   * Remove toast by ID
   */
  remove(id: string): void {
    const currentToasts = this.toastsSubject.value;
    this.toastsSubject.next(currentToasts.filter(t => t.id !== id));
  }

  /**
   * Clear all toasts
   */
  clear(): void {
    this.toastsSubject.next([]);
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
