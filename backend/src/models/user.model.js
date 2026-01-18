
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { normalizePhone } = require('../utils/phone.util');

const userSchema = new mongoose.Schema({
  /**
   * Restaurant ID (Tenant Isolation)
   * ---------------------------------
   * Foreign key to Restaurant collection
   * - NULL only for super_admin users
   * - REQUIRED for admin and customer roles
   * 
   * Why: Ensures complete data isolation between restaurants
   */
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    default: null,
    // Custom validator: require restaurantId unless role is super_admin
    validate: {
      validator: function(value) {
        // If role is super_admin, restaurantId must be null
        if (this.role === 'super_admin') {
          return value === null;
        }
        // For admin and customer, restaurantId is required
        return value !== null;
      },
      message: 'restaurantId مطلوب للمشرفين والعملاء'
    }
  },

  /**
   * User Name
   * ---------
   * Full name in Arabic or English
   */
  name: {
    type: String,
    required: [true, 'الاسم مطلوب'],
    trim: true,
    minlength: [2, 'الاسم يجب أن يكون حرفين على الأقل'],
    maxlength: [100, 'الاسم يجب أن لا يتجاوز 100 حرف']
  },

  /**
   * Phone Number (Primary Login ID)
   * --------------------------------
   * Format: +9665XXXXXXXX (Saudi format only)
   * 
   * Validation:
   * - Must start with +966
   * - Followed by 5 (Saudi mobile prefix)
   * - Then 8 digits
   * - Total: 13 characters
   * 
   * Uniqueness (MVP Simplification):
   * --------------------------------
   * Phone is GLOBALLY UNIQUE across entire platform.
   * This simplifies login: { phone, password } without restaurantSlug.
   * 
   * Trade-off:
   * - Same person cannot have accounts at different restaurants
   * - Benefit: Simple, unambiguous login flow
   * 
   * Multi-tenancy is still enforced via restaurantId on data queries.
   * 
   * Examples:
   * ✅ +966500000001 (Restaurant A, Admin)
   * ❌ +966500000001 (Restaurant B, Customer) - REJECTED (duplicate)
   * ✅ +966500000002 (Restaurant B, Customer) - ALLOWED (unique)
   */
  phone: {
    type: String,
    required: [true, 'رقم الجوال مطلوب'],
    unique: true,  // Globally unique across platform
    index: true,   // Index for fast lookups during login
    trim: true,
    validate: {
      validator: function(v) {
        // Accept both formats for backward compatibility:
        // 1. Local: 05XXXXXXXX
        // 2. International: +9665XXXXXXXX
        const cleaned = v ? v.trim().replace(/\s/g, '') : '';
        return /^05[0-9]{8}$/.test(cleaned) || /^\+9665[0-9]{8}$/.test(cleaned);
      },
      message: 'رقم الجوال يجب أن يكون بصيغة 05XXXXXXXX أو +9665XXXXXXXX'
    }
  },

  /**
   * Email (Optional, Future Use)
   * -----------------------------
   * NOT used for login in MVP
   * May be used for:
   * - Password reset emails
   * - Order notifications
   * - Marketing communications
   */
  email: {
    type: String,
    trim: true,
    lowercase: true,
    default: null,
    validate: {
      validator: function(v) {
        // Only validate if email is provided
        if (!v) return true;
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'البريد الإلكتروني غير صالح'
    }
  },

  passwordHash: {
    type: String,
    required: [true, 'كلمة المرور مطلوبة'],
    select: false // Don't include in queries by default (security)
  },

  /**
   * User Role
   * ---------
   * Determines access permissions:
   * 
   * super_admin:
   * - Create restaurants
   * - Create admin users
   * - Platform-level analytics
   * - restaurantId = null
   * 
   * admin:
   * - Manage meals (own restaurant)
   * - View orders (own restaurant)
   * - Manage subscriptions (own restaurant)
   * - Create customer accounts
   * 
   * customer:
   * - Browse meals
   * - Create daily orders
   * - View own order history
   */
  role: {
    type: String,
    enum: {
      values: ['super_admin', 'admin', 'customer'],
      message: 'الدور يجب أن يكون: super_admin أو admin أو customer'
    },
    required: [true, 'دور المستخدم مطلوب']
  },

  /**
   * Creation Timestamp
   * ------------------
   * Automatically set when user account is created
   */
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  /**
   * Schema Options
   * --------------
   */
  timestamps: true, // Adds createdAt and updatedAt
  toJSON: {
    transform: function(doc, ret) {
      // Sanitize response: remove sensitive data
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      delete ret.passwordHash; // NEVER expose password hash
      return ret;
    }
  }
});

/**
 * ============================================
 * INDEXES
 * ============================================
 * 
 * Phone Index:
 * ------------
 * Phone field has { unique: true, index: true } defined in schema above.
 * MongoDB will automatically create unique index on phone field.
 * 
 * This ensures:
 * - Fast lookups during login: User.findOne({ phone })
 * - Prevents duplicate phone numbers across entire platform
 * - E11000 error if attempting to insert duplicate phone
 * 
 * MVP Simplification:
 * -------------------
 * We removed the compound index { phone, restaurantId } to simplify login.
 * Phone is now globally unique, so users login with just { phone, password }.
 * 
 * Multi-tenancy is still enforced via restaurantId on data operations,
 * NOT on user identity.
 */


/**
 * ============================================
 * PRE-SAVE HOOK: Phone Normalization
 * ============================================
 * 
 * Normalize phone to international format before saving
 * Ensures all phones stored as +9665XXXXXXXX
 */
userSchema.pre('save', async function() {
  // Normalize phone if it's new or modified
  if (this.isModified('phone')) {
    this.phone = normalizePhone(this.phone);
  }
});

/**
 * ============================================
 * PRE-SAVE HOOK: Automatic Password Hashing
 * ============================================
 */
userSchema.pre('save', async function() {
  // Only hash if password is new or modified
  if (!this.isModified('passwordHash')) {
    return;
  }

  // Generate salt and hash password
  // 12 rounds = 2^12 iterations (~300ms)
  const salt = await bcrypt.genSalt(12);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
});

/*
 * 
 * @param {string} candidatePassword - Plain text password from login form
 * @returns {Promise<boolean>} - True if password matches
 */
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    // bcrypt.compare() extracts salt from this.passwordHash automatically
    return await bcrypt.compare(candidatePassword, this.passwordHash);
  } catch (error) {
    return false;
  }
};

/**
 * ============================================
 * STATIC METHODS
 * ============================================
 * 
 * MVP Simplification:
 * -------------------
 * With globally unique phone numbers, we don't need a special findByPhone method.
 * Controllers can simply use: User.findOne({ phone }).select('+passwordHash')
 * 
 * Future Enhancement:
 * -------------------
 * If we want to support phone reuse across restaurants:
 * - Add restaurantSlug to login request
 * - Restore compound index { phone, restaurantId }
 * - Add findByPhone(phone, restaurantId) static method
 */


module.exports = mongoose.model('User', userSchema);
