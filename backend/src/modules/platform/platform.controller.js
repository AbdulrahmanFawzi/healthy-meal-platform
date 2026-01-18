/**
 * ============================================
 * PLATFORM CONTROLLER
 * ============================================
 * 
 * Handles HTTP requests for platform-level operations (super admin only)
 */

const platformService = require('./platform.service');

/**
 * Create a new restaurant with admin user
 * POST /api/platform/restaurants
 * 
 * Multipart form data:
 * - restaurantName: string (required)
 * - adminPhone: string (required)
 * - adminPassword: string (required)
 * - logo: file (optional)
 */
const createRestaurant = async (req, res, next) => {
  try {
    const { restaurantName, adminPhone, adminPassword } = req.body;

    // Get logo URL if file was uploaded
    let logoUrl = null;
    if (req.file) {
      // Construct public URL for uploaded file
      logoUrl = `/uploads/restaurants/${req.file.filename}`;
    }

    const result = await platformService.createRestaurant({
      restaurantName,
      adminPhone,
      adminPassword,
      logoUrl
    });

    res.status(201).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all restaurants
 * GET /api/platform/restaurants
 */
const getAllRestaurants = async (req, res, next) => {
  try {
    const restaurants = await platformService.getAllRestaurants();

    res.status(200).json({
      success: true,
      data: restaurants
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRestaurant,
  getAllRestaurants
};
