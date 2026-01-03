

const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  /**
   * Restaurant Name
   * ----------------
   * Arabic name displayed in customer app and admin panel
   * Example: "مطعم الصحة", "مطبخ الحياة"
   */
  name: {
    type: String,
    required: [true, 'اسم المطعم مطلوب'],
    trim: true,
    minlength: [3, 'اسم المطعم يجب أن يكون 3 أحرف على الأقل'],
    maxlength: [100, 'اسم المطعم يجب أن لا يتجاوز 100 حرف']
  },

  /**
   * Logo URL
   * ---------
   * URL to restaurant logo image (Cloudinary or local storage)
   * Used in:
   * - Login response (frontend displays in header)
   * - Customer app branding
   * - Admin panel branding
   * 
   * Can be null during initial setup
   */
  logoUrl: {
    type: String,
    default: null,
    trim: true
  },

  /**
   * Creation Timestamp
   * -------------------
   * Automatically set when restaurant is created
   * Useful for analytics and auditing
   */
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  /**
   * Schema Options
   * --------------
   * timestamps: Adds createdAt and updatedAt automatically
   * toJSON: Customizes how model is serialized to JSON
   */
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      // Convert _id to id for cleaner API responses
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});


module.exports = mongoose.model('Restaurant', restaurantSchema);
