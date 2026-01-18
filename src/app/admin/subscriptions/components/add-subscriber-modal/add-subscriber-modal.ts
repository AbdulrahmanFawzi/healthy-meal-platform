import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AdminSubscriptionsService } from '../../services/admin-subscriptions.service';
import { SubscriberCard, CreateSubscriberRequest, UpdateSubscriberRequest } from '../../../../core/models/subscription.model';
import { toLocalFormat, toInternationalFormat } from '../../../../core/utils/phone.util';

/**
 * Add/Edit Subscriber Modal Component
 * 
 * Features:
 * - Create new subscriber (customer + subscription)
 * - Edit existing subscriber
 * - Validation for all fields
 * - Date range validation
 * - Password optional on edit
 */
@Component({
  selector: 'app-add-subscriber-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-subscriber-modal.html',
  styleUrls: ['./add-subscriber-modal.scss']
})
export class AddSubscriberModalComponent implements OnInit, OnChanges {
  @Input() subscriber: SubscriberCard | null = null; // Edit mode if provided
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  subscriberForm!: FormGroup;
  isSubmitting = false;
  error: string | null = null;

  // Password visibility
  showPassword = false;

  // Dropdown states
  isMealsDropdownOpen = false;
  isStatusDropdownOpen = false;

  // Meals per day options
  mealsOptions = [
    { value: 1, label: 'وجبة واحدة' },
    { value: 2, label: 'وجبتان' },
    { value: 3, label: '3 وجبات' },
    { value: 4, label: '4 وجبات' },
    { value: 5, label: '5 وجبات' }
  ];

  // Status options
  statusOptions = [
    { value: 'active', label: 'نشط' },
    { value: 'paused', label: 'متوقف مؤقتاً' }
  ];

  constructor(
    private fb: FormBuilder,
    private subscriptionsService: AdminSubscriptionsService
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['subscriber'] && this.subscriberForm) {
      this.initForm();
    }
  }

  /**
   * Initialize form with validation
   */
  initForm(): void {
    const isEditMode = !!this.subscriber;

    this.subscriberForm = this.fb.group({
      fullName: [
        this.subscriber?.fullName || '',
        [Validators.required, Validators.minLength(2), Validators.maxLength(100)]
      ],
      phone: [
        this.subscriber?.phone ? toLocalFormat(this.subscriber.phone) : '',
        [Validators.required, Validators.pattern(/^05[0-9]{8}$/)]
      ],
      email: [
        this.subscriber?.email || '',
        [Validators.email]
      ],
      password: [
        '',
        isEditMode ? [] : [Validators.required, Validators.minLength(6)]
      ],
      mealsPerDay: [
        this.subscriber?.mealsPerDay || 2,
        [Validators.required, Validators.min(1), Validators.max(5)]
      ],
      dailyProteinGram: [
        this.subscriber?.dailyProteinGram || 0,
        [Validators.required, Validators.min(1)]
      ],
      dailyCarbsGram: [
        this.subscriber?.dailyCarbsGram || 0,
        [Validators.required, Validators.min(1)]
      ],
      includeSnack: [
        this.subscriber?.includeSnack || false
      ],
      startDate: [
        this.subscriber ? this.formatDateForInput(this.subscriber.startDate) : '',
        [Validators.required]
      ],
      endDate: [
        this.subscriber ? this.formatDateForInput(this.subscriber.endDate) : '',
        [Validators.required]
      ],
      status: [
        this.subscriber?.status || 'active',
        [Validators.required]
      ]
    });
  }

  /**
   * Submit form
   */
  onSubmit(): void {
    if (this.subscriberForm.invalid) {
      this.subscriberForm.markAllAsTouched();
      return;
    }

    // Validate date range
    const startDate = new Date(this.subscriberForm.value.startDate);
    const endDate = new Date(this.subscriberForm.value.endDate);
    
    if (endDate < startDate) {
      this.error = 'تاريخ النهاية يجب أن يكون بعد أو يساوي تاريخ البداية';
      return;
    }

    this.isSubmitting = true;
    this.error = null;

    if (this.subscriber) {
      // Update existing subscriber
      this.updateSubscriber();
    } else {
      // Create new subscriber
      this.createSubscriber();
    }
  }

  /**
   * Create new subscriber
   */
  createSubscriber(): void {
    const payload: CreateSubscriberRequest = {
      fullName: this.subscriberForm.value.fullName,
      phone: toInternationalFormat(this.subscriberForm.value.phone),
      email: this.subscriberForm.value.email || undefined,
      password: this.subscriberForm.value.password,
      mealsPerDay: this.subscriberForm.value.mealsPerDay,
      dailyProteinGram: this.subscriberForm.value.dailyProteinGram,
      dailyCarbsGram: this.subscriberForm.value.dailyCarbsGram,
      includeSnack: this.subscriberForm.value.includeSnack,
      startDate: this.subscriberForm.value.startDate,
      endDate: this.subscriberForm.value.endDate,
      status: this.subscriberForm.value.status
    };

    this.subscriptionsService.createSubscriber(payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.saved.emit();
      },
      error: (err) => {
        console.error('Error creating subscriber:', err);
        this.error = err.error?.error?.message || 'حدث خطأ في إضافة المشترك';
        this.isSubmitting = false;
      }
    });
  }

  /**
   * Update existing subscriber
   */
  updateSubscriber(): void {
    const payload: UpdateSubscriberRequest = {
      fullName: this.subscriberForm.value.fullName,
      phone: toInternationalFormat(this.subscriberForm.value.phone),
      email: this.subscriberForm.value.email || undefined,
      mealsPerDay: this.subscriberForm.value.mealsPerDay,
      dailyProteinGram: this.subscriberForm.value.dailyProteinGram,
      dailyCarbsGram: this.subscriberForm.value.dailyCarbsGram,
      includeSnack: this.subscriberForm.value.includeSnack,
      startDate: this.subscriberForm.value.startDate,
      endDate: this.subscriberForm.value.endDate,
      status: this.subscriberForm.value.status
    };

    // Only include password if provided
    if (this.subscriberForm.value.password) {
      payload.password = this.subscriberForm.value.password;
    }

    this.subscriptionsService.updateSubscriber(this.subscriber!.id, payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.saved.emit();
      },
      error: (err) => {
        console.error('Error updating subscriber:', err);
        this.error = err.error?.error?.message || 'حدث خطأ في تحديث المشترك';
        this.isSubmitting = false;
      }
    });
  }

  /**
   * Close modal
   */
  onClose(): void {
    if (!this.isSubmitting) {
      this.close.emit();
    }
  }

  /**
   * Toggle meals dropdown
   */
  toggleMealsDropdown(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.isMealsDropdownOpen = !this.isMealsDropdownOpen;
    if (this.isMealsDropdownOpen) {
      this.isStatusDropdownOpen = false;
    }
  }

  /**
   * Select meals per day
   */
  selectMealsPerDay(value: number): void {
    this.subscriberForm.patchValue({ mealsPerDay: value });
    this.isMealsDropdownOpen = false;
  }

  /**
   * Get selected meals label
   */
  getSelectedMealsLabel(): string {
    const value = this.subscriberForm.get('mealsPerDay')?.value;
    return this.mealsOptions.find(o => o.value === value)?.label || 'اختر عدد الوجبات';
  }

  /**
   * Toggle status dropdown
   */
  toggleStatusDropdown(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.isStatusDropdownOpen = !this.isStatusDropdownOpen;
    if (this.isStatusDropdownOpen) {
      this.isMealsDropdownOpen = false;
    }
  }

  /**
   * Select status
   */
  selectStatus(value: string): void {
    this.subscriberForm.patchValue({ status: value });
    this.isStatusDropdownOpen = false;
  }

  /**
   * Get selected status label
   */
  getSelectedStatusLabel(): string {
    const value = this.subscriberForm.get('status')?.value;
    return this.statusOptions.find(o => o.value === value)?.label || 'اختر الحالة';
  }

  /**
   * Close all dropdowns
   */
  closeAllDropdowns(): void {
    this.isMealsDropdownOpen = false;
    this.isStatusDropdownOpen = false;
  }

  /**
   * Toggle password visibility
   */
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  /**
   * Check if field has error
   */
  hasError(fieldName: string): boolean {
    const field = this.subscriberForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  /**
   * Get error message for field
   */
  getErrorMessage(fieldName: string): string {
    const field = this.subscriberForm.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.errors['required']) return 'هذا الحقل مطلوب';
    if (field.errors['email']) return 'البريد الإلكتروني غير صالح';
    if (field.errors['pattern']) {
      if (fieldName === 'phone') {
        return 'رقم الجوال يجب أن يبدأ بـ 05 ويتكون من 10 أرقام';
      }
      return 'الصيغة غير صحيحة';
    }
    if (field.errors['minLength']) return `الحد الأدنى ${field.errors['minLength'].requiredLength} أحرف`;
    if (field.errors['min']) return `يجب أن يكون أكبر من ${field.errors['min'].min}`;
    if (field.errors['max']) return `يجب أن يكون أصغر من ${field.errors['max'].max}`;

    return 'قيمة غير صالحة';
  }

  /**
   * Format date for input (YYYY-MM-DD)
   */
  formatDateForInput(date: string | Date): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
