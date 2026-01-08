import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { OrderDraftService } from '../services/order-draft.service';

@Component({
  selector: 'app-order-review',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-review.html',
  styleUrl: './order-review.scss'
})
export class OrderReviewComponent implements OnInit {
  // Daily goals (hardcoded for now, will come from subscription later)
  proteinGoal = 120;
  carbsGoal = 150;

  constructor(
    public orderDraft: OrderDraftService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Redirect if no order draft
    if (!this.orderDraft.isOrderComplete) {
      this.router.navigate(['/customer/home']);
    }
  }

  /**
   * Go back to home (meal selection)
   */
  goBack(): void {
    this.router.navigate(['/customer/home']);
  }

  /**
   * Confirm and submit order
   */
  confirmOrder(): void {
    // TODO: Implement order submission in next phase
    console.log('Confirming order:', this.orderDraft);
    alert('ميزة تأكيد الطلب قيد التطوير');
  }

  /**
   * Helper to get meal image
   */
  getMealImage(imageUrl: string | null): string {
    return imageUrl || 'assets/images/meal-placeholder.svg';
  }
}
