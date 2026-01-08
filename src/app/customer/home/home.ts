import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MealsService } from '../../core/services/meals.service';
import { Meal, MealCategory } from '../../core/models/meal.model';
import { OrderDraftService } from '../services/order-draft.service';

@Component({
  selector: 'app-customer-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class CustomerHomeComponent implements OnInit {
  // Header card data
  dailyGoals = '120g بروتين · 150g كارب';

  // Meal lists
  proteinMeals: Meal[] = [];
  carbMeals: Meal[] = [];
  snackMeals: Meal[] = [];
  
  // Current step: 1 = meal 1, 2 = meal 2, 3 = snack
  currentStep = 1;
  currentMealIndex = 1; // 1 or 2 (for meal steps)
  
  // Loading states
  loadingProtein = false;
  loadingCarb = false;
  loadingSnack = false;
  
  // Error states
  errorProtein = '';
  errorCarb = '';
  errorSnack = '';

  constructor(
    private mealsService: MealsService,
    public orderDraft: OrderDraftService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Reset draft on component init
    this.orderDraft.reset();
    this.loadProteinMeals();
  }

  /**
   * Computed: Progress percentage text (dynamic)
   */
  get progressPercentage(): string {
    return `${Math.round(this.progressValue)}%`;
  }

  /**
   * Computed: Progress value (0-100) based on completed selections
   */
  get progressValue(): number {
    let completed = 0;
    if (this.orderDraft.selectedMeal1Protein) completed++;
    if (this.orderDraft.selectedMeal1Carb) completed++;
    if (this.orderDraft.selectedMeal2Protein) completed++;
    if (this.orderDraft.selectedMeal2Carb) completed++;
    return (completed / 4) * 100;
  }

  /**
   * Computed: Meal label for header
   */
  get mealLabel(): string {
    if (this.currentStep === 3) return 'وجبة خفيفة (اختيارية)';
    return this.currentMealIndex === 1 ? 'الوجبة 1 من 2' : 'الوجبة 2 من 2';
  }

  /**
   * Computed: Currently selected protein for active meal
   */
  get selectedProtein(): Meal | null {
    return this.currentMealIndex === 1 
      ? this.orderDraft.selectedMeal1Protein 
      : this.orderDraft.selectedMeal2Protein;
  }

  /**
   * Computed: Currently selected carb for active meal
   */
  get selectedCarb(): Meal | null {
    return this.currentMealIndex === 1 
      ? this.orderDraft.selectedMeal1Carb 
      : this.orderDraft.selectedMeal2Carb;
  }

  /**
   * Computed: Is meal 1 complete
   */
  get isMeal1Complete(): boolean {
    return this.orderDraft.selectedMeal1Protein !== null && 
           this.orderDraft.selectedMeal1Carb !== null;
  }

  /**
   * Computed: Is meal 2 complete
   */
  get isMeal2Complete(): boolean {
    return this.orderDraft.selectedMeal2Protein !== null && 
           this.orderDraft.selectedMeal2Carb !== null;
  }

  /**
   * Computed: Show next meal button
   */
  get showNextMealButton(): boolean {
    return this.isMeal1Complete && this.currentStep === 1;
  }

  /**
   * Computed: Show snack button
   */
  get showSnackButton(): boolean {
    return this.isMeal2Complete && this.currentStep === 2;
  }

  /**
   * Computed: Show meal 2 action buttons (back and snack)
   */
  get showMeal2ActionButtons(): boolean {
    return this.isMeal2Complete && this.currentStep === 2;
  }

  /**
   * Computed: Is on snack step
   */
  get isSnackStep(): boolean {
    return this.currentStep === 3;
  }

  /**
   * Load protein meals
   */
  loadProteinMeals(): void {
    this.loadingProtein = true;
    this.errorProtein = '';
    
    this.mealsService.getMeals({ 
      category: MealCategory.PROTEIN,
      isActive: true 
    }).subscribe({
      next: (meals) => {
        this.proteinMeals = meals;
        this.loadingProtein = false;
      },
      error: (err) => {
        this.errorProtein = 'فشل تحميل وجبات البروتين';
        this.loadingProtein = false;
        console.error('Error loading protein meals:', err);
      }
    });
  }

  /**
   * Load carb meals
   */
  loadCarbMeals(): void {
    this.loadingCarb = true;
    this.errorCarb = '';
    
    this.mealsService.getMeals({ 
      category: MealCategory.CARB,
      isActive: true 
    }).subscribe({
      next: (meals) => {
        this.carbMeals = meals;
        this.loadingCarb = false;
      },
      error: (err) => {
        this.errorCarb = 'فشل تحميل وجبات الكربوهيدرات';
        this.loadingCarb = false;
        console.error('Error loading carb meals:', err);
      }
    });
  }

  /**
   * Load snack meals
   */
  loadSnackMeals(): void {
    this.loadingSnack = true;
    this.errorSnack = '';
    
    this.mealsService.getMeals({ 
      category: MealCategory.SNACK,
      isActive: true 
    }).subscribe({
      next: (meals) => {
        this.snackMeals = meals;
        this.loadingSnack = false;
      },
      error: (err) => {
        this.errorSnack = 'فشل تحميل وجبات السناك';
        this.loadingSnack = false;
        console.error('Error loading snack meals:', err);
      }
    });
  }

  /**
   * Select protein
   */
  selectProtein(meal: Meal): void {
    if (this.currentMealIndex === 1) {
      this.orderDraft.selectedMeal1Protein = meal;
      this.orderDraft.selectedMeal1Carb = null;
    } else {
      this.orderDraft.selectedMeal2Protein = meal;
      this.orderDraft.selectedMeal2Carb = null;
    }
    this.loadCarbMeals();
  }

  /**
   * Select carb
   */
  selectCarb(meal: Meal): void {
    if (this.currentMealIndex === 1) {
      this.orderDraft.selectedMeal1Carb = meal;
    } else {
      this.orderDraft.selectedMeal2Carb = meal;
    }
  }

  /**
   * Select snack
   */
  selectSnack(meal: Meal): void {
    this.orderDraft.selectedSnack = meal;
    // Navigate to order review
    this.router.navigate(['/customer/order-review']);
  }

  /**
   * Proceed to meal 2
   */
  proceedToMeal2(): void {
    this.currentMealIndex = 2;
    this.currentStep = 2;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * Go back to meal 1
   */
  goBackToMeal1(): void {
    this.currentMealIndex = 1;
    this.currentStep = 1;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * Proceed to snack step
   */
  proceedToSnack(): void {
    this.currentStep = 3;
    this.loadSnackMeals();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * Skip snack and go to order review
   */
  skipSnack(): void {
    this.orderDraft.selectedSnack = null;
    this.router.navigate(['/customer/order-review']);
  }

  /**
   * Helper to get meal image
   */
  getMealImage(meal: Meal): string {
    return this.mealsService.getImageUrl(meal.imageUrl);
  }
}
