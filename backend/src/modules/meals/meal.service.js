/**
 * Meal Service
 * 
 * Business logic layer with strict tenant isolation.
 * All operations filter by restaurantId to ensure multi-tenant data separation.
 */

const Meal = require('../../models/meal.model');

class MealService {
  /**
   * Get all meals for a specific restaurant
   * Supports filtering by: availability, category, active status, search term
   */
  async getMeals(restaurantId, filters = {}) {
    const query = { restaurantId };

    // Apply optional filters
    if (filters.availability) {
      query.availability = filters.availability;
    }

    if (filters.category) {
      query.category = filters.category;
    }

    if (filters.isActive !== undefined) {
      query.isActive = filters.isActive === 'true';
    }

    // Search by name or description
    if (filters.q) {
      query.$or = [
        { name: { $regex: filters.q, $options: 'i' } },
        { description: { $regex: filters.q, $options: 'i' } },
      ];
    }

    const meals = await Meal.find(query).sort({ createdAt: -1 });
    return meals;
  }

  /**
   * Create a new meal
   * Automatically assigns to admin's restaurant
   */
  async createMeal(restaurantId, mealData) {
    const meal = new Meal({
      ...mealData,
      restaurantId, // Enforce tenant isolation
    });

    await meal.save();
    return meal;
  }

  /**
   * Update an existing meal
   * Validates that meal belongs to admin's restaurant
   */
  async updateMeal(mealId, restaurantId, updates) {
    // Find meal with tenant filter
    const meal = await Meal.findOne({
      _id: mealId,
      restaurantId, // CRITICAL: Prevent cross-tenant updates
    });

    if (!meal) {
      return null;
    }

    // Apply updates
    Object.assign(meal, updates);
    await meal.save();

    return meal;
  }

  /**
   * Delete a meal
   * Validates ownership before deletion
   */
  async deleteMeal(mealId, restaurantId) {
    const result = await Meal.deleteOne({
      _id: mealId,
      restaurantId, // CRITICAL: Prevent cross-tenant deletions
    });

    return result.deletedCount > 0;
  }

  /**
   * Update meal image URL
   * Used after successful image upload
   */
  async updateMealImage(mealId, restaurantId, imageUrl) {
    const meal = await Meal.findOne({
      _id: mealId,
      restaurantId,
    });

    if (!meal) {
      return null;
    }

    meal.imageUrl = imageUrl;
    await meal.save();

    return meal;
  }

  /**
   * Get a single meal by ID
   * With tenant validation
   */
  async getMealById(mealId, restaurantId) {
    const meal = await Meal.findOne({
      _id: mealId,
      restaurantId,
    });

    return meal;
  }
}

module.exports = new MealService();
