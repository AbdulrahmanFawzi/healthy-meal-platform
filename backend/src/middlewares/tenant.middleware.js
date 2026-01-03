/**
 * ============================================
 * TENANT ISOLATION MIDDLEWARE
 * ============================================
 * 
 * Educational Overview:
 * ---------------------
 * This middleware enforces multi-tenant data isolation.
 * It adds a tenant filter to the request object that controllers
 * use to scope all database queries to the user's restaurant.
 * 
 * Multi-Tenancy Architecture:
 * ---------------------------
 * In a multi-tenant SaaS application, multiple customers (tenants)
 * share the same database, but their data must be completely isolated.
 * 
 * Example Scenario:
 * -----------------
 * Restaurant A (ID: 65a8b2c4e5f6ab3c4d123456)
 * - Admin: Ahmed
 * - Customers: Fatima, Omar
 * - Meals: Grilled Chicken, Brown Rice, Apple
 * 
 * Restaurant B (ID: 65a8b2c4e5f6ab3c4d123457)
 * - Admin: Sara
 * - Customers: Ali, Layla
 * - Meals: Beef Kabsa, Salad, Orange
 * 
 * When Ahmed (Restaurant A admin) queries meals:
 * - WITHOUT tenant filter: Returns ALL 6 meals (security breach!)
 * - WITH tenant filter: Returns only 3 meals (secure)
 * 
 * The Problem This Solves:
 * ------------------------
 * Without this middleware, developers might forget to add restaurantId
 * filter in controllers, causing data leakage between tenants.
 * 
 * This middleware makes tenant isolation automatic and fail-safe.
 * 
 * Middleware Chain:
 * -----------------
 * authMiddleware → tenantMiddleware → Controller
 *      ↓                  ↓                ↓
 * req.user = {...}  req.tenantFilter  Meal.find(req.tenantFilter)
 */

/**
 * ============================================
 * TENANT MIDDLEWARE FUNCTION
 * ============================================
 * 
 * Educational Purpose:
 * --------------------
 * Adds req.tenantFilter object that controllers use to scope queries.
 * 
 * Usage in Routes:
 * ----------------
 * // Apply to specific routes
 * router.get('/api/meals', authMiddleware, tenantMiddleware, getMeals);
 * 
 * // Apply to all routes in router
 * router.use(authMiddleware);
 * router.use(tenantMiddleware);
 * router.get('/api/meals', getMeals);
 * router.post('/api/orders', createOrder);
 * 
 * Usage in Controllers:
 * ---------------------
 * // Before (UNSAFE - returns all restaurants' meals)
 * const meals = await Meal.find({});
 * 
 * // After (SAFE - returns only current restaurant's meals)
 * const meals = await Meal.find(req.tenantFilter);
 * 
 * // With additional filters
 * const activeMeals = await Meal.find({
 *   ...req.tenantFilter,
 *   isActive: true,
 *   category: 'protein'
 * });
 * 
 * Request Object Changes:
 * -----------------------
 * Before middleware:
 * - req.user = { userId: "...", role: "admin", restaurantId: "65a8..." }
 * - req.tenantFilter = undefined
 * 
 * After middleware:
 * - req.tenantFilter = { restaurantId: "65a8..." }
 * 
 * Special Cases:
 * --------------
 * 1. super_admin: NO tenant filter (can access all restaurants)
 * 2. admin/customer: Tenant filter = their restaurantId
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const tenantMiddleware = (req, res, next) => {
  /**
   * Step 1: Verify Authentication
   * ------------------------------
   * Check that authMiddleware has run and set req.user.
   * This middleware MUST run after authMiddleware.
   * 
   * If req.user is missing, user is not authenticated.
   * This should not happen if middleware chain is correct,
   * but we check defensively.
   */
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'يجب تسجيل الدخول أولاً'
      }
    });
  }
  
  /**
   * Step 2: Handle super_admin (No Tenant Filter)
   * ----------------------------------------------
   * Super admin has platform-level access and should NOT
   * be restricted to a single restaurant.
   * 
   * Use Cases:
   * - View all restaurants
   * - Platform analytics
   * - Create new restaurants
   * 
   * For super_admin, we set req.tenantFilter to empty object
   * so queries work without filtering.
   */
  if (req.user.role === 'super_admin') {
    req.tenantFilter = {}; // No filtering
    return next();
  }
  
  /**
   * Step 3: Verify restaurantId Exists
   * -----------------------------------
   * For admin and customer roles, restaurantId MUST be present
   * in the JWT payload (set during login).
   * 
   * If missing, something went wrong during authentication.
   * This is a defensive check that should never trigger.
   */
  if (!req.user.restaurantId) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'TENANT_ID_MISSING',
        message: 'معرف المطعم مفقود في سياق المستخدم'
      }
    });
  }
  
  /**
   * Step 4: Set Tenant Filter
   * --------------------------
   * Create tenant filter object with user's restaurantId.
   * Controllers will spread this into their queries.
   * 
   * MongoDB Query Example:
   * ----------------------
   * req.tenantFilter = { restaurantId: "65a8b2c4e5f6ab3c4d123456" }
   * 
   * Controller:
   * const meals = await Meal.find({
   *   ...req.tenantFilter,      // restaurantId: "65a8..."
   *   category: 'protein'        // Additional filter
   * });
   * 
   * Resulting MongoDB query:
   * {
   *   restaurantId: ObjectId("65a8b2c4e5f6ab3c4d123456"),
   *   category: "protein"
   * }
   */
  req.tenantFilter = {
    restaurantId: req.user.restaurantId
  };
  
  /**
   * Step 5: Proceed to Controller
   * ------------------------------
   * Tenant filter is set, controller can now execute tenant-aware queries.
   */
  next();
};

/**
 * ============================================
 * REQUIRE TENANT MIDDLEWARE (Strict Validation)
 * ============================================
 * 
 * Educational Purpose:
 * --------------------
 * Stricter version that REQUIRES restaurantId even for super_admin.
 * Used for routes that must operate within a restaurant context.
 * 
 * Use Case:
 * ---------
 * Super admin managing a specific restaurant's data (not platform-level).
 * Example: Super admin helping Restaurant A troubleshoot an order issue.
 * 
 * Usage:
 * ------
 * // Requires restaurantId in query/params
 * router.get('/api/admin/restaurant/:restaurantId/meals', 
 *   authMiddleware, 
 *   requireTenantMiddleware,
 *   getMeals
 * );
 * 
 * In this case, even super_admin must specify which restaurant.
 * The middleware sets req.tenantFilter based on route param.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const requireTenantMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'يجب تسجيل الدخول أولاً'
      }
    });
  }
  
  /**
   * For super_admin, try to get restaurantId from:
   * 1. Route params: /api/admin/restaurant/:restaurantId/meals
   * 2. Query params: /api/meals?restaurantId=65a8...
   * 3. Request body: { restaurantId: "65a8..." }
   */
  let restaurantId;
  
  if (req.user.role === 'super_admin') {
    restaurantId = req.params.restaurantId || req.query.restaurantId || req.body.restaurantId;
    
    if (!restaurantId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'RESTAURANT_ID_REQUIRED',
          message: 'معرف المطعم مطلوب لهذا الإجراء'
        }
      });
    }
  } else {
    // For admin/customer, use their JWT restaurantId
    restaurantId = req.user.restaurantId;
    
    if (!restaurantId) {
      return res.status(500).json({
        success: false,
        error: {
          code: 'TENANT_ID_MISSING',
          message: 'معرف المطعم مفقود في سياق المستخدم'
        }
      });
    }
  }
  
  req.tenantFilter = { restaurantId };
  next();
};

/**
 * Export Middleware
 * -----------------
 * tenantMiddleware: Standard tenant filtering (excludes super_admin)
 * requireTenantMiddleware: Strict filtering (requires restaurantId for all)
 */
module.exports = {
  tenantMiddleware,
  requireTenantMiddleware
};
