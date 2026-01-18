import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import {
  SubscriberCard,
  CreateSubscriberRequest,
  UpdateSubscriberRequest,
  PaginatedSubscribersResponse,
  SubscribersQueryParams
} from '../../../core/models/subscription.model';

/**
 * API Response wrapper
 */
interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: {
    code: string;
    message: string;
    details: any[];
  };
}

/**
 * Admin Subscriptions Service
 * Handles API calls for subscriber/subscription management
 */
@Injectable({
  providedIn: 'root'
})
export class AdminSubscriptionsService {
  private readonly apiUrl = `${environment.apiUrl}/admin/subscribers`;

  constructor(private http: HttpClient) {}

  /**
   * Create a new subscriber (customer + subscription)
   */
  createSubscriber(payload: CreateSubscriberRequest): Observable<SubscriberCard> {
    return this.http
      .post<ApiResponse<SubscriberCard>>(this.apiUrl, payload)
      .pipe(map(response => response.data));
  }

  /**
   * Get paginated list of subscribers
   */
  getSubscribers(filters?: SubscribersQueryParams): Observable<PaginatedSubscribersResponse> {
    let params = new HttpParams();

    if (filters?.search) {
      params = params.set('search', filters.search);
    }
    if (filters?.status) {
      params = params.set('status', filters.status);
    }
    if (filters?.page) {
      params = params.set('page', filters.page.toString());
    }
    if (filters?.pageSize) {
      params = params.set('pageSize', filters.pageSize.toString());
    }

    return this.http
      .get<ApiResponse<PaginatedSubscribersResponse>>(this.apiUrl, { params })
      .pipe(map(response => response.data));
  }

  /**
   * Get subscriber details by ID
   */
  getSubscriberById(id: string): Observable<SubscriberCard> {
    return this.http
      .get<ApiResponse<SubscriberCard>>(`${this.apiUrl}/${id}`)
      .pipe(map(response => response.data));
  }

  /**
   * Update subscriber and subscription details
   */
  updateSubscriber(id: string, payload: UpdateSubscriberRequest): Observable<SubscriberCard> {
    return this.http
      .put<ApiResponse<SubscriberCard>>(`${this.apiUrl}/${id}`, payload)
      .pipe(map(response => response.data));
  }

  /**
   * Delete (soft delete) subscriber
   */
  deleteSubscriber(id: string): Observable<void> {
    return this.http
      .delete<ApiResponse<{ message: string }>>(`${this.apiUrl}/${id}`)
      .pipe(map(() => undefined));
  }
}
