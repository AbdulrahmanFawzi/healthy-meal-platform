/**
 * Orders Service
 * 
 * HTTP service for order and notification operations.
 * Handles both customer and admin endpoints.
 */

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Order, CreateOrderDto, OrderStatus } from '../models/order.model';
import { Notification } from '../models/notification.model';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class OrdersService {
  private readonly apiUrl = `${environment.apiUrl}/orders`;
  private readonly notificationsUrl = `${environment.apiUrl}/notifications`;

  constructor(private http: HttpClient) {}

  /**
   * Customer: Create new order
   */
  createOrder(orderData: CreateOrderDto): Observable<Order> {
    return this.http.post<ApiResponse<Order>>(this.apiUrl, orderData)
      .pipe(map(response => response.data));
  }

  /**
   * Customer: Get my orders
   */
  getMyOrders(): Observable<Order[]> {
    return this.http.get<ApiResponse<Order[]>>(`${this.apiUrl}/my`)
      .pipe(map(response => response.data));
  }

  /**
   * Admin: Get today's orders with filters
   */
  getTodayOrders(filters?: { status?: OrderStatus; q?: string }): Observable<Order[]> {
    let params = new HttpParams();

    if (filters) {
      if (filters.status) {
        params = params.set('status', filters.status);
      }
      if (filters.q) {
        params = params.set('q', filters.q);
      }
    }

    return this.http.get<ApiResponse<Order[]>>(`${this.apiUrl}/today`, { params })
      .pipe(map(response => response.data));
  }

  /**
   * Admin: Update order status
   */
  updateOrderStatus(orderId: string, status: OrderStatus): Observable<Order> {
    return this.http.patch<ApiResponse<Order>>(`${this.apiUrl}/${orderId}/status`, { status })
      .pipe(map(response => response.data));
  }

  /**
   * Admin: Send ready notification
   */
  sendReadyNotification(orderId: string): Observable<any> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/${orderId}/notify`, {})
      .pipe(map(response => response.data));
  }

  /**
   * Customer: Get my notifications
   */
  getMyNotifications(): Observable<Notification[]> {
    return this.http.get<ApiResponse<Notification[]>>(`${this.notificationsUrl}/my`)
      .pipe(map(response => response.data));
  }

  /**
   * Customer: Mark notification as read
   */
  markNotificationAsRead(notificationId: string): Observable<Notification> {
    return this.http.patch<ApiResponse<Notification>>(`${this.notificationsUrl}/${notificationId}/read`, {})
      .pipe(map(response => response.data));
  }
}
