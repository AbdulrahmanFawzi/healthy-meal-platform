import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MealsService } from '../../core/services/meals.service';
import { Meal, MealCategory } from '../../core/models/meal.model';
import { OrderDraftService } from '../services/order-draft.service';
import { CustomerSubscriptionService, SubscriptionSettingsDto } from '../services/customer-subscription.service';

@Component({
  selector: 'app-customer-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class CustomerHomeComponent implements OnInit {
  // Subscription settings (loaded from API)
  subscriptionSettings: SubscriptionSettingsDto | null = null;
  dailyGoals = '';
  
  // Dynamic meal configuration
  totalMeals = 2; // Default, updated from subscription
  snackIncluded = false; // Updated from subscription

  // Meal lists
  proteinMeals: Meal[] = [];
  carbMeals: Meal[] = [];
  snackMeals: Meal[] = [];
  
  // Current step: 0-based index for meal, or snack step
  currentMealIndex = 0; // 0 to totalMeals-1
  isSnackStep = false;
  
  // Loading states
  loadingProtein = false;
  loadingCarb = false;
  loadingSnack = false;
  loadingSettings = false;
  
  // Error states
  errorProtein = '';
  errorCarb = '';
  errorSnack = '';
  errorSettings = '';

  constructor(
    private mealsService: MealsService,
    private subscriptionService: CustomerSubscriptionService,
    public orderDraft: OrderDraftService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Load subscription settings first
    this.loadSubscriptionSettings();
  }
  
  /**
   * Load subscription settings to drive UI
   */
  loadSubscriptionSettings(): void {
    this.loadingSettings = true;
    this.errorSettings = '';
    
    this.subscriptionService.getSubscriptionSettings().subscribe({
      next: (settings) => {
        this.subscriptionSettings = settings;
        this.totalMeals = settings.mealsPerDay;
        this.snackIncluded = settings.snackIncluded;
        this.dailyGoals = this.subscriptionService.formatDailyGoals(settings);
        
        // Initialize order draft with correct meal count
        this.orderDraft.initSelections(this.totalMeals);
        
        // Load protein meals for first meal
        this.loadProteinMeals();
        this.loadingSettings = false;
      },
      error: (err) => {
        this.errorSettings = 'فشل تحميل بيانات الاشتراك';
        this.loadingSettings = false;
        console.error('Error loading subscription settings:', err);
      }
    });
  }

  /**
   * Computed: Progress percentage text
   */
  get progressPercentage(): string {
    return `${Math.round(this.progressValue)}%`;
  }

  /**
   * Computed: Progress value (0-100) based on completed selections
   * Each meal requires 2 selections (protein + carb)
   * Snack is NOT counted in progress
   */
  get progressValue(): number {
    const totalRequired = this.totalMeals * 2; // protein + carb for each meal
    const completed = this.orderDraft.completedSelectionsCount;
    return (completed / totalRequired) * 100;
  }

  /**
   * Computed: Meal label for header (1-based for display)
   */
  get mealLabel(): string {
    if (this.isSnackStep) return 'وجبة خفيفة (اختيارية)';
    return `الوجبة ${this.currentMealIndex + 1} من ${this.totalMeals}`;
  }

  /**
   * Computed: Currently selected protein for active meal
   */
  get selectedProtein(): Meal | null {
    const selection = this.orderDraft.getMealSelection(this.currentMealIndex);
    return selection ? selection.protein : null;
  }

  /**
   * Computed: Currently selected carb for active meal
   */
  get selectedCarb(): Meal | null {
    const selection = this.orderDraft.getMealSelection(this.currentMealIndex);
    return selection ? selection.carb : null;
  }

  /**
   * Computed: Is current meal complete
   */
  get isCurrentMealComplete(): boolean {
    return this.orderDraft.isMealComplete(this.currentMealIndex);
  }

  /**
   * Computed: Is on last meal
   */
  get isLastMeal(): boolean {
    return this.currentMealIndex === this.totalMeals - 1;
  }

  /**
   * Computed: Show next meal button
   */
  get showNextMealButton(): boolean {
    return this.isCurrentMealComplete && !this.isLastMeal;
  }

  /**
   * Computed: Show snack button (only if subscription includes snack and on last meal)
   */
  get showSnackButton(): boolean {
    return this.isCurrentMealComplete && this.isLastMeal && this.snackIncluded;
  }
  
  /**
   * Computed: Show review button (skip snack - when on last meal and no snack)
   */
  get showReviewButton(): boolean {
    return this.isCurrentMealComplete && this.isLastMeal && !this.snackIncluded;
  }

  /**
   * Computed: Show meal action buttons (back and next/snack/review)
   */
  get showMealActionButtons(): boolean {
    return this.isCurrentMealComplete;
  }

  /**
   * Computed: Can go back (not on first meal or on snack step)
   */
  get canGoBack(): boolean {
    return this.currentMealIndex > 0 || this.isSnackStep;
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
    this.orderDraft.setProtein(this.currentMealIndex, meal);
    this.loadCarbMeals();
  }

  /**
   * Select carb
   */
  selectCarb(meal: Meal): void {
    this.orderDraft.setCarb(this.currentMealIndex, meal);
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
   * Proceed to next meal
   */
  proceedToNextMeal(): void {
    if (!this.isLastMeal) {
      this.currentMealIndex++;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  /**
   * Go back to previous meal
   */
  goBackToPreviousMeal(): void {
    if (this.isSnackStep) {
      // Return to last meal from snack step
      this.isSnackStep = false;
      this.currentMealIndex = this.totalMeals - 1;
    } else if (this.currentMealIndex > 0) {
      // Go to previous meal
      this.currentMealIndex--;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * Proceed to snack step
   */
  proceedToSnack(): void {
    this.isSnackStep = true;
    this.loadSnackMeals();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * Skip snack and go to order review
   */
  skipSnack(): void {
    this.orderDraft.selectedSnack = null;
    this.orderDraft.snackSkipped = true;
    this.router.navigate(['/customer/order-review']);
  }
  
  /**
   * Go directly to order review (when snack not included)
   */
  proceedToReview(): void {
    this.router.navigate(['/customer/order-review']);
  }

  /**
   * Helper to get meal image
   */
  getMealImage(meal: Meal): string {
    return this.mealsService.getImageUrl(meal.imageUrl);
  }
}
