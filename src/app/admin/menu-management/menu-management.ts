/**
 * Menu Management Component
 * 
 * Admin page for managing meals (CRUD operations)
 * 
 * Features:
 * - View all meals in grid layout
 * - Add new meal via modal
 * - Edit existing meal
 * - Delete meal
 * - Toggle meal active status
 * - Upload/update meal images
 */

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MealsService } from '../../core/services/meals.service';
import { Meal, CreateMealDto } from '../../core/models/meal.model';
import { MealCardComponent } from '../../shared/components/meal-card/meal-card';
import { MealFormModalComponent } from '../../shared/components/meal-form-modal/meal-form-modal';
import { LoadingOverlayComponent } from '../../shared/components/loading-overlay/loading-overlay';
import { ConfirmationModalComponent } from '../../shared/components/confirmation-modal/confirmation-modal';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'app-menu-management',
  standalone: true,
  imports: [CommonModule, MealCardComponent, MealFormModalComponent, LoadingOverlayComponent, ConfirmationModalComponent],
  templateUrl: './menu-management.html',
  styleUrl: './menu-management.scss'
})
export class AdminMenuManagementComponent implements OnInit {
  meals: Meal[] = [];
  isLoading = false;
  isInitialLoading = true; // For first load
  error: string | null = null;

  // Modal state
  isModalOpen = false;
  editingMeal: Meal | null = null;

  // Confirmation modal state
  isConfirmationOpen = false;
  mealToDelete: Meal | null = null;

  constructor(
    private mealsService: MealsService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadMeals();
  }

  /**
   * Load all meals for this restaurant
   */
  loadMeals(): void {
    this.isInitialLoading = true;
    this.error = null;

    this.mealsService.getMeals().subscribe({
      next: (meals) => {
        this.meals = meals;
        this.isInitialLoading = false;
      },
      error: (err) => {
        console.error('Error loading meals:', err);
        this.error = 'فشل تحميل الوجبات. يرجى المحاولة مرة أخرى.';
        this.isInitialLoading = false;
      }
    });
  }

  /**
   * Open modal to add new meal
   */
  openAddMealModal(): void {
    this.editingMeal = null;
    this.isModalOpen = true;
  }

  /**
   * Open modal to edit existing meal
   */
  onEditMeal(meal: Meal): void {
    this.editingMeal = meal;
    this.isModalOpen = true;
  }

  /**
   * Close modal and reset state
   */
  closeModal(): void {
    this.isModalOpen = false;
    this.editingMeal = null;
    // Give modal time to reset its internal state
    setTimeout(() => {
      // Reset any lingering state
    }, 100);
  }

  /**
   * Handle meal form submission (create or update)
   */
  onMealSubmit(event: { data: CreateMealDto, image: File | null }): void {
    if (this.editingMeal) {
      this.updateMeal(this.editingMeal._id, event.data, event.image);
    } else {
      this.createMeal(event.data, event.image);
    }
  }

  /**
   * Create new meal
   */
  private createMeal(mealData: CreateMealDto, imageFile: File | null): void {
    // Prevent concurrent requests
    if (this.isLoading) {
      return;
    }

    this.isLoading = true;

    this.mealsService.createMeal(mealData).subscribe({
      next: (createdMeal) => {
        // If image was selected, upload it
        if (imageFile) {
          this.uploadMealImage(createdMeal._id, imageFile);
        } else {
          // No image, just reload meals and close modal
          this.meals = [createdMeal, ...this.meals];
          this.isLoading = false;
          this.closeModal();
          this.toastService.success('تم إضافة الوجبة بنجاح ✅');
        }
      },
      error: (err) => {
        console.error('[MenuManagement] Error creating meal:', err);
        this.isLoading = false;
        this.closeModal();
        this.toastService.error('فشل إضافة الوجبة. يرجى المحاولة مرة أخرى.');
      }
    });
  }

  /**
   * Update existing meal
   */
  private updateMeal(mealId: string, updates: any, imageFile: File | null): void {
    // Prevent concurrent requests
    if (this.isLoading) {
      return;
    }

    this.isLoading = true;

    this.mealsService.updateMeal(mealId, updates).subscribe({
      next: (updatedMeal) => {
        // If new image was selected, upload it
        if (imageFile) {
          this.uploadMealImage(mealId, imageFile);
        } else {
          // No new image, just update in list and close modal
          const index = this.meals.findIndex(m => m._id === mealId);
          if (index !== -1) {
            this.meals[index] = updatedMeal;
            this.meals = [...this.meals]; // Trigger change detection
          }
          this.isLoading = false;
          this.closeModal();
          this.toastService.success('تم تحديث الوجبة بنجاح ✅');
        }
      },
      error: (err) => {
        console.error('Error updating meal:', err);
        this.isLoading = false;
        this.closeModal();
        this.toastService.error('فشل تحديث الوجبة. يرجى المحاولة مرة أخرى.');
      }
    });
  }

  /**
   * Upload meal image
   */
  private uploadMealImage(mealId: string, imageFile: File): void {
    this.mealsService.uploadMealImage(mealId, imageFile).subscribe({
      next: () => {
        // Reload meals to get updated imageUrl
        this.loadMeals();
        this.isLoading = false;
        this.closeModal();
        this.toastService.success('تم حفظ الوجبة والصورة بنجاح ✅');
      },
      error: (err) => {
        console.error('Error uploading image:', err);
        // Meal was created but image failed - still show success but mention image issue
        this.loadMeals();
        this.isLoading = false;
        this.closeModal();
        this.toastService.warning('تم حفظ الوجبة لكن فشل تحميل الصورة. يمكنك تحميلها لاحقاً.');
      }
    });
  }

  /**
   * Delete meal - open confirmation modal
   */
  onDeleteMeal(meal: Meal): void {
    this.mealToDelete = meal;
    this.isConfirmationOpen = true;
  }

  /**
   * Confirm deletion
   */
  confirmDelete(): void {
    if (!this.mealToDelete) return;

    this.isConfirmationOpen = false;
    this.isLoading = true;

    this.mealsService.deleteMeal(this.mealToDelete._id).subscribe({
      next: () => {
        this.meals = this.meals.filter(m => m._id !== this.mealToDelete!._id);
        this.isLoading = false;
        this.mealToDelete = null;
        this.toastService.success('تم حذف الوجبة بنجاح ✅');
      },
      error: (err) => {
        console.error('Error deleting meal:', err);
        this.isLoading = false;
        this.mealToDelete = null;
        this.toastService.error('فشل حذف الوجبة. يرجى المحاولة مرة أخرى.');
      }
    });
  }

  /**
   * Cancel deletion
   */
  cancelDelete(): void {
    this.isConfirmationOpen = false;
    this.mealToDelete = null;
  }

  /**
   * Toggle meal active status
   */
  onToggleMealStatus(event: { meal: Meal, isActive: boolean }): void {
    this.mealsService.toggleMealStatus(event.meal._id, event.isActive).subscribe({
      next: (updatedMeal) => {
        const index = this.meals.findIndex(m => m._id === event.meal._id);
        if (index !== -1) {
          this.meals[index] = updatedMeal;
          this.meals = [...this.meals]; // Trigger change detection
        }
      },
      error: (err) => {
        console.error('Error toggling meal status:', err);
        this.toastService.error('فشل تحديث حالة الوجبة. يرجى المحاولة مرة أخرى.');
        // Reload to revert UI
        this.loadMeals();
      }
    });
  }
}
