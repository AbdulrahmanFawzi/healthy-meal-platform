import { Injectable } from '@angular/core';
import { Meal } from '../../core/models/meal.model';

/**
 * OrderDraftService
 * 
 * Manages the current order draft state across customer components.
 * Stores meal selections and calculates totals.
 */
@Injectable({
  providedIn: 'root'
})
export class OrderDraftService {
  // Meal selections
  selectedMeal1Protein: Meal | null = null;
  selectedMeal1Carb: Meal | null = null;
  selectedMeal2Protein: Meal | null = null;
  selectedMeal2Carb: Meal | null = null;
  selectedSnack: Meal | null = null;

  /**
   * Reset all selections (for new order)
   */
  reset(): void {
    this.selectedMeal1Protein = null;
    this.selectedMeal1Carb = null;
    this.selectedMeal2Protein = null;
    this.selectedMeal2Carb = null;
    this.selectedSnack = null;
  }

  /**
   * Computed: Total protein grams
   */
  get totalProtein(): number {
    let total = 0;
    if (this.selectedMeal1Protein) total += this.selectedMeal1Protein.proteinGrams;
    if (this.selectedMeal1Carb) total += this.selectedMeal1Carb.proteinGrams;
    if (this.selectedMeal2Protein) total += this.selectedMeal2Protein.proteinGrams;
    if (this.selectedMeal2Carb) total += this.selectedMeal2Carb.proteinGrams;
    if (this.selectedSnack) total += this.selectedSnack.proteinGrams;
    return total;
  }

  /**
   * Computed: Total carbs grams
   */
  get totalCarbs(): number {
    let total = 0;
    if (this.selectedMeal1Protein) total += this.selectedMeal1Protein.carbsGrams;
    if (this.selectedMeal1Carb) total += this.selectedMeal1Carb.carbsGrams;
    if (this.selectedMeal2Protein) total += this.selectedMeal2Protein.carbsGrams;
    if (this.selectedMeal2Carb) total += this.selectedMeal2Carb.carbsGrams;
    if (this.selectedSnack) total += this.selectedSnack.carbsGrams;
    return total;
  }

  /**
   * Computed: Total calories
   */
  get totalCalories(): number {
    let total = 0;
    if (this.selectedMeal1Protein) total += this.selectedMeal1Protein.calories;
    if (this.selectedMeal1Carb) total += this.selectedMeal1Carb.calories;
    if (this.selectedMeal2Protein) total += this.selectedMeal2Protein.calories;
    if (this.selectedMeal2Carb) total += this.selectedMeal2Carb.calories;
    if (this.selectedSnack) total += this.selectedSnack.calories;
    return total;
  }

  /**
   * Check if order is complete (both meals selected, snack optional)
   */
  get isOrderComplete(): boolean {
    return this.selectedMeal1Protein !== null &&
           this.selectedMeal1Carb !== null &&
           this.selectedMeal2Protein !== null &&
           this.selectedMeal2Carb !== null;
  }
}
