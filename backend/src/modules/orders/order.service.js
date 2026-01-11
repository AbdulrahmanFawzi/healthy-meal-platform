/**
 * Order Service
 * 
 * Business logic for order management.
 * Enforces tenant isolation on all operations.
 */

const Order = require('../../models/order.model');
const User = require('../../models/user.model');
const Notification = require('../../models/notification.model');

/**
 * Create new order (customer)
 */
async function createOrder(customerId, restaurantId, orderData) {
  // Validate customer exists and belongs to restaurant
  const customer = await User.findOne({ _id: customerId, restaurantId, role: 'customer' });
  if (!customer) {
    throw new Error('عميل غير صالح');
  }

  // Generate order number
  const orderNumber = await Order.generateOrderNumber(restaurantId);

  // Get today's date (YYYY-MM-DD)
  const orderDate = new Date().toISOString().split('T')[0];

  // Create order
  const order = await Order.create({
    restaurantId,
    customerId,
    orderNumber,
    orderDate,
    status: 'received',
    selections: orderData.selections,
    snackMeal: orderData.snackMeal || null,
    totals: orderData.totals,
    macroTargets: orderData.macroTargets || {},
    notes: orderData.notes || '',
  });

  // Populate customer info for response
  await order.populate('customerId', 'name phone');

  return order;
}

/**
 * Get today's orders for admin (with search/filter)
 */
async function getTodayOrders(restaurantId, filters = {}) {
  const today = new Date().toISOString().split('T')[0];

  const query = {
    restaurantId,
    orderDate: today,
  };

  // Filter by status
  if (filters.status) {
    query.status = filters.status;
  }

  // Search by customer name or order number
  let orders = await Order.find(query)
    .populate('customerId', 'name phone')
    .sort({ createdAt: -1 })
    .lean();

  // Client-side search if query provided
  if (filters.q) {
    const searchLower = filters.q.toLowerCase();
    orders = orders.filter(order => {
      const customerName = order.customerId?.name?.toLowerCase() || '';
      const orderNumber = order.orderNumber.toLowerCase();
      return customerName.includes(searchLower) || orderNumber.includes(searchLower);
    });
  }

  return orders;
}

/**
 * Get customer's own orders
 */
async function getMyOrders(customerId, restaurantId) {
  const orders = await Order.find({ customerId, restaurantId })
    .sort({ createdAt: -1 })
    .limit(30) // Last 30 orders
    .lean();

  return orders;
}

/**
 * Update order status (admin only)
 */
async function updateOrderStatus(orderId, restaurantId, newStatus) {
  // Validate status
  const validStatuses = ['received', 'preparing', 'ready', 'completed'];
  if (!validStatuses.includes(newStatus)) {
    throw new Error('حالة غير صالحة');
  }

  // Update order with tenant isolation
  const order = await Order.findOneAndUpdate(
    { _id: orderId, restaurantId },
    { status: newStatus },
    { new: true }
  ).populate('customerId', 'name phone');

  if (!order) {
    throw new Error('طلب غير موجود');
  }

  return order;
}

/**
 * Send ready notification (admin only)
 */
async function sendReadyNotification(orderId, restaurantId) {
  // Find order with tenant isolation
  const order = await Order.findOne({ _id: orderId, restaurantId })
    .populate('customerId', 'name phone');

  if (!order) {
    throw new Error('طلب غير موجود');
  }

  // Check if already notified (prevent duplicate notifications)
  const existingNotification = await Notification.findOne({
    orderId,
    customerId: order.customerId._id,
    type: 'order_ready',
  });

  if (existingNotification) {
    return { alreadyNotified: true, notification: existingNotification };
  }

  // Create notification
  const notification = await Notification.create({
    restaurantId,
    customerId: order.customerId._id,
    orderId,
    type: 'order_ready',
    message: `طلبك ${order.orderNumber} جاهز للاستلام! 🎉`,
    isRead: false,
  });

  return { alreadyNotified: false, notification };
}

/**
 * Get current active order for customer (latest today's order)
 */
async function getCurrentOrder(customerId, restaurantId) {
  // Get today's date (YYYY-MM-DD)
  const today = new Date().toISOString().split('T')[0];

  // Find today's order for this customer
  const order = await Order.findOne({
    restaurantId,
    customerId,
    orderDate: today,
  })
    .sort({ createdAt: -1 }) // Latest first
    .populate('customerId', 'name phone');

  return order; // null if no order today
}

/**
 * Get order history for customer (all past orders)
 */
async function getOrderHistory(customerId, restaurantId) {
  // Find all orders for this customer, sorted by date (newest first)
  const orders = await Order.find({
    restaurantId,
    customerId,
  })
    .sort({ createdAt: -1 }) // Latest first
    .populate('customerId', 'name phone');

  return orders;
}

module.exports = {
  createOrder,
  getTodayOrders,
  getMyOrders,
  getCurrentOrder,
  getOrderHistory,
  updateOrderStatus,
  sendReadyNotification,
};
