import { Injectable } from '@angular/core';
import { Meal } from '../../core/models/meal.model';

/**
 * Meal Selection Interface
 * Represents a single meal (protein + carb pair)
 */
export interface MealSelection {
  protein: Meal | null;
  carb: Meal | null;
}

/**
 * OrderDraftService
 * 
 * Manages the current order draft state across customer components.
 * Stores meal selections dynamically based on subscription settings.
 * 
 * Key Changes:
 * - Supports dynamic number of meals (1-5) instead of hardcoded 2 meals
 * - Uses array-based storage: selections[]
 * - Snack is optional based on subscription settings
 */
@Injectable({
  providedIn: 'root'
})
export class OrderDraftService {
  // Dynamic meal selections (length = mealsPerDay)
  selections: MealSelection[] = [];
  
  // Optional snack selection
  selectedSnack: Meal | null = null;
  
  // Flag if snack was explicitly skipped
  snackSkipped: boolean = false;

  /**
   * Initialize selections array based on subscription settings
   * @param mealsPerDay - Number of meals per day (1-5)
   */
  initSelections(mealsPerDay: number): void {
    this.selections = Array.from({ length: mealsPerDay }, () => ({
      protein: null,
      carb: null
    }));
  }

  /**
   * Reset all selections (for new order)
   */
  reset(): void {
    this.selections = [];
    this.selectedSnack = null;
    this.snackSkipped = false;
  }

  /**
   * Get meal selection by index (0-based)
   */
  getMealSelection(index: number): MealSelection | null {
    return this.selections[index] || null;
  }

  /**
   * Set protein for specific meal index
   */
  setProtein(index: number, meal: Meal): void {
    if (this.selections[index]) {
      this.selections[index].protein = meal;
      // Clear carb when changing protein
      this.selections[index].carb = null;
    }
  }

  /**
   * Set carb for specific meal index
   */
  setCarb(index: number, meal: Meal): void {
    if (this.selections[index]) {
      this.selections[index].carb = meal;
    }
  }

  /**
   * Check if specific meal is complete
   */
  isMealComplete(index: number): boolean {
    const meal = this.selections[index];
    return meal !== null && meal.protein !== null && meal.carb !== null;
  }

  /**
   * Computed: Total protein grams
   */
  get totalProtein(): number {
    let total = 0;
    
    // Sum protein from all meal selections
    this.selections.forEach(meal => {
      if (meal.protein) total += meal.protein.proteinGrams;
      if (meal.carb) total += meal.carb.proteinGrams;
    });
    
    // Add snack if selected
    if (this.selectedSnack) total += this.selectedSnack.proteinGrams;
    
    return total;
  }

  /**
   * Computed: Total carbs grams
   */
  get totalCarbs(): number {
    let total = 0;
    
    // Sum carbs from all meal selections
    this.selections.forEach(meal => {
      if (meal.protein) total += meal.protein.carbsGrams;
      if (meal.carb) total += meal.carb.carbsGrams;
    });
    
    // Add snack if selected
    if (this.selectedSnack) total += this.selectedSnack.carbsGrams;
    
    return total;
  }

  /**
   * Computed: Total calories
   */
  get totalCalories(): number {
    let total = 0;
    
    // Sum calories from all meal selections
    this.selections.forEach(meal => {
      if (meal.protein) total += meal.protein.calories;
      if (meal.carb) total += meal.carb.calories;
    });
    
    // Add snack if selected
    if (this.selectedSnack) total += this.selectedSnack.calories;
    
    return total;
  }

  /**
   * Computed: Number of completed selections (protein + carb counts)
   */
  get completedSelectionsCount(): number {
    let count = 0;
    
    this.selections.forEach(meal => {
      if (meal.protein) count++;
      if (meal.carb) count++;
    });
    
    return count;
  }

  /**
   * Check if all required meals are selected (snack not required)
   */
  get isOrderComplete(): boolean {
    return this.selections.every(meal => meal.protein !== null && meal.carb !== null);
  }
}
