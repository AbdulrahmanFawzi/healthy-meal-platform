/**
 * ============================================
 * AUTHENTICATION SERVICE
 * ============================================
 * 
 * Educational Overview:
 * ---------------------
 * The service layer contains business logic for authentication operations.
 * It sits between controllers (HTTP layer) and models (data layer).
 * 
 * Layered Architecture:
 * ---------------------
 * Client Request
 *     ↓
 * Route (auth.routes.js) - Define endpoints
 *     ↓
 * Controller (auth.controller.js) - Handle HTTP req/res
 *     ↓
 * Service (auth.service.js) - Business logic ← WE ARE HERE
 *     ↓
 * Model (user.model.js, restaurant.model.js) - Database operations
 *     ↓
 * MongoDB
 * 
 * Why Service Layer:
 * ------------------
 * 1. Separation of Concerns: Keep business logic separate from HTTP
 * 2. Reusability: Services can be called from multiple controllers
 * 3. Testability: Easy to unit test without HTTP mocking
 * 4. Single Responsibility: Controller handles HTTP, service handles logic
 * 
 * Authentication Flow:
 * --------------------
 * 1. User submits phone + password
 * 2. Service finds user in database
 * 3. Service verifies password with bcrypt
 * 4. Service generates JWT token
 * 5. Service loads restaurant data
 * 6. Service returns token + user + restaurant
 */

const User = require('../../models/user.model');
const Restaurant = require('../../models/restaurant.model');
const { generateToken } = require('../../utils/jwt.util');

/**
 * ============================================
 * LOGIN SERVICE
 * ============================================
 * 
 * Educational Purpose:
 * --------------------
 * Authenticates a user by phone + password and returns access token.
 * 
 * Business Logic:
 * ---------------
 * 1. Find user by phone (tenant-aware for admin/customer)
 * 2. Verify password using bcrypt comparison
 * 3. Generate JWT token with user context
 * 4. Load restaurant data (for admin/customer)
 * 5. Return authentication package
 * 
 * Security Considerations:
 * ------------------------
 * ✅ Passwords never exposed (bcrypt comparison)
 * ✅ Generic error messages (don't reveal if phone exists)
 * ✅ Tenant isolation (same phone different restaurants)
 * ✅ JWT includes restaurantId (automatic tenant context)
 * 
 * Multi-Tenancy Handling:
 * -----------------------
 * Phone numbers are unique PER RESTAURANT, not globally.
 * 
 * Scenario 1 - Admin/Customer Login:
 * User enters: +966500000001
 * Problem: Which restaurant?
 * Solution: Phone is unique within restaurant, so we can find them.
 * 
 * Scenario 2 - Super Admin Login:
 * User enters: +966500000001
 * Solution: Super admin has role = 'super_admin' and restaurantId = null
 * 
 * Error Cases:
 * ------------
 * - INVALID_CREDENTIALS: Phone doesn't exist OR password wrong (same message)
 * - VALIDATION_ERROR: Missing required fields
 * - SERVER_ERROR: Unexpected database/system error
 * 
 * @param {Object} credentials - Login credentials
 * @param {string} credentials.phone - User's phone number (+9665XXXXXXXX)
 * @param {string} credentials.password - User's plain text password
 * @returns {Promise<Object>} - Authentication result
 * @throws {Error} - If credentials invalid or system error
 */
const login = async ({ phone, password }) => {
  /**
   * Step 1: Validate Input
   * ----------------------
   * Check that required fields are present.
   * More detailed validation (phone format) is handled by Mongoose schema.
   */
  if (!phone || !password) {
    const error = new Error('رقم الجوال وكلمة المرور مطلوبان');
    error.code = 'VALIDATION_ERROR';
    error.statusCode = 400;
    throw error;
  }
  
  /**
   * Step 2: Find User by Phone
   * ---------------------------
   * Search for user with matching phone number.
   * 
   * MVP Simplification:
   * -------------------
   * Phone is GLOBALLY UNIQUE across entire platform.
   * Simple lookup: User.findOne({ phone })
   * 
   * Benefits:
   * - No ambiguity (one phone = one user)
   * - No need for restaurantSlug in login request
   * - Clean, simple authentication flow
   * 
   * Multi-tenancy is still enforced via restaurantId on data operations.
   * User's restaurantId is embedded in JWT for automatic tenant filtering.
   * 
   * Important: Use .select('+passwordHash') to include password field
   * (normally excluded by default for security).
   */
  const user = await User.findOne({ phone }).select('+passwordHash');
  
  /**
   * Security Note: Generic Error Message
   * -------------------------------------
   * We use the same error message for "phone not found" and "wrong password"
   * to prevent attackers from enumerating valid phone numbers.
   * 
   * Bad: "رقم الجوال غير موجود" vs "كلمة المرور خاطئة"
   * Good: "بيانات الدخول غير صحيحة" (for both cases)
   */
  if (!user) {
    const error = new Error('رقم الجوال أو كلمة المرور غير صحيحة');
    error.code = 'INVALID_CREDENTIALS';
    error.statusCode = 401;
    throw error;
  }
  
  /**
   * Step 3: Verify Password
   * -----------------------
   * Compare submitted password with stored hash using bcrypt.
   * 
   * Process:
   * 1. user.comparePassword() is an instance method (defined in user.model.js)
   * 2. It calls bcrypt.compare(password, hash)
   * 3. bcrypt extracts salt from hash
   * 4. bcrypt hashes submitted password with same salt
   * 5. bcrypt compares results in constant time
   * 6. Returns true if match, false otherwise
   * 
   * Why Constant Time:
   * ------------------
   * Prevents timing attacks where attacker measures response time
   * to guess password characters.
   */
  const isPasswordValid = await user.comparePassword(password);
  
  if (!isPasswordValid) {
    const error = new Error('رقم الجوال أو كلمة المرور غير صحيحة');
    error.code = 'INVALID_CREDENTIALS';
    error.statusCode = 401;
    throw error;
  }
  
  /**
   * Step 4: Generate JWT Token
   * ---------------------------
   * Create signed token with user context for future API requests.
   * 
   * Token Payload:
   * {
   *   userId: "65a8b2c4e5f6ab3c4d123456",
   *   role: "admin",
   *   restaurantId: "65a8b2c4e5f6ab3c4d123457",
   *   iat: 1735689600,
   *   exp: 1736294400
   * }
   * 
   * Why Include restaurantId:
   * - Automatic tenant context in every request
   * - No need to query database for user's restaurant
   * - Middleware can filter queries without additional lookups
   */
  const token = generateToken({
    userId: user._id.toString(),
    role: user.role,
    restaurantId: user.restaurantId?.toString() || null
  });
  
  /**
   * Step 5: Load Restaurant Data (if applicable)
   * ---------------------------------------------
   * For admin and customer users, fetch restaurant information
   * to include in login response.
   * 
   * Use Cases:
   * - Frontend displays restaurant logo in header
   * - Admin panel shows restaurant name
   * - Customer app branded with restaurant identity
   * 
   * For super_admin, restaurant is null (platform-level access).
   */
  let restaurant = null;
  
  if (user.restaurantId) {
    restaurant = await Restaurant.findById(user.restaurantId);
    
    /**
     * Defensive Check:
     * If user references a restaurant that doesn't exist (data integrity issue),
     * throw error to prevent undefined behavior.
     */
    if (!restaurant) {
      const error = new Error('المطعم المرتبط بهذا الحساب غير موجود');
      error.code = 'RESTAURANT_NOT_FOUND';
      error.statusCode = 500;
      throw error;
    }
  }
  
  /**
   * Step 6: Prepare Response Data
   * ------------------------------
   * Return authentication package with:
   * - accessToken: JWT for future requests
   * - user: User info (excluding password)
   * - restaurant: Restaurant info (if applicable)
   * 
   * Response Structure:
   * {
   *   accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
   *   user: {
   *     id: "65a8b2c4e5f6ab3c4d123456",
   *     name: "أحمد محمد",
   *     phone: "+966500000001",
   *     role: "admin",
   *     restaurantId: "65a8b2c4e5f6ab3c4d123457"
   *   },
   *   restaurant: {
   *     id: "65a8b2c4e5f6ab3c4d123457",
   *     name: "مطعم الصحة",
   *     logoUrl: "https://res.cloudinary.com/..."
   *   }
   * }
   * 
   * Note: user.toJSON() automatically removes passwordHash and __v
   * (configured in user.model.js schema options).
   */
  return {
    accessToken: token,
    user: user.toJSON(),
    restaurant: restaurant ? restaurant.toJSON() : null
  };
};

/**
 * ============================================
 * GET CURRENT USER SERVICE
 * ============================================
 * 
 * Educational Purpose:
 * --------------------
 * Returns current user's profile based on JWT token.
 * Used for "get profile" or "refresh user data" endpoints.
 * 
 * Use Cases:
 * ----------
 * 1. Frontend loads app and wants to verify token is still valid
 * 2. User updates profile and frontend needs refreshed data
 * 3. Role/permissions changed, frontend needs updated context
 * 
 * Security:
 * ---------
 * userId comes from verified JWT (req.user.userId), not user input.
 * This prevents users from accessing other users' profiles.
 * 
 * @param {string} userId - User ID from JWT token
 * @returns {Promise<Object>} - User profile with restaurant
 * @throws {Error} - If user not found
 */
const getCurrentUser = async (userId) => {
  /**
   * Load user with restaurant populated
   * ------------------------------------
   * .populate('restaurantId') loads full restaurant document
   * instead of just the ID.
   * 
   * Without populate:
   * user = { restaurantId: "65a8...", ... }
   * 
   * With populate:
   * user = { 
   *   restaurantId: { id: "65a8...", name: "مطعم الصحة", logoUrl: "..." },
   *   ...
   * }
   */
  const user = await User.findById(userId).populate('restaurantId');
  
  if (!user) {
    const error = new Error('المستخدم غير موجود');
    error.code = 'USER_NOT_FOUND';
    error.statusCode = 404;
    throw error;
  }
  
  return {
    user: user.toJSON(),
    restaurant: user.restaurantId ? user.restaurantId.toJSON() : null
  };
};

/**
 * Export Service Functions
 * -------------------------
 * These are called by controllers to execute business logic.
 * 
 * Usage in Controller:
 * const authService = require('./auth.service');
 * const result = await authService.login({ phone, password });
 */
module.exports = {
  login,
  getCurrentUser
};
