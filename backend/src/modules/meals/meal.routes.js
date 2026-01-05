/**
 * Meal Routes
 * 
 * Defines HTTP routes for meal management with proper auth and role guards.
 * 
 * Authorization:
 * - GET /meals: admin, customer (restaurant-scoped)
 * - POST /meals: admin only
 * - PUT /meals/:id: admin only
 * - DELETE /meals/:id: admin only
 * - POST /meals/:id/image: admin only
 */

const express = require('express');
const router = express.Router();
const mealController = require('./meal.controller');
const { authMiddleware } = require('../../middlewares/auth.middleware');
const { requireRole } = require('../../middlewares/role.middleware');
const upload = require('../../config/multer');

// GET /api/meals - List meals (admin & customer)
router.get(
  '/',
  authMiddleware,
  mealController.getMeals
);

// POST /api/meals - Create meal (admin only)
router.post(
  '/',
  authMiddleware,
  requireRole('admin'),
  mealController.createMeal
);

// PUT /api/meals/:id - Update meal (admin only)
router.put(
  '/:id',
  authMiddleware,
  requireRole('admin'),
  mealController.updateMeal
);

// DELETE /api/meals/:id - Delete meal (admin only)
router.delete(
  '/:id',
  authMiddleware,
  requireRole('admin'),
  mealController.deleteMeal
);

// POST /api/meals/:id/image - Upload image (admin only)
router.post(
  '/:id/image',
  authMiddleware,
  requireRole('admin'),
  upload.single('image'), // Multer middleware: expects 'image' field
  mealController.uploadImage
);

module.exports = router;
