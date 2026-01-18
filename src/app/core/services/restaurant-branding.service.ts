/**
 * Restaurant Branding Service
 * 
 * Single source of truth for restaurant branding (name + logo).
 * Loads branding from backend after login and caches in memory.
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface RestaurantBranding {
  name: string;
  logoUrl: string | null;
}

interface MeResponse {
  success: boolean;
  data: {
    user: any;
    restaurant: {
      id: string;
      name: string;
      logoUrl: string | null;
    } | null;
  };
}

@Injectable({
  providedIn: 'root'
})
export class RestaurantBrandingService {
  private readonly API_URL = environment.apiUrl;
  
  // BehaviorSubject to hold current branding state
  private brandingSubject = new BehaviorSubject<RestaurantBranding | null>(null);
  
  // Observable stream for components to subscribe to
  public branding$ = this.brandingSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Load branding from backend
   * Calls GET /api/auth/me to get current user's restaurant
   */
  loadBranding(): Observable<RestaurantBranding | null> {
    return this.http.get<MeResponse>(`${this.API_URL}/auth/me`).pipe(
      map(response => {
        if (response.success && response.data.restaurant) {
          const branding: RestaurantBranding = {
            name: response.data.restaurant.name,
            logoUrl: response.data.restaurant.logoUrl
          };
          this.brandingSubject.next(branding);
          return branding;
        } else {
          // Super admin or no restaurant
          this.brandingSubject.next(null);
          return null;
        }
      }),
      tap({
        error: (err) => {
          console.error('Failed to load restaurant branding:', err);
          this.brandingSubject.next(null);
        }
      })
    );
  }

  /**
   * Get current branding synchronously (from cached value)
   */
  getBranding(): RestaurantBranding | null {
    return this.brandingSubject.value;
  }

  /**
   * Clear branding (called on logout)
   */
  clearBranding(): void {
    this.brandingSubject.next(null);
  }

  /**
   * Get full logo URL (prepend API base if relative path)
   */
  getLogoUrl(logoUrl: string | null): string {
    if (!logoUrl) {
      return 'assets/healthyFoodIcon.png'; // Default placeholder
    }
    
    if (logoUrl.startsWith('http://') || logoUrl.startsWith('https://')) {
      return logoUrl; // Already absolute URL
    }
    
    // Relative path - construct full URL
    const baseUrl = this.API_URL.replace('/api', '');
    return `${baseUrl}${logoUrl}`;
  }
}
