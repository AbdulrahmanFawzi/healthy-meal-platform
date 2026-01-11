/**
 * Order Controller
 * 
 * HTTP handlers for order endpoints.
 */

const orderService = require('./order.service');

/**
 * POST /api/orders
 * Create new order (customer only)
 */
async function createOrder(req, res, next) {
  try {
    const { userId: customerId, restaurantId } = req.user;

    const order = await orderService.createOrder(customerId, restaurantId, req.body);

    res.status(201).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/orders/today
 * Get today's orders with filters (admin only)
 */
async function getTodayOrders(req, res, next) {
  try {
    const { restaurantId } = req.user;
    const filters = {
      status: req.query.status,
      q: req.query.q,
    };

    const orders = await orderService.getTodayOrders(restaurantId, filters);

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/orders/my
 * Get customer's own orders (customer only)
 */
async function getMyOrders(req, res, next) {
  try {
    const { userId: customerId, restaurantId } = req.user;

    const orders = await orderService.getMyOrders(customerId, restaurantId);

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/orders/current
 * Get customer's current active order (today's order)
 */
async function getCurrentOrder(req, res, next) {
  try {
    const { userId: customerId, restaurantId } = req.user;

    const order = await orderService.getCurrentOrder(customerId, restaurantId);

    res.status(200).json({
      success: true,
      data: order, // null if no order today
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/orders/history
 * Get customer's order history (all past orders)
 */
async function getOrderHistory(req, res, next) {
  try {
    const { userId: customerId, restaurantId } = req.user;

    const orders = await orderService.getOrderHistory(customerId, restaurantId);

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/orders/:id/status
 * Update order status (admin only)
 */
async function updateStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { restaurantId } = req.user;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        error: { message: 'الحالة مطلوبة' },
      });
    }

    const order = await orderService.updateOrderStatus(id, restaurantId, status);

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/orders/:id/notify
 * Send ready notification (admin only)
 */
async function notifyReady(req, res, next) {
  try {
    const { id } = req.params;
    const { restaurantId } = req.user;

    const result = await orderService.sendReadyNotification(id, restaurantId);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createOrder,
  getTodayOrders,
  getMyOrders,
  getCurrentOrder,
  getOrderHistory,
  updateStatus,
  notifyReady,
};
