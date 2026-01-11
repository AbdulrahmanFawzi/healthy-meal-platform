/**
 * Order Models
 * 
 * TypeScript interfaces matching backend Order schema
 */

export type OrderStatus = 'received' | 'preparing' | 'ready' | 'completed';

export interface MealSnapshot {
  mealId: string;
  name: string;
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  imageUrl?: string;
}

export interface MealPair {
  proteinMeal: MealSnapshot;
  carbMeal: MealSnapshot;
}

export interface Order {
  _id: string;
  restaurantId: string;
  customerId: {
    _id: string;
    name: string;
    phone: string;
  };
  orderNumber: string;
  orderDate: string;
  status: OrderStatus;
  selections: MealPair[];
  snackMeal?: MealSnapshot;
  totals: {
    calories: number;
    proteinGrams: number;
    carbsGrams: number;
  };
  macroTargets?: {
    proteinGrams: number;
    carbsGrams: number;
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderDto {
  selections: MealPair[];
  snackMeal?: MealSnapshot;
  totals: {
    calories: number;
    proteinGrams: number;
    carbsGrams: number;
  };
  macroTargets?: {
    proteinGrams: number;
    carbsGrams: number;
  };
  notes?: string;
}
