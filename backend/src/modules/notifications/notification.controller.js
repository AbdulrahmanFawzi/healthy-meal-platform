/**
 * Notification Controller
 */

const notificationService = require('./notification.service');

/**
 * GET /api/notifications/my
 * Get customer's notifications
 */
async function getMyNotifications(req, res, next) {
  try {
    const { userId: customerId, restaurantId } = req.user;

    const notifications = await notificationService.getMyNotifications(customerId, restaurantId);

    res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/notifications/:id/read
 * Mark notification as read
 */
async function markAsRead(req, res, next) {
  try {
    const { id } = req.params;
    const { userId: customerId, restaurantId } = req.user;

    const notification = await notificationService.markAsRead(id, customerId, restaurantId);

    res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getMyNotifications,
  markAsRead,
};
