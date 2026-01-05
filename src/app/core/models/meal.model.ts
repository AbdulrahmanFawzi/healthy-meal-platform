
/**
 * Meal Category Enum
 * Used for meal classification in orders (protein + carb pairing logic)
 */
export enum MealCategory {
  PROTEIN = 'protein',
  CARB = 'carb',
  SNACK = 'snack'
}

/**
 * Meal Availability Enum
 * Defines scheduling frequency for meal offerings
 */
export enum MealAvailability {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly'
}

/**
 * Meal Interface
 * Complete meal entity as returned from backend API
 */
export interface Meal {
  _id: string;
  restaurantId: string;
  name: string;
  description: string;
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  imageUrl: string | null;
  availability: MealAvailability;
  category: MealCategory;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Create Meal DTO (Data Transfer Object)
 * Used when creating a new meal (no _id, timestamps, or imageUrl yet)
 */
export interface CreateMealDto {
  name: string;
  description: string;
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  category: MealCategory;
  availability: MealAvailability;
  isActive: boolean;
}

/**
 * Update Meal DTO
 * Partial update - all fields optional
 */
export interface UpdateMealDto {
  name?: string;
  description?: string;
  calories?: number;
  proteinGrams?: number;
  carbsGrams?: number;
  category?: MealCategory;
  availability?: MealAvailability;
  isActive?: boolean;
}

/**
 * Meal Category Display Config
 * For UI rendering (labels, colors, icons)
 */
export interface MealCategoryConfig {
  label: string;
  color: string;
  backgroundColor: string;
  value: MealCategory;
}

/**
 * Category configurations for UI display
 */
export const MEAL_CATEGORY_CONFIGS: MealCategoryConfig[] = [
  {
    label: 'بروتين',
    value: MealCategory.PROTEIN,
    color: '#DC2626', // Red text
    backgroundColor: '#FEE2E2' // Light red background
  },
  {
    label: 'كربوهيدرات',
    value: MealCategory.CARB,
    color: '#D97706', // Orange text
    backgroundColor: '#FEF3C7' // Light yellow/orange background
  },
  {
    label: 'سناك',
    value: MealCategory.SNACK,
    color: '#7C3AED', // Purple text
    backgroundColor: '#EDE9FE' // Light purple background
  }
];

/**
 * Availability display configs
 */
export const MEAL_AVAILABILITY_CONFIGS = [
  { label: 'يومي', value: MealAvailability.DAILY },
  { label: 'أسبوعي', value: MealAvailability.WEEKLY },
  { label: 'شهري', value: MealAvailability.MONTHLY }
];

/**
 * Helper function to get category config by value
 */
export function getMealCategoryConfig(category: MealCategory): MealCategoryConfig {
  return MEAL_CATEGORY_CONFIGS.find(c => c.value === category) || MEAL_CATEGORY_CONFIGS[0];
}
