# Customer Home Dynamic Implementation - Summary

## Overview
Successfully implemented a fully dynamic Customer Home page that renders based on subscription settings (mealsPerDay: 1-5, snackIncluded: boolean).

## Changes Made

### 1. Order Draft Service (`order-draft.service.ts`)
**Old Structure:** Hardcoded properties for 2 meals
```typescript
selectedMeal1Protein, selectedMeal1Carb
selectedMeal2Protein, selectedMeal2Carb
```

**New Structure:** Dynamic array-based storage
```typescript
selections: MealSelection[]  // Array of { protein, carb } pairs
```

**New Methods:**
- `initSelections(mealsPerDay)` - Initialize array based on subscription
- `getMealSelection(index)` - Get meal by index
- `setProtein(index, meal)` - Set protein for specific meal
- `setCarb(index, meal)` - Set carb for specific meal
- `isMealComplete(index)` - Check if meal is complete
- `completedSelectionsCount` - Count total selections (protein + carb)

**Updated Calculations:**
- `totalProtein`, `totalCarbs`, `totalCalories` - Loop through selections array
- `isOrderComplete` - Check all meals complete

### 2. Customer Subscription Service (`customer-subscription.service.ts`)
**Purpose:** Provide subscription settings to drive UI

**Interface:**
```typescript
interface SubscriptionSettingsDto {
  mealsPerDay: number;        // 1-5
  proteinTarget: number;      // Daily protein grams
  carbsTarget: number;        // Daily carbs grams
  snackIncluded: boolean;     // Show/hide snack step
  startDate: Date;
  endDate: Date;
  status: string;
}
```

**Methods:**
- `getSubscriptionSettings()` - Returns Observable with mock data
- `formatDailyGoals(settings)` - Format macro targets: "120g بروتين · 150g كارب"

**Current Mock Data:**
- mealsPerDay: 2
- proteinTarget: 120g
- carbsTarget: 150g
- snackIncluded: true

### 3. Customer Home Component (`home.ts`)
**Old Logic:** Hardcoded for 2 meals with fixed flow
- currentStep: 1, 2, 3
- currentMealIndex: 1 or 2
- Fixed meal1/meal2 checks

**New Logic:** Fully dynamic
- `totalMeals` - Loaded from subscription
- `snackIncluded` - Loaded from subscription
- `currentMealIndex` - 0-based index (0 to totalMeals-1)
- `isSnackStep` - Boolean flag for snack step

**New Initialization Flow:**
1. Load subscription settings on init
2. Extract mealsPerDay and snackIncluded
3. Initialize orderDraft with correct meal count
4. Load protein meals for first meal

**New Computed Properties:**
- `progressValue` - Dynamic: (completed / (totalMeals * 2)) * 100
- `mealLabel` - Dynamic: "الوجبة X من Y"
- `selectedProtein/Carb` - Use getMealSelection(index)
- `isCurrentMealComplete` - Use isMealComplete(index)
- `isLastMeal` - currentMealIndex === totalMeals - 1
- `showNextMealButton` - Complete + not last meal
- `showSnackButton` - Complete + last meal + snackIncluded
- `showReviewButton` - Complete + last meal + !snackIncluded
- `canGoBack` - currentMealIndex > 0 or isSnackStep

**New Methods:**
- `selectProtein(meal)` - Use setProtein(currentMealIndex, meal)
- `selectCarb(meal)` - Use setCarb(currentMealIndex, meal)
- `proceedToNextMeal()` - Increment currentMealIndex
- `goBackToPreviousMeal()` - Decrement index or return from snack
- `proceedToReview()` - Navigate to review (when no snack)

### 4. Customer Home Template (`home.html`)
**Changes:**
- All meal number badges use `{{ currentMealIndex + 1 }}` (1-based display)
- All subtitles use `للوجبة {{ currentMealIndex + 1 }}`
- Action buttons now in single container with conditional rendering
- Back button shows when `canGoBack`
- Next button shows when `showNextMealButton`
- Snack button shows when `showSnackButton` (only if subscription includes snack)
- Review button shows when `showReviewButton` (when no snack)

## Key Benefits

### 1. Flexibility
- Supports any meal count (1-5) without code changes
- Snack step automatically shows/hides based on subscription

### 2. Scalability
- Easy to add new subscription plans with different meal counts
- No hardcoded logic tied to specific meal numbers

### 3. Maintainability
- Single source of truth: subscription settings
- Cleaner code with array operations instead of conditional checks

### 4. User Experience
- Progress bar accurately reflects any meal count
- Buttons appear/hide based on context
- Clear navigation flow regardless of configuration

## Testing Scenarios

### Scenario 1: 1 Meal + No Snack
- Shows "الوجبة 1 من 1"
- No "Next Meal" button
- Shows "Review" button after completion

### Scenario 2: 3 Meals + Snack
- Shows "الوجبة 1 من 3", "الوجبة 2 من 3", "الوجبة 3 من 3"
- "Next Meal" button appears after meals 1-2
- "Snack" button appears after meal 3
- Can navigate back through all meals

### Scenario 3: 5 Meals + No Snack
- Shows "الوجبة 1 من 5" through "الوجبة 5 من 5"
- "Next Meal" button through meals 1-4
- "Review" button after meal 5
- Progress bar: 10% per selection (2 selections * 5 meals = 10 steps)

### Scenario 4: 2 Meals + Snack (Current Mock)
- Shows "الوجبة 1 من 2", "الوجبة 2 من 2"
- "Next Meal" after meal 1
- "Snack" button after meal 2
- Snack step shows "وجبة خفيفة (اختيارية)"

## Next Steps

### 1. Connect to Real API
Replace mock data in `customer-subscription.service.ts`:
```typescript
return this.http.get<SubscriptionSettingsDto>('/api/subscriptions/my-settings');
```

### 2. Update Order Review Component
The order review component needs to be updated to:
- Loop through dynamic selections array
- Display correct number of meals
- Handle optional snack

### 3. Backend Updates
Ensure backend endpoints return subscription settings with:
- mealsPerDay
- proteinTarget
- carbsTarget
- snackIncluded

### 4. Update Customer Header/Sidebar
Show dynamic meal count in UI:
```typescript
"لديك {{ totalMeals }} وجبات اليوم"
```

## Files Modified
1. `/src/app/customer/services/order-draft.service.ts` - ✅ Complete refactor
2. `/src/app/customer/services/customer-subscription.service.ts` - ✅ New file
3. `/src/app/customer/home/home.ts` - ✅ Complete refactor
4. `/src/app/customer/home/home.html` - ✅ Updated template

## Status
✅ Implementation Complete
✅ No compilation errors
⏳ Ready for testing with different meal counts
⏳ Pending: Order Review component update
⏳ Pending: API integration
