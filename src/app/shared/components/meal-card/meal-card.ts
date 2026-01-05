/**
 * Meal Card Component
 * 
 * Displays individual meal in a card format with:
 * - Meal image
 * - Category badge
 * - Name and description
 * - Nutrition stats (calories, protein, carbs)
 * - Action buttons (edit, delete, active toggle)
 * 
 * Mobile-first responsive design
 */

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Meal, getMealCategoryConfig } from '../../../core/models/meal.model';
import { MealsService } from '../../../core/services/meals.service';

@Component({
  selector: 'app-meal-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './meal-card.html',
  styleUrls: ['./meal-card.scss']
})
export class MealCardComponent {
  @Input() meal!: Meal;
  @Output() edit = new EventEmitter<Meal>();
  @Output() delete = new EventEmitter<Meal>();
  @Output() toggleActive = new EventEmitter<{ meal: Meal, isActive: boolean }>();

  constructor(private mealsService: MealsService) {}

  /**
   * Get category configuration for badge styling
   */
  get categoryConfig() {
    return getMealCategoryConfig(this.meal.category);
  }

  /**
   * Get full image URL
   */
  get imageUrl(): string {
    return this.mealsService.getImageUrl(this.meal.imageUrl);
  }

  /**
   * Handle edit button click
   */
  onEdit(): void {
    this.edit.emit(this.meal);
  }

  /**
   * Handle delete button click
   */
  onDelete(): void {
    this.delete.emit(this.meal);
  }

  /**
   * Handle active toggle
   */
  onToggleActive(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    this.toggleActive.emit({
      meal: this.meal,
      isActive: checkbox.checked
    });
  }
}
