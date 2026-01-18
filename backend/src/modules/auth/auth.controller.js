/**
 * ============================================
 * AUTHENTICATION CONTROLLER
 * ============================================
 * 
 * Educational Overview:
 * ---------------------
 * Controllers handle HTTP requests and responses.
 * They validate input, call service layer, and format responses.
 * 
 * Responsibility Separation:
 * --------------------------
 * Controller:
 * - Parse HTTP request
 * - Validate request format
 * - Call service functions
 * - Format HTTP response
 * - Handle HTTP status codes
 * 
 * Service:
 * - Business logic
 * - Database operations
 * - Data validation
 * - Error generation
 * 
 * Request Flow:
 * -------------
 * HTTP POST /api/auth/login
 *     ↓
 * Route → Controller.login()  ← WE ARE HERE
 *     ↓
 * Service.login()
 *     ↓
 * User Model / Restaurant Model
 *     ↓
 * MongoDB
 *     ↓
 * Response flows back up the chain
 * 
 * Response Format Standard:
 * -------------------------
 * Success: { success: true, data: {...} }
 * Error: { success: false, error: { code, message, details } }
 */

const authService = require('./auth.service');

/**
 * ============================================
 * LOGIN CONTROLLER
 * ============================================
 * 
 * Educational Purpose:
 * --------------------
 * Handles POST /api/auth/login endpoint.
 * Authenticates user and returns JWT token.
 * 
 * HTTP Request:
 * -------------
 * POST /api/auth/login
 * Content-Type: application/json
 * 
 * Body:
 * {
 *   "phone": "+966500000001",
 *   "password": "MyPassword123"
 * }
 * 
 * HTTP Response (Success):
 * ------------------------
 * 200 OK
 * {
 *   "success": true,
 *   "data": {
 *     "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
 *     "user": {
 *       "id": "65a8b2c4e5f6ab3c4d123456",
 *       "name": "أحمد محمد",
 *       "phone": "+966500000001",
 *       "role": "admin",
 *       "restaurantId": "65a8b2c4e5f6ab3c4d123457"
 *     },
 *     "restaurant": {
 *       "id": "65a8b2c4e5f6ab3c4d123457",
 *       "name": "مطعم الصحة",
 *       "logoUrl": "https://res.cloudinary.com/..."
 *     }
 *   }
 * }
 * 
 * HTTP Response (Error):
 * ----------------------
 * 401 Unauthorized
 * {
 *   "success": false,
 *   "error": {
 *     "code": "INVALID_CREDENTIALS",
 *     "message": "رقم الجوال أو كلمة المرور غير صحيحة"
 *   }
 * }
 * 
 * Status Codes:
 * -------------
 * 200: Login successful
 * 400: Validation error (missing fields)
 * 401: Invalid credentials
 * 500: Server error
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const login = async (req, res) => {
  try {
    /**
     * Step 1: Extract Request Data
     * -----------------------------
     * Get phone and password from request body.
     * Express body-parser middleware has already parsed JSON.
     */
    const { phone, password } = req.body;
    
    /**
     * Step 2: Call Service Layer
     * ---------------------------
     * Pass data to service for business logic and database operations.
     * Service returns authentication package or throws error.
     */
    const result = await authService.login({ phone, password });
    
    /**
     * Step 3: Send Success Response
     * ------------------------------
     * Return standardized success response with JWT and user data.
     * Frontend will:
     * 1. Store accessToken in localStorage
     * 2. Store user and restaurant for display
     * 3. Redirect based on role (admin → /admin, customer → /customer)
     */
    return res.status(200).json({
      success: true,
      data: result
    });
    
  } catch (error) {
    /**
     * Step 4: Handle Errors
     * ----------------------
     * Service throws errors with code and statusCode.
     * We catch them and format into standardized error response.
     * 
     * Error Flow:
     * 1. Service detects problem (invalid password)
     * 2. Service throws error with code and statusCode
     * 3. Controller catches error
     * 4. Controller formats into { success: false, error: {...} }
     * 5. Frontend displays error message to user
     */
    
    // Use error status code or default to 500
    const statusCode = error.statusCode || 500;
    
    // Use error code or default to SERVER_ERROR
    const errorCode = error.code || 'SERVER_ERROR';
    
    // Use error message or default generic message
    const errorMessage = error.message || 'حدث خطأ في الخادم';
    
    /**
     * Log Error for Debugging
     * -----------------------
     * In development, log full error for debugging.
     * In production, use proper logging service (Winston, Sentry, etc.)
     */
    if (process.env.NODE_ENV === 'development') {
      console.error('Login error:', error);
    }
    
    /**
     * Send Error Response
     * -------------------
     * Return standardized error response.
     * Don't expose internal error details (stack traces) to client.
     */
    return res.status(statusCode).json({
      success: false,
      error: {
        code: errorCode,
        message: errorMessage,
        // Include details if provided by service (e.g., validation errors)
        ...(error.details && { details: error.details })
      }
    });
  }
};

/**
 * ============================================
 * GET CURRENT USER CONTROLLER
 * ============================================
 * 
 * Educational Purpose:
 * --------------------
 * Returns current user's profile and restaurant data.
 * Used after login to load/refresh user context.
 * 
 * Security:
 * ---------
 * userId is extracted from verified JWT by authMiddleware.
 * User can only access their own profile.
 * 
 * @param {Object} req - Express request (with req.user from JWT)
 * @param {Object} res - Express response
 */
const getCurrentUser = async (req, res) => {
  try {
    const result = await authService.getCurrentUser(req.user.userId);
    
    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    const errorCode = error.code || 'SERVER_ERROR';
    const errorMessage = error.message || 'حدث خطأ في الخادم';
    
    if (process.env.NODE_ENV === 'development') {
      console.error('Get current user error:', error);
    }
    
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
 * LOGOUT CONTROLLER
 * ============================================
 * 
 * Educational Purpose:
 * --------------------
 * Handles POST /api/auth/logout endpoint.
 * 
 * JWT Logout Pattern:
 * -------------------
 * JWTs are stateless - server doesn't track active sessions.
 * Therefore, "logout" is primarily a client-side operation:
 * 1. Client removes token from localStorage
 * 2. Client removes user/restaurant data
 * 3. Client redirects to login page
 * 
 * Server Endpoint Purpose:
 * ------------------------
 * While not strictly necessary for JWT, having a logout endpoint:
 * - Provides consistent API design
 * - Allows future enhancements (token blacklist, analytics)
 * - Enables server-side logout tracking
 * 
 * Future Enhancement:
 * -------------------
 * Implement token blacklist using Redis:
 * 1. Store token ID in Redis with TTL = token expiration
 * 2. authMiddleware checks Redis before accepting token
 * 3. Logout adds token to blacklist
 * 
 * For MVP, we return success immediately.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const logout = async (req, res) => {
  try {
    /**
     * Current Implementation:
     * -----------------------
     * Simply acknowledge logout request.
     * Client is responsible for removing token.
     * 
     * Future: Add token to blacklist here
     */
    return res.status(200).json({
      success: true,
      data: {
        message: 'تم تسجيل الخروج بنجاح'
      }
    });
    
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'حدث خطأ أثناء تسجيل الخروج'
      }
    });
  }
};

/**
 * Export Controller Functions
 * ----------------------------
 * These are used by route definitions.
 * 
 * Usage in Routes:
 * const authController = require('./auth.controller');
 * router.post('/login', authController.login);
 */
module.exports = {
  login,
  getCurrentUser,
  logout
};
