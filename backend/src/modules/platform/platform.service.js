/**
 * ============================================
 * PLATFORM SERVICE
 * ============================================
 * 
 * Handles platform-level operations for super admin:
 * - Restaurant registration
 * - Creating initial admin users for restaurants
 */

const Restaurant = require('../../models/restaurant.model');
const User = require('../../models/user.model');
const { normalizePhone } = require('../../utils/phone.util');

/**
 * Create a new restaurant with initial admin user
 * 
 * @param {Object} data - Restaurant and admin data
 * @param {string} data.restaurantName - Restaurant name
 * @param {string} data.adminPhone - Admin phone number
 * @param {string} data.adminPassword - Admin password
 * @param {string} data.logoUrl - Optional restaurant logo URL
 * @returns {Promise<Object>} Created restaurant and admin info
 */
const createRestaurant = async ({ restaurantName, adminPhone, adminPassword, logoUrl = null }) => {
  // Validate input
  if (!restaurantName || !adminPhone || !adminPassword) {
    const error = new Error('اسم المطعم، رقم الجوال، وكلمة المرور مطلوبة');
    error.code = 'VALIDATION_ERROR';
    error.statusCode = 400;
    throw error;
  }

  // Normalize phone
  let normalizedPhone;
  try {
    normalizedPhone = normalizePhone(adminPhone);
  } catch (error) {
    const err = new Error('صيغة رقم الجوال غير صحيحة');
    err.code = 'VALIDATION_ERROR';
    err.statusCode = 400;
    throw err;
  }

  // Check if phone already exists (globally unique)
  const existingUser = await User.findOne({ phone: normalizedPhone });
  if (existingUser) {
    const error = new Error('رقم الجوال مستخدم بالفعل');
    error.code = 'PHONE_EXISTS';
    error.statusCode = 409;
    throw error;
  }

  // Create restaurant
  const restaurant = await Restaurant.create({
    name: restaurantName,
    logoUrl: logoUrl
  });

  // Create admin user for this restaurant
  const adminUser = await User.create({
    restaurantId: restaurant._id,
    name: `مدير ${restaurantName}`, // "Manager of [Restaurant Name]"
    phone: normalizedPhone,
    passwordHash: adminPassword, // Will be hashed by pre-save hook
    role: 'admin'
  });

  return {
    restaurantId: restaurant._id.toString(),
    restaurantName: restaurant.name,
    logoUrl: restaurant.logoUrl,
    adminPhone: adminUser.phone,
    adminName: adminUser.name
  };
};

/**
 * Get all restaurants (for super admin)
 * 
 * @returns {Promise<Array>} List of all restaurants
 */
const getAllRestaurants = async () => {
  const restaurants = await Restaurant.find().sort({ createdAt: -1 });
  return restaurants.map(r => ({
    id: r._id.toString(),
    name: r.name,
    logoUrl: r.logoUrl,
    createdAt: r.createdAt
  }));
};

module.exports = {
  createRestaurant,
  getAllRestaurants
};
