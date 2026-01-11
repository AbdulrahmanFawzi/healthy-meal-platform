import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { OrderDraftService } from '../services/order-draft.service';
import { OrdersService } from '../../core/services/orders.service';
import { ToastService } from '../../shared/services/toast.service';
import { CreateOrderDto, MealSnapshot } from '../../core/models/order.model';

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

  // Loading state
  isSubmitting = false;

  constructor(
    public orderDraft: OrderDraftService,
    private ordersService: OrdersService,
    private toastService: ToastService,
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
    if (this.isSubmitting) return;

    this.isSubmitting = true;

    // Build order payload
    const orderData: CreateOrderDto = {
      selections: [
        {
          proteinMeal: this.mapMealToSnapshot(this.orderDraft.selectedMeal1Protein!),
          carbMeal: this.mapMealToSnapshot(this.orderDraft.selectedMeal1Carb!),
        },
        {
          proteinMeal: this.mapMealToSnapshot(this.orderDraft.selectedMeal2Protein!),
          carbMeal: this.mapMealToSnapshot(this.orderDraft.selectedMeal2Carb!),
        }
      ],
      totals: {
        calories: this.orderDraft.totalCalories,
        proteinGrams: this.orderDraft.totalProtein,
        carbsGrams: this.orderDraft.totalCarbs,
      },
      macroTargets: {
        proteinGrams: this.proteinGoal,
        carbsGrams: this.carbsGoal,
      },
    };

    // Add snack if selected
    if (this.orderDraft.selectedSnack) {
      orderData.snackMeal = this.mapMealToSnapshot(this.orderDraft.selectedSnack);
      console.log('Adding snack to order:', orderData.snackMeal);
    }

    console.log('Submitting order data:', orderData);

    // Submit order
    this.ordersService.createOrder(orderData).subscribe({
      next: (order) => {
        console.log('Order created:', order);
        this.toastService.success('تم تأكيد طلبك بنجاح! 🎉');
        this.orderDraft.reset(); // Clear draft
        this.router.navigate(['/customer/my-orders']);
      },
      error: (error) => {
        console.error('Order creation failed:', error);
        this.toastService.error('فشل تأكيد الطلب. يرجى المحاولة مرة أخرى.');
        this.isSubmitting = false;
      },
    });
  }

  /**
   * Helper: Map Meal to MealSnapshot
   */
  private mapMealToSnapshot(meal: any): MealSnapshot {
    return {
      mealId: meal._id,
      name: meal.name,
      calories: meal.calories,
      proteinGrams: meal.proteinGrams,
      carbsGrams: meal.carbsGrams,
      imageUrl: meal.imageUrl,
    };
  }

  /**
   * Helper to get meal image
   */
  getMealImage(imageUrl: string | null): string {
    return imageUrl || 'assets/images/meal-placeholder.svg';
  }
}
