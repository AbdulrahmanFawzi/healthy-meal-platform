/**
 * ============================================
 * ROLE-BASED AUTHORIZATION MIDDLEWARE
 * ============================================
 * 
 * Educational Overview:
 * ---------------------
 * This middleware enforces role-based access control (RBAC).
 * It runs AFTER authMiddleware to check if the authenticated user
 * has the required role(s) to access a route.
 * 
 * Authorization vs Authentication:
 * --------------------------------
 * - Authentication: "Who are you?" (handled by authMiddleware)
 * - Authorization: "What can you do?" (handled by this middleware)
 * 
 * Middleware Chain Example:
 * -------------------------
 * router.post('/api/meals', 
 *   authMiddleware,              // Step 1: Verify identity
 *   requireRole('admin'),        // Step 2: Check permission
 *   createMeal                   // Step 3: Execute action
 * );
 * 
 * Role Hierarchy:
 * ---------------
 * super_admin: Platform owner (create restaurants, manage all)
 * admin: Restaurant owner/staff (manage own restaurant)
 * customer: Meal subscriber (browse, order, view own data)
 * 
 * Multi-Tenancy Note:
 * -------------------
 * This middleware only checks roles, NOT tenant isolation.
 * Tenant filtering is handled by:
 * 1. tenant.middleware.js (adds req.tenantFilter)
 * 2. Service layer (applies restaurantId filter to queries)
 */

/**
 * ============================================
 * REQUIRE ROLE MIDDLEWARE (Factory Function)
 * ============================================
 * 
 * Educational Purpose:
 * --------------------
 * A "factory function" that creates middleware based on allowed roles.
 * Returns a middleware function that checks req.user.role.
 * 
 * Factory Pattern Explained:
 * --------------------------
 * Instead of creating separate middleware for each role combination:
 * - requireAdminRole()
 * - requireCustomerRole()
 * - requireAdminOrCustomerRole()
 * 
 * We create ONE factory that generates middleware dynamically:
 * - requireRole('admin')
 * - requireRole('customer')
 * - requireRole(['admin', 'customer'])
 * 
 * How It Works:
 * -------------
 * 1. Call requireRole('admin')
 * 2. Returns a middleware function
 * 3. Middleware function checks if req.user.role === 'admin'
 * 4. If match: calls next()
 * 5. If no match: returns 403 Forbidden
 * 
 * Usage Examples:
 * ---------------
 * // Single role
 * router.post('/api/meals', authMiddleware, requireRole('admin'), createMeal);
 * 
 * // Multiple roles (any match allowed)
 * router.get('/api/meals', authMiddleware, requireRole(['admin', 'customer']), getMeals);
 * 
 * // Super admin only
 * router.post('/api/restaurants', authMiddleware, requireRole('super_admin'), createRestaurant);
 * 
 * Error Response:
 * ---------------
 * 403 Forbidden:
 * {
 *   "success": false,
 *   "error": {
 *     "code": "FORBIDDEN",
 *     "message": "ليس لديك صلاحية للوصول إلى هذا المورد"
 *   }
 * }
 * 
 * @param {string|string[]} allowedRoles - Single role or array of allowed roles
 * @returns {Function} - Express middleware function
 */
const requireRole = (allowedRoles) => {
  /**
   * Step 1: Normalize Input
   * -----------------------
   * Convert single role to array for consistent handling.
   * 
   * Input: 'admin' → Output: ['admin']
   * Input: ['admin', 'customer'] → Output: ['admin', 'customer']
   */
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  
  /**
   * Step 2: Return Middleware Function
   * -----------------------------------
   * This is the actual middleware that will run in the request chain.
   * It has access to `roles` variable via closure (lexical scope).
   */
  return (req, res, next) => {
    /**
     * Step 3: Check Authentication
     * -----------------------------
     * Verify that authMiddleware has run and set req.user.
     * If req.user is missing, user is not authenticated.
     * 
     * This should never happen if authMiddleware is properly chained,
     * but we check defensively for robustness.
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
     * Step 4: Check Role Authorization
     * ---------------------------------
     * Verify that user's role is in the allowed roles array.
     * 
     * Example:
     * - req.user.role = 'admin'
     * - roles = ['admin', 'customer']
     * - roles.includes('admin') → true → next()
     * 
     * Example 2:
     * - req.user.role = 'customer'
     * - roles = ['admin']
     * - roles.includes('customer') → false → 403 Forbidden
     */
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'ليس لديك صلاحية للوصول إلى هذا المورد',
          details: [
            {
              field: 'role',
              issue: `الأدوار المسموحة: ${roles.join(', ')}`
            }
          ]
        }
      });
    }
    
    /**
     * Step 5: Authorization Successful
     * ---------------------------------
     * User has required role, proceed to next middleware/controller.
     */
    next();
  };
};

/**
 * ============================================
 * CONVENIENCE MIDDLEWARE EXPORTS
 * ============================================
 * 
 * Educational Purpose:
 * --------------------
 * Pre-configured middleware for common role checks.
 * These are syntactic sugar for better code readability.
 * 
 * Instead of:
 * router.post('/meals', authMiddleware, requireRole('admin'), createMeal);
 * 
 * You can write:
 * router.post('/meals', authMiddleware, requireAdmin, createMeal);
 * 
 * Usage:
 * ------
 * const { requireAdmin, requireCustomer, requireAdminOrCustomer } = require('./middlewares/role.middleware');
 * 
 * router.post('/api/meals', authMiddleware, requireAdmin, createMeal);
 * router.get('/api/orders/my', authMiddleware, requireCustomer, getMyOrders);
 * router.get('/api/meals', authMiddleware, requireAdminOrCustomer, getMeals);
 */

// Admin only
const requireAdmin = requireRole('admin');

// Customer only
const requireCustomer = requireRole('customer');

// Super admin only (platform management)
const requireSuperAdmin = requireRole('super_admin');

// Admin or Customer (most common for restaurant-scoped resources)
const requireAdminOrCustomer = requireRole(['admin', 'customer']);

/**
 * Export Middleware
 * -----------------
 * Main factory:
 * - requireRole(roles): Flexible role checker
 * 
 * Convenience exports:
 * - requireAdmin: Admin only
 * - requireCustomer: Customer only
 * - requireSuperAdmin: Super admin only
 * - requireAdminOrCustomer: Admin or Customer
 */
module.exports = {
  requireRole,
  requireAdmin,
  requireCustomer,
  requireSuperAdmin,
  requireAdminOrCustomer
};
