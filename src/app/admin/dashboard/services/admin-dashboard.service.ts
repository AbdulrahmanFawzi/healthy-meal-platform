import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

/**
 * Dashboard Statistics DTO
 * Contains overall dashboard metrics
 */
export interface DashboardStats {
  todayOrders: number;
  totalMeals: number;
  completedOrders: number;
  activeSubscribers: number;
  trends?: {
    todayOrders?: string;
    activeSubscribers?: string;
  };
}

/**
 * Order Status Statistics DTO
 * Contains count of orders by status
 */
export interface OrderStatusStats {
  received: number;
  preparing: number;
  ready: number;
  completed: number;
}

/**
 * Today Menu Item DTO
 * Represents a single meal in today's menu
 */
export interface TodayMenuItem {
  id: string;
  name: string;
  category: 'protein' | 'carb' | 'snack';
  protein: number;
  carbs: number;
  imageUrl: string;
}

/**
 * Latest Order DTO
 * Represents a recent order in the dashboard
 */
export interface LatestOrder {
  orderNumber: string;
  customerName: string;
  mealsCount: number;
  hasSnack?: boolean;
  status: 'received' | 'preparing' | 'ready' | 'completed';
}

/**
 * Admin Dashboard Service
 * 
 * Centralized service for all dashboard data operations.
 * Currently returns mock data via RxJS observables.
 * Ready for backend integration - just replace 'of()' with HttpClient calls.
 */
@Injectable({
  providedIn: 'root'
})
export class AdminDashboardService {

  constructor() {}

  /**
   * Get dashboard header statistics
   * 
   * TODO: Replace mock with API call -> GET /api/admin/dashboard/stats
   * 
   * @returns Observable<DashboardStats>
   */
  getDashboardStats(): Observable<DashboardStats> {
    const mockStats: DashboardStats = {
      todayOrders: 3,
      totalMeals: 8,
      completedOrders: 0,
      activeSubscribers: 48,
      trends: {
        todayOrders: '↑ 12% من الأمس',
        activeSubscribers: '↑ 8% هذا الشهر'
      }
    };

    return of(mockStats);
  }

  /**
   * Get order status distribution
   * 
   * TODO: Replace mock with API call -> GET /api/admin/dashboard/order-status
   * 
   * @returns Observable<OrderStatusStats>
   */
  getOrderStatusStats(): Observable<OrderStatusStats> {
    const mockStatusStats: OrderStatusStats = {
      received: 1,
      preparing: 1,
      ready: 1,
      completed: 0
    };

    return of(mockStatusStats);
  }

  /**
   * Get today's menu items
   * Note: This will eventually fetch from the real meals API
   * 
   * TODO: Replace mock with API call -> GET /api/admin/dashboard/today-menu
   * Or use existing: GET /api/meals?isActive=true&availability=daily
   * 
   * @returns Observable<TodayMenuItem[]>
   */
  getTodayMenu(): Observable<TodayMenuItem[]> {
    const mockMenu: TodayMenuItem[] = [
      {
        id: '1',
        name: 'صدر دجاج مشوي',
        category: 'protein',
        protein: 45,
        carbs: 2,
        imageUrl: '/uploads/chicken-breast.jpg'
      },
      {
        id: '2',
        name: 'سلمون مشوي',
        category: 'protein',
        protein: 38,
        carbs: 0,
        imageUrl: '/uploads/salmon.jpg'
      },
      {
        id: '3',
        name: 'أرز بسمتي',
        category: 'carb',
        protein: 3,
        carbs: 40,
        imageUrl: '/uploads/rice.jpg'
      },
      {
        id: '4',
        name: 'بطاطا حلوة مشوية',
        category: 'carb',
        protein: 2,
        carbs: 37,
        imageUrl: '/uploads/sweet-potato.jpg'
      }
    ];

    return of(mockMenu);
  }

  /**
   * Get latest orders
   * 
   * TODO: Replace mock with API call -> GET /api/admin/dashboard/latest-orders
   * Or use existing: GET /api/orders/today with limit
   * 
   * @returns Observable<LatestOrder[]>
   */
  getLatestOrders(): Observable<LatestOrder[]> {
    const mockOrders: LatestOrder[] = [
      {
        orderNumber: 'ORD001',
        customerName: 'أحمد محمد',
        mealsCount: 2,
        hasSnack: true,
        status: 'received'
      },
      {
        orderNumber: 'ORD002',
        customerName: 'فاطمة علي',
        mealsCount: 3,
        hasSnack: false,
        status: 'preparing'
      },
      {
        orderNumber: 'ORD003',
        customerName: 'عبدالله خالد',
        mealsCount: 2,
        hasSnack: true,
        status: 'ready'
      },
      {
        orderNumber: 'ORD004',
        customerName: 'سارة إبراهيم',
        mealsCount: 3,
        hasSnack: false,
        status: 'completed'
      },
      {
        orderNumber: 'ORD005',
        customerName: 'يوسف عبدالرحمن',
        mealsCount: 2,
        hasSnack: false,
        status: 'received'
      }
    ];

    return of(mockOrders);
  }
}
