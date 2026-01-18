const subscriptionService = require('./subscription.service');

/**
 * ============================================
 * SUBSCRIPTION CONTROLLER
 * ============================================
 * HTTP handlers for subscription management endpoints.
 * All operations are admin-only and tenant-isolated.
 */

/**
 * Create a new subscriber (customer + subscription)
 * POST /api/admin/subscribers
 * 
 * @route POST /api/admin/subscribers
 * @access Admin only
 */
exports.createSubscriber = async (req, res, next) => {
  try {
    const restaurantId = req.user.restaurantId;
    
    // Validate required fields
    const {
      fullName,
      phone,
      password,
      mealsPerDay,
      dailyProteinGram,
      dailyCarbsGram,
      startDate,
      endDate
    } = req.body;

    if (!fullName || !phone || !password || !mealsPerDay || 
        !dailyProteinGram || !dailyCarbsGram || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'جميع الحقول المطلوبة يجب أن تكون موجودة',
          details: []
        }
      });
    }

    // Validate mealsPerDay range
    if (mealsPerDay < 1 || mealsPerDay > 5) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'عدد الوجبات اليومية يجب أن يكون بين 1 و 5',
          details: []
        }
      });
    }

    // Validate macros
    if (dailyProteinGram <= 0 || dailyCarbsGram <= 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'البروتين والكربوهيدرات يجب أن تكون أكبر من صفر',
          details: []
        }
      });
    }

    const subscriber = await subscriptionService.createSubscriber(req.body, restaurantId);

    res.status(201).json({
      success: true,
      data: subscriber
    });
  } catch (error) {
    if (error.message.includes('رقم الجوال مسجل بالفعل') || 
        error.message.includes('phone')) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'PHONE_EXISTS',
          message: 'رقم الجوال مسجل بالفعل',
          details: []
        }
      });
    }

    if (error.message.includes('تاريخ')) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: error.message,
          details: []
        }
      });
    }

    next(error);
  }
};

/**
 * Get paginated list of subscribers
 * GET /api/admin/subscribers?search=&status=&page=&pageSize=
 * 
 * @route GET /api/admin/subscribers
 * @access Admin only
 */
exports.getSubscribers = async (req, res, next) => {
  try {
    const restaurantId = req.user.restaurantId;
    const filters = {
      search: req.query.search || '',
      status: req.query.status || '',
      page: parseInt(req.query.page) || 1,
      pageSize: parseInt(req.query.pageSize) || 10
    };

    const result = await subscriptionService.getSubscribers(restaurantId, filters);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get subscriber by ID
 * GET /api/admin/subscribers/:id
 * 
 * @route GET /api/admin/subscribers/:id
 * @access Admin only
 */
exports.getSubscriberById = async (req, res, next) => {
  try {
    const restaurantId = req.user.restaurantId;
    const subscriberId = req.params.id;

    const subscriber = await subscriptionService.getSubscriberById(subscriberId, restaurantId);

    res.json({
      success: true,
      data: subscriber
    });
  } catch (error) {
    if (error.message.includes('غير موجود')) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: error.message,
          details: []
        }
      });
    }

    next(error);
  }
};

/**
 * Update subscriber
 * PUT /api/admin/subscribers/:id
 * 
 * @route PUT /api/admin/subscribers/:id
 * @access Admin only
 */
exports.updateSubscriber = async (req, res, next) => {
  try {
    const restaurantId = req.user.restaurantId;
    const subscriberId = req.params.id;

    // Validate mealsPerDay if provided
    if (req.body.mealsPerDay !== undefined) {
      if (req.body.mealsPerDay < 1 || req.body.mealsPerDay > 5) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'عدد الوجبات اليومية يجب أن يكون بين 1 و 5',
            details: []
          }
        });
      }
    }

    // Validate macros if provided
    if (req.body.dailyProteinGram !== undefined && req.body.dailyProteinGram <= 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'البروتين يجب أن يكون أكبر من صفر',
          details: []
        }
      });
    }

    if (req.body.dailyCarbsGram !== undefined && req.body.dailyCarbsGram <= 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'الكربوهيدرات يجب أن تكون أكبر من صفر',
          details: []
        }
      });
    }

    const subscriber = await subscriptionService.updateSubscriber(
      subscriberId, 
      req.body, 
      restaurantId
    );

    res.json({
      success: true,
      data: subscriber
    });
  } catch (error) {
    if (error.message.includes('غير موجود')) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: error.message,
          details: []
        }
      });
    }

    if (error.message.includes('رقم الجوال مسجل بالفعل')) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'PHONE_EXISTS',
          message: 'رقم الجوال مسجل بالفعل',
          details: []
        }
      });
    }

    if (error.message.includes('تاريخ')) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: error.message,
          details: []
        }
      });
    }

    next(error);
  }
};

/**
 * Delete subscriber (soft delete)
 * DELETE /api/admin/subscribers/:id
 * 
 * @route DELETE /api/admin/subscribers/:id
 * @access Admin only
 */
exports.deleteSubscriber = async (req, res, next) => {
  try {
    const restaurantId = req.user.restaurantId;
    const subscriberId = req.params.id;

    await subscriptionService.deleteSubscriber(subscriberId, restaurantId);

    res.json({
      success: true,
      data: {
        message: 'تم إيقاف اشتراك المشترك بنجاح'
      }
    });
  } catch (error) {
    if (error.message.includes('غير موجود')) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: error.message,
          details: []
        }
      });
    }

    next(error);
  }
};
