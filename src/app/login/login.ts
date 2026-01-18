import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../core/auth/auth.service';
import { RestaurantBrandingService } from '../core/services/restaurant-branding.service';
import { toInternationalFormat } from '../core/utils/phone.util';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginComponent {
  loginForm: FormGroup;          // Reactive form for phone and password
  isPasswordVisible = false;     // Toggle for password visibility
  errorMessage = '';             // Displays login errors to user
  isLoading = false;             // Shows loading spinner during authentication

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private brandingService: RestaurantBrandingService
  ) {
    // Initialize login form with validation rules
    this.loginForm = this.fb.group({
      phone: ['', [
        Validators.required,
        Validators.pattern(/^05[0-9]{8}$/)  // Saudi phone: 05XXXXXXXX (10 digits)
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(6)                // Minimum 6 characters
      ]]
    });
  }

  // Toggle password field between text and password type
  togglePasswordVisibility(): void {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

 
  onSubmit(): void {
    // Validate form before submission
    if (this.loginForm.invalid) {
      this.errorMessage = 'يرجى التأكد من صحة البيانات المدخلة';
      // Mark all fields as touched to show validation errors
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
      return;
    }

    // Clear previous errors and show loading state
    this.errorMessage = '';
    this.isLoading = true;

    // Convert phone to international format before sending to backend
    const loginPayload = {
      phone: toInternationalFormat(this.loginForm.value.phone),
      password: this.loginForm.value.password
    };

    // Attempt login via AuthService
    this.authService.login(loginPayload).subscribe({
      next: (response) => {
        // Load restaurant branding after successful login
        this.brandingService.loadBranding().subscribe({
          next: () => {
            this.isLoading = false;
            // Navigation handled by AuthService based on user role
            console.log('Login successful:', response);
          },
          error: (err) => {
            console.warn('Failed to load branding, but login succeeded:', err);
            this.isLoading = false;
          }
        });
      },
      error: (error) => {
        this.isLoading = false;
        // Display backend error or generic message
        this.errorMessage = error.error?.error?.message || 'حدث خطأ أثناء تسجيل الدخول';
      }
    });
  }

  // Convenience getter for phone form control (used in template for validation)
  get phone() {
    return this.loginForm.get('phone');
  }

  // Convenience getter for password form control (used in template for validation)
  get password() {
    return this.loginForm.get('password');
  }
}
