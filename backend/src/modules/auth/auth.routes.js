/**
 * ============================================
 * AUTHENTICATION ROUTES
 * ============================================
 * 
 * Educational Overview:
 * ---------------------
 * Routes define the API endpoints and connect them to controllers.
 * They also specify which middleware to apply to each route.
 * 
 * Express Router:
 * ---------------
 * Express Router is a mini-application for handling routes.
 * It can have its own middleware and routes, then be mounted
 * on the main app at a specific path.
 * 
 * Example:
 * --------
 * // In this file
 * router.post('/login', authController.login);
 * 
 * // In app.js
 * app.use('/api/auth', authRoutes);
 * 
 * // Results in endpoint:
 * POST /api/auth/login
 * 
 * Middleware Chain:
 * -----------------
 * Route → Middleware(s) → Controller
 * 
 * Example:
 * router.get('/me', authMiddleware, getCurrentUser);
 *           ↓            ↓                ↓
 *        Endpoint    Verify JWT      Handle Request
 * 
 * Public vs Protected Routes:
 * ---------------------------
 * Public (no middleware):
 * - POST /login - Anyone can attempt login
 * 
 * Protected (authMiddleware required):
 * - GET /me - Must be authenticated
 * - POST /logout - Must be authenticated
 */

const express = require('express');
const authController = require('./auth.controller');
const { authMiddleware } = require('../../middlewares/auth.middleware');

/**
 * Create Router
 * -------------
 * Express Router instance for authentication routes.
 */
const router = express.Router();

/**
 * ============================================
 * POST /api/auth/login
 * ============================================
 * 
 * Purpose: Authenticate user with phone + password
 * 
 * Access: Public (no authentication required)
 * 
 * Request Body:
 * {
 *   "phone": "+966500000001",
 *   "password": "MyPassword123"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "accessToken": "jwt...",
 *     "user": { ... },
 *     "restaurant": { ... }
 *   }
 * }
 * 
 * Use Case:
 * ---------
 * 1. User opens app and navigates to login page
 * 2. User enters phone and password
 * 3. Frontend sends POST request
 * 4. Backend validates credentials
 * 5. Backend returns JWT token
 * 6. Frontend stores token and redirects
 * 
 * Why No Middleware:
 * ------------------
 * This is a public endpoint - users can't authenticate without
 * first having credentials to authenticate WITH!
 */
router.post('/login', authController.login);

/**
 * ============================================
 * GET /api/auth/me
 * ============================================
 * 
 * Purpose: Get current user's profile
 * 
 * Access: Protected (requires valid JWT)
 * 
 * Headers:
 * Authorization: Bearer <jwt-token>
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "user": { ... },
 *     "restaurant": { ... }
 *   }
 * }
 * 
 * Use Cases:
 * ----------
 * 1. Frontend loads and wants to verify token
 * 2. User updates profile, frontend refreshes data
 * 3. Periodic token validation
 * 
 * Middleware Flow:
 * ----------------
 * Request → authMiddleware → Controller
 *              ↓                  ↓
 *         Verify JWT        Use req.user.userId
 *         Set req.user
 */
router.get('/me', authMiddleware, authController.getCurrentUser);

/**
 * ============================================
 * POST /api/auth/logout
 * ============================================
 * 
 * Purpose: Logout current user
 * 
 * Access: Protected (requires valid JWT)
 * 
 * Headers:
 * Authorization: Bearer <jwt-token>
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "message": "تم تسجيل الخروج بنجاح"
 *   }
 * }
 * 
 * Use Case:
 * ---------
 * 1. User clicks logout button
 * 2. Frontend sends POST request
 * 3. Backend acknowledges (future: blacklist token)
 * 4. Frontend removes token from localStorage
 * 5. Frontend redirects to login page
 * 
 * JWT Note:
 * ---------
 * Since JWTs are stateless, logout is primarily client-side.
 * This endpoint exists for:
 * - Consistent API design
 * - Future token blacklisting
 * - Logout analytics
 */
router.post('/logout', authMiddleware, authController.logout);

/**
 * ============================================
 * FUTURE ROUTES (MVP+)
 * ============================================
 * 
 * POST /api/auth/refresh
 * - Refresh expired JWT with refresh token
 * - Requires refresh token in body
 * 
 * POST /api/auth/forgot-password
 * - Request password reset via SMS
 * - Requires phone number
 * 
 * POST /api/auth/reset-password
 * - Reset password with verification code
 * - Requires phone, code, new password
 * 
 * POST /api/auth/change-password
 * - Change password for authenticated user
 * - Requires old password and new password
 */

/**
 * Export Router
 * -------------
 * This router will be mounted on /api/auth in app.js
 * 
 * Usage in app.js:
 * const authRoutes = require('./modules/auth/auth.routes');
 * app.use('/api/auth', authRoutes);
 */
module.exports = router;
