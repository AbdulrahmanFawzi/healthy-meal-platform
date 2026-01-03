

const jwt = require('jsonwebtoken');

const generateToken = (payload) => {
  // Validate required fields
  if (!payload.userId || !payload.role) {
    throw new Error('userId and role are required for token generation');
  }

  // Get configuration from environment variables
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  // Validate JWT_SECRET exists
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  /**
   * jwt.sign() Parameters:
   * ----------------------
   * 1. payload: Data to encode (userId, role, restaurantId)
   * 2. secret: Secret key for signing (from .env)
   * 3. options:
   *    - expiresIn: Token lifetime (e.g., "7d", "24h", "60m")
   *    - algorithm: HMAC SHA256 (default, symmetric key)
   * 
   * Returns: Compact JWT string (header.payload.signature)
   */
  return jwt.sign(
    {
      userId: payload.userId,
      role: payload.role,
      restaurantId: payload.restaurantId || null
    },
    secret,
    { expiresIn }
  );
};


const verifyToken = (token) => {
  // Validate token exists
  if (!token) {
    throw new Error('Token is required');
  }

  // Get secret from environment
  const secret = process.env.JWT_SECRET;
  
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  try {
    /**
     * jwt.verify() Parameters:
     * ------------------------
     * 1. token: JWT string to verify
     * 2. secret: Secret key used for signing
     * 3. options (optional):
     *    - algorithms: Allowed algorithms (defaults to all)
     *    - clockTolerance: Seconds to tolerate clock skew
     * 
     * Returns: Decoded payload if valid
     * Throws: JsonWebTokenError or TokenExpiredError if invalid
     * 
     * Security Note:
     * --------------
     * jwt.verify() is synchronous for HMAC algorithms (HS256).
     * It's asynchronous only for RSA/ECDSA (RS256, ES256).
     */
    const decoded = jwt.verify(token, secret);
    
    // Return payload with user context
    return {
      userId: decoded.userId,
      role: decoded.role,
      restaurantId: decoded.restaurantId || null,
      iat: decoded.iat,
      exp: decoded.exp
    };
  } catch (error) {
    /**
     * Error Handling:
     * ---------------
     * Re-throw with user-friendly message.
     * Middleware will catch and format error response.
     */
    if (error.name === 'TokenExpiredError') {
      const err = new Error('انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى');
      err.statusCode = 401;
      err.code = 'TOKEN_EXPIRED';
      throw err;
    }
    
    if (error.name === 'JsonWebTokenError') {
      const err = new Error('رمز الجلسة غير صالح');
      err.statusCode = 401;
      err.code = 'INVALID_TOKEN';
      throw err;
    }
    
    // Unknown JWT error
    throw error;
  }
};

/**
 * ============================================
 * DECODE TOKEN (WITHOUT VERIFICATION)
 * ============================================
 * 
 * Educational Purpose:
 * --------------------
 * Decodes a JWT without verifying the signature.
 * Useful for debugging or inspecting token contents.
 * 
 * ⚠️ WARNING: DO NOT USE FOR AUTHENTICATION
 * This method doesn't check signature or expiration.
 * Only use for non-security-critical operations like:
 * - Debugging
 * - Logging
 * - Displaying user info before API calls
 * 
 * How It Works:
 * -------------
 * 1. Split token by dots: header.payload.signature
 * 2. Base64 decode the payload part
 * 3. JSON parse the decoded string
 * 4. Return payload object
 * 
 * Example:
 * --------
 * const token = "eyJhbGc...";
 * const payload = decodeToken(token);
 * console.log(`User ${payload.userId} has role ${payload.role}`);
 * 
 * @param {string} token - JWT token to decode
 * @returns {Object|null} - Decoded payload or null if invalid
 */
const decodeToken = (token) => {
  try {
    // jwt.decode() returns payload without verification
    return jwt.decode(token);
  } catch (error) {
    return null;
  }
};

/**
 * Export Functions
 * ----------------
 * These utilities are used throughout the backend:
 * - auth.controller.js: generateToken() after login
 * - auth.middleware.js: verifyToken() to protect routes
 * - Debug tools: decodeToken() for inspecting tokens
 */
module.exports = {
  generateToken,
  verifyToken,
  decodeToken
};
