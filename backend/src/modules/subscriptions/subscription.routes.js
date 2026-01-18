const express = require('express');
const router = express.Router();
const subscriptionController = require('./subscription.controller');
const { authMiddleware } = require('../../middlewares/auth.middleware');
const { requireRole } = require('../../middlewares/role.middleware');

/**
 * ============================================
 * SUBSCRIPTION ROUTES
 * ============================================
 * All routes require authentication and admin role.
 * Tenant isolation is enforced via restaurantId from JWT.
 */

/**
 * @route   POST /api/admin/subscribers
 * @desc    Create new subscriber (customer + subscription)
 * @access  Admin only
 */
router.post('/', authMiddleware, requireRole(['admin']), subscriptionController.createSubscriber);

/**
 * @route   GET /api/admin/subscribers
 * @desc    Get paginated list of subscribers
 * @query   search - Search by name, phone, email
 * @query   status - Filter by status (active/paused)
 * @query   page - Page number (default: 1)
 * @query   pageSize - Items per page (default: 10)
 * @access  Admin only
 */
router.get('/', authMiddleware, requireRole(['admin']), subscriptionController.getSubscribers);

/**
 * @route   GET /api/admin/subscribers/:id
 * @desc    Get subscriber details by ID
 * @access  Admin only
 */
router.get('/:id', authMiddleware, requireRole(['admin']), subscriptionController.getSubscriberById);

/**
 * @route   PUT /api/admin/subscribers/:id
 * @desc    Update subscriber and subscription details
 * @access  Admin only
 */
router.put('/:id', authMiddleware, requireRole(['admin']), subscriptionController.updateSubscriber);

/**
 * @route   DELETE /api/admin/subscribers/:id
 * @desc    Delete (soft delete) subscriber
 * @access  Admin only
 */
router.delete('/:id', authMiddleware, requireRole(['admin']), subscriptionController.deleteSubscriber);

module.exports = router;
