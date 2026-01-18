import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

/**
 * Subscription Settings DTO
 * 
 * Represents the logged-in customer's subscription configuration
 */
export interface SubscriptionSettingsDto {
  mealsPerDay: number;        // 1..5
  proteinTarget: number;       // Daily protein goal (grams)
  carbsTarget: number;         // Daily carbs goal (grams)
  snackIncluded: boolean;      // Whether subscription includes snack
  startDate: string;           // ISO date string
  endDate: string;             // ISO date string
  status: 'active' | 'paused'; // Subscription status
}

/**
 * Customer Subscription Service
 * 
 * Provides the logged-in customer's subscription settings.
 * These settings drive the entire customer home experience:
 * - Number of meal selections to render
 * - Whether to show snack step
 * - Daily macro targets displayed in header
 * 
 * TODO: Replace mock data with real API call to:
 * GET /api/customer/subscription-settings
 */
@Injectable({
  providedIn: 'root'
})
export class CustomerSubscriptionService {
  /**
   * Get subscription settings for logged-in customer
   * 
   * TODO: Replace with real HTTP call:
   * return this.http.get<ApiResponse<SubscriptionSettingsDto>>('/api/customer/subscription-settings')
   *   .pipe(map(response => response.data));
   * 
   * @returns Observable<SubscriptionSettingsDto>
   */
  getSubscriptionSettings(): Observable<SubscriptionSettingsDto> {
    // Mock data - will be replaced with real API call
    const mockSettings: SubscriptionSettingsDto = {
      mealsPerDay: 3,           // Configurable: 1-5 meals
      proteinTarget: 120,        // 120g protein daily
      carbsTarget: 150,          // 150g carbs daily
      snackIncluded: true,       // Show snack step
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      status: 'active'
    };

    return of(mockSettings);
  }

  /**
   * Format daily goals string for display
   * @param settings - Subscription settings
   * @returns Formatted string like "120g بروتين · 150g كارب"
   */
  formatDailyGoals(settings: SubscriptionSettingsDto): string {
    return `${settings.proteinTarget}g بروتين · ${settings.carbsTarget}g كارب`;
  }
}
