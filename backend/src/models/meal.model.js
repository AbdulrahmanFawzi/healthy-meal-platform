/**
 * Meal Model
 * 
 * Multi-Tenant SaaS: Every meal belongs to a specific restaurant (restaurantId).
 * This ensures data isolation between tenants.
 * 
 * Business Rules:
 * - Meals are categorized as: protein, carb, or snack
 * - Availability determines scheduling: daily, weekly, or monthly
 * - isActive flag controls customer visibility
 * - All monetary values and macros are required for nutrition tracking
 */

const mongoose = require('mongoose');

const mealSchema = new mongoose.Schema({
  // Multi-tenancy: Links meal to specific restaurant
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true,
    index: true, // Index for performance on tenant-filtered queries
  },

  // Basic meal information
  name: {
    type: String,
    required: true,
    trim: true,
  },

  description: {
    type: String,
    required: true,
  },

  // Nutritional information (required for macro tracking)
  calories: {
    type: Number,
    required: true,
    min: 0,
  },

  proteinGrams: {
    type: Number,
    required: true,
    min: 0,
  },

  carbsGrams: {
    type: Number,
    required: true,
    min: 0,
  },

  // Optional image URL (uploaded via separate endpoint)
  imageUrl: {
    type: String,
    default: null,
  },

  // Meal scheduling
  availability: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    required: true,
    default: 'daily',
  },

  // Meal category for order pairing logic
  category: {
    type: String,
    enum: ['protein', 'carb', 'snack'],
    required: true,
  },

  // Visibility control: Only active meals shown to customers
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt automatically
});

// Compound index for common query patterns (tenant + category + active status)
mealSchema.index({ restaurantId: 1, category: 1, isActive: 1 });

const Meal = mongoose.model('Meal', mealSchema);

module.exports = Meal;
