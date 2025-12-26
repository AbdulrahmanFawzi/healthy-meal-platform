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
// Future API Routes
// ===========================
// TODO: Mount authentication routes
// router.use('/auth', require('./auth.routes'));

// TODO: Mount meals routes
// router.use('/meals', require('./meals.routes'));

// TODO: Mount orders routes
// router.use('/orders', require('./orders.routes'));

// TODO: Mount subscriptions routes
// router.use('/subscriptions', require('./subscriptions.routes'));

// TODO: Mount notifications routes
// router.use('/notifications', require('./notifications.routes'));

module.exports = router;
