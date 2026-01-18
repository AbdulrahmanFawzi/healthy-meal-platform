const express = require('express');
const router = express.Router();

/**
 * Health Check Endpoint
 * GET /api/health
 * 
 * Returns the backend service health status.
 * Used for monitoring and deployment health checks.
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      message: 'Backend is running 🚀',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    }
  });
});

// ===========================
// API Routes
// ===========================

/**
 * Authentication Routes
 * ---------------------
 * Handles user login, logout, and profile retrieval.
 * Base path: /api/auth
 * 
 * Available endpoints:
 * - POST /api/auth/login
 * - GET /api/auth/me
 * - POST /api/auth/logout
 */
const authRoutes = require('../modules/auth/auth.routes');
router.use('/auth', authRoutes);

/**
 * Platform Routes
 * ---------------
 * Handles platform-level operations (super admin only).
 * Base path: /api/platform
 * 
 * Available endpoints:
 * - POST /api/platform/restaurants (create restaurant + admin)
 * - GET /api/platform/restaurants (list all restaurants)
 */
const platformRoutes = require('../modules/platform/platform.routes');
router.use('/platform', platformRoutes);

/**
 * Meals Routes
 * ------------
 * Handles meal management (CRUD + image upload).
 * Base path: /api/meals
 * 
 * Available endpoints:
 * - GET /api/meals (admin, customer)
 * - POST /api/meals (admin only)
 * - PUT /api/meals/:id (admin only)
 * - DELETE /api/meals/:id (admin only)
 * - POST /api/meals/:id/image (admin only)
 */
const mealRoutes = require('../modules/meals/meal.routes');
router.use('/meals', mealRoutes);

/**
 * Orders Routes
 * -------------
 * Handles order creation and management.
 * Base path: /api/orders
 * 
 * Available endpoints:
 * - POST /api/orders (customer)
 * - GET /api/orders/today (admin)
 * - GET /api/orders/my (customer)
 * - PATCH /api/orders/:id/status (admin)
 * - POST /api/orders/:id/notify (admin)
 */
const orderRoutes = require('../modules/orders/order.routes');
router.use('/orders', orderRoutes);

/**
 * Notifications Routes
 * --------------------
 * Handles customer notifications.
 * Base path: /api/notifications
 * 
 * Available endpoints:
 * - GET /api/notifications/my (customer)
 * - PATCH /api/notifications/:id/read (customer)
 */
const notificationRoutes = require('../modules/notifications/notification.routes');
router.use('/notifications', notificationRoutes);

/**
 * Subscriptions Routes (Admin)
 * ----------------------------
 * Handles subscriber and subscription management.
 * Base path: /api/admin/subscribers
 * 
 * Available endpoints:
 * - POST /api/admin/subscribers (admin)
 * - GET /api/admin/subscribers (admin)
 * - GET /api/admin/subscribers/:id (admin)
 * - PUT /api/admin/subscribers/:id (admin)
 * - DELETE /api/admin/subscribers/:id (admin)
 */
const subscriptionRoutes = require('../modules/subscriptions/subscription.routes');
router.use('/admin/subscribers', subscriptionRoutes);

// ===========================
// Future API Routes
// ===========================

// TODO: Mount platform routes (super_admin only)
// const platformRoutes = require('../modules/platform/platform.routes');
// router.use('/platform', platformRoutes);

module.exports = router;
