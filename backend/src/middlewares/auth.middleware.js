/**
 * ============================================
 * AUTHENTICATION MIDDLEWARE
 * ============================================
 * 
 * Educational Overview:
 * ---------------------
 * This middleware protects routes that require authentication.
 * It runs BEFORE the route handler to verify the user's identity.
 * 
 * Middleware Chain Example:
 * -------------------------
 * app.get('/api/meals', authMiddleware, mealsController.getAll);
 *                       ↑ Runs first      ↑ Runs if auth passes
 * 
 * Flow:
 * -----
 * 1. Extract JWT from Authorization header
 * 2. Verify token using jwt.util.verifyToken()
 * 3. Decode payload to get userId, role, restaurantId
 * 4. Attach user context to req.user
 * 5. Call next() to proceed to route handler
 * 6. If any step fails, return 401 Unauthorized
 * 
 * Request Flow:
 * -------------
 * Client → [Authorization: Bearer eyJhbGc...] → authMiddleware → req.user = {...} → Controller
 * 
 * Multi-Tenancy:
 * --------------
 * By extracting restaurantId from JWT, every authenticated request
 * automatically has tenant context without additional database queries.
 */

const { verifyToken } = require('../utils/jwt.util');

/**
 * ============================================
 * AUTH MIDDLEWARE FUNCTION
 * ============================================
 * 
 * Educational Purpose:
 * --------------------
 * Express middleware that verifies JWT tokens and adds user context to request.
 * 
 * Usage in Routes:
 * ----------------
 * // Protect single route
 * router.get('/api/meals', authMiddleware, getMeals);
 * 
 * // Protect all routes in a router
 * router.use(authMiddleware);
 * router.get('/api/meals', getMeals);
 * router.post('/api/orders', createOrder);
 * 
 * Request Object Changes:
 * -----------------------
 * Before middleware:
 * - req.user = undefined
 * 
 * After middleware:
 * - req.user = {
 *     userId: "65a8b2c4e5f6ab3c4d123456",
 *     role: "admin",
 *     restaurantId: "65a8b2c4e5f6ab3c4d123457",
 *     iat: 1735689600,
 *     exp: 1736294400
 *   }
 * 
 * Error Responses:
 * ----------------
 * Missing token: 401 { error: { code: "NO_TOKEN", message: "..." } }
 * Invalid token: 401 { error: { code: "INVALID_TOKEN", message: "..." } }
 * Expired token: 401 { error: { code: "TOKEN_EXPIRED", message: "..." } }
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const authMiddleware = async (req, res, next) => {
  try {
    /**
     * Step 1: Extract Token from Authorization Header
     * ------------------------------------------------
     * Authorization header format: "Bearer <token>"
     * 
     * Example:
     * Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQi...
     * 
     * Process:
     * 1. Get Authorization header value
     * 2. Check if it starts with "Bearer "
     * 3. Extract token by removing "Bearer " prefix
     */
    const authHeader = req.headers.authorization;
    
    // Check if Authorization header exists
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'NO_TOKEN',
          message: 'يجب تسجيل الدخول للوصول إلى هذا المورد'
        }
      });
    }
    
    // Check if header starts with "Bearer "
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_AUTH_FORMAT',
          message: 'صيغة رأس التفويض غير صالحة. استخدم: Bearer <token>'
        }
      });
    }
    
    // Extract token (remove "Bearer " prefix)
    const token = authHeader.substring(7); // "Bearer ".length === 7
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'NO_TOKEN',
          message: 'الرمز المميز مفقود'
        }
      });
    }
    
    /**
     * Step 2: Verify Token
     * --------------------
     * Call verifyToken() from jwt.util.js to:
     * - Validate signature
     * - Check expiration
     * - Decode payload
     * 
     * If verification fails, verifyToken() throws an error
     * which is caught by the catch block below.
     */
    const decoded = verifyToken(token);
    
    /**
     * Step 3: Attach User Context to Request
     * ---------------------------------------
     * Add user information to req.user so downstream
     * middleware and controllers can access it.
     * 
     * This enables tenant-aware queries like:
     * - Meal.find({ restaurantId: req.user.restaurantId })
     * - Order.find({ customerId: req.user.userId })
     */
    req.user = {
      userId: decoded.userId,
      role: decoded.role,
      restaurantId: decoded.restaurantId
    };
    
    /**
     * Step 4: Proceed to Next Middleware
     * -----------------------------------
     * Call next() to pass control to the next middleware or route handler.
     * The request now has req.user populated with authenticated user data.
     */
    next();
    
  } catch (error) {
    /**
     * Error Handling
     * --------------
     * If verifyToken() throws an error (invalid/expired token),
     * or any other error occurs, return 401 Unauthorized.
     * 
     * Common scenarios:
     * - Token signature doesn't match (tampered)
     * - Token expired (past exp timestamp)
     * - Token malformed (not valid JWT structure)
     */
    
    // Check if error already has statusCode (from jwt.util.js)
    const statusCode = error.statusCode || 401;
    const errorCode = error.code || 'AUTH_ERROR';
    const errorMessage = error.message || 'فشل التحقق من الهوية';
    
    return res.status(statusCode).json({
      success: false,
      error: {
        code: errorCode,
        message: errorMessage
      }
    });
  }
};

/**
 * ============================================
 * OPTIONAL AUTH MIDDLEWARE
 * ============================================
 * 
 * Educational Purpose:
 * --------------------
 * Similar to authMiddleware but doesn't require authentication.
 * If token is present and valid, sets req.user.
 * If token is missing or invalid, continues without req.user.
 * 
 * Use Case:
 * ---------
 * Routes that behave differently for authenticated vs anonymous users.
 * Example: Public meal listing shows prices, authenticated users see personalized data.
 * 
 * Usage:
 * ------
 * router.get('/api/meals', optionalAuthMiddleware, getMeals);
 * 
 * In controller:
 * if (req.user) {
 *   // User is authenticated
 * } else {
 *   // User is anonymous
 * }
 */
const optionalAuthMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    // If no auth header, just continue without req.user
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }
    
    const token = authHeader.substring(7);
    
    if (!token) {
      return next();
    }
    
    // Try to verify token
    const decoded = verifyToken(token);
    
    // If successful, attach user context
    req.user = {
      userId: decoded.userId,
      role: decoded.role,
      restaurantId: decoded.restaurantId
    };
    
    next();
    
  } catch (error) {
    // If token is invalid, just continue without req.user
    // Don't return error (unlike authMiddleware)
    next();
  }
};

/**
 * Export Middleware
 * -----------------
 * authMiddleware: Required authentication (401 if missing/invalid)
 * optionalAuthMiddleware: Optional authentication (continues even if missing)
 */
module.exports = {
  authMiddleware,
  optionalAuthMiddleware
};
