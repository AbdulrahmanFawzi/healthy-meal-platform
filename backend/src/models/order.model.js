/**
 * Order Model
 * 
 * Multi-Tenant SaaS: Every order belongs to a specific restaurant (restaurantId).
 * Stores daily meal selections with macro tracking.
 * 
 * Business Rules:
 * - Orders capture snapshot of meals at creation time
 * - Status workflow: received → preparing → ready → completed
 * - Auto-generates orderNumber (ORD0001#)
 * - Pairs structure: [{proteinMealId, carbMealId}]
 */

const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  // Multi-tenancy: Links order to specific restaurant
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true,
    index: true,
  },

  // Customer reference
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },

  // Auto-generated order number (e.g., ORD0001#)
  orderNumber: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },

  // Date of the order (YYYY-MM-DD format)
  orderDate: {
    type: String,
    required: true,
    index: true,
  },

  // Order status workflow
  status: {
    type: String,
    enum: ['received', 'preparing', 'ready', 'completed'],
    default: 'received',
    index: true,
  },

  // Meal selections stored as pairs
  selections: [{
    proteinMeal: {
      mealId: { type: mongoose.Schema.Types.ObjectId, ref: 'Meal' },
      name: String,
      calories: Number,
      proteinGrams: Number,
      carbsGrams: Number,
      imageUrl: String,
    },
    carbMeal: {
      mealId: { type: mongoose.Schema.Types.ObjectId, ref: 'Meal' },
      name: String,
      calories: Number,
      proteinGrams: Number,
      carbsGrams: Number,
      imageUrl: String,
    }
  }],

  // Optional snack
  snackMeal: {
    mealId: { type: mongoose.Schema.Types.ObjectId, ref: 'Meal' },
    name: String,
    calories: Number,
    proteinGrams: Number,
    carbsGrams: Number,
    imageUrl: String,
  },

  // Calculated totals
  totals: {
    calories: { type: Number, required: true },
    proteinGrams: { type: Number, required: true },
    carbsGrams: { type: Number, required: true },
  },

  // Macro targets (from subscription - informational)
  macroTargets: {
    proteinGrams: Number,
    carbsGrams: Number,
  },

  // Optional customer notes
  notes: {
    type: String,
    default: '',
  },

}, {
  timestamps: true, // Auto-generates createdAt and updatedAt
});

// Compound index for efficient queries
orderSchema.index({ restaurantId: 1, orderDate: 1, status: 1 });
orderSchema.index({ restaurantId: 1, customerId: 1, orderDate: 1 });

/**
 * Generate next order number for restaurant
 * Format: ORD0001#, ORD0002#, etc.
 */
orderSchema.statics.generateOrderNumber = async function(restaurantId) {
  const lastOrder = await this.findOne({ restaurantId })
    .sort({ createdAt: -1 })
    .select('orderNumber')
    .lean();

  if (!lastOrder) {
    return 'ORD0001#';
  }

  const lastNumber = parseInt(lastOrder.orderNumber.replace(/[^\d]/g, ''));
  const nextNumber = (lastNumber + 1).toString().padStart(4, '0');
  return `ORD${nextNumber}#`;
};

module.exports = mongoose.model('Order', orderSchema);
