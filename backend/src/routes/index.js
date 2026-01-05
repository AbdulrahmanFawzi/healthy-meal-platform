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

// ===========================
// Future API Routes
// ===========================

// TODO: Mount orders routes (restaurant-scoped)
// const ordersRoutes = require('../modules/orders/orders.routes');
// router.use('/orders', ordersRoutes);

// TODO: Mount subscriptions routes (restaurant-scoped)
// const subscriptionsRoutes = require('../modules/subscriptions/subscriptions.routes');
// router.use('/subscriptions', subscriptionsRoutes);

// TODO: Mount notifications routes (restaurant-scoped)
// const notificationsRoutes = require('../modules/notifications/notifications.routes');
// router.use('/notifications', notificationsRoutes);

// TODO: Mount platform routes (super_admin only)
// const platformRoutes = require('../modules/platform/platform.routes');
// router.use('/platform', platformRoutes);

module.exports = router;
