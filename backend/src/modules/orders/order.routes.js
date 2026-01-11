/**
 * Order Routes
 * 
 * Endpoints:
 * - POST /api/orders (customer)
 * - GET /api/orders/today (admin)
 * - GET /api/orders/my (customer)
 * - PATCH /api/orders/:id/status (admin)
 * - POST /api/orders/:id/notify (admin)
 */

const express = require('express');
const router = express.Router();
const orderController = require('./order.controller');
const { authMiddleware } = require('../../middlewares/auth.middleware');
const { requireRole } = require('../../middlewares/role.middleware');

// Customer: Create order
router.post(
  '/',
  authMiddleware,
  requireRole(['customer']),
  orderController.createOrder
);

// Customer: Get my orders
router.get(
  '/my',
  authMiddleware,
  requireRole(['customer']),
  orderController.getMyOrders
);

// Customer: Get current order (today's order with live updates)
router.get(
  '/current',
  authMiddleware,
  requireRole(['customer']),
  orderController.getCurrentOrder
);

// Customer: Get order history (all past orders)
router.get(
  '/history',
  authMiddleware,
  requireRole(['customer']),
  orderController.getOrderHistory
);

// Admin: Get today's orders
router.get(
  '/today',
  authMiddleware,
  requireRole(['admin']),
  orderController.getTodayOrders
);

// Admin: Update order status
router.patch(
  '/:id/status',
  authMiddleware,
  requireRole(['admin']),
  orderController.updateStatus
);

// Admin: Send ready notification
router.post(
  '/:id/notify',
  authMiddleware,
  requireRole(['admin']),
  orderController.notifyReady
);

module.exports = router;
