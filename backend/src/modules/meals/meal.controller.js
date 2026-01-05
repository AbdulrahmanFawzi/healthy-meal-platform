/**
 * Meal Controller
 * 
 * HTTP request handlers for meal endpoints.
 * Enforces authentication, role-based access, and tenant isolation.
 */

const mealService = require('./meal.service');

/**
 * GET /api/meals
 * Returns meals filtered by restaurantId from JWT
 * Accessible by: admin, customer
 */
async function getMeals(req, res, next) {
  try {
    const { restaurantId } = req.user; // Extracted from JWT by auth middleware
    const filters = req.query; // availability, category, isActive, q

    const meals = await mealService.getMeals(restaurantId, filters);

    res.json({
      success: true,
      data: meals,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/meals
 * Create new meal for admin's restaurant
 * Accessible by: admin only
 */
async function createMeal(req, res, next) {
  try {
    const { restaurantId } = req.user;
    const { name, description, calories, proteinGrams, carbsGrams, availability, category, isActive } = req.body;

    // Validation
    if (!name || !description || calories === undefined || proteinGrams === undefined || carbsGrams === undefined || !category) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Missing required fields',
          details: [
            { field: 'name', issue: 'Required' },
            { field: 'description', issue: 'Required' },
            { field: 'calories', issue: 'Required' },
            { field: 'proteinGrams', issue: 'Required' },
            { field: 'carbsGrams', issue: 'Required' },
            { field: 'category', issue: 'Required (protein, carb, or snack)' },
          ],
        },
      });
    }

    // Validate category enum
    if (!['protein', 'carb', 'snack'].includes(category)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid category',
          details: [{ field: 'category', issue: 'Must be protein, carb, or snack' }],
        },
      });
    }

    const meal = await mealService.createMeal(restaurantId, {
      name,
      description,
      calories,
      proteinGrams,
      carbsGrams,
      availability: availability || 'daily',
      category,
      isActive: isActive !== undefined ? isActive : true,
    });

    res.status(201).json({
      success: true,
      data: meal,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/meals/:id
 * Update existing meal
 * Accessible by: admin only
 */
async function updateMeal(req, res, next) {
  try {
    const { id } = req.params;
    const { restaurantId } = req.user;
    const updates = req.body;

    // Validate category if provided
    if (updates.category && !['protein', 'carb', 'snack'].includes(updates.category)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid category',
          details: [{ field: 'category', issue: 'Must be protein, carb, or snack' }],
        },
      });
    }

    const meal = await mealService.updateMeal(id, restaurantId, updates);

    if (!meal) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Meal not found or does not belong to your restaurant',
        },
      });
    }

    res.json({
      success: true,
      data: meal,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/meals/:id
 * Delete a meal
 * Accessible by: admin only
 */
async function deleteMeal(req, res, next) {
  try {
    const { id } = req.params;
    const { restaurantId } = req.user;

    const deleted = await mealService.deleteMeal(id, restaurantId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Meal not found or does not belong to your restaurant',
        },
      });
    }

    res.json({
      success: true,
      data: {
        id,
        deleted: true,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/meals/:id/image
 * Upload meal image
 * Accessible by: admin only
 */
async function uploadImage(req, res, next) {
  try {
    const { id } = req.params;
    const { restaurantId } = req.user;

    // Check if file was uploaded (handled by multer middleware)
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'No image file provided',
        },
      });
    }

    // Construct image URL (served from /uploads static route)
    const imageUrl = `/uploads/${req.file.filename}`;

    // Update meal with new image URL
    const meal = await mealService.updateMealImage(id, restaurantId, imageUrl);

    if (!meal) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Meal not found or does not belong to your restaurant',
        },
      });
    }

    res.json({
      success: true,
      data: {
        id: meal._id,
        imageUrl: meal.imageUrl,
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getMeals,
  createMeal,
  updateMeal,
  deleteMeal,
  uploadImage,
};
