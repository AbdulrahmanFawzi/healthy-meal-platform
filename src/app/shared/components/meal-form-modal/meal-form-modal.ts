/**
 * Meal Form Modal Component
 * 
 * Reusable modal for creating and editing meals.
 * Implements Reactive Forms with validation.
 * 
 * Features:
 * - Image upload with preview
 * - Form validation (required fields)
 * - Create and Edit modes
 * - Mobile-responsive (full-screen on mobile)
 */

import { Component, EventEmitter, Input, OnInit, OnChanges, SimpleChanges, Output, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { 
  Meal, 
  MealCategory, 
  MealAvailability,
  MEAL_CATEGORY_CONFIGS,
  MEAL_AVAILABILITY_CONFIGS 
} from '../../../core/models/meal.model';
import { MealsService } from '../../../core/services/meals.service';

@Component({
  selector: 'app-meal-form-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './meal-form-modal.html',
  styleUrls: ['./meal-form-modal.scss']
})
export class MealFormModalComponent implements OnInit, OnChanges {
  @Input() meal: Meal | null = null; // null = create mode, Meal = edit mode
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();
  @Output() submit = new EventEmitter<{ data: any, image: File | null }>();

  mealForm!: FormGroup;
  imagePreview: string | null = null;
  selectedImageFile: File | null = null;
  isSubmitting = false;

  // Custom dropdown states
  isCategoryDropdownOpen = false;
  isAvailabilityDropdownOpen = false;

  // Expose category and availability configs to template
  categoryConfigs = MEAL_CATEGORY_CONFIGS;
  availabilityConfigs = MEAL_AVAILABILITY_CONFIGS;

  constructor(
    private fb: FormBuilder,
    private mealsService: MealsService
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Handle both meal changes AND isOpen changes
    if (changes['isOpen'] && changes['isOpen'].currentValue === true) {
      // Modal just opened
      if (this.meal) {
        // Edit mode - patch form with meal data
        this.patchFormForEdit(this.meal);
      } else {
        // Create mode - reset to clean state
        this.resetFormToDefaults();
      }
    }
    
    // Also handle meal input changes
    if (changes['meal'] && !changes['meal'].firstChange) {
      if (this.meal) {
        this.patchFormForEdit(this.meal);
      } else {
        this.resetFormToDefaults();
      }
    }
  }

  /**
   * Initialize form structure (called once in ngOnInit)
   */
  private initForm(): void {
    this.mealForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(2)]],
      category: [MealCategory.PROTEIN, Validators.required],
      calories: [null, [Validators.required, Validators.min(1)]],
      proteinGrams: [null, [Validators.required, Validators.min(0)]],
      carbsGrams: [null, [Validators.required, Validators.min(0)]],
      availability: [MealAvailability.DAILY, Validators.required],
      isActive: [true]
    });
  }

  /**
   * Reset form to default empty state (CREATE mode)
   */
  private resetFormToDefaults(): void {
    this.mealForm.reset({
      name: '',
      description: '',
      category: MealCategory.PROTEIN,
      calories: null,
      proteinGrams: null,
      carbsGrams: null,
      availability: MealAvailability.DAILY,
      isActive: true
    });

    // Reset all UI states
    this.imagePreview = null;
    this.selectedImageFile = null;
    this.isSubmitting = false;
    this.isCategoryDropdownOpen = false;
    this.isAvailabilityDropdownOpen = false;

    // Clear file input
    const fileInput = document.getElementById('mealImageInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  /**
   * Patch form with existing meal data (EDIT mode)
   */
  private patchFormForEdit(meal: Meal): void {
    this.mealForm.patchValue({
      name: meal.name,
      description: meal.description,
      category: meal.category,
      calories: meal.calories,
      proteinGrams: meal.proteinGrams,
      carbsGrams: meal.carbsGrams,
      availability: meal.availability,
      isActive: meal.isActive
    });

    // Set image preview from existing meal
    this.imagePreview = meal.imageUrl ? this.mealsService.getImageUrl(meal.imageUrl) : null;
    this.selectedImageFile = null;

    // Reset submission state
    this.isSubmitting = false;
    this.isCategoryDropdownOpen = false;
    this.isAvailabilityDropdownOpen = false;

    // Clear file input
    const fileInput = document.getElementById('mealImageInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  /**
   * Handle image file selection
   */
  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Validate file type (accept any image format)
      if (!file.type.startsWith('image/')) {
        alert('يرجى اختيار ملف صورة صحيح');
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert('حجم الصورة يجب أن لا يتجاوز 5 ميجابايت');
        return;
      }

      this.selectedImageFile = file;

      // Create preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  /**
   * Trigger file input click
   */
  triggerImageUpload(): void {
    const fileInput = document.getElementById('mealImageInput') as HTMLInputElement;
    fileInput?.click();
  }

  /**
   * Remove selected image
   */
  removeImage(): void {
    this.imagePreview = null;
    this.selectedImageFile = null;
    const fileInput = document.getElementById('mealImageInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  /**
   * Handle form submission
   */
  onSubmit(): void {
    // Prevent duplicate submissions
    if (this.isSubmitting) {
      return;
    }

    // Validate form before submission
    if (this.mealForm.invalid) {
      this.mealForm.markAllAsTouched();
      return;
    }

    // Set submitting state immediately to prevent duplicate submissions
    this.isSubmitting = true;

    const formData = this.mealForm.value;
    
    // Emit data and image separately (image uploaded via separate endpoint)
    this.submit.emit({
      data: formData,
      image: this.selectedImageFile
    });
  }
  
  /**
   * Reset submitting state (called from parent after operation completes)
   */
  resetSubmittingState(): void {
    this.isSubmitting = false;
  }

  /**
   * Close modal and reset state
   */
  onClose(): void {
    // Always allow closing (even if submitting)
    this.resetFormToDefaults();
    this.close.emit();
  }

  /**
   * Check if form field has error
   */
  hasError(fieldName: string): boolean {
    const field = this.mealForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  /**
   * Get field error message
   */
  getErrorMessage(fieldName: string): string {
    const field = this.mealForm.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.errors['required']) return 'هذا الحقل مطلوب';
    if (field.errors['minlength']) return `الحد الأدنى ${field.errors['minlength'].requiredLength} أحرف`;
    if (field.errors['min']) return 'القيمة يجب أن تكون أكبر من أو تساوي صفر';
    
    return 'قيمة غير صالحة';
  }

  /**
   * Toggle category dropdown
   */
  toggleCategoryDropdown(): void {
    this.isCategoryDropdownOpen = !this.isCategoryDropdownOpen;
    if (this.isCategoryDropdownOpen) {
      this.isAvailabilityDropdownOpen = false;
    }
  }

  /**
   * Toggle availability dropdown
   */
  toggleAvailabilityDropdown(): void {
    this.isAvailabilityDropdownOpen = !this.isAvailabilityDropdownOpen;
    if (this.isAvailabilityDropdownOpen) {
      this.isCategoryDropdownOpen = false;
    }
  }

  /**
   * Select category option
   */
  selectCategory(value: string): void {
    this.mealForm.patchValue({ category: value });
    this.mealForm.get('category')?.markAsTouched();
    this.isCategoryDropdownOpen = false;
  }

  /**
   * Select availability option
   */
  selectAvailability(value: string): void {
    this.mealForm.patchValue({ availability: value });
    this.mealForm.get('availability')?.markAsTouched();
    this.isAvailabilityDropdownOpen = false;
  }

  /**
   * Get selected category label
   */
  getSelectedCategoryLabel(): string {
    const value = this.mealForm.get('category')?.value;
    const config = this.categoryConfigs.find(c => c.value === value);
    return config ? config.label : 'اختر نوع الوجبة';
  }

  /**
   * Get selected availability label
   */
  getSelectedAvailabilityLabel(): string {
    const value = this.mealForm.get('availability')?.value;
    const config = this.availabilityConfigs.find(c => c.value === value);
    return config ? config.label : 'اختر توفر الوجبة';
  }

  /**
   * Close all dropdowns
   */
  closeAllDropdowns(): void {
    this.isCategoryDropdownOpen = false;
    this.isAvailabilityDropdownOpen = false;
  }

  /**
   * Close dropdowns on Escape key
   */
  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.isCategoryDropdownOpen || this.isAvailabilityDropdownOpen) {
      this.closeAllDropdowns();
    }
  }
}
