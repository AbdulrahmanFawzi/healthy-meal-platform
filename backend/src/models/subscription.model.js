const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
      index: true // IMPORTANT: index for tenant filtering performance
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    // Subscription Plan Details
    plan: {
      mealsPerDay: {
        type: Number,
        required: true,
        min: 1,
        max: 5
      },
      includesSnack: {
        type: Boolean,
        default: false
      }
    },
    // Daily Macro Targets (informational)
    macros: {
      proteinGrams: {
        type: Number,
        required: true,
        min: 0
      },
      carbsGrams: {
        type: Number,
        required: true,
        min: 0
      }
    },
    // Subscription Period
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true,
      validate: {
        validator: function(value) {
          return value >= this.startDate;
        },
        message: 'End date must be greater than or equal to start date'
      }
    },
    // Status
    status: {
      type: String,
      enum: ['active', 'paused'],
      default: 'active'
    }
  },
  {
    timestamps: true
  }
);

// Compound index for efficient queries
subscriptionSchema.index({ restaurantId: 1, customerId: 1 });
subscriptionSchema.index({ restaurantId: 1, status: 1 });

// Virtual for calculating remaining days
subscriptionSchema.virtual('remainingDays').get(function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endDate = new Date(this.endDate);
  endDate.setHours(0, 0, 0, 0);
  const diffTime = endDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
});

// Virtual for calculating total days
subscriptionSchema.virtual('totalDays').get(function() {
  const startDate = new Date(this.startDate);
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date(this.endDate);
  endDate.setHours(0, 0, 0, 0);
  const diffTime = endDate - startDate;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days
});

module.exports = mongoose.model('Subscription', subscriptionSchema);
