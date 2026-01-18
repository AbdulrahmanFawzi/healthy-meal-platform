import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { LoginRequest, LoginResponse, AuthState } from '../models/auth.model';
import { User } from '../models/user.model';
import { Restaurant } from '../models/restaurant.model';
import { RestaurantBrandingService } from '../services/restaurant-branding.service';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Backend API base URL
  private readonly API_URL = 'http://localhost:3000/api';
  // LocalStorage key for persisting auth state
  private readonly AUTH_KEY = 'auth_state';
  
  // Observable stream of authentication state - emits current auth state to subscribers
  // Initialized with stored state from localStorage (if available)
  private authState$ = new BehaviorSubject<AuthState | null>(this.loadAuthState());

  constructor(
    private http: HttpClient,
    private router: Router,
    private brandingService: RestaurantBrandingService
  ) {}

  /**
   * Authenticate user with phone and password
   * 
   * On success:
   * 1. Saves auth state (token, user, restaurant) to localStorage
   * 2. Updates observable auth state
   * 3. Navigates to role-specific dashboard (platform/admin/customer)
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/auth/login`, credentials)
      .pipe(
        tap(response => {
          if (response.success) {
            this.saveAuthState(response.data);
            this.authState$.next(response.data);
            this.navigateByRole(response.data.user.role);
          }
        })
      );
  }

  /**
   * Clear authentication state and redirect to login page
   * Removes stored auth data and resets the observable state
   */
  logout(): void {
    localStorage.removeItem(this.AUTH_KEY);
    this.authState$.next(null);
    this.brandingService.clearBranding();
    this.router.navigate(['/login']);
  }

  // Check if user is currently authenticated (has valid auth state)
  isAuthenticated(): boolean {
    return !!this.authState$.value;
  }

  // Get JWT access token for API requests (used by auth interceptor)
  getToken(): string | null {
    return this.authState$.value?.accessToken || null;
  }

  // Get current user object (contains role, restaurantId, etc.)
  getUser(): User | null {
    return this.authState$.value?.user || null;
  }

  // Get restaurant context (null for super_admin, populated for admin/customer)
  getRestaurant(): Restaurant | null {
    return this.authState$.value?.restaurant || null;
  }

  // Subscribe to auth state changes (useful for reactive UI updates)
  getAuthState(): Observable<AuthState | null> {
    return this.authState$.asObservable();
  }

  // Persist auth state to localStorage for session persistence across page refreshes
  private saveAuthState(state: AuthState): void {
    localStorage.setItem(this.AUTH_KEY, JSON.stringify(state));
  }

  // Load auth state from localStorage on app initialization
  private loadAuthState(): AuthState | null {
    const stored = localStorage.getItem(this.AUTH_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
    return null;
  }

  /**
   * Navigate user to appropriate dashboard based on their role
   * - super_admin → /platform (platform management)
   * - admin → /admin (restaurant management)
   * - customer → /customer (meal ordering)
   */
  private navigateByRole(role: string): void {
    switch (role) {
      case 'super_admin':
        this.router.navigate(['/platform']);
        break;
      case 'admin':
        this.router.navigate(['/admin']);
        break;
      case 'customer':
        this.router.navigate(['/customer']);
        break;
      default:
        this.router.navigate(['/']);
    }
  }
}
