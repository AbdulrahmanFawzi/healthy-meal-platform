/**
 * Notification Routes
 */

const express = require('express');
const router = express.Router();
const notificationController = require('./notification.controller');
const { authMiddleware } = require('../../middlewares/auth.middleware');
const { requireRole } = require('../../middlewares/role.middleware');

// Customer: Get my notifications
router.get(
  '/my',
  authMiddleware,
  requireRole(['customer']),
  notificationController.getMyNotifications
);

// Customer: Mark notification as read
router.patch(
  '/:id/read',
  authMiddleware,
  requireRole(['customer']),
  notificationController.markAsRead
);

module.exports = router;
