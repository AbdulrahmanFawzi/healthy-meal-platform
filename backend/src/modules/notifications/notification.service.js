/**
 * Notification Service
 * 
 * Business logic for customer notifications.
 * MVP: Simple polling-based notifications (no websockets).
 */

const Notification = require('../../models/notification.model');

/**
 * Get customer's notifications (latest first, unread priority)
 */
async function getMyNotifications(customerId, restaurantId) {
  const notifications = await Notification.find({
    customerId,
    restaurantId,
  })
    .sort({ isRead: 1, createdAt: -1 }) // Unread first, then newest
    .limit(20)
    .lean();

  return notifications;
}

/**
 * Mark notification as read
 */
async function markAsRead(notificationId, customerId, restaurantId) {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, customerId, restaurantId },
    { isRead: true },
    { new: true }
  );

  if (!notification) {
    throw new Error('إشعار غير موجود');
  }

  return notification;
}

module.exports = {
  getMyNotifications,
  markAsRead,
};
