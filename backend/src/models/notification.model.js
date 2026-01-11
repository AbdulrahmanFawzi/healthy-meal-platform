/**
 * Notification Model
 * 
 * Multi-Tenant SaaS: Notifications belong to specific restaurant.
 * MVP: Only "order_ready" notifications (in-app, no push/SMS).
 * 
 * Business Rules:
 * - Created when admin clicks "إرسال إشعار"
 * - Customer polls GET /api/notifications to check
 * - Can be marked as read
 */

const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  // Multi-tenancy
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true,
    index: true,
  },

  // Customer who receives notification
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },

  // Related order
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
  },

  // Notification type (MVP: only order_ready)
  type: {
    type: String,
    enum: ['order_ready'],
    default: 'order_ready',
  },

  // Notification message (Arabic)
  message: {
    type: String,
    required: true,
  },

  // Read status
  isRead: {
    type: Boolean,
    default: false,
    index: true,
  },

}, {
  timestamps: true,
});

// Compound index for efficient customer queries
notificationSchema.index({ customerId: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
