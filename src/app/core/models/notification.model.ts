/**
 * Notification Models
 */

export type NotificationType = 'order_ready';

export interface Notification {
  _id: string;
  restaurantId: string;
  customerId: string;
  orderId: string;
  type: NotificationType;
  message: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}
