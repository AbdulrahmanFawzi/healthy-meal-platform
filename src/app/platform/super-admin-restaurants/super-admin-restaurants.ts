import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface CreateRestaurantResponse {
  success: boolean;
  data: {
    restaurantId: string;
    restaurantName: string;
    logoUrl: string | null;
    adminPhone: string;
    adminName: string;
  };
}

interface CreatedRestaurant {
  restaurantId: string;
  restaurantName: string;
  logoUrl: string | null;
  adminPhone: string;
  adminName: string;
}

@Component({
  selector: 'app-super-admin-restaurants',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './super-admin-restaurants.html',
  styleUrl: './super-admin-restaurants.scss'
})
export class SuperAdminRestaurantsComponent {
  private readonly API_URL = environment.apiUrl;
  
  restaurantForm: FormGroup;
  selectedFile: File | null = null;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';
  createdRestaurants: CreatedRestaurant[] = [];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient
  ) {
    this.restaurantForm = this.fb.group({
      restaurantName: ['', [Validators.required, Validators.minLength(3)]],
      adminPhone: ['', [Validators.required, Validators.pattern(/^(\+9665|05)\d{8}$/)]],
      adminPassword: ['', [Validators.required, Validators.minLength(6)]],
      logo: [null]
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      
      // Validate file type
      if (!this.selectedFile.type.startsWith('image/')) {
        this.errorMessage = 'يجب أن يكون الملف صورة';
        this.selectedFile = null;
        return;
      }
      
      // Validate file size (5MB)
      if (this.selectedFile.size > 5 * 1024 * 1024) {
        this.errorMessage = 'حجم الصورة يجب أن لا يتجاوز 5 ميجابايت';
        this.selectedFile = null;
        return;
      }
      
      this.errorMessage = '';
    }
  }

  onSubmit(): void {
    if (this.restaurantForm.invalid) {
      this.markFormGroupTouched(this.restaurantForm);
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const formData = new FormData();
    formData.append('restaurantName', this.restaurantForm.value.restaurantName);
    formData.append('adminPhone', this.restaurantForm.value.adminPhone);
    formData.append('adminPassword', this.restaurantForm.value.adminPassword);
    
    if (this.selectedFile) {
      formData.append('logo', this.selectedFile);
    }

    this.http.post<CreateRestaurantResponse>(`${this.API_URL}/platform/restaurants`, formData)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.successMessage = `تم إنشاء المطعم "${response.data.restaurantName}" بنجاح!`;
            
            // Add to list
            this.createdRestaurants.unshift(response.data);
            
            // Reset form
            this.restaurantForm.reset();
            this.selectedFile = null;
            
            // Clear file input
            const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
            if (fileInput) {
              fileInput.value = '';
            }
          }
          this.isSubmitting = false;
        },
        error: (error) => {
          console.error('Create restaurant error:', error);
          this.errorMessage = error.error?.error?.message || 'حدث خطأ أثناء إنشاء المطعم';
          this.isSubmitting = false;
        }
      });
  }

  copyCredentials(restaurant: CreatedRestaurant): void {
    const text = `المطعم: ${restaurant.restaurantName}\nرقم الجوال: ${restaurant.adminPhone}\nالمدير: ${restaurant.adminName}`;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        alert('تم نسخ بيانات الاعتماد!');
      });
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }
}
