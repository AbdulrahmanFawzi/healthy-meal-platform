import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { 
  Meal, 
  CreateMealDto, 
  UpdateMealDto,
  MealCategory,
  MealAvailability 
} from '../models/meal.model';

/**
 * API Response wrapper (matches backend convention)
 */
interface ApiResponse<T> {
  success: boolean;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class MealsService {
  private readonly apiUrl = `${environment.apiUrl}/meals`;

  constructor(private http: HttpClient) {}

  /**
   * Get all meals for authenticated admin's restaurant
   * 
   * @param filters - Optional query filters
   * @returns Observable<Meal[]>
   */
  getMeals(filters?: {
    category?: MealCategory;
    availability?: MealAvailability;
    isActive?: boolean;
    q?: string;
  }): Observable<Meal[]> {
    let params = new HttpParams();

    if (filters) {
      if (filters.category) {
        params = params.set('category', filters.category);
      }
      if (filters.availability) {
        params = params.set('availability', filters.availability);
      }
      if (filters.isActive !== undefined) {
        params = params.set('isActive', String(filters.isActive));
      }
      if (filters.q) {
        params = params.set('q', filters.q);
      }
    }

    return this.http.get<ApiResponse<Meal[]>>(this.apiUrl, { params })
      .pipe(map(response => response.data));
  }

  /**
   * Create a new meal
   * 
   * @param mealData - Meal creation data
   * @returns Observable<Meal> - Created meal with _id
   */
  createMeal(mealData: CreateMealDto): Observable<Meal> {
    return this.http.post<ApiResponse<Meal>>(this.apiUrl, mealData)
      .pipe(map(response => response.data));
  }

  /**
   * Update an existing meal
   * 
   * @param mealId - Meal ID to update
   * @param updates - Partial meal updates
   * @returns Observable<Meal> - Updated meal
   */
  updateMeal(mealId: string, updates: UpdateMealDto): Observable<Meal> {
    return this.http.put<ApiResponse<Meal>>(`${this.apiUrl}/${mealId}`, updates)
      .pipe(map(response => response.data));
  }

  /**
   * Delete a meal
   * 
   * @param mealId - Meal ID to delete
   * @returns Observable<{id: string, deleted: boolean}>
   */
  deleteMeal(mealId: string): Observable<{ id: string; deleted: boolean }> {
    return this.http.delete<ApiResponse<{ id: string; deleted: boolean }>>(`${this.apiUrl}/${mealId}`)
      .pipe(map(response => response.data));
  }

  /**
   * Upload image for a meal
   * 
   * @param mealId - Meal ID to attach image to
   * @param imageFile - Image file (jpg, png, gif, webp - max 5MB)
   * @returns Observable<{id: string, imageUrl: string}>
   */
  uploadMealImage(mealId: string, imageFile: File): Observable<{ id: string; imageUrl: string }> {
    const formData = new FormData();
    formData.append('image', imageFile);

    return this.http.post<ApiResponse<{ id: string; imageUrl: string }>>(
      `${this.apiUrl}/${mealId}/image`,
      formData
    ).pipe(map(response => response.data));
  }

  /**
   * Toggle meal active status (helper method)
   * 
   * @param mealId - Meal ID
   * @param isActive - New active status
   * @returns Observable<Meal>
   */
  toggleMealStatus(mealId: string, isActive: boolean): Observable<Meal> {
    return this.updateMeal(mealId, { isActive });
  }

  /**
   * Get full image URL from relative path
   * 
   * @param imageUrl - Relative path from API (e.g., /uploads/image.jpg)
   * @returns Full URL
   */
  getImageUrl(imageUrl: string | null): string {
    if (!imageUrl) {
      return 'assets/images/meal-placeholder.svg'; // Fallback placeholder
    }
    
    // If already a full URL, return as-is
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    
    // Construct full URL from backend base URL
    return `${environment.apiUrl.replace('/api', '')}${imageUrl}`;
  }
}
