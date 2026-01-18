/**
 * ============================================
 * PLATFORM ROUTES
 * ============================================
 * 
 * Super admin endpoints for platform management
 * Base path: /api/platform
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const platformController = require('./platform.controller');
const { authMiddleware } = require('../../middlewares/auth.middleware');
const { requireRole } = require('../../middlewares/role.middleware');

// Ensure restaurants upload directory exists
const restaurantsUploadDir = path.join(__dirname, '../../../uploads/restaurants');
if (!fs.existsSync(restaurantsUploadDir)) {
  fs.mkdirSync(restaurantsUploadDir, { recursive: true });
}

// Configure multer for restaurant logo uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, restaurantsUploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'logo-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('يجب أن يكون الملف صورة'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: fileFilter
});

/**
 * POST /api/platform/restaurants
 * Create new restaurant with admin user
 * Requires: super_admin role (TEMPORARILY DISABLED FOR TESTING)
 */
router.post(
  '/restaurants',
  // authMiddleware,  // Temporarily disabled
  // requireRole('super_admin'),  // Temporarily disabled
  upload.single('logo'),
  platformController.createRestaurant
);

/**
 * GET /api/platform/restaurants
 * Get all restaurants
 * Requires: super_admin role (TEMPORARILY DISABLED FOR TESTING)
 */
router.get(
  '/restaurants',
  // authMiddleware,  // Temporarily disabled
  // requireRole('super_admin'),  // Temporarily disabled
  platformController.getAllRestaurants
);

module.exports = router;
