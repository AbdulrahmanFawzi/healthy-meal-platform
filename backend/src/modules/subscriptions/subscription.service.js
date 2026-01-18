const User = require('../../models/user.model');
const Subscription = require('../../models/subscription.model');
const Order = require('../../models/order.model');
const bcrypt = require('bcryptjs');
const { normalizePhone } = require('../../utils/phone.util');

/**
 * ============================================
 * SUBSCRIPTION SERVICE
 * ============================================
 * Business logic for managing subscribers and their subscriptions.
 * All operations enforce tenant isolation by restaurantId.
 */

class SubscriptionService {
  /**
   * Create a new subscriber (customer user + subscription) in one transaction
   * 
   * @param {Object} data - Subscriber data
   * @param {string} data.fullName - Full name
   * @param {string} data.phone - Phone number (+9665XXXXXXXX)
   * @param {string} data.email - Email (optional)
   * @param {string} data.password - Plain password (will be hashed)
   * @param {number} data.mealsPerDay - Meals per day (1-5)
   * @param {number} data.dailyProteinGram - Daily protein target
   * @param {number} data.dailyCarbsGram - Daily carbs target
   * @param {boolean} data.includeSnack - Include snack option
   * @param {Date} data.startDate - Subscription start date
   * @param {Date} data.endDate - Subscription end date
   * @param {string} data.status - Subscription status (active/paused)
   * @param {string} restaurantId - Admin's restaurant ID (from JWT)
   * @returns {Promise<Object>} Created subscriber with subscription details
   */
  async createSubscriber(data, restaurantId) {
    const {
      fullName,
      phone,
      email,
      password,
      mealsPerDay,
      dailyProteinGram,
      dailyCarbsGram,
      includeSnack,
      startDate,
      endDate,
      status
    } = data;

    // Normalize phone number to international format
    let normalizedPhone;
    try {
      normalizedPhone = normalizePhone(phone);
    } catch (error) {
      throw new Error('صيغة رقم الجوال غير صحيحة');
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) {
      throw new Error('تاريخ النهاية يجب أن يكون بعد أو يساوي تاريخ البداية');
    }

    // Check if phone already exists (use normalized format)
    const existingUser = await User.findOne({ phone: normalizedPhone });
    if (existingUser) {
      throw new Error('رقم الجوال مسجل بالفعل');
    }

    // Create user account (customer role) with normalized phone
    const user = new User({
      restaurantId,
      name: fullName,
      phone: normalizedPhone,
      email: email || null,
      passwordHash: password, // Will be hashed by pre-save hook
      role: 'customer'
    });

    await user.save();

    // Create subscription
    const subscription = new Subscription({
      restaurantId,
      customerId: user._id,
      plan: {
        mealsPerDay,
        includesSnack: includeSnack || false
      },
      macros: {
        proteinGrams: dailyProteinGram,
        carbsGrams: dailyCarbsGram
      },
      startDate: start,
      endDate: end,
      status: status || 'active'
    });

    await subscription.save();

    // Get total orders count for this customer (0 for new subscriber)
    const totalOrdersCount = 0;

    return this._formatSubscriberCard(user, subscription, totalOrdersCount);
  }

  /**
   * Get paginated list of subscribers for a restaurant
   * 
   * @param {string} restaurantId - Admin's restaurant ID
   * @param {Object} filters - Query filters
   * @param {string} filters.search - Search term (name, phone, email)
   * @param {string} filters.status - Filter by status (active/paused)
   * @param {number} filters.page - Page number (1-indexed)
   * @param {number} filters.pageSize - Items per page
   * @returns {Promise<Object>} Paginated subscribers list
   */
  async getSubscribers(restaurantId, filters = {}) {
    const {
      search = '',
      status = '',
      page = 1,
      pageSize = 10
    } = filters;

    // Build query for customers in this restaurant
    const userQuery = { 
      restaurantId,
      role: 'customer'
    };

    // Apply search filter
    if (search) {
      userQuery.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Get matching users
    const skip = (page - 1) * pageSize;
    const users = await User.find(userQuery)
      .skip(skip)
      .limit(pageSize)
      .sort({ createdAt: -1 });

    const totalUsers = await User.countDocuments(userQuery);

    // Get subscriptions for these users
    const userIds = users.map(u => u._id);
    const subscriptionQuery = { 
      restaurantId,
      customerId: { $in: userIds }
    };

    // Apply status filter to subscriptions
    if (status) {
      subscriptionQuery.status = status;
    }

    const subscriptions = await Subscription.find(subscriptionQuery);

    // Map subscriptions by customerId for quick lookup
    const subscriptionMap = {};
    subscriptions.forEach(sub => {
      subscriptionMap[sub.customerId.toString()] = sub;
    });

    // Get order counts for all users
    const orderCounts = await Order.aggregate([
      { 
        $match: { 
          restaurantId: restaurantId,
          customerId: { $in: userIds }
        }
      },
      {
        $group: {
          _id: '$customerId',
          count: { $sum: 1 }
        }
      }
    ]);

    const orderCountMap = {};
    orderCounts.forEach(item => {
      orderCountMap[item._id.toString()] = item.count;
    });

    // Build subscriber cards
    const subscribers = [];
    for (const user of users) {
      const subscription = subscriptionMap[user._id.toString()];
      
      // Skip if status filter applied and no matching subscription
      if (status && !subscription) continue;
      
      // Skip if no subscription exists at all
      if (!subscription) continue;

      const totalOrdersCount = orderCountMap[user._id.toString()] || 0;
      subscribers.push(this._formatSubscriberCard(user, subscription, totalOrdersCount));
    }

    return {
      subscribers,
      pagination: {
        page,
        pageSize,
        totalItems: totalUsers,
        totalPages: Math.ceil(totalUsers / pageSize)
      }
    };
  }

  /**
   * Get subscriber details by ID
   * 
   * @param {string} subscriberId - User ID
   * @param {string} restaurantId - Admin's restaurant ID
   * @returns {Promise<Object>} Subscriber card details
   */
  async getSubscriberById(subscriberId, restaurantId) {
    // Find user (must be customer in this restaurant)
    const user = await User.findOne({
      _id: subscriberId,
      restaurantId,
      role: 'customer'
    });

    if (!user) {
      throw new Error('المشترك غير موجود');
    }

    // Find subscription
    const subscription = await Subscription.findOne({
      customerId: subscriberId,
      restaurantId
    });

    if (!subscription) {
      throw new Error('اشتراك المشترك غير موجود');
    }

    // Get total orders count
    const totalOrdersCount = await Order.countDocuments({
      customerId: subscriberId,
      restaurantId
    });

    return this._formatSubscriberCard(user, subscription, totalOrdersCount);
  }

  /**
   * Update subscriber and subscription details
   * 
   * @param {string} subscriberId - User ID
   * @param {Object} data - Update data
   * @param {string} restaurantId - Admin's restaurant ID
   * @returns {Promise<Object>} Updated subscriber card
   */
  async updateSubscriber(subscriberId, data, restaurantId) {
    const {
      fullName,
      phone,
      email,
      password,
      mealsPerDay,
      dailyProteinGram,
      dailyCarbsGram,
      includeSnack,
      startDate,
      endDate,
      status
    } = data;

    // Find user (must be customer in this restaurant)
    const user = await User.findOne({
      _id: subscriberId,
      restaurantId,
      role: 'customer'
    }).select('+passwordHash');

    if (!user) {
      throw new Error('المشترك غير موجود');
    }

    // Find subscription
    const subscription = await Subscription.findOne({
      customerId: subscriberId,
      restaurantId
    });

    if (!subscription) {
      throw new Error('اشتراك المشترك غير موجود');
    }

    // Normalize phone if provided
    let normalizedPhone;
    if (phone) {
      try {
        normalizedPhone = normalizePhone(phone);
      } catch (error) {
        throw new Error('صيغة رقم الجوال غير صحيحة');
      }
    }

    // Check if phone is being changed and if new phone already exists
    if (normalizedPhone && normalizedPhone !== user.phone) {
      const existingUser = await User.findOne({ phone: normalizedPhone });
      if (existingUser) {
        throw new Error('رقم الجوال مسجل بالفعل');
      }
    }

    // Validate dates if both provided
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (end < start) {
        throw new Error('تاريخ النهاية يجب أن يكون بعد أو يساوي تاريخ البداية');
      }
    }

    // Update user fields
    if (fullName) user.name = fullName;
    if (normalizedPhone) user.phone = normalizedPhone;
    if (email !== undefined) user.email = email || null;
    
    // Update password if provided
    if (password) {
      user.passwordHash = password; // Will be hashed by pre-save hook
    }

    await user.save();

    // Update subscription fields
    if (mealsPerDay !== undefined) subscription.plan.mealsPerDay = mealsPerDay;
    if (includeSnack !== undefined) subscription.plan.includesSnack = includeSnack;
    if (dailyProteinGram !== undefined) subscription.macros.proteinGrams = dailyProteinGram;
    if (dailyCarbsGram !== undefined) subscription.macros.carbsGrams = dailyCarbsGram;
    if (startDate) subscription.startDate = new Date(startDate);
    if (endDate) subscription.endDate = new Date(endDate);
    if (status) subscription.status = status;

    await subscription.save();

    // Get total orders count
    const totalOrdersCount = await Order.countDocuments({
      customerId: subscriberId,
      restaurantId
    });

    return this._formatSubscriberCard(user, subscription, totalOrdersCount);
  }

  /**
   * Delete (soft delete) subscriber
   * 
   * @param {string} subscriberId - User ID
   * @param {string} restaurantId - Admin's restaurant ID
   * @returns {Promise<void>}
   */
  async deleteSubscriber(subscriberId, restaurantId) {
    // Find user (must be customer in this restaurant)
    const user = await User.findOne({
      _id: subscriberId,
      restaurantId,
      role: 'customer'
    });

    if (!user) {
      throw new Error('المشترك غير موجود');
    }

    // Find subscription
    const subscription = await Subscription.findOne({
      customerId: subscriberId,
      restaurantId
    });

    if (subscription) {
      // Soft delete: set status to paused instead of actual deletion
      subscription.status = 'paused';
      await subscription.save();
    }

    // Option: Also soft delete the user or keep user but mark subscription as paused
    // For now, we just pause the subscription and keep the user for history
  }

  /**
   * Format subscriber data for card display
   * 
   * @private
   * @param {Object} user - User document
   * @param {Object} subscription - Subscription document
   * @param {number} totalOrdersCount - Total orders count
   * @returns {Object} Formatted subscriber card
   */
  _formatSubscriberCard(user, subscription, totalOrdersCount) {
    return {
      id: user._id.toString(),
      fullName: user.name,
      username: user.phone, // Using phone as username for MVP
      email: user.email,
      phone: user.phone,
      mealsPerDay: subscription.plan.mealsPerDay,
      dailyProteinGram: subscription.macros.proteinGrams,
      dailyCarbsGram: subscription.macros.carbsGrams,
      includeSnack: subscription.plan.includesSnack,
      startDate: subscription.startDate,
      endDate: subscription.endDate,
      status: subscription.status,
      totalOrdersCount,
      createdAt: user.createdAt,
      remainingDays: subscription.remainingDays,
      totalDays: subscription.totalDays
    };
  }
}

module.exports = new SubscriptionService();
