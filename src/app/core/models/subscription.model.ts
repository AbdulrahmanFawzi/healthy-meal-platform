/**
 * Subscription-related models and interfaces
 */

/**
 * Subscription status enum
 */
export type SubscriptionStatus = 'active' | 'paused';

/**
 * Subscriber card data (used in list/cards display)
 */
export interface SubscriberCard {
  id: string;
  fullName: string;
  username: string;
  email?: string | null;
  phone: string;
  mealsPerDay: number;
  dailyProteinGram: number;
  dailyCarbsGram: number;
  includeSnack: boolean;
  startDate: string | Date;
  endDate: string | Date;
  status: SubscriptionStatus;
  totalOrdersCount: number;
  createdAt: string | Date;
  remainingDays?: number;
  totalDays?: number;
}

/**
 * Create subscriber request payload
 */
export interface CreateSubscriberRequest {
  fullName: string;
  phone: string;
  email?: string;
  password: string;
  mealsPerDay: number;
  dailyProteinGram: number;
  dailyCarbsGram: number;
  includeSnack: boolean;
  startDate: string | Date;
  endDate: string | Date;
  status: SubscriptionStatus;
}

/**
 * Update subscriber request payload
 */
export interface UpdateSubscriberRequest {
  fullName?: string;
  phone?: string;
  email?: string;
  password?: string; // Optional: only update if provided
  mealsPerDay?: number;
  dailyProteinGram?: number;
  dailyCarbsGram?: number;
  includeSnack?: boolean;
  startDate?: string | Date;
  endDate?: string | Date;
  status?: SubscriptionStatus;
}

/**
 * Paginated subscribers response
 */
export interface PaginatedSubscribersResponse {
  subscribers: SubscriberCard[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

/**
 * Subscribers filter/query params
 */
export interface SubscribersQueryParams {
  search?: string;
  status?: SubscriptionStatus | '';
  page?: number;
  pageSize?: number;
}
