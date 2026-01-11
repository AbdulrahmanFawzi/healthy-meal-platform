import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Meal, MealCategory, getMealCategoryConfig } from '../../../../core/models/meal.model';
import { MealsService } from '../../../../core/services/meals.service';

/**
 * Dashboard Today Menu Component
 * 
 * Displays scrollable list of today's available meals with images and macros
 * Fetches real data from backend meals API
 */
@Component({
  selector: 'app-dashboard-today-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-today-menu.html',
  styleUrl: './dashboard-today-menu.scss'
})
export class DashboardTodayMenuComponent implements OnInit {
  todaysMeals: Meal[] = [];

  constructor(private mealsService: MealsService) {}

  ngOnInit(): void {
    this.loadTodayMenu();
  }

  private loadTodayMenu(): void {
    // Fetch real meals from backend API
    this.mealsService.getMeals({ isActive: true }).subscribe({
      next: (meals) => {
        this.todaysMeals = meals;
      },
      error: (error) => {
        console.error('Error loading today\'s menu:', error);
        this.todaysMeals = [];
      }
    });
  }

  getMealImageUrl(meal: Meal): string {
    return this.mealsService.getImageUrl(meal.imageUrl);
  }

  getMealCategoryConfig(category: MealCategory) {
    return getMealCategoryConfig(category);
  }

  onMealImgError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/images/meal-placeholder.svg';
  }
}
