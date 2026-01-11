import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, interval, Subject, of } from 'rxjs';
import { switchMap, map, takeUntil, startWith, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Order } from '../../core/models/order.model';

@Injectable({
  providedIn: 'root'
})
export class CustomerOrdersService {
  private apiUrl = `${environment.apiUrl}/orders`;
  private stopPolling$ = new Subject<void>();

  constructor(private http: HttpClient) {}

  /**
   * Get current order (today's order)
   */
  getCurrentOrder(): Observable<Order | null> {
    return this.http.get<{ success: boolean; data: Order | null }>(`${this.apiUrl}/current`)
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error('Failed to get current order:', error);
          return of(null);
        })
      );
  }

  /**
   * Get order history (all past orders)
   */
  getOrderHistory(): Observable<Order[]> {
    return this.http.get<{ success: boolean; data: Order[] }>(`${this.apiUrl}/history`)
      .pipe(
        map(response => response.data || []),
        catchError(error => {
          console.error('Failed to get order history:', error);
          return of([]);
        })
      );
  }

  /**
   * Poll current order every 10 seconds
   * Returns an observable that emits the latest order state
   */
  pollCurrentOrder(): Observable<Order | null> {
    return interval(10000).pipe( // Poll every 10 seconds
      startWith(0), // Emit immediately on subscription
      switchMap(() => this.getCurrentOrder()),
      takeUntil(this.stopPolling$) // Stop when component destroys
    );
  }

  /**
   * Stop polling (call this in ngOnDestroy)
   */
  stopPolling(): void {
    this.stopPolling$.next();
    this.stopPolling$.complete();
  }

  /**
   * Reset polling subject (for resubscription)
   */
  resetPolling(): void {
    this.stopPolling$ = new Subject<void>();
  }
}
